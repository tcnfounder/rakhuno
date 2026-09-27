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
    title: "Рахунок-фактура онлайн · Rakhuno",
    description:
      "Створіть рахунок-фактуру для ФОП і завантажте PDF.",
  },
};

export default function InvoicePage() {
  return <InvoiceClient />;
}
