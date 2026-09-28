import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArticleLayout } from "@/components/ArticleLayout";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Рахунок на оплату для ФОП: зразок, реквізити, PDF онлайн",
  description:
    "Рахунок на оплату для ФОП: які поля потрібні, зразок структури, бланк без Word і як одразу виставити PDF онлайн у Rakhuno.",
  alternates: { canonical: "https://rakhuno.com/guides/rakhunok-na-oplatu" },
  openGraph: {
    title: "Рахунок на оплату для ФОП · Rakhuno",
    description: "Зразок полів + онлайн PDF за 2 хвилини — без Excel і Checkbox.",
    url: "https://rakhuno.com/guides/rakhunok-na-oplatu",
  },
};

const faqs = [
  {
    q: "Що таке рахунок на оплату?",
    a: "Документ, яким ФОП або компанія просить клієнта переказати гроші на IBAN за товари чи послуги. У розмовній мові його часто називають рахунком-фактурою або просто рахунком.",
  },
  {
    q: "Чим рахунок на оплату відрізняється від рахунку-фактури?",
    a: "Для більшості ФОП — нічим суттєвим: потрібні реквізити, позиції й сума. «Рахунок-фактура» і «рахунок на оплату» в пошуку й переписці часто означають один і той самий PDF клієнту.",
  },
  {
    q: "Де взяти зразок рахунку на оплату для ФОП?",
    a: "Достатньо структури: номер/дата, постачальник, покупець, таблиця позицій, разом, примітка. У Rakhuno ці поля вже в формі — заповнюєте й качаєте PDF, без окремого Word.",
  },
  {
    q: "Чи потрібен бланк у Word або Excel?",
    a: "Лише якщо клієнт вимагає їхній шаблон. Для типових оплат швидше онлайн-генератор з готовим PDF.",
  },
  {
    q: "Як виставити рахунок на оплату онлайн?",
    a: "Відкрийте конструктор Rakhuno, внесіть реквізити ФОП і клієнта, додайте позиції, залиште email — PDF завантажиться в браузері.",
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
  headline: "Рахунок на оплату для ФОП: зразок, реквізити, PDF онлайн",
  description: metadata.description,
  datePublished: "2026-09-28",
  dateModified: "2026-09-28",
  author: { "@type": "Organization", name: "Rakhuno" },
  publisher: {
    "@type": "Organization",
    name: "Rakhuno",
    logo: { "@type": "ImageObject", url: "https://rakhuno.com/brand/icon-512.png" },
  },
  mainEntityOfPage: "https://rakhuno.com/guides/rakhunok-na-oplatu",
  inLanguage: "uk",
};

const howToLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Як виставити рахунок на оплату ФОП онлайн",
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
      name: "Заповнити реквізити",
      text: "ПІБ ФОП, ІПН, IBAN, покупець, позиції, строк оплати.",
    },
    {
      "@type": "HowToStep",
      name: "Скачати PDF",
      text: "Залиште email і завантажте рахунок на оплату в браузері.",
    },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={[articleLd, faqLd, howToLd]} />
      <ArticleLayout
        title="Рахунок на оплату для ФОП"
        description="Зразок полів, обов’язкові реквізити й готовий PDF клієнту за кілька хвилин."
        path="/guides/rakhunok-na-oplatu"
        related={[
          { href: "/guides/blank-rakhunku-faktury", label: "Бланк рахунку-фактури" },
          { href: "/guides/vystavyty-rakhunok", label: "Як виставити рахунок" },
          { href: "/invoice", label: "Створити PDF зараз" },
        ]}
      >
        <p>
          <strong>Рахунок на оплату</strong> — документ, з яким клієнт бачить: куди платити, за що й
          скільки. Для ФОП це найчастіший спосіб отримати гроші на IBAN без важкої бухгалтерії.
        </p>
        <p>
          Нижче — зразок логіки полів і шлях до PDF у{" "}
          <Link href="/invoice" className="text-signal underline-offset-2 hover:underline">
            Rakhuno
          </Link>
          . Теорія «рахунку-фактури» — у{" "}
          <Link
            href="/guides/rahunok-faktura"
            className="text-signal underline-offset-2 hover:underline"
          >
            окремому гіді
          </Link>
          .
        </p>

        <figure className="not-prose my-8">
          <Image
            src="/brand/invoice.webp"
            alt="Зразок рахунку на оплату для ФОП у форматі PDF — приклад полів Rakhuno"
            width={1200}
            height={630}
            className="w-full rounded-xl border border-line"
            priority
          />
          <figcaption className="mt-2 text-sm text-muted">
            Приклад вигляду рахунку на оплату: сторони, таблиця, сума.
          </figcaption>
        </figure>

        <h2 className="!mt-10 font-display text-2xl text-paper">Зразок полів рахунку на оплату</h2>
        <div className="not-prose rounded-xl border border-line bg-ink-2/40 p-5 text-sm leading-relaxed text-mist">
          <p className="font-display text-base text-paper">
            Рахунок на оплату № 18 від 28.09.2026
          </p>
          <p className="mt-4">
            <strong className="text-paper/90">Постачальник:</strong> ФОП Коваленко К. К., ІПН
            1234567890, IBAN UA00…0000
          </p>
          <p className="mt-2">
            <strong className="text-paper/90">Покупець:</strong> ТОВ «Замовник», ЄДРПОУ 12345678
          </p>
          <p className="mt-4">
            <strong className="text-paper/90">Позиція:</strong> Дизайн лендінгу — 1 шт. — 8 500,00 грн
          </p>
          <p className="mt-2">
            <strong className="text-paper/90">Разом:</strong> 8 500,00 грн, без ПДВ
          </p>
          <p className="mt-2">
            <strong className="text-paper/90">Примітка:</strong> оплата протягом 3 банківських днів
          </p>
        </div>

        <h2 className="!mt-10 font-display text-2xl text-paper">Що обов’язково перевірити</h2>
        <ul className="list-disc space-y-2 pl-5 text-mist">
          <li>IBAN без помилок.</li>
          <li>Конкретна назва послуги, не «послуги».</li>
          <li>Одна сума в документі й у платежі.</li>
          <li>Номер рахунку — щоб знайти PDF у архіві.</li>
          <li>«Без ПДВ» / зі ставкою — як ви реально працюєте.</li>
        </ul>

        <h2 className="!mt-10 font-display text-2xl text-paper">Онлайн замість бланка Word</h2>
        <ol className="list-decimal space-y-3 pl-5 text-mist">
          <li>
            Відкрийте{" "}
            <Link href="/invoice" className="text-signal underline-offset-2 hover:underline">
              конструктор рахунку
            </Link>
            .
          </li>
          <li>Заповніть блоки зі зразка вище.</li>
          <li>Залиште email → PDF у завантаженнях браузера.</li>
          <li>Надішліть клієнту й збережіть копію собі.</li>
        </ol>
        <p>
          Шукаєте саме «бланк» для друку — див.{" "}
          <Link
            href="/guides/blank-rakhunku-faktury"
            className="text-signal underline-offset-2 hover:underline"
          >
            бланк рахунку-фактури
          </Link>
          : там пояснюємо, чому онлайн-PDF частіше зручніший за Word.
        </p>

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
