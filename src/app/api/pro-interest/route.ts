import { NextRequest, NextResponse } from "next/server";
import { getWorkerEnv, type WorkerEnv } from "@/lib/brevo-drip";

/**
 * Pro waitlist. Records interest on the Brevo contact without touching SOURCE or the
 * welcome/drip flow, so the original lead attribution stays intact.
 */

const PLANS = new Set(["fop", "accountant"]);
const ATTRS = ["PRO_INTEREST", "PRO_INTEREST_AT", "PRO_CLIENTS", "PRO_FROM"];

let attrsReady = false;

async function ensureAttrs(env: WorkerEnv) {
  if (attrsReady || !env.BREVO_API_KEY) return;
  await Promise.all(
    ATTRS.map(async (name) => {
      try {
        const res = await fetch(`https://api.brevo.com/v3/contacts/attributes/normal/${name}`, {
          method: "POST",
          headers: { accept: "application/json", "content-type": "application/json", "api-key": env.BREVO_API_KEY! },
          body: JSON.stringify({ type: "text" }),
        });
        if (!res.ok && res.status !== 400) console.error("[pro-attr]", name, res.status, await res.text());
      } catch (e) {
        console.error("[pro-attr]", name, e);
      }
    }),
  );
  attrsReady = true;
}

function clean(value: unknown, max = 60) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const email = clean(body.email, 200).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  const plan = clean(body.plan);
  if (!PLANS.has(plan)) return NextResponse.json({ error: "invalid_plan" }, { status: 400 });

  const env = await getWorkerEnv();
  if (!env.BREVO_API_KEY || !env.BREVO_LIST_ID) {
    console.error("[pro-interest] Brevo not configured; interest not saved:", plan);
    return NextResponse.json({ ok: true, saved: false });
  }
  await ensureAttrs(env);

  const attributes: Record<string, string> = {
    PRO_INTEREST: plan,
    PRO_INTEREST_AT: new Date().toISOString().slice(0, 10),
    PRO_FROM: clean(body.from) || "unknown",
  };
  const clients = clean(body.clients, 10);
  if (clients) attributes.PRO_CLIENTS = clients;

  const headers = {
    accept: "application/json",
    "content-type": "application/json",
    "api-key": env.BREVO_API_KEY,
  };

  // New address: create it with its own SOURCE. Existing address: update only the PRO_* fields.
  const create = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers,
    body: JSON.stringify({
      email,
      listIds: [Number(env.BREVO_LIST_ID)],
      attributes: { ...attributes, SOURCE: "pro_waitlist", SIGNUP_SITE: "rakhuno.com" },
    }),
  });
  if (create.status === 201) return NextResponse.json({ ok: true, saved: true, created: true });

  const update = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ attributes }),
  });
  if (update.ok) return NextResponse.json({ ok: true, saved: true, created: false });

  console.error("[pro-interest]", create.status, update.status, await update.text());
  return NextResponse.json({ ok: true, saved: false });
}
