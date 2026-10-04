import { NextRequest, NextResponse } from "next/server";
import {
  CONTENT_SIGNAL,
  buildAgentLinkHeader,
  buildPageMarkdown,
  buildRobotsTxt,
  estimateMarkdownTokens,
  prefersMarkdown,
} from "@/lib/agent-ready";
import { getSiteUrl } from "@/lib/site";

const CANONICAL_HOST = "rakhuno.com";

const SKIP_PREFIXES = [
  "/api",
  "/_next",
  "/mcp",
  "/oauth",
  "/.well-known",
];

function canonicalRedirect(req: NextRequest): NextResponse | null {
  const url = req.nextUrl.clone();
  const host = (req.headers.get("host") || url.host || "")
    .toLowerCase()
    .split(":")[0];
  const proto = (
    req.headers.get("x-forwarded-proto") || url.protocol.replace(":", "")
  ).toLowerCase();

  let needsRedirect = false;

  if (host === `www.${CANONICAL_HOST}`) {
    url.host = CANONICAL_HOST;
    needsRedirect = true;
  }

  if (proto === "http" && host.endsWith(CANONICAL_HOST)) {
    url.protocol = "https:";
    needsRedirect = true;
  }

  if (!needsRedirect) return null;
  return NextResponse.redirect(url, 301);
}

function withAgentHeaders(response: NextResponse, origin: string) {
  response.headers.set("Link", buildAgentLinkHeader(origin));
  response.headers.set("Content-Signal", CONTENT_SIGNAL);
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Prefer canonical site URL — request.nextUrl.origin is localhost behind Railway.
  const origin = getSiteUrl();

  // Serve robots from middleware so CDN/static caches cannot hide Content-Signal.
  if (pathname === "/robots.txt") {
    const siteOrigin = getSiteUrl();
    return new NextResponse(buildRobotsTxt(siteOrigin), {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "CDN-Cache-Control": "no-store",
        "Vercel-CDN-Cache-Control": "no-store",
        "Content-Signal": CONTENT_SIGNAL,
      },
    });
  }

  const hostFix = canonicalRedirect(request);
  if (hostFix) return withAgentHeaders(hostFix, origin);

  // Short hub URL people type / paste in GSC — canonical lives under /guides.
  if (pathname === "/rahunok-faktura" || pathname === "/rahunok-faktura/") {
    const target = new URL("/guides/rahunok-faktura", origin);
    return withAgentHeaders(NextResponse.redirect(target, 301), origin);
  }

  const isUuidPath =
    /^\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/?$/.test(
      pathname,
    );
  if (isUuidPath) {
    return withAgentHeaders(
      NextResponse.redirect(new URL("/invoice", request.url), 302),
      origin,
    );
  }

  if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
    return NextResponse.next();
  }

  if (prefersMarkdown(request.headers.get("accept"))) {
    const markdown = buildPageMarkdown(pathname);
    const tokens = estimateMarkdownTokens(markdown);
    return new NextResponse(markdown, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=300",
        Vary: "Accept",
        "x-markdown-tokens": String(tokens),
        "Content-Signal": CONTENT_SIGNAL,
        Link: buildAgentLinkHeader(origin),
      },
    });
  }

  const response = NextResponse.next();
  return withAgentHeaders(response, origin);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/).*)"],
};
