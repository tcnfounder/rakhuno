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
  url: "https://rakhuno.com",
  logo: "https://rakhuno.com/brand/icon-512.png",
  description: "Простий рахунок-фактура та email-нагадування про податки для ФОП.",
  email: "info@rakhuno.com",
  sameAs: [],
};

export const softwareLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Rakhuno",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://rakhuno.com",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "UAH",
  },
  description:
    "Онлайн рахунок-фактура для ФОП: заповніть документ, завантажте PDF, отримуйте нагадування про податки.",
};
