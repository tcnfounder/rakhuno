import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArticleLayout } from "@/components/ArticleLayout";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Бланк рахунку-фактури для ФОП: скачати PDF онлайн без Word",
  description:
    "Бланк рахунку-фактури для ФОП: які поля потрібні замість Word/Excel і як одразу заповнити й скачати PDF онлайн у Rakhuno — безкоштовно.",
  alternates: { canonical: "https://rakhuno.com/guides/blank-rakhunku-faktury" },
  openGraph: {
    title: "Бланк рахунку-фактури для ФОП · Rakhuno",
    description: "Не копипастити IBAN у Word — заповніть онлайн і скачайте PDF.",
    url: "https://rakhuno.com/guides/blank-rakhunku-faktury",
  },
};

const faqs = [
  {
    q: "Де скачати бланк рахунку-фактури?",
    a: "Можна знайти Word/Excel у мережі, але для регулярних рахунків зручніше онлайн-форма: поля вже готові, PDF збирається за хвилини. У Rakhuno бланк = форма → PDF.",
  },
  {
    q: "Чи є офіційний бланк з гербом?",
    a: "Для оплати клієнту по IBAN достатньо чітких реквізитів і суми. «Офіційний бланк з гербом» не обов’язковий для типового рахунку ФОП.",
  },
  {
    q: "Бланк у Word чи онлайн PDF?",
    a: "Word має сенс, якщо замовник вимагає саме їхній шаблон. Інакше онлайн PDF швидший: не губите версії файлів і не копипастите IBAN щоразу.",
  },
  {
    q: "Чим бланк відрізняється від заповненого рахунку?",
    a: "Бланк — порожня структура полів. Заповнений рахунок — уже ваш документ з клієнтом і сумою. Rakhuno одразу дає заповнений PDF.",
  },
  {
    q: "Чи можна бланк рахунку на оплату без ПДВ?",
    a: "Так. У формі вкажіть позиції й примітку «без ПДВ», якщо так працюєте. Головне — щоб формулювання збігалося з вашою реальною системою оподаткування.",
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
  headline: "Бланк рахунку-фактури для ФОП",
  description: metadata.description,
  datePublished: "2026-09-28",
  dateModified: "2026-09-28",
  author: { "@type": "Organization", name: "Rakhuno" },
  publisher: {
    "@type": "Organization",
    name: "Rakhuno",
    logo: { "@type": "ImageObject", url: "https://rakhuno.com/brand/icon-512.png" },
  },
  mainEntityOfPage: "https://rakhuno.com/guides/blank-rakhunku-faktury",
  inLanguage: "uk",
};

const howToLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Як заповнити бланк рахунку-фактури онлайн",
  totalTime: "PT2M",
  step: [
    {
      "@type": "HowToStep",
      name: "Відкрити форму",
      text: "Перейдіть у конструктор рахунку Rakhuno — це і є робочий бланк.",
      url: "https://rakhuno.com/invoice",
    },
    {
      "@type": "HowToStep",
      name: "Заповнити поля",
      text: "ПІБ ФОП, ІПН, IBAN, покупець, позиції, примітка.",
    },
    {
      "@type": "HowToStep",
      name: "Скачати PDF",
      text: "Залиште email і завантажте готовий рахунок замість порожнього Word.",
    },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={[articleLd, faqLd, howToLd]} />
      <ArticleLayout
        title="Бланк рахунку-фактури для ФОП"
        description="Порожній Word не потрібен: заповніть поля онлайн і скачайте PDF."
        path="/guides/blank-rakhunku-faktury"
        related={[
          { href: "/guides/rakhunok-na-oplatu", label: "Рахунок на оплату" },
          { href: "/guides/zrazok-rahunku-faktury", label: "Зразок рахунку-фактури" },
          { href: "/invoice", label: "Заповнити бланк онлайн" },
        ]}
      >
        <p>
          Шукаєте <strong>бланк рахунку-фактури</strong> у Word або Excel — зазвичай потрібна не
          «порожня таблиця», а швидкий спосіб зібрати документ з IBAN і позиціями. У{" "}
          <Link href="/invoice" className="text-signal underline-offset-2 hover:underline">
            Rakhuno
          </Link>{" "}
          бланк уже зібраний у формі: заповнюєте → PDF.
        </p>

        <figure className="not-prose my-8">
          <Image
            src="/brand/sample-rakhunok-faktury-card.webp"
            alt="Бланк рахунку-фактури для ФОП: приклад заповненого PDF онлайн"
            width={1200}
            height={900}
            className="w-full rounded-xl border border-line"
            priority
          />
          <figcaption className="mt-2 text-sm text-muted">
            Заповнений бланк у вигляді PDF — те, що реально надсилають клієнту.
          </figcaption>
        </figure>

        <h2 className="!mt-10 font-display text-2xl text-paper">Які поля має мати бланк</h2>
        <ul className="list-disc space-y-2 pl-5 text-mist">
          <li>Назва документа, номер, дата.</li>
          <li>Постачальник: ПІБ ФОП, ІПН, контакти, IBAN.</li>
          <li>Покупець: назва / ПІБ, код (якщо є).</li>
          <li>Таблиця: назва, кількість, ціна, сума.</li>
          <li>Разом + примітка (строк, ПДВ / без ПДВ).</li>
        </ul>
        <p>
          Детальний приклад заповнення — у{" "}
          <Link
            href="/guides/zrazok-rahunku-faktury"
            className="text-signal underline-offset-2 hover:underline"
          >
            зразку рахунку-фактури
          </Link>{" "}
          і в гіді{" "}
          <Link
            href="/guides/rakhunok-na-oplatu"
            className="text-signal underline-offset-2 hover:underline"
          >
            рахунок на оплату
          </Link>
          .
        </p>

        <h2 className="!mt-10 font-display text-2xl text-paper">Word-бланк vs онлайн</h2>
        <div className="not-prose overflow-x-auto">
          <table className="w-full min-w-[280px] border-collapse text-left text-sm text-mist">
            <thead>
              <tr className="border-b border-line text-paper">
                <th className="py-2 pr-3 font-display font-medium"></th>
                <th className="py-2 pr-3 font-display font-medium">Word / Excel</th>
                <th className="py-2 font-display font-medium">Rakhuno PDF</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-line/80">
                <td className="py-2 pr-3 text-paper/90">Швидкість</td>
                <td className="py-2 pr-3">Копипаст IBAN</td>
                <td className="py-2">Профіль ФОП у браузері</td>
              </tr>
              <tr className="border-b border-line/80">
                <td className="py-2 pr-3 text-paper/90">Формат клієнту</td>
                <td className="py-2 pr-3">Часто «ще конвертуй у PDF»</td>
                <td className="py-2">Одразу PDF</td>
              </tr>
              <tr className="border-b border-line/80">
                <td className="py-2 pr-3 text-paper/90">Версії файлів</td>
                <td className="py-2 pr-3">rahunok_v7_final.docx</td>
                <td className="py-2">Номер у документі</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 text-paper/90">Коли треба Word</td>
                <td className="py-2 pr-3">Шаблон замовника</td>
                <td className="py-2">Типові рахунки ФОП</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="!mt-10 font-display text-2xl text-paper">Заповнити бланк за 2 хвилини</h2>
        <ol className="list-decimal space-y-3 pl-5 text-mist">
          <li>
            Відкрийте{" "}
            <Link href="/invoice" className="text-signal underline-offset-2 hover:underline">
              онлайн-бланк рахунку
            </Link>
            .
          </li>
          <li>Внесіть ФОП, покупця, позиції.</li>
          <li>Залиште email → скачайте PDF.</li>
          <li>Надішліть клієнту (email / Telegram).</li>
        </ol>

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
