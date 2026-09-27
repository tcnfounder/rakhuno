import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { appendFile, mkdir } from "fs/promises";
import path from "path";

type LeadBody = {
  email?: string;
  source?: string;
  fopGroup?: string;
};

type LeadsKv = {
  put: (key: string, value: string) => Promise<void>;
};

type WorkerEnv = {
  LEADS?: LeadsKv;
  BREVO_API_KEY?: string;
  BREVO_LIST_ID?: string;
  /** Transactional template id for immediate welcome (default: 1) */
  BREVO_WELCOME_TEMPLATE_ID?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function getEnv(): Promise<WorkerEnv> {
  // Railway (and other Node hosts) set secrets on process.env. Cloudflare
  // Workers may expose the same names via getCloudflareContext. Prefer
  // bindings when present, but always fall back to process.env so a
  // successful CF context without Brevo secrets does not skip mailing.
  const fromProcess: WorkerEnv = {
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    BREVO_LIST_ID: process.env.BREVO_LIST_ID,
    BREVO_WELCOME_TEMPLATE_ID: process.env.BREVO_WELCOME_TEMPLATE_ID,
  };
  try {
    const { env } = await getCloudflareContext({ async: true });
    const cf = env as WorkerEnv;
    return {
      LEADS: cf.LEADS,
      BREVO_API_KEY: cf.BREVO_API_KEY || fromProcess.BREVO_API_KEY,
      BREVO_LIST_ID: cf.BREVO_LIST_ID || fromProcess.BREVO_LIST_ID,
      BREVO_WELCOME_TEMPLATE_ID:
        cf.BREVO_WELCOME_TEMPLATE_ID || fromProcess.BREVO_WELCOME_TEMPLATE_ID,
    };
  } catch {
    return fromProcess;
  }
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

    // Authorized-IP flaps / transient errors — retry
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

/** Immediate Mail 0 — transactional template (Rakhuno Welcome). */
async function sendWelcomeEmail(email: string, env: WorkerEnv) {
  if (!env.BREVO_API_KEY) return "skipped";
  const templateId = Number(env.BREVO_WELCOME_TEMPLATE_ID || "1");
  if (!Number.isFinite(templateId) || templateId <= 0) return "bad_template";

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        to: [{ email }],
        templateId,
        tags: ["rakhuno-welcome"],
      }),
    });
    if (res.ok) return "sent";
    const text = await res.text();
    console.error("[brevo-welcome]", res.status, text);
    return "send_error";
  } catch (e) {
    console.error("[brevo-welcome]", e);
    return "send_error";
  }
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
  const env = await getEnv();
  const backend = await storeLead(email, source, env, { fopGroup });
  const brevo = await pushToBrevo(email, source, env, { fopGroup });
  const welcome =
    brevo === "brevo" || brevo === "brevo_exists"
      ? await sendWelcomeEmail(email, env)
      : "skipped";
  return NextResponse.json({ ok: true, backend, brevo, welcome });
}
