import type { Metadata } from "next";
import InvoiceClient from "@/app/invoice/InvoiceClient";
import { DEFAULT_OG_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Ukrainian invoice PDF generator for FOPs — free · Rakhuno" },
  description:
    "Make a Ukrainian invoice (rakhunok-faktura) as a PDF in two minutes with an English interface: IBAN, amount in words and a payment QR are filled in for you. Free, no sign-up.",
  alternates: {
    canonical: "https://rakhuno.com/en/invoice",
    languages: { uk: "https://rakhuno.com/invoice", en: "https://rakhuno.com/en/invoice" },
  },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    url: "https://rakhuno.com/en/invoice",
    locale: "en_US",
    title: "Ukrainian invoice PDF generator · Rakhuno",
    description: "English interface, Ukrainian invoice. PDF in two minutes. Free, no sign-up.",
  },
};

export default function EnglishInvoicePage() {
  return (
    <InvoiceClient
      lang="en"
      heading={{ h1: "Ukrainian invoice PDF generator", mobileH1: "Invoice PDF" }}
    />
  );
}
