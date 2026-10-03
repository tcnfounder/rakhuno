import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * RFC 9728 OAuth 2.0 Protected Resource Metadata.
 * isitagentready validates `resource` against the scanned site origin
 * (resource mismatch fails when this points only at /mcp).
 */
export async function GET() {
  const origin = getSiteUrl();
  return NextResponse.json(
    {
      resource: origin,
      authorization_servers: [origin],
      scopes_supported: ["rakhuno.public.read"],
      bearer_methods_supported: ["header"],
      resource_documentation: `${origin}/auth.md`,
      resource_signing_alg_values_supported: ["none"],
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
