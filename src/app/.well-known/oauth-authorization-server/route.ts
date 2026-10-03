import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

/** RFC 8414 OAuth 2.0 Authorization Server Metadata — public Rakhuno agent surface. */
export async function GET() {
  const origin = getSiteUrl();
  return NextResponse.json(
    {
      issuer: origin,
      authorization_endpoint: `${origin}/oauth/authorize`,
      token_endpoint: `${origin}/oauth/token`,
      registration_endpoint: `${origin}/oauth/register`,
      jwks_uri: `${origin}/.well-known/jwks.json`,
      grant_types_supported: ["client_credentials"],
      response_types_supported: ["token"],
      token_endpoint_auth_methods_supported: ["none", "client_secret_post"],
      scopes_supported: ["rakhuno.public.read"],
      service_documentation: `${origin}/auth.md`,
      code_challenge_methods_supported: ["S256"],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
