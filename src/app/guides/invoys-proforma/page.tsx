import type { Metadata } from "next";
import Link from "next/link";
import { ArticleLayout } from "@/components/ArticleLayout";
import { JsonLd } from "@/components/JsonLd";
import { MidInvoiceCta } from "@/components/SiteShell";
import { TemplateDownload } from "@/components/TemplateDownload";

export const metadata: Metadata = {
  title: "Інвойс і проформа для ФОП: зразок UA/EN, бланк",
  description:
    "Що таке інвойс і проформа-інвойс для ФОП, чим відрізняються від рахунку-фактури, які поля потрібні іноземному клієнту. Двомовний бланк Word безкоштовно.",
  alternates: { canonical: "https://rakhuno.com/guides/invoys-proforma" },
  openGraph: {
    title: "Інвойс і проформа: зразок UA/EN · Rakhuno",
    description: "Двомовний інвойс для ФОП: поля, приклад і бланк Word безкоштовно.",
    url: "https://rakhuno.com/guides/invoys-proforma",
  },
};

const faqs = [
  {
    q: "Чим інвойс відрізняється від рахунку-фактури?",
    a: "За суттю — нічим: обидва просять оплатити. «Інвойс» (invoice) — звична назва в міжнародній практиці, тому його виставляють іноземним клієнтам, часто двомовним (українська + англійська) і у валюті. Для українських клієнтів кажуть «рахунок» або «рахунок-фактура».",
  },
  {
    q: "Що таке проформа-інвойс?",
    a: "Попередній рахунок: його надсилають до поставки чи надання послуг, щоб клієнт оплатив аванс або погодив суму. Проформа не підтверджує, що послугу вже надано.",
  },
  {
    q: "Чи може оплачений інвойс замінити акт виконаних робіт?",
    a: "Може, якщо інвойс містить реквізити первинного документа, а договір чи оферта прямо передбачає, що оплата інвойсу означає прийняття послуг. Так часто працюють ФОП з іноземними клієнтами. Формулювання варто погодити з бухгалтером.",
  },
  {
    q: "Які поля потрібні в інвойсі для іноземного клієнта?",
    a: "Номер і дата, дані ФОП англійською (ПІБ, адреса, РНОКПП), дані клієнта, опис послуг, кількість, ціна, валюта, загальна сума, строк оплати, банківські реквізити для валютного платежу (IBAN, банк, SWIFT) і позначка, що ПДВ не застосовується, якщо ви не платник ПДВ.",
  },
  {
    q: "У якій валюті виставляти інвойс?",
    a: "У валюті договору — зазвичай USD або EUR. Для зарахування валюти ФОП потрібен валютний рахунок; реквізити для SWIFT-платежу дає ваш банк.",
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
  headline: "Інвойс і проформа для ФОП: зразок UA/EN, бланк",
  description: metadata.description,
  datePublished: "2026-10-22",
  dateModified: "2026-10-22",
  author: { "@type": "Organization", name: "Rakhuno" },
  publisher: {
    "@type": "Organization",
    name: "Rakhuno",
    logo: { "@type": "ImageObject", url: "https://rakhuno.com/brand/icon-512.png" },
  },
  mainEntityOfPage: "https://rakhuno.com/guides/invoys-proforma",
  inLanguage: "uk",
};

export default function Page() {
  return (
    <>
      <JsonLd data={[articleLd, faqLd]} />
      <ArticleLayout
        title="Інвойс і проформа-інвойс для ФОП: зразок і бланк"
        description="Що це, чим відрізняються від рахунку-фактури, які поля потрібні іноземному клієнту, і двомовний бланк Word."
        path="/guides/invoys-proforma"
        related={[
          { href: "/guides/rahunok-faktura", label: "Що таке рахунок-фактура" },
          { href: "/guides/akt-vykonanykh-robit", label: "Акт виконаних робіт" },
          { href: "/guides/zrazok-rahunku-faktury", label: "Зразок рахунку-фактури" },
        ]}
      >
        <p className="rounded-xl border border-line bg-ink-2/40 p-5 text-paper">
          <strong>Інвойс</strong> (invoice) — рахунок на оплату товарів чи послуг; так його
          називають у міжнародній практиці, тому ФОП виставляють інвойси іноземним клієнтам,
          зазвичай двомовні й у валюті. <strong>Проформа-інвойс</strong> — попередній рахунок до
          поставки або надання послуг, наприклад для авансу. Для українських клієнтів той самий
          документ називають{" "}
          <Link href="/guides/rahunok-faktura" className="text-signal underline-offset-2 hover:underline">
            рахунком-фактурою
          </Link>
          .
        </p>

        <TemplateDownload
          title="Скачати двомовний бланк інвойсу (UA/EN)"
          text="Word (.docx), без реєстрації. Поля українською й англійською, валюта, IBAN і SWIFT, умова про прийняття послуг."
          files={[{ href: "/templates/invoys-ua-en.docx", label: "Інвойс UA/EN (.docx)", format: "docx" }]}
        />

        <h2 className="!mt-10 font-display text-2xl text-paper">Інвойс, проформа, рахунок-фактура</h2>
        <div className="not-prose overflow-x-auto">
          <table className="w-full min-w-[320px] border-collapse text-left text-sm text-mist">
            <thead>
              <tr className="border-b border-line text-paper">
                <th className="py-2 pr-3 font-display font-medium">Документ</th>
                <th className="py-2 pr-3 font-display font-medium">Кому й коли</th>
                <th className="py-2 font-display font-medium">Що підтверджує</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-line/80">
                <td className="py-2 pr-3 text-paper/90">Рахунок-фактура</td>
                <td className="py-2 pr-3">Українському клієнту, у гривнях</td>
                <td className="py-2">Прохання оплатити</td>
              </tr>
              <tr className="border-b border-line/80">
                <td className="py-2 pr-3 text-paper/90">Інвойс</td>
                <td className="py-2 pr-3">Іноземному клієнту, у валюті, часто UA/EN</td>
                <td className="py-2">Прохання оплатити; за умовами договору — і надання послуг</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 text-paper/90">Проформа-інвойс</td>
                <td className="py-2 pr-3">До поставки чи послуги, для авансу</td>
                <td className="py-2">Лише погоджену суму, не факт надання</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="!mt-10 font-display text-2xl text-paper">Зразок інвойсу UA/EN</h2>
        <div className="not-prose rounded-xl border border-line bg-ink-2/40 p-5 text-sm leading-relaxed text-mist">
          <p className="font-display text-base text-paper">Інвойс / Invoice № 2026-014 від / dated 31.10.2026</p>
          <p className="mt-4">
            <strong className="text-paper/90">Виконавець / Contractor:</strong> ФОП Петренко
            Петро / Individual entrepreneur Petro Petrenko, Tax ID 1234567890, Kyiv, Ukraine ·
            IBAN UA00…0000, SWIFT XXXXUAUX
          </p>
          <p className="mt-2">
            <strong className="text-paper/90">Замовник / Customer:</strong> Example GmbH, Berlin,
            Germany · Agreement № 7 dated 01.09.2026
          </p>
          <p className="mt-4">
            1. Розробка вебзастосунку, жовтень 2026 / Web application development, October 2026 —
            80 h × 30.00 — 2 400.00 USD
          </p>
          <p className="mt-2">
            <strong className="text-paper/90">Разом / Total due:</strong> 2 400.00 USD · Без ПДВ /
            VAT not applicable · Строк оплати / Due: 10.11.2026
          </p>
          <p className="mt-2">
            Оплата цього інвойсу означає згоду з обсягом і якістю наданих послуг. / Payment of this
            invoice confirms acceptance of the services rendered.
          </p>
        </div>

        <MidInvoiceCta
          title="Клієнт в Україні?"
          text="Для українських клієнтів створіть рахунок-фактуру у гривнях: PDF з IBAN і сумою прописом за 2 хвилини."
          ctaLabel="Створити рахунок у гривнях"
        />

        <h2 className="!mt-10 font-display text-2xl text-paper">Типові помилки</h2>
        <ul className="list-disc space-y-2 pl-5 text-mist">
          <li>Гривневий IBAN замість реквізитів валютного рахунку з SWIFT.</li>
          <li>Розмитий опис: «IT services» без періоду й обсягу.</li>
          <li>Валюта чи сума не збігаються з договором.</li>
          <li>Немає умови про прийняття послуг, хоча акт не складається.</li>
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
