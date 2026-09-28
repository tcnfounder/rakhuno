import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArticleLayout } from "@/components/ArticleLayout";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Рахунок-фактура зразок для ФОП: поля, приклад, PDF онлайн",
  description:
    "Рахунок-фактура зразок для ФОП: які поля заповнити, приклад структури без Word і як одразу скачати PDF онлайн у Rakhuno.",
  alternates: { canonical: "https://rakhuno.com/guides/zrazok-rahunku-faktury" },
  openGraph: {
    title: "Рахунок-фактура зразок для ФОП · Rakhuno",
    description: "Приклад полів + онлайн PDF за 2 хвилини — без бланка Word.",
    url: "https://rakhuno.com/guides/zrazok-rahunku-faktury",
  },
};

const faqs = [
  {
    q: "Де взяти зразок рахунку-фактури для ФОП?",
    a: "Достатньо структури: номер і дата, постачальник, покупець, позиції, сума, примітка. У Rakhuno ці поля вже в формі — заповнюєте й одразу отримуєте PDF.",
  },
  {
    q: "Чи потрібен офіційний бланк з гербом?",
    a: "Ні. Для оплати клієнту важливі чіткі реквізити й сума. Печатка чи скан підпису — лише якщо так вимагає договір замовника.",
  },
  {
    q: "Чим зразок відрізняється від готового PDF?",
    a: "Зразок показує, які поля мають бути. Готовий PDF — уже ваш документ з IBAN і позиціями. Rakhuno збирає саме готовий файл.",
  },
  {
    q: "Чи можна скачати Word-шаблон?",
    a: "Можна шукати бланки в мережі, але для 5–30 рахунків на місяць зручніше онлайн-форма: не копипастити IBAN щоразу.",
  },
  {
    q: "Що писати в призначенні платежу?",
    a: "Коротко: «Оплата за рахунком №… від …» і суть послуги — так бухгалтерія клієнта швидше проводить платіж.",
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
  headline: "Зразок рахунку-фактури для ФОП",
  description: metadata.description,
  datePublished: "2026-09-28",
  dateModified: "2026-09-28",
  author: { "@type": "Organization", name: "Rakhuno" },
  publisher: {
    "@type": "Organization",
    name: "Rakhuno",
    logo: { "@type": "ImageObject", url: "https://rakhuno.com/brand/icon-512.png" },
  },
  mainEntityOfPage: "https://rakhuno.com/guides/zrazok-rahunku-faktury",
  inLanguage: "uk",
};

const howToLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Як зробити рахунок за зразком онлайн",
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
      name: "Заповнити поля зі зразка",
      text: "ПІБ ФОП, ІПН, IBAN, покупець, позиції, примітка про строк оплати.",
    },
    {
      "@type": "HowToStep",
      name: "Скачати PDF",
      text: "Залиште email і завантажте PDF у браузері, потім надішліть клієнту.",
    },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={[articleLd, faqLd, howToLd]} />
      <ArticleLayout
        title="Зразок рахунку-фактури для ФОП"
        description="Які поля потрібні, приклад структури й як одразу зібрати PDF онлайн — без Word."
        path="/guides/zrazok-rahunku-faktury"
        related={[
          { href: "/guides/rakhunok-na-oplatu", label: "Рахунок на оплату" },
          { href: "/guides/blank-rakhunku-faktury", label: "Бланк рахунку-фактури" },
          { href: "/invoice", label: "Створити PDF зараз" },
        ]}
      >
        <p>
          Шукаєте <strong>зразок рахунку-фактури</strong> — частіше потрібна не «красива таблиця в
          Word», а зрозумілий набір полів, щоб клієнт заплатив на IBAN без уточнень. Нижче —
          робочий приклад структури для ФОП і шлях до готового PDF у{" "}
          <Link href="/invoice" className="text-signal underline-offset-2 hover:underline">
            Rakhuno
          </Link>
          .
        </p>

        <figure className="not-prose my-8">
          <Image
            src="/brand/invoice.webp"
            alt="Зразок рахунку-фактури для ФОП: приклад PDF з реквізитами та позиціями"
            width={1200}
            height={630}
            className="w-full rounded-xl border border-line"
            priority
          />
          <figcaption className="mt-2 text-sm text-muted">
            Візуальний зразок рахунку-фактури — те, що клієнт бачить у PDF.
          </figcaption>
        </figure>

        <h2 className="!mt-10 font-display text-2xl text-paper">Зразок полів (приклад)</h2>
        <div className="not-prose rounded-xl border border-line bg-ink-2/40 p-5 text-sm leading-relaxed text-mist">
          <p className="font-display text-base text-paper">
            Рахунок-фактура (проформа) № 12 від 28.09.2026
          </p>
          <p className="mt-4">
            <strong className="text-paper/90">Постачальник:</strong> ФОП Петренко П. П., ІПН
            1234567890, адреса …, тел. …, IBAN UA00…0000, банк …
          </p>
          <p className="mt-2">
            <strong className="text-paper/90">Покупець:</strong> ТОВ «Приклад», ЄДРПОУ 12345678,
            адреса …
          </p>
          <p className="mt-4">
            <strong className="text-paper/90">Позиція 1:</strong> Розробка лендінгу — 1 шт. — 12
            000,00 грн
          </p>
          <p className="mt-2">
            <strong className="text-paper/90">Разом:</strong> 12 000,00 грн (дванадцять тисяч грн 00
            коп.), без ПДВ
          </p>
          <p className="mt-2">
            <strong className="text-paper/90">Примітка:</strong> оплата протягом 5 банківських днів;
            призначення платежу: «Оплата за рахунком № 12 від 28.09.2026»
          </p>
        </div>
        <p className="mt-4">
          Це не бланк з гербом і не акт виконаних робіт. Це{" "}
          <em>зразок логіки полів</em>, яку клієнт і банк читають за 10 секунд. Теорія документа — у
          гідові{" "}
          <Link
            href="/guides/rahunok-faktura"
            className="text-signal underline-offset-2 hover:underline"
          >
            рахунок-фактура для ФОП
          </Link>
          .
        </p>

        <h2 className="!mt-10 font-display text-2xl text-paper">Що обов’язково перевірити</h2>
        <ul className="list-disc space-y-2 pl-5 text-mist">
          <li>IBAN без помилок (краще з виписки банку).</li>
          <li>Конкретна назва послуги, не просто «послуги».</li>
          <li>Одна й та сама сума в рахунку й у платежі.</li>
          <li>Номер документа — щоб потім знайти PDF у архіві.</li>
          <li>«Без ПДВ» / зі ставкою — як ви реально працюєте.</li>
        </ul>

        <h2 className="!mt-10 font-display text-2xl text-paper">Зразок → готовий PDF за 2 хвилини</h2>
        <ol className="list-decimal space-y-3 pl-5 text-mist">
          <li>
            Відкрийте{" "}
            <Link href="/invoice" className="text-signal underline-offset-2 hover:underline">
              конструктор рахунку
            </Link>
            .
          </li>
          <li>Заповніть блоки зі зразка вище (ФОП, покупець, позиції).</li>
          <li>Залиште email → PDF завантажиться в браузері.</li>
          <li>Надішліть файл клієнту (Telegram / email) і збережіть копію собі.</li>
        </ol>
        <p>
          Word-шаблон має сенс, якщо клієнт вимагає саме їхній бланк. Для типових рахунків ФОП
          швидше{" "}
          <Link
            href="/guides/rahunok-onlayn"
            className="text-signal underline-offset-2 hover:underline"
          >
            рахунок онлайн
          </Link>{" "}
          з живим PDF.
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
