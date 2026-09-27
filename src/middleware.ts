import { NextRequest, NextResponse } from "next/server";

/** Brevo click-tracking can rewrite CTAs to `https://rakhuno.com/<uuid>` when
 *  link branding points at the site apex. Those paths 404 here — send users
 *  to the invoice tool (where their form state lives in localStorage). */
export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/invoice";
  url.search = "";
  return NextResponse.redirect(url, 302);
}

export const config = {
  matcher: [
    "/:uuid([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})",
  ],
};
