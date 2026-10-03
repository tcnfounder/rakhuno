import { NextResponse } from "next/server";

/** Public liveness probe for API catalog / agents. */
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "rakhuno",
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
