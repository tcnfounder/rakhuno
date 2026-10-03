import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-static";

export async function GET() {
  const origin = getSiteUrl();
  const card = {
    serverInfo: {
      name: "rakhuno-public",
      version: "1.0.0",
    },
    description:
      "Public MCP server for Rakhuno: company profile, contact details, and Ukrainian ФОП invoice / tax-reminder product summary.",
    url: `${origin}/mcp`,
    endpoint: `${origin}/mcp`,
    transport: {
      type: "streamable-http",
    },
    capabilities: {
      tools: true,
      resources: false,
      prompts: false,
    },
    homepage: origin,
    documentation: `${origin}/llms-full.txt`,
  };

  return NextResponse.json(card, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
