import { NextRequest, NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * Public client_credentials token endpoint.
 * Issues an opaque Bearer for rakhuno.public.read — no client secret required.
 */
export async function POST(request: NextRequest) {
  let grantType = "client_credentials";
  let scope = "rakhuno.public.read";

  const contentType = request.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as Record<string, string>;
      grantType = body.grant_type || grantType;
      scope = body.scope || scope;
    } else {
      const form = await request.formData();
      grantType = String(form.get("grant_type") || grantType);
      scope = String(form.get("scope") || scope);
    }
  } catch {
    // keep defaults
  }

  if (grantType !== "client_credentials") {
    return NextResponse.json(
      {
        error: "unsupported_grant_type",
        error_description: "Only client_credentials is supported for public tools.",
      },
      { status: 400, headers: { "Access-Control-Allow-Origin": "*" } },
    );
  }

  const token = `rakhuno_public_${btoa(String(Date.now()))
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")}`;

  return NextResponse.json(
    {
      access_token: token,
      token_type: "Bearer",
      expires_in: 3600,
      scope: "rakhuno.public.read",
      resource: getSiteUrl(),
    },
    { headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" } },
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
