import { buildRobotsTxt, CONTENT_SIGNAL } from "@/lib/agent-ready";

/** Always regenerate - agent scanners must not see a stale CDN copy without Content-Signal. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return new Response(buildRobotsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "CDN-Cache-Control": "no-store",
      "Vercel-CDN-Cache-Control": "no-store",
      "Content-Signal": CONTENT_SIGNAL,
    },
  });
}
