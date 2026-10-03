import { NextRequest, NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

/** Dynamic client registration for public read-only agents (RFC 7591-lite). */
export async function POST(request: NextRequest) {
  let clientName = "rakhuno-public-agent";
  try {
    const body = (await request.json()) as { client_name?: string };
    if (body.client_name) clientName = String(body.client_name).slice(0, 120);
  } catch {
    // defaults
  }

  const clientId = `public_${Date.now().toString(36)}`;
  const origin = getSiteUrl();

  return NextResponse.json(
    {
      client_id: clientId,
      client_name: clientName,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      grant_types: ["client_credentials"],
      token_endpoint_auth_method: "none",
      scope: "rakhuno.public.read",
      registration_client_uri: `${origin}/auth.md`,
    },
    {
      status: 201,
      headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" },
    },
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
