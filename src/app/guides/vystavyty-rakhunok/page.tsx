import type { Metadata } from "next";
import Link from "next/link";
import { ArticleLayout } from "@/components/ArticleLayout";
import { JsonLd } from "@/components/JsonLd";
import { MidInvoiceCta } from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "Як виставити рахунок на оплату ФОП онлайн: крок за кроком",
  description:
    "Як виставити рахунок на оплату для ФОП: коли надсилати клієнту, які реквізити вказати й як за 2 хвилини скачати PDF онлайн у Rakhuno — без Word і Checkbox.",
  alternates: { canonical: "https://rakhuno.com/guides/vystavyty-rakhunok" },
  openGraph: {
    title: "Як виставити рахунок на оплату ФОП · Rakhuno",
    description: "Кроки: реквізити → позиції → PDF → клієнту. Без бланка Word.",
    url: "https://rakhuno.com/guides/vystavyty-rakhunok",
  },
};

const faqs = [
  {
    q: "Як виставити рахунок ФОП клієнту?",
    a: "Зберіть номер і дату, свої реквізити (ПІБ, ІПН, IBAN), дані покупця, позиції зі сумою й коротку примітку про строк оплати. У Rakhuno ці поля вже в формі — заповнюєте й одразу качаєте PDF.",
  },
  {
    q: "Що таке рахунок на оплату?",
    a: "Документ, яким ви просите замовника переказати гроші на IBAN за конкретні послуги чи товари. У розмовній мові ФОП часто кажуть просто «рахунок» або «рахунок-фактура» — суть та сама: куди, за що й скільки платити.",
  },
  {
    q: "Коли виставляти рахунок — до чи після роботи?",
    a: "Найчастіше до оплати: після узгодження обсягу або кошторису. Іноді — по етапах (аванс + фінал). Головне, щоб сума й опис збігалися з тим, що клієнт реально оплачує.",
  },
  {
    q: "Чи потрібен Checkbox або Медок, щоб виставити рахунок?",
    a: "Ні. Для простого рахунку на оплату достатньо зрозумілого PDF з реквізитами. Checkbox/Медок — облік і звітність, а не мінімальний документ клієнту.",
  },
  {
    q: "Куди надсилати рахунок клієнту?",
    a: "Email, Telegram, Viber — як зручно замовнику. Збережіть копію PDF собі (номер документа в назві файлу допомагає знайти його пізніше).",
  },
  {
    q: "Що писати в призначенні платежу?",
    a: "Коротко: «Оплата за рахунком №… від …» і суть послуги. Так бухгалтерія клієнта швидше проводить платіж.",
  },
];

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const articleLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Як виставити рахунок на оплату ФОП онлайн",
  description: metadata.description,
  datePublished: "2026-09-28",
  dateModified: "2026-09-29",
  author: { "@type": "Organization", name: "Rakhuno" },
  publisher: {
    "@type": "Organization",
    name: "Rakhuno",
    logo: { "@type": "ImageObject", url: "https://rakhuno.com/brand/icon-512.png" },
  },
  mainEntityOfPage: "https://rakhuno.com/guides/vystavyty-rakhunok",
  inLanguage: "uk",
};

const howToLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Як виставити рахунок на оплату ФОП",
  description:
    "Заповніть реквізити ФОП і позиції в Rakhuno, залиште email — PDF завантажиться в браузері.",
  totalTime: "PT2M",
  step: [
    {
      "@type": "HowToStep",
      name: "Відкрити конструктор",
      text: "Перейдіть на сторінку рахунку Rakhuno.",
      url: "https://rakhuno.com/invoice",
    },
    {
      "@type": "HowToStep",
      name: "Заповнити реквізити й позиції",
      text: "ПІБ ФОП, ІПН, IBAN, покупець, послуги/товари та сума.",
    },
    {
      "@type": "HowToStep",
      name: "Скачати PDF і надіслати",
      text: "Залиште email, завантажте PDF у браузері й надішліть клієнту.",
    },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={[articleLd, faqLd, howToLd]} />
      <ArticleLayout
        title="Як виставити рахунок на оплату ФОП"
        description="Коли надсилати, які поля потрібні й як одразу зібрати PDF онлайн — без Word."
        path="/guides/vystavyty-rakhunok"
        related={[
          { href: "/guides/rakhunok-na-oplatu", label: "Рахунок на оплату" },
          { href: "/guides/blank-rakhunku-faktury", label: "Бланк рахунку-фактури" },
          { href: "/invoice", label: "Виставити рахунок зараз" },
        ]}
      >
        <p>
          <strong>Виставити рахунок</strong> означає надіслати клієнту документ на оплату: за що
          платити, скільки й на які реквізити. Для більшості сервісних ФОП це{" "}
          <strong>рахунок на оплату</strong> (проформа / рахунок-фактура в побутовій мові) у форматі
          PDF — без обов’язкового Checkbox чи Медок.
        </p>
        <p>
          Нижче — короткий порядок дій і шлях до готового файлу в{" "}
          <Link href="/invoice" className="text-signal underline-offset-2 hover:underline">
            Rakhuno
          </Link>
          . Теорія полів — у{" "}
          <Link
            href="/guides/rahunok-faktura"
            className="text-signal underline-offset-2 hover:underline"
          >
            гіді про рахунок-фактуру
          </Link>
          ; приклад структури — у{" "}
          <Link
            href="/guides/zrazok-rahunku-faktury"
            className="text-signal underline-offset-2 hover:underline"
          >
            зразку
          </Link>
          .
        </p>

        <MidInvoiceCta
          title="Виставити рахунок зараз"
          text="Кроки нижче — у конструкторі Rakhuno: реквізити → позиції → PDF клієнту."
        />

        <h2 className="!mt-10 font-display text-2xl text-paper">Коли виставляти рахунок</h2>
        <ul className="list-disc space-y-2 pl-5 text-mist">
          <li>Після узгодження обсягу робіт або кошторису — до оплати.</li>
          <li>По етапах: аванс + фінал, якщо так домовились.</li>
          <li>Коли клієнт просить «рахунок на оплату» для бухгалтерії перед платежем.</li>
        </ul>
        <p>
          Не плутайте з актом виконаних робіт: рахунок просить гроші; акт фіксує факт виконання. Багато
          ФОП спочатку надсилають рахунок, потім — акт після здачі.
        </p>

        <h2 className="!mt-10 font-display text-2xl text-paper">Що має бути в рахунку на оплату</h2>
        <ol className="list-decimal space-y-2 pl-5 text-mist">
          <li>Номер і дата документа.</li>
          <li>Постачальник: ПІБ ФОП, ІПН, контакти, IBAN і банк.</li>
          <li>Покупець: назва / ПІБ, ЄДРПОУ або ІПН (якщо є).</li>
          <li>Позиції: конкретна назва послуги, кількість, ціна, сума.</li>
          <li>Разом + примітка (строк оплати, «без ПДВ» / зі ставкою).</li>
        </ol>
        <p>
          IBAN краще копіювати з виписки банку. У призначенні платежу клієнту підкажіть фразу на кшталт
          «Оплата за рахунком №… від …».
        </p>

        <h2 className="!mt-10 font-display text-2xl text-paper">Виставити рахунок онлайн за 2 хвилини</h2>
        <ol className="list-decimal space-y-3 pl-5 text-mist">
          <li>
            Відкрийте{" "}
            <Link href="/invoice" className="text-signal underline-offset-2 hover:underline">
              конструктор рахунку
            </Link>
            .
          </li>
          <li>Заповніть блоки: ФОП, покупець, позиції, примітка.</li>
          <li>Залиште email → PDF завантажиться в браузері.</li>
          <li>Надішліть файл клієнту (email / Telegram) і збережіть копію собі.</li>
        </ol>
        <p>
          Дані продавця можна зберегти локально в браузері — наступні рахунки швидші. Детальніше про
          онлайн-формат — у гіді{" "}
          <Link
            href="/guides/rahunok-onlayn"
            className="text-signal underline-offset-2 hover:underline"
          >
            рахунок онлайн
          </Link>
          .
        </p>

        <h2 className="!mt-10 font-display text-2xl text-paper">Типові помилки</h2>
        <ul className="list-disc space-y-2 pl-5 text-mist">
          <li>Порожня назва позиції («послуги») — клієнт не розуміє, за що платить.</li>
          <li>Різна сума в рахунку й у платежі.</li>
          <li>Помилка в IBAN або відсутній номер документа в архіві.</li>
          <li>Чекати «офіційний бланк з гербом» — для оплати по IBAN достатньо чітких реквізитів.</li>
        </ul>

        <h2 className="!mt-10 font-display text-2xl text-paper">Часті питання</h2>
        <div className="divide-y divide-line">
          {faqs.map((f) => (
            <div key={f.q} className="py-5">
              <h3 className="font-display text-lg text-paper">{f.q}</h3>
              <p className="mt-2 text-mist">{f.a}</p>
            </div>
          ))}
        </div>

        <p className="!mt-8 text-sm text-muted">
          Матеріал інформаційний і не є податковою чи бухгалтерською консультацією.
        </p>
      </ArticleLayout>
    </>
  );
}
