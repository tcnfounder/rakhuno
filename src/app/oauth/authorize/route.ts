import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

/** Public-agent authorize entry — documents client_credentials instead of browser redirects. */
export async function GET() {
  const origin = getSiteUrl();
  return NextResponse.json(
    {
      message:
        "Rakhuno public agent access uses the client_credentials grant. POST /oauth/token with grant_type=client_credentials (no client secret). See /auth.md.",
      token_endpoint: `${origin}/oauth/token`,
      registration_endpoint: `${origin}/oauth/register`,
      documentation: `${origin}/auth.md`,
      scopes_supported: ["rakhuno.public.read"],
    },
    { headers: { "Access-Control-Allow-Origin": "*" } },
  );
}
