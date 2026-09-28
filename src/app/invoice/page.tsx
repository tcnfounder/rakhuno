import type { Metadata } from "next";
import InvoiceClient from "./InvoiceClient";

export const metadata: Metadata = {
  title: "Рахунок-проформа онлайн",
  description:
    "Створіть рахунок-проформу для ФОП у українському форматі і завантажте PDF. Email-нагадування про податки від Rakhuno.",
  alternates: { canonical: "https://rakhuno.com/invoice" },
  openGraph: {
    title: "Рахунок-проформа онлайн · Rakhuno",
    description:
      "Створіть рахунок-проформу для ФОП і завантажте PDF. Email-нагадування про податки.",
    url: "https://rakhuno.com/invoice",
  },
  twitter: {
    card: "summary_large_image",
    title: "Рахунок-проформа онлайн · Rakhuno",
    description: "Створіть рахунок-проформу для ФОП і завантажте PDF.",
    images: ["/brand/og-default.png"],
  },
};

export default function InvoicePage() {
  return <InvoiceClient />;
}
