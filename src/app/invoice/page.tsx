import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
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

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Як створити рахунок-проформу для ФОП?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Заповніть реквізити ФОП, покупця та позиції, вкажіть email і натисніть «Отримати PDF». Файл завантажиться у браузері.",
      },
    },
    {
      "@type": "Question",
      name: "Чи є PDF у листі?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ні. PDF зберігається локально в завантаженнях. Лист — welcome і нагадування про типові податкові строки.",
      },
    },
    {
      "@type": "Question",
      name: "Чи безкоштовно?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Так. Створення рахунку-проформи та PDF зараз безкоштовні.",
      },
    },
  ],
};

const howToLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Створити рахунок-проформу онлайн у Rakhuno",
  totalTime: "PT2M",
  step: [
    {
      "@type": "HowToStep",
      name: "Реквізити ФОП",
      text: "Вкажіть ПІБ, ІПН, IBAN і за потреби логотип.",
    },
    {
      "@type": "HowToStep",
      name: "Покупець і позиції",
      text: "Додайте дані клієнта та рядки послуг або товарів.",
    },
    {
      "@type": "HowToStep",
      name: "PDF",
      text: "Залиште email і завантажте PDF у браузері.",
    },
  ],
};

export default function InvoicePage() {
  return (
    <>
      <JsonLd data={[faqLd, howToLd]} />
      <InvoiceClient />
    </>
  );
}
