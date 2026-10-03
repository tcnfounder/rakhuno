import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

/** Path-specific RFC 9728 metadata for the MCP endpoint. */
export async function GET() {
  const origin = getSiteUrl();
  return NextResponse.json(
    {
      resource: `${origin}/mcp`,
      authorization_servers: [origin],
      scopes_supported: ["rakhuno.public.read"],
      bearer_methods_supported: ["header"],
      resource_documentation: `${origin}/auth.md`,
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
