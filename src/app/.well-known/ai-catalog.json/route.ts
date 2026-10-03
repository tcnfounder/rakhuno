import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-static";

export async function GET() {
  const origin = getSiteUrl();
  const host = new URL(origin).hostname;

  const catalog = {
    specVersion: "1.0",
    host: {
      displayName: "Rakhuno",
      identifier: `did:web:${host}`,
    },
    entries: [
      {
        identifier: `urn:air:${host}:server:public-mcp`,
        displayName: "Rakhuno Public MCP",
        type: "application/mcp-server-card+json",
        url: `${origin}/.well-known/mcp/server-card.json`,
        representativeQueries: [
          "What is Rakhuno?",
          "Рахунок-фактура для ФОП онлайн",
          "Rakhuno tax reminders",
          "Як виставити рахунок ФОП PDF",
        ],
      },
      {
        identifier: `urn:air:${host}:skills:index`,
        displayName: "Rakhuno Agent Skills",
        type: "application/json",
        url: `${origin}/.well-known/agent-skills/index.json`,
        representativeQueries: [
          "How can an agent contact Rakhuno?",
          "Rakhuno product profile for AI agents",
          "ФОП рахунок-фактура skill",
        ],
      },
      {
        identifier: `urn:air:${host}:agent:info`,
        displayName: "Rakhuno Info Agent (A2A)",
        type: "application/json",
        url: `${origin}/.well-known/agent-card.json`,
        representativeQueries: [
          "Find Rakhuno agent card",
          "Ask Rakhuno about invoice PDF",
        ],
      },
      {
        identifier: `urn:air:${host}:api:catalog`,
        displayName: "Rakhuno API Catalog",
        type: "application/linkset+json",
        url: `${origin}/.well-known/api-catalog`,
        representativeQueries: [
          "Rakhuno public API endpoints",
          "Where is the Rakhuno MCP endpoint?",
        ],
      },
    ],
  };

  return NextResponse.json(catalog, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
