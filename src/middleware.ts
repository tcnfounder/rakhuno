import { NextRequest, NextResponse } from "next/server";

/**
 * Brevo click-tracking sometimes lands on `https://rakhuno.com/<uuid>`
 * (apex used as branded host, or Mail Privacy Protection prefetch).
 * Absolute 302 → /invoice so Safari doesn't stick on a dead UUID path.
 */
export function middleware(req: NextRequest) {
  return NextResponse.redirect(new URL("/invoice", req.url), 302);
}

export const config = {
  matcher: [
    "/:uuid([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})",
  ],
};
