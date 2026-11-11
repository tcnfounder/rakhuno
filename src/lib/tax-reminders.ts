import { createHmac } from "crypto";
import type { WorkerEnv } from "@/lib/brevo-drip";
import { TAX_YEAR, upcomingDeadlines, type Deadline, type FopGroup } from "@/lib/fop-tax";

/**
 * Tax deadline reminders: the daily cron emails each contact in the leads list
 * LEAD_DAYS before a deadline that applies to their FOP group.
 * - FOP_GROUP 1 or 2: monthly ЄП + військовий збір, quarterly ЄСВ, annual declaration.
 * - FOP_GROUP 3: quarterly declaration, ЄП + військовий збір, ЄСВ.
 * - no group: ЄСВ only (it applies to everyone).
 * TAX_REMINDER_LAST on the contact stores the last sent day, so a second cron run
 * on the same day sends nothing.
 */
export const LEAD_DAYS = 3;
const SITE = "https://rakhuno.com";
const LAST_ATTR = "TAX_REMINDER_LAST";
const DAY = 86_400_000;

export function parseGroup(raw: unknown): FopGroup | null {
  const g = String(raw ?? "").trim();
  return g === "1" || g === "2" || g === "3" ? (Number(g) as FopGroup) : null;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Deadlines that fall exactly LEAD_DAYS after `today` for this group. */
export function remindersDue(group: FopGroup | null, today: Date): Deadline[] {
  const target = new Date(today.getFullYear(), today.getMonth(), today.getDate() + LEAD_DAYS);
  const list = upcomingDeadlines(group ?? 3, target, 12).filter((d) => sameDay(d.date, target));
  return group ? list : list.filter((d) => d.title.startsWith("ЄСВ"));
}

const dateFmt = new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long" });

export function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function unsubscribeToken(email: string, secret: string) {
  return createHmac("sha256", secret).update(email.trim().toLowerCase()).digest("hex").slice(0, 32);
}

export function unsubscribeUrl(email: string, secret?: string) {
  if (!secret) return null;
  const e = encodeURIComponent(email.trim().toLowerCase());
  return `${SITE}/api/unsubscribe?e=${e}&t=${unsubscribeToken(email, secret)}`;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function layout(body: string, unsub: string | null) {
  return `<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;">
<div style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f5;padding:24px 12px;">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5ebe8;">
<div style="background:#07110e;padding:20px 24px;"><a href="${SITE}" style="text-decoration:none;color:#f7faf8;"><img src="${SITE}/brand/mark.webp" width="36" height="36" alt="Rakhuno" style="border-radius:8px;vertical-align:middle;margin-right:10px;" /><span style="font-size:20px;font-weight:700;vertical-align:middle;">Rakhuno</span></a></div>
<div style="padding:28px 24px;color:#07110e;font-size:16px;line-height:1.55;">${body}</div>
<div style="padding:16px 24px 28px;color:#5a6b63;font-size:12px;line-height:1.45;">Це не податкова консультація. Звіряйте суми й дати з ДПС або бухгалтером.<br /><a href="${SITE}" style="color:#3d5a40;">rakhuno.com</a>${unsub ? ` · <a href="${unsub}" style="color:#3d5a40;">Відписатися від нагадувань</a>` : ""}</div>
</div></div></body></html>`;
}

const cta = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:#c6f26d;color:#07110e;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:999px;margin-top:8px;">${label}</a>`;

export function reminderEmail(deadlines: Deadline[], unsub: string | null) {
  const date = dateFmt.format(deadlines[0].date);
  const subject =
    deadlines.length === 1
      ? `Нагадування: ${deadlines[0].title.toLowerCase()} — до ${date}`
      : `Податки ФОП: ${deadlines.length} терміни до ${date}`;
  const items = deadlines
    .map((d) => `<li style="margin:0 0 10px;"><strong>${esc(d.title)}</strong><br /><span style="color:#5a6b63;">${esc(d.detail)}</span></li>`)
    .join("");
  const body = `<p style="margin:0 0 12px;font-size:20px;font-weight:700;">До ${date} — ${LEAD_DAYS} дні</p>
<ul style="padding-left:18px;margin:0 0 16px;">${items}</ul>
<p style="margin:0 0 8px;">Порахуйте суму для своєї групи й доходу:</p>
${cta(`${SITE}/kalkulyator-podatkiv-fop`, "Калькулятор податків ФОП")}
<p style="margin:20px 0 0;color:#5a6b63;font-size:14px;">Якщо дата припадає на вихідний, перевірте перенесення в календарі ДПС.</p>`;
  return { subject, html: layout(body, unsub) };
}

/** First email after signing up on the calculator: confirms and shows the next dates. */
export function welcomeTaxEmail(group: FopGroup | null, today: Date, unsub: string | null) {
  const next = upcomingDeadlines(group ?? 3, today, 3).filter((d) => group || d.title.startsWith("ЄСВ"));
  const items = next
    .map((d) => `<li style="margin:0 0 10px;"><strong>до ${dateFmt.format(d.date)}</strong> · ${esc(d.title)}<br /><span style="color:#5a6b63;">${esc(d.detail)}</span></li>`)
    .join("");
  const body = `<p style="margin:0 0 12px;font-size:20px;font-weight:700;">Нагадування увімкнено</p>
<p style="margin:0 0 12px;">Напишемо за ${LEAD_DAYS} дні до кожного терміну${group ? ` для ${group} групи` : " сплати ЄСВ"}. Найближчі дати:</p>
<ul style="padding-left:18px;margin:0 0 16px;">${items}</ul>
<p style="margin:0 0 8px;">Потрібен рахунок для клієнта? У Rakhuno він з QR-кодом для оплати:</p>
${cta(`${SITE}/invoice`, "Зробити рахунок")}`;
  return { subject: `Нагадування про податки ФОП ${TAX_YEAR} увімкнено`, html: layout(body, unsub) };
}

export async function sendHtmlEmail(
  env: WorkerEnv,
  to: string,
  mail: { subject: string; html: string },
  tags: string[],
) {
  if (!env.BREVO_API_KEY) return "skipped";
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json", "api-key": env.BREVO_API_KEY },
      body: JSON.stringify({
        sender: { name: "Rakhuno", email: process.env.BREVO_SENDER_EMAIL || "info@jettfy.com" },
        to: [{ email: to }],
        subject: mail.subject,
        htmlContent: mail.html,
        tags,
      }),
    });
    if (res.ok) return "sent";
    console.error("[tax-reminder-send]", res.status, await res.text());
    return "send_error";
  } catch (e) {
    console.error("[tax-reminder-send]", e);
    return "send_error";
  }
}

