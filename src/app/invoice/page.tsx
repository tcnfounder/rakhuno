import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import InvoiceClient from "./InvoiceClient";

export const metadata: Metadata = {
  title: "Рахунок-фактура PDF для ФОП за 2 хвилини — безкоштовно",
  description:
    "Виставити рахунок на оплату для ФОП: реквізити → PDF у браузері за ~2 хвилини. Без Word і Checkbox. Email лише для податкових нагадувань.",
  alternates: { canonical: "https://rakhuno.com/invoice" },
  openGraph: {
    title: "Рахунок-фактура PDF для ФОП · Rakhuno",
    description:
      "Безкоштовний рахунок на оплату за 2 хвилини: PDF у браузері + податкові нагадування.",
    url: "https://rakhuno.com/invoice",
  },
  twitter: {
    card: "summary_large_image",
    title: "Рахунок-фактура PDF для ФОП · Rakhuno",
    description: "PDF за 2 хвилини. Безкоштовно. Без Word.",
    images: ["/brand/og-default.png"],
  },
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Як виставити рахунок-фактуру онлайн для ФОП?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Заповніть реквізити ФОП, покупця та позиції, вкажіть email і натисніть «Отримати PDF». Файл завантажиться у браузері.",
      },
    },
    {
      "@type": "Question",
      name: "Це рахунок на оплату чи проформа-інвойс?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Так. У документі — рахунок-проформа (рахунок на оплату) з реквізитами, позиціями й сумою для переказу на IBAN. Не є податковою накладною.",
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
        text: "Так. Створення рахунку-фактури та PDF зараз безкоштовні.",
      },
    },
  ],
};

const howToLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Виставити рахунок-фактуру онлайн у Rakhuno",
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
      text: "Залиште email і завантажте рахунок на оплату в браузері.",
    },
  ],
};

export default function InvoicePage() {
  return (
    <>
      <JsonLd data={[faqLd, howToLd]} />
      <InvoiceClient />
      <section className="print:hidden border-t border-line bg-ink px-5 py-12 md:px-10">
        <div className="mx-auto w-full max-w-3xl">
          <h2 className="font-display text-2xl text-paper md:text-3xl">
            Рахунок-фактура онлайн за 2 хвилини
          </h2>
          <p className="mt-3 text-mist">
            Rakhuno збирає <strong className="text-paper/90">рахунок на оплату</strong> (проформа /
            рахунок-фактура в побутовій мові) у PDF: реквізити ФОП, покупець, позиції, сума прописом.
            Без Word-бланка й без Checkbox.
          </p>
          <h3 className="mt-8 font-display text-xl text-paper">Що заповнити перед PDF</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-mist">
            <li>ПІБ ФОП, ІПН (РНОКПП), IBAN — профіль можна зберегти в браузері.</li>
            <li>Дані покупця: назва / ПІБ, ЄДРПОУ або ІПН, адреса за потреби.</li>
            <li>Позиції з конкретною назвою послуги (не голе «роботи»), кількість і ціна.</li>
            <li>Примітка: строк оплати, «без ПДВ» / ставка, призначення платежу.</li>
          </ul>
          <h3 className="mt-8 font-display text-xl text-paper">Коли цього достатньо</h3>
          <p className="mt-3 text-mist">
            ФОП і фрілансери з кількома рахунками на місяць, клієнти-юрособи, яким потрібен PDF на
            оплату, а не повний електронний документообіг. Якщо замовник вимагає саме Медок / Вчасно
            / Checkbox як канал — робіть за їхнім регламентом. Якщо треба лише зрозумілий рахунок на
            IBAN — цієї форми достатньо.
          </p>
          <p className="mt-4 text-mist">
            PDF зберігається локально в завантаженнях — зручно надіслати в Telegram, email чи Drive.
            Лист від Rakhuno — welcome і нагадування про типові податкові строки, не копія PDF у
            вкладенні.
          </p>
          <p className="mt-4 text-mist">
            Гіди:{" "}
            <Link
              href="/guides/rahunok-faktura"
              className="text-signal underline-offset-2 hover:underline"
            >
              рахунок-фактура для ФОП
            </Link>
            ,{" "}
            <Link
              href="/guides/rakhunok-na-oplatu"
              className="text-signal underline-offset-2 hover:underline"
            >
              рахунок на оплату
            </Link>
            ,{" "}
            <Link
              href="/guides/blank-rakhunku-faktury"
              className="text-signal underline-offset-2 hover:underline"
            >
              бланк
            </Link>
            ,{" "}
            <Link
              href="/guides/vystavyty-rakhunok"
              className="text-signal underline-offset-2 hover:underline"
            >
              як виставити рахунок
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
