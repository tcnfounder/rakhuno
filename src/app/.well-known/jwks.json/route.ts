import { NextResponse } from "next/server";

export const dynamic = "force-static";

/** Opaque public tokens - no asymmetric signing keys required. */
export async function GET() {
  return NextResponse.json(
    { keys: [] },
    {
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
