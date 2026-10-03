import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-static";

export async function GET() {
  const origin = getSiteUrl();

  const body = {
    linkset: [
      {
        anchor: `${origin}/mcp`,
        "service-desc": [
          {
            href: `${origin}/.well-known/mcp/server-card.json`,
            type: "application/json",
          },
        ],
        "service-doc": [
          {
            href: `${origin}/llms-full.txt`,
            type: "text/plain",
          },
          {
            href: `${origin}/auth.md`,
            type: "text/markdown",
          },
        ],
        status: [
          {
            href: `${origin}/api/health`,
          },
        ],
      },
      {
        anchor: `${origin}/api/leads`,
        "service-doc": [
          {
            href: `${origin}/invoice`,
            type: "text/html",
          },
          {
            href: `${origin}/auth.md`,
            type: "text/markdown",
          },
        ],
        status: [
          {
            href: `${origin}/api/health`,
          },
        ],
      },
      {
        anchor: `${origin}/invoice`,
        "service-doc": [
          {
            href: `${origin}/llms.txt`,
            type: "text/plain",
          },
        ],
        status: [
          {
            href: `${origin}/api/health`,
          },
        ],
      },
    ],
  };

  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/linkset+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
