import type { Metadata } from "next";
import InvoiceClient from "./InvoiceClient";

export const metadata: Metadata = {
  title: "Рахунок-фактура онлайн",
  description:
    "Створіть рахунок-фактуру для ФОП і завантажте PDF. Email-нагадування про податки від Rakhuno.",
  alternates: { canonical: "https://rakhuno.com/invoice" },
  openGraph: {
    title: "Рахунок-фактура онлайн · Rakhuno",
    description:
      "Створіть рахунок-фактуру для ФОП і завантажте PDF. Email-нагадування про податки.",
    url: "https://rakhuno.com/invoice",
  },
  twitter: {
    card: "summary_large_image",
    title: "Рахунок-фактура онлайн · Rakhuno",
    description: "Створіть рахунок-фактуру для ФОП і завантажте PDF.",
    images: ["/brand/og-default.png"],
  },
};

export default function InvoicePage() {
  return <InvoiceClient />;
}
