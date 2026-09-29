/** Server-safe JSON-LD script tag. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Rakhuno",
  url: "https://rakhuno.com/",
  logo: "https://rakhuno.com/brand/icon-512.png",
  description: "Простий рахунок-фактура та email-нагадування про податки для ФОП.",
  email: "info@rakhuno.com",
  areaServed: {
    "@type": "Country",
    name: "Ukraine",
  },
  knowsAbout: [
    "рахунок-фактура",
    "рахунок на оплату",
    "ФОП",
    "єдиний податок",
    "ЄСВ",
  ],
  sameAs: [],
};

export const softwareLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Rakhuno",
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Invoice generator",
  operatingSystem: "Web",
  url: "https://rakhuno.com/invoice",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "UAH",
  },
  featureList: [
    "Онлайн рахунок-фактура для ФОП",
    "PDF у браузері за ~2 хвилини",
    "Збереження реквізитів ФОП локально",
    "Email-нагадування про єдиний податок і ЄСВ",
  ],
  inLanguage: "uk",
  description:
    "Онлайн рахунок-фактура для ФОП: заповніть документ, завантажте PDF, отримуйте нагадування про податки.",
};

export const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Rakhuno",
  url: "https://rakhuno.com/",
  inLanguage: "uk",
  publisher: {
    "@type": "Organization",
    name: "Rakhuno",
    url: "https://rakhuno.com/",
  },
  description:
    "Простий рахунок-фактура для ФОП: PDF онлайн і нагадування про податки.",
};
