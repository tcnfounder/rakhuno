import { NextResponse } from "next/server";

/**
 * Public liveness probe for API catalog / agents.
 * `leads` is false when Brevo env is missing: the site still serves PDFs but saves no emails.
 * It shows only whether the variables are set, never their values.
 */
export async function GET() {
  const leads = Boolean(process.env.BREVO_API_KEY && process.env.BREVO_LIST_ID);
  return NextResponse.json(
    {
      ok: true,
      service: "rakhuno",
      leads,
      time: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
