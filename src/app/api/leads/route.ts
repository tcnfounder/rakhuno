import { NextRequest, NextResponse } from "next/server";
import { appendFile, mkdir } from "fs/promises";
import path from "path";
import {
  getWorkerEnv,
  scheduleDripEmails,
  sendTransactionalTemplate,
  type WorkerEnv,
} from "@/lib/brevo-drip";

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
  if (!env.BREVO_API_KEY || !env.BREVO_LIST_ID) return "skipped";
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

    if (res.ok || res.status === 204) return "brevo";

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
  const fopGroup = fopGroupRaw === "2" || fopGroupRaw === "3" ? fopGroupRaw : undefined;
  const env = await getWorkerEnv();
  const backend = await storeLead(email, source, env, { fopGroup });
  const brevo = await pushToBrevo(email, source, env, { fopGroup });

  // New list members get Welcome + Day 3 schedule + Day 7 queue.
  // Existing contacts still get Welcome; drip not re-stacked.
  const enrolled = brevo === "brevo";
  const welcome =
    enrolled || brevo === "brevo_exists"
      ? await sendWelcomeEmail(email, env)
      : "skipped";
  const drip = enrolled
    ? await scheduleDripEmails(email, env)
    : { day3: "skipped", day7: "skipped" };

  return NextResponse.json({ ok: true, backend, brevo, welcome, drip });
}
