import { NextResponse } from "next/server";

export const dynamic = "force-static";

// Digests: sha256 of public/.well-known/agent-skills/<name>/SKILL.md
// Recompute: sha256sum public/.well-known/agent-skills/<name>/SKILL.md
const INDEX = {
  $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
  skills: [
    {
      name: "rakhuno-company",
      type: "skill-md",
      description:
        "Accurate Rakhuno product profile, email, guide links, and llms.txt URLs for AI citation.",
      url: "/.well-known/agent-skills/rakhuno-company/SKILL.md",
      digest: "sha256:915050972455436f6c51259e51f99cf10e25998e10cf627786a243df37f8af52",
    },
    {
      name: "rakhuno-contact",
      type: "skill-md",
      description:
        "How agents and humans contact Rakhuno: invoice page, email, and unauthenticated POST /api/leads flow.",
      url: "/.well-known/agent-skills/rakhuno-contact/SKILL.md",
      digest: "sha256:236734676d7065b29a3ed9b129610a6fc8237070dfd960361822dffbfa10edac",
    },
    {
      name: "rakhuno-product",
      type: "skill-md",
      description:
        "Rakhuno invoice PDF and tax-reminder product summary for Ukrainian ФОП via MCP get_product_summary.",
      url: "/.well-known/agent-skills/rakhuno-product/SKILL.md",
      digest: "sha256:6cdf175a1e3362f16923b3c346714abd5099b9c322120c70ee5833c954729c00",
    },
  ],
} as const;

export async function GET() {
  return NextResponse.json(INDEX, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
