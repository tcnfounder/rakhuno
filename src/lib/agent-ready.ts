import { getSiteUrl, siteUrl } from "@/lib/site";

/** Public crawl allow list (search + AI citation / GEO). */
export const PUBLIC_ALLOW = [
  "/",
  "/llms.txt",
  "/llms-full.txt",
  "/auth.md",
  "/3b8c52078c06493597e733bef4820a74.txt",
  "/_next/static/",
  "/_next/image",
] as const;

/** Admin, auth and private API — out of crawl. */
export const PUBLIC_DISALLOW = ["/api/", "/private/"] as const;

/** Generative Engine Optimization: citation / answer crawlers. */
export const AI_CITATION_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Amazonbot",
  "meta-externalagent",
] as const;

/** Training / scrapers we keep blocked. */
export const AI_BLOCKED_BOTS = ["Bytespider", "AhrefsBot", "MJ12bot", "DotBot"] as const;

/** GEO: allow search + agent input + training citation (Cloudflare / contentsignals.org order). */
export const CONTENT_SIGNAL = "ai-train=yes, search=yes, ai-input=yes";

export const COMPANY = {
  name: "Rakhuno",
  brand: "Rakhuno",
  email: "info@rakhuno.com",
  phone: "",
  phoneTel: "",
  address: "Україна",
  hours: "Онлайн-сервіс (Europe/Kyiv)",
  summary:
    "Простий онлайн рахунок-фактура (проформа) у PDF для ФОП в Україні. Email-нагадування про єдиний податок і ЄСВ. Без Word, Checkbox і складної бухгалтерії.",
} as const;

export const PRODUCTS = [
  {
    name: "Онлайн рахунок-фактура",
    path: "/invoice",
    description: "Створити рахунок на оплату / рахунок-фактуру та скачати PDF за ~2 хвилини.",
  },
  {
    name: "Гіди для ФОП",
    path: "/guides",
    description: "Українські гіди: рахунок-фактура, зразки, бланки, єдиний податок, ЄСВ.",
  },
  {
    name: "Нагадування про податки",
    path: "/",
    description: "Email-нагадування про типові строки сплати єдиного податку та ЄСВ.",
  },
] as const;

export const PRIORITY_PAGES: Record<string, { title: string; summary: string }> = {
  "/": {
    title: "Rakhuno — простий рахунок для ФОП",
    summary: COMPANY.summary,
  },
  "/invoice": {
    title: "Виставити рахунок-фактуру",
    summary: "Онлайн рахунок-фактура для ФОП: заповніть документ і завантажте PDF.",
  },
  "/guides": {
    title: "Гіди для ФОП",
    summary: "Усі гіди: рахунок-фактура, зразки, податки ФОП.",
  },
  "/guides/rahunok-faktura": {
    title: "Що таке рахунок-фактура для ФОП",
    summary: "Пояснення рахунку-фактури для ФОП і як виставити його онлайн.",
  },
  "/guides/rakhunok-na-oplatu": {
    title: "Рахунок на оплату",
    summary: "Рахунок на оплату: зразок і PDF онлайн.",
  },
  "/guides/blank-rakhunku-faktury": {
    title: "Бланк рахунку-фактури",
    summary: "Бланк рахунку-фактури онлайн без Word.",
  },
  "/guides/zrazok-rahunku-faktury": {
    title: "Зразок рахунку-фактури",
    summary: "Зразок рахунку-фактури для ФОП.",
  },
  "/guides/rakhunok-u-word": {
    title: "Рахунок у Word vs онлайн PDF",
    summary: "Чому онлайн PDF зручніший за шаблон у Word.",
  },
  "/guides/vystavyty-rakhunok": {
    title: "Як виставити рахунок",
    summary: "Покроково: як виставити рахунок ФОП онлайн.",
  },
  "/guides/rahunok-onlayn": {
    title: "Рахунок онлайн за 2 хвилини",
    summary: "Швидкий онлайн рахунок для ФОП.",
  },
  "/guides/fop-3-grupa": {
    title: "ФОП 3 група",
    summary: "Коротко про ФОП 3 групи та рахунок-фактуру.",
  },
  "/guides/yedynyy-podatok": {
    title: "Єдиний податок",
    summary: "Коли платити єдиний податок — типові строки.",
  },
  "/guides/podatky-fop": {
    title: "Податки ФОП",
    summary: "Огляд податків ФОП: єдиний податок і ЄСВ.",
  },
  "/privacy": {
    title: "Політика конфіденційності",
    summary: "Як Rakhuno обробляє персональні дані.",
  },
  "/terms": {
    title: "Умови використання",
    summary: "Умови використання сервісу Rakhuno.",
  },
};

export function estimateMarkdownTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

/** Prefer markdown when Accept explicitly asks for it over HTML. */
export function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  const lower = accept.toLowerCase();
  if (!lower.includes("text/markdown")) return false;
  const mdIndex = lower.indexOf("text/markdown");
  const htmlIndex = lower.indexOf("text/html");
  if (htmlIndex === -1) return true;
  return mdIndex < htmlIndex;
}

