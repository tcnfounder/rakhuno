import type { Metadata } from "next";
import InvoiceClient from "./InvoiceClient";

export const metadata: Metadata = {
  title: "Рахунок-фактура онлайн",
  description:
    "Створіть рахунок-фактуру для ФОП і завантажте PDF. Email-нагадування про податки від Rakhuno.",
};

export default function InvoicePage() {
  return <InvoiceClient />;
}
