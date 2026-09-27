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
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function getEnv(): Promise<WorkerEnv> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env as WorkerEnv;
  } catch {
    return {
      BREVO_API_KEY: process.env.BREVO_API_KEY,
      BREVO_LIST_ID: process.env.BREVO_LIST_ID,
    };
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

  const res = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      email,
      updateEnabled: true,
      listIds: [listId],
      attributes: {
        SOURCE: source,
        SIGNUP_SITE: "rakhuno.com",
        ...(extra.fopGroup ? { FOP_GROUP: extra.fopGroup } : {}),
      },
    }),
  });

  if (res.ok || res.status === 204) return "brevo";
  // Duplicate contact still OK for our funnel
  if (res.status === 400) {
    const text = await res.text();
    if (text.toLowerCase().includes("already")) return "brevo_exists";
  }
  console.error("[brevo]", res.status, await res.text());
  return "brevo_error";
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
  return NextResponse.json({ ok: true, backend, brevo });
}
