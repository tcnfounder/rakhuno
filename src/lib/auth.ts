import { createHash, randomBytes } from "crypto";
import type { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Passwordless accounts: an emailed one-time link starts a 90-day session.
 * Only SHA-256 hashes of tokens are stored, so a database leak gives no working links or sessions.
 */

export const SESSION_COOKIE = "rk_session";
/** Not httpOnly: tells client code that a session exists, so anonymous visitors skip the sync call. */
export const SIGNED_IN_COOKIE = "rk_in";

const SESSION_DAYS = 90;
const LINK_MINUTES = 20;
const MAX_LINKS_PER_15_MIN = 3;

export type SessionUser = { id: string; email: string };

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function newToken() {
  return randomBytes(32).toString("base64url");
}

export function normalizeEmail(raw: unknown) {
  const email = typeof raw === "string" ? raw.trim().toLowerCase().slice(0, 200) : "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

/** Only same-site paths, so the link cannot redirect elsewhere. */
export function safeNext(raw: unknown) {
  const next = typeof raw === "string" ? raw : "";
  return next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next.slice(0, 200) : "/account";
}

/** Returns the raw token to email, or null when this address asked for too many links. */
export async function createLoginToken(email: string, next: string) {
  const sql = await db();
  const [{ count }] = await sql<{ count: number }[]>`
    SELECT count(*)::int AS count FROM login_tokens
    WHERE email = ${email} AND created_at > now() - interval '15 minutes'`;
  if (count >= MAX_LINKS_PER_15_MIN) return null;
  const token = newToken();
  await sql`
    INSERT INTO login_tokens (token_hash, email, next_path, expires_at)
    VALUES (${hashToken(token)}, ${email}, ${next}, now() + ${`${LINK_MINUTES} minutes`}::interval)`;
  return token;
}

/** Consumes a login token once. Returns the new session token and where to go next. */
export async function redeemLoginToken(token: string) {
  const sql = await db();
  const rows = await sql<{ email: string; next_path: string }[]>`
    UPDATE login_tokens SET used_at = now()
    WHERE token_hash = ${hashToken(token)} AND used_at IS NULL AND expires_at > now()
    RETURNING email, next_path`;
  if (!rows.length) return null;
  const { email, next_path } = rows[0];
  const [user] = await sql<{ id: string; created: boolean }[]>`
    INSERT INTO users (email, last_login_at) VALUES (${email}, now())
    ON CONFLICT (email) DO UPDATE SET last_login_at = now()
    RETURNING id, (xmax = 0) AS created`;
  const sessionToken = newToken();
  await sql`
    INSERT INTO sessions (token_hash, user_id, expires_at)
    VALUES (${hashToken(sessionToken)}, ${user.id}, now() + ${`${SESSION_DAYS} days`}::interval)`;
  return { sessionToken, email, next: next_path, created: user.created };
}

export async function getSessionUser(req: NextRequest): Promise<SessionUser | null> {
  return userForSessionToken(req.cookies.get(SESSION_COOKIE)?.value);
}

/** For server components, which read cookies() instead of a request. */
export async function userForSessionToken(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  const sql = await db();
  const rows = await sql<SessionUser[]>`
    SELECT u.id, u.email FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ${hashToken(token)} AND s.expires_at > now()`;
  return rows[0] || null;
}

export async function deleteSession(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return;
  const sql = await db();
  await sql`DELETE FROM sessions WHERE token_hash = ${hashToken(token)}`;
}

export function setSessionCookies(res: NextResponse, sessionToken: string) {
  const common = {
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DAYS * 86_400,
  };
  res.cookies.set(SESSION_COOKIE, sessionToken, { ...common, httpOnly: true });
  res.cookies.set(SIGNED_IN_COOKIE, "1", { ...common, httpOnly: false });
}

export function clearSessionCookies(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(SIGNED_IN_COOKIE, "", { path: "/", maxAge: 0 });
}

export function loginEmail(link: string) {
  return {
    subject: "Вхід у Rakhuno",
    html: `<!doctype html><html lang="uk"><body style="margin:0;background:#f5f5f0;font-family:Arial,sans-serif;color:#111">
<div style="max-width:480px;margin:0 auto;padding:32px 24px">
<p style="font-size:20px;font-weight:bold;margin:0 0 16px">Rakhuno</p>
<p style="font-size:16px;line-height:1.5;margin:0 0 24px">Натисніть кнопку, щоб увійти. Посилання діє ${LINK_MINUTES} хвилин і працює один раз.</p>
<p style="margin:0 0 24px"><a href="${link}" style="display:inline-block;background:#c6f26d;color:#111;text-decoration:none;font-weight:bold;padding:14px 24px;border-radius:12px">Увійти в Rakhuno</a></p>
<p style="font-size:13px;line-height:1.5;color:#555;margin:0">Якщо ви не просили вхід, просто проігноруйте цей лист.</p>
</div></body></html>`,
  };
}
