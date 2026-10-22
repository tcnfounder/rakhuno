import type { Metadata } from "next";
import Link from "next/link";
import { ArticleLayout } from "@/components/ArticleLayout";
import { JsonLd } from "@/components/JsonLd";
import { MidInvoiceCta } from "@/components/SiteShell";
import { TemplateDownload } from "@/components/TemplateDownload";

export const metadata: Metadata = {
  title: "Видаткова накладна ФОП: зразок і бланк Word",
  description:
    "Видаткова накладна для ФОП: обов’язкові реквізити, зразок заповнення без ПДВ і безкоштовний бланк Word. Чим вона відрізняється від рахунку й акту.",
  alternates: { canonical: "https://rakhuno.com/guides/vydatkova-nakladna" },
  openGraph: {
    title: "Видаткова накладна: зразок і бланк · Rakhuno",
    description: "Реквізити, приклад заповнення й бланк Word безкоштовно.",
    url: "https://rakhuno.com/guides/vydatkova-nakladna",
  },
};

const faqs = [
  {
    q: "Коли ФОП потрібна видаткова накладна?",
    a: "Коли ви продаєте й передаєте товар покупцю — особливо юрособі чи ФОП, якому потрібен документ для обліку. Для послуг замість накладної складають акт виконаних робіт (наданих послуг).",
  },
  {
    q: "Чим видаткова накладна відрізняється від рахунку-фактури?",
    a: "Рахунок-фактура просить оплатити товар і містить IBAN. Видаткова накладна підтверджує, що товар фактично передано покупцю. Часто їх оформлюють разом: рахунок — для оплати, накладна — при відвантаженні.",
  },
  {
    q: "Чи є затверджена форма видаткової накладної?",
    a: "Обов’язкової типової форми немає — достатньо реквізитів первинного документа зі ст. 9 Закону «Про бухгалтерський облік та фінансову звітність в Україні». Бланк на цій сторінці їх містить.",
  },
  {
    q: "Хто підписує видаткову накладну?",
    a: "Постачальник (відвантажив) і покупець або його представник (отримав). Повноваження представника зазвичай визначає договір. Печатка для ФОП не обов’язкова.",
  },
  {
    q: "Що писати ФОП-неплатнику ПДВ?",
    a: "Ціни й суми без ПДВ і позначку «Без ПДВ». Ставку та суму податку не вказуйте.",
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
  headline: "Видаткова накладна ФОП: зразок і бланк Word",
  description: metadata.description,
  datePublished: "2026-10-22",
  dateModified: "2026-10-22",
  author: { "@type": "Organization", name: "Rakhuno" },
  publisher: {
    "@type": "Organization",
    name: "Rakhuno",
    logo: { "@type": "ImageObject", url: "https://rakhuno.com/brand/icon-512.png" },
  },
  mainEntityOfPage: "https://rakhuno.com/guides/vydatkova-nakladna",
  inLanguage: "uk",
};

export default function Page() {
  return (
    <>
      <JsonLd data={[articleLd, faqLd]} />
      <ArticleLayout
        title="Видаткова накладна для ФОП: зразок і бланк"
        description="Обов’язкові реквізити, приклад заповнення без ПДВ і бланк Word безкоштовно."
        path="/guides/vydatkova-nakladna"
        related={[
          { href: "/guides/rahunok-faktura", label: "Що таке рахунок-фактура" },
          { href: "/guides/akt-vykonanykh-robit", label: "Акт виконаних робіт" },
          { href: "/guides/akt-zvirky", label: "Акт звірки" },
        ]}
      >
        <p className="rounded-xl border border-line bg-ink-2/40 p-5 text-paper">
          <strong>Видаткова накладна</strong> — первинний документ, який підтверджує, що
          постачальник (зокрема ФОП) передав товар покупцю: що саме, скільки й за якою ціною.
          Оплату просять{" "}
          <Link href="/guides/rahunok-faktura" className="text-signal underline-offset-2 hover:underline">
            рахунком-фактурою
          </Link>
          , а для послуг замість накладної складають{" "}
          <Link href="/guides/akt-vykonanykh-robit" className="text-signal underline-offset-2 hover:underline">
            акт виконаних робіт
          </Link>
          .
        </p>

        <TemplateDownload
          title="Скачати бланк видаткової накладної"
          text="Word (.docx), без реєстрації. Постачальник, покупець, підстава, таблиця товарів, сума прописом, підписи."
          files={[
            { href: "/templates/vydatkova-nakladna.docx", label: "Бланк накладної (.docx)", format: "docx" },
          ]}
        />

        <h2 className="!mt-10 font-display text-2xl text-paper">Обов’язкові реквізити</h2>
        <ul className="list-disc space-y-2 pl-5 text-mist">
          <li>назва документа, номер і дата;</li>
          <li>постачальник: ПІБ ФОП, РНОКПП; покупець: назва, код ЄДРПОУ або РНОКПП;</li>
          <li>підстава: договір, замовлення або рахунок-фактура;</li>
          <li>товари: найменування, одиниця виміру, кількість, ціна, сума;</li>
          <li>
            разом цифрами й{" "}
            <Link href="/suma-propysom" className="text-signal underline-offset-2 hover:underline">
              прописом
            </Link>
            , «без ПДВ» для неплатника ПДВ;
          </li>
          <li>підписи: хто відвантажив і хто отримав.</li>
        </ul>

        <h2 className="!mt-10 font-display text-2xl text-paper">Зразок заповнення</h2>
        <div className="not-prose rounded-xl border border-line bg-ink-2/40 p-5 text-sm leading-relaxed text-mist">
          <p className="font-display text-base text-paper">Видаткова накладна № 18 від 14.10.2026</p>
          <p className="mt-4">
            <strong className="text-paper/90">Постачальник:</strong> ФОП Петренко П. П., РНОКПП
            1234567890 · <strong className="text-paper/90">Покупець:</strong> ТОВ «Приклад»,
            ЄДРПОУ 12345678 · <strong className="text-paper/90">Підстава:</strong> рахунок-фактура
            № 18 від 10.10.2026
          </p>
          <p className="mt-4">1. Кава в зернах 1 кг — 10 шт. × 650,00 — 6 500,00 грн</p>
          <p className="mt-2">2. Чай листовий 250 г — 20 шт. × 180,00 — 3 600,00 грн</p>
          <p className="mt-2">
            <strong className="text-paper/90">Разом:</strong> 10 100,00 грн (Десять тисяч сто
            гривень 00 копійок), без ПДВ
          </p>
          <p className="mt-4">Відвантажив: ________ / Петренко П. П. · Отримав: ________ / Іваненко І. І.</p>
        </div>

        <MidInvoiceCta
          title="Спершу потрібен рахунок на оплату?"
          text="Створіть рахунок-фактуру з тими самими товарами: PDF з IBAN за 2 хвилини, безкоштовно."
          ctaLabel="Створити рахунок"
        />

        <h2 className="!mt-10 font-display text-2xl text-paper">Рахунок, накладна, акт: що коли</h2>
        <ul className="list-disc space-y-2 pl-5 text-mist">
          <li>
            <strong className="text-paper/90">Товар із передоплатою:</strong> рахунок-фактура → оплата
            → видаткова накладна при відвантаженні.
          </li>
          <li>
            <strong className="text-paper/90">Товар із відстрочкою:</strong> видаткова накладна при
            відвантаженні + рахунок, оплата пізніше.
          </li>
          <li>
            <strong className="text-paper/90">Послуги:</strong> рахунок і{" "}
            <Link href="/guides/akt-vykonanykh-robit" className="text-signal underline-offset-2 hover:underline">
              акт виконаних робіт
            </Link>{" "}
            замість накладної.
          </li>
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