async function brevo(env: WorkerEnv, path: string, init: RequestInit = {}) {
  return fetch(`https://api.brevo.com/v3${path}`, {
    ...init,
    headers: { accept: "application/json", "content-type": "application/json", "api-key": env.BREVO_API_KEY || "", ...(init.headers || {}) },
  });
}

type Options = { today?: Date; dryRun?: boolean; testTo?: string; testGroup?: FopGroup | null };

export async function processTaxReminders(env: WorkerEnv, opts: Options = {}) {
  const today = opts.today ?? new Date();
  const key = dayKey(today);

  // Test mode: one email to a given address, no list scan, no attribute writes.
  if (opts.testTo) {
    const due = remindersDue(opts.testGroup ?? 3, today);
    if (!due.length) return { ok: true, mode: "test", key, sent: 0, note: "no deadline in 3 days for this date" };
    const mail = reminderEmail(due, unsubscribeUrl(opts.testTo, env.CRON_SECRET));
    const status = opts.dryRun ? "dry_run" : await sendHtmlEmail(env, opts.testTo, mail, ["rakhuno-tax-reminder-test"]);
    return { ok: true, mode: "test", key, subject: mail.subject, status };
  }

  if (!env.BREVO_API_KEY || !env.BREVO_LIST_ID) return { ok: false, error: "missing_brevo" };
  if (!opts.dryRun) {
    const res = await brevo(env, "/contacts/attributes/normal/" + LAST_ATTR, {
      method: "POST",
      body: JSON.stringify({ type: "text" }),
    });
    if (!res.ok && res.status !== 400) console.error("[tax-reminder-attr]", res.status, await res.text());
  }

  const results: Array<{ email: string; group: FopGroup | null; items: number; status: string }> = [];
  let offset = 0;
  for (let page = 0; page < 40; page++) {
    const res = await brevo(env, `/contacts/lists/${Number(env.BREVO_LIST_ID)}/contacts?limit=50&offset=${offset}`);
    if (!res.ok) {
      console.error("[tax-reminder-list]", res.status, await res.text());
      break;
    }
    const data = (await res.json()) as {
      contacts?: Array<{ email?: string; emailBlacklisted?: boolean; attributes?: Record<string, unknown> }>;
    };
    const contacts = data.contacts || [];
    for (const c of contacts) {
      const email = (c.email || "").trim().toLowerCase();
      if (!email || c.emailBlacklisted) continue;
      const attrs = c.attributes || {};
      if (String(attrs[LAST_ATTR] || "") === key) continue;
      const group = parseGroup(attrs.FOP_GROUP);
      const due = remindersDue(group, today);
      if (!due.length) continue;
      let status = "dry_run";
      if (!opts.dryRun) {
        status = await sendHtmlEmail(env, email, reminderEmail(due, unsubscribeUrl(email, env.CRON_SECRET)), ["rakhuno-tax-reminder"]);
        if (status === "sent") {
          await brevo(env, `/contacts/${encodeURIComponent(email)}`, {
            method: "PUT",
            body: JSON.stringify({ attributes: { [LAST_ATTR]: key } }),
          });
        }
      }
      results.push({ email, group, items: due.length, status });
    }
    offset += contacts.length;
    if (contacts.length < 50) break;
  }
  return { ok: true, key, target: dayKey(new Date(today.getTime() + LEAD_DAYS * DAY)), sent: results.filter((r) => r.status === "sent").length, results };
}
