import { NextResponse } from "next/server";
import { COMPANY, PRODUCTS } from "@/lib/agent-ready";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-static";

export async function GET() {
  const origin = getSiteUrl();

  const card = {
    name: "Rakhuno Info Agent",
    description: `${COMPANY.summary} Agents can ask for product facts, guide links, and contact details.`,
    version: "1.0.0",
    protocolVersion: "0.3",
    url: `${origin}/mcp`,
    provider: {
      organization: COMPANY.name,
      url: origin,
    },
    documentationUrl: `${origin}/llms-full.txt`,
    supportedInterfaces: [
      {
        url: `${origin}/mcp`,
        protocolBinding: "HTTP+JSON",
        protocolVersion: "0.3",
      },
    ],
    capabilities: {
      streaming: false,
      pushNotifications: false,
      extendedAgentCard: false,
    },
    defaultInputModes: ["text/plain", "application/json"],
    defaultOutputModes: ["text/plain", "application/json"],
    skills: [
      {
        id: "company-info",
        name: "Company info",
        description: "Return Rakhuno product profile and key URLs.",
        tags: ["company", "rakhuno", "fop"],
        examples: ["What is Rakhuno?", "Rakhuno для ФОП"],
        inputModes: ["text/plain"],
        outputModes: ["application/json", "text/plain"],
      },
      {
        id: "product-summary",
        name: "Product summary",
        description: "Summarize invoice PDF and tax-reminder features.",
        tags: ["invoice", "tax", "pdf"],
        examples: ["How does Rakhuno invoice work?", "Податкові нагадування"],
        inputModes: ["text/plain"],
        outputModes: ["application/json", "text/plain"],
      },
      {
        id: "contact",
        name: "Contact",
        description: "Return contact channels and lead API pointers.",
        tags: ["contact", "lead"],
        examples: ["How do I contact Rakhuno?", "Email Rakhuno"],
        inputModes: ["text/plain"],
        outputModes: ["application/json", "text/plain"],
      },
    ],
    serviceSkills: PRODUCTS.map((p) => p.name),
  };

  return NextResponse.json(card, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
