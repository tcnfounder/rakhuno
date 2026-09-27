import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { appendFile, mkdir } from "fs/promises";
import path from "path";

type LeadBody = {
  email?: string;
  source?: string;
};

type LeadsKv = {
  put: (key: string, value: string) => Promise<void>;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function storeLead(email: string, source: string) {
  const stamp = new Date().toISOString();
  const key = `lead:${stamp}:${email}`;
  const value = JSON.stringify({ email, source, at: stamp });

  try {
    const { env } = await getCloudflareContext({ async: true });
    const kv = (env as { LEADS?: LeadsKv }).LEADS;
    if (kv) {
      await kv.put(key, value);
      return "kv";
    }
  } catch {
    // Local `next dev` / preview without bindings.
  }

  try {
    const dir = path.join(process.cwd(), "data");
    await mkdir(dir, { recursive: true });
    await appendFile(path.join(dir, "leads.csv"), `${stamp},${email},${source}\n`, "utf8");
    return "csv";
  } catch {
    // Workers without KV/fs — accept lead to unblock PDF; connect Brevo next.
    console.log("[lead]", value);
    return "log";
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
  const backend = await storeLead(email, source);
  return NextResponse.json({ ok: true, backend });
}
