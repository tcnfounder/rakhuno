import { NextRequest, NextResponse } from "next/server";
import { appendFile, mkdir } from "fs/promises";
import path from "path";
import {
  getWorkerEnv,
  scheduleDripEmails,
  sendTransactionalTemplate,
  type WorkerEnv,
} from "@/lib/brevo-drip";
import { parseGroup, sendHtmlEmail, unsubscribeUrl, welcomeTaxEmail } from "@/lib/tax-reminders";

type LeadBody = {
  email?: string;
  source?: string;
  fopGroup?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function storeLead(
  email: string,
  source: string,
  env: WorkerEnv,
  extra: { fopGroup?: string } = {},
) {
  const stamp = new Date().toISOString();
  const key = `lead:${stamp}:${email}`;
  const value = JSON.stringify({ email, source, at: stamp, ...extra });

  if (env.LEADS) {
    await env.LEADS.put(key, value);
    return "kv";
  }

  try {
    const dir = path.join(process.cwd(), "data");
    await mkdir(dir, { recursive: true });
    await appendFile(
      path.join(dir, "leads.csv"),
      `${stamp},${email},${source},${extra.fopGroup || ""}\n`,
      "utf8",
    );
    return "csv";
  } catch {
    console.log("[lead]", value);
    return "log";
  }
}

async function pushToBrevo(
  email: string,
  source: string,
  env: WorkerEnv,
  extra: { fopGroup?: string } = {},
) {
  if (!env.BREVO_API_KEY || !env.BREVO_LIST_ID) {
    // Leads are lost while this is true (Railway has no KV and the disk is ephemeral).
    console.error("[brevo] BREVO_API_KEY or BREVO_LIST_ID missing; lead not saved:", email);
    return "skipped";
  }
  const listId = Number(env.BREVO_LIST_ID);
  if (!Number.isFinite(listId)) return "bad_list";

  const payload = JSON.stringify({
    email,
    updateEnabled: true,
    listIds: [listId],
    attributes: {
      SOURCE: source,
      SIGNUP_SITE: "rakhuno.com",
      ...(extra.fopGroup ? { FOP_GROUP: extra.fopGroup } : {}),
    },
  });

  let lastStatus = 0;
  let lastBody = "";

  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, 250 * attempt));
    }

    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": env.BREVO_API_KEY,
      },
      body: payload,
    });

    // 201 = new contact. 204 = updateEnabled hit an existing contact.
    if (res.status === 201) return "brevo";
    if (res.status === 204) return "brevo_exists";

    lastStatus = res.status;
    lastBody = await res.text();

    if (res.status === 400 && lastBody.toLowerCase().includes("already")) {
      return "brevo_exists";
    }

    const retryable =
      res.status === 401 ||
      res.status === 429 ||
      res.status >= 500 ||
      lastBody.toLowerCase().includes("unrecognised ip") ||
      lastBody.toLowerCase().includes("unauthorized");
    if (!retryable) break;
  }

  console.error("[brevo]", lastStatus, lastBody);
  return "brevo_error";
}

async function sendWelcomeEmail(email: string, env: WorkerEnv) {
  const templateId = Number(env.BREVO_WELCOME_TEMPLATE_ID || "1");
  return sendTransactionalTemplate(email, env, {
    templateId,
    tags: ["rakhuno-welcome"],
    logLabel: "brevo-welcome",
  });
}

export async function POST(req: NextRequest) {
  let body: LeadBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const source = (body.source || "invoice").slice(0, 64);
  const fopGroupRaw = (body.fopGroup || "").trim();
  const fopGroup =
    fopGroupRaw === "1" || fopGroupRaw === "2" || fopGroupRaw === "3" ? fopGroupRaw : undefined;
  const env = await getWorkerEnv();
  const backend = await storeLead(email, source, env, { fopGroup });
  const brevo = await pushToBrevo(email, source, env, { fopGroup });

  // Only a brand-new Brevo contact is a lead. Existing emails update
  // attributes but do not get another welcome, drip, or conversion.
  const created = brevo === "brevo";

  // Calculator sign-up asks for deadline reminders, not an invoice: confirm that instead of
  // the invoice welcome and drip. Existing contacts get the confirmation too, since they asked.
  if (source === "tax_calc") {
    const saved = brevo === "brevo" || brevo === "brevo_exists";
    const welcome = saved
      ? await sendHtmlEmail(
          env,
          email,
          welcomeTaxEmail(parseGroup(fopGroup), new Date(), unsubscribeUrl(email, env.CRON_SECRET)),
          ["rakhuno-tax-welcome"],
        )
      : "skipped";
    return NextResponse.json({ ok: true, created, backend, brevo, welcome, drip: { day3: "skipped", day7: "skipped" } });
  }

  const welcome = created ? await sendWelcomeEmail(email, env) : "skipped";
  const drip = created
    ? await scheduleDripEmails(email, env)
    : { day3: "skipped", day7: "skipped" };

  return NextResponse.json({ ok: true, created, backend, brevo, welcome, drip });
}