export function buildAgentLinkHeader(origin = getSiteUrl()): string {
  const links = [
    `<${origin}/.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"`,
    `<${origin}/.well-known/mcp/server-card.json>; rel="service-desc"; type="application/json"`,
    `<${origin}/.well-known/agent-skills/index.json>; rel="describedby"; type="application/json"`,
    `<${origin}/.well-known/ai-catalog.json>; rel="describedby"; type="application/json"`,
    `<${origin}/.well-known/oauth-protected-resource>; rel="oauth-protected-resource"; type="application/json"`,
    `<${origin}/llms.txt>; rel="describedby"; type="text/plain"`,
    `<${origin}/auth.md>; rel="describedby"; type="text/markdown"`,
  ];
  return links.join(", ");
}

export function buildRobotsTxt(origin = getSiteUrl()): string {
  const allow = PUBLIC_ALLOW.join("\nAllow: ");
  const disallow = PUBLIC_DISALLOW.join("\nDisallow: ");

  const starBlock = [
    "User-agent: *",
    "Allow: /",
    `Content-Signal: ${CONTENT_SIGNAL}`,
    `Allow: ${allow}`,
    `Disallow: ${disallow}`,
  ].join("\n");

  const block = (ua: string) =>
    [`User-agent: ${ua}`, `Allow: ${allow}`, `Disallow: ${disallow}`].join("\n");

  const parts = [
    "# rakhuno-agent-ready robots — Content-Signal after Allow:/ like isitagentready.com",
    starBlock,
    block("Googlebot"),
    block("Bingbot"),
    ...AI_CITATION_BOTS.map((bot) => block(bot)),
    ...AI_BLOCKED_BOTS.map((bot) => `User-agent: ${bot}\nDisallow: /`),
    `Sitemap: ${origin}/sitemap.xml`,
    `Host: ${origin}`,
    `Agentmap: ${origin}/.well-known/ai-catalog.json`,
  ];

  return `${parts.join("\n\n")}\n`;
}

export function companyInfoPayload() {
  const origin = getSiteUrl();
  return {
    name: COMPANY.name,
    brand: COMPANY.brand,
    summary: COMPANY.summary,
    website: origin,
    email: COMPANY.email,
    address: COMPANY.address,
    hours: COMPANY.hours,
    llmsTxt: siteUrl("/llms.txt"),
    llmsFullTxt: siteUrl("/llms-full.txt"),
    invoicePage: siteUrl("/invoice"),
    guidesPage: siteUrl("/guides"),
    products: PRODUCTS.map((p) => ({
      name: p.name,
      url: siteUrl(p.path),
      description: p.description,
    })),
  };
}

export function productSummaryPayload() {
  return {
    name: COMPANY.brand,
    tagline: "Простий рахунок для ФОП",
    summary: COMPANY.summary,
    pricing: "Безкоштовно створити рахунок-фактуру та PDF",
    features: [
      "Онлайн рахунок-фактура / рахунок на оплату у PDF",
      "Збереження реквізитів ФОП локально в браузері",
      "Email-нагадування про єдиний податок і ЄСВ",
      "Українські гіди для ФОП",
    ],
    primaryCta: siteUrl("/invoice"),
    guides: siteUrl("/guides"),
    language: "uk",
    areaServed: "Ukraine",
  };
}

export function buildPageMarkdown(pathname: string): string {
  const origin = getSiteUrl();
  const path = pathname === "" ? "/" : pathname;
  const page = PRIORITY_PAGES[path];
  const title = page?.title ?? "Rakhuno";
  const summary = page?.summary ?? COMPANY.summary;

  const lines = [
    `# ${title}`,
    "",
    `> ${summary}`,
    "",
    `- Site: ${origin}`,
    `- Ця сторінка: ${origin}${path === "/" ? "/" : path}`,
    `- Рахунок: ${siteUrl("/invoice")}`,
    `- Гіди: ${siteUrl("/guides")}`,
    `- E-mail: ${COMPANY.email}`,
    `- AI summary: ${siteUrl("/llms.txt")}`,
    `- Full context: ${siteUrl("/llms-full.txt")}`,
    "",
    "## Продукт",
    "",
    ...PRODUCTS.map((p) => `- [${p.name}](${siteUrl(p.path)}) — ${p.description}`),
    "",
    "## Agent discovery",
    "",
    `- MCP: ${siteUrl("/.well-known/mcp/server-card.json")}`,
    `- API catalog: ${siteUrl("/.well-known/api-catalog")}`,
    `- Agent skills: ${siteUrl("/.well-known/agent-skills/index.json")}`,
    `- ARD: ${siteUrl("/.well-known/ai-catalog.json")}`,
    `- Auth: ${siteUrl("/auth.md")}`,
  ];

  return `${lines.join("\n")}\n`;
}
