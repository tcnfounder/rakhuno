import type { Metadata } from "next";
import Link from "next/link";
import { BlankDownloadLink } from "@/components/BlankDownloadLink";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { MidInvoiceCta, PageFooterNote, SiteShell } from "@/components/SiteShell";
import { DEFAULT_OG_IMAGE } from "@/lib/site";

const URL = "https://rakhuno.com/blanky";

export const metadata: Metadata = {
  title: "Бланки документів ФОП: Word і Excel безкоштовно",
  description:
    "Бланки рахунку-фактури, рахунку на оплату, видаткової накладної, акту виконаних робіт, акту звірки та інвойсу. Word і Excel без реєстрації, або PDF онлайн за 2 хвилини.",
  alternates: { canonical: URL },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: "Бланки документів ФОП: Word і Excel · Rakhuno",
    description: "Рахунок, накладна, акт, акт звірки, інвойс — скачати безкоштовно.",
    url: URL,
  },
};

type Blank = {
  name: string;
  what: string;
  guide: string;
  files: { href: string; format: "docx" | "xlsx" }[];
  online?: string;
};

const blanks: Blank[] = [
  {
    name: "Рахунок-фактура",
    what: "Просить клієнта оплатити товар чи послугу: реквізити ФОП, IBAN, таблиця, сума прописом.",
    guide: "/guides/blank-rakhunku-faktury",
    files: [
      { href: "/templates/blank-rakhunku-faktury.docx", format: "docx" },
      { href: "/templates/blank-rakhunku-faktury.xlsx", format: "xlsx" },
    ],
    online: "/invoice",
  },
  {
    name: "Рахунок на оплату",
    what: "Той самий документ під назвою, яку частіше просить бухгалтерія замовника.",
    guide: "/guides/rakhunok-na-oplatu",
    files: [
      { href: "/templates/rakhunok-na-oplatu.docx", format: "docx" },
      { href: "/templates/rakhunok-na-oplatu.xlsx", format: "xlsx" },
    ],
    online: "/invoice",
  },
  {
    name: "Видаткова накладна",
    what: "Підтверджує, що товар передано покупцю: що, скільки, за якою ціною, підписи сторін.",
    guide: "/guides/vydatkova-nakladna",
    files: [
      { href: "/templates/vydatkova-nakladna.docx", format: "docx" },
      { href: "/templates/vydatkova-nakladna.xlsx", format: "xlsx" },
    ],
    online: "/invoice",
  },
  {
    name: "Акт виконаних робіт (наданих послуг)",
    what: "Підтверджує, що послуги надано в повному обсязі. Для ФОП без ПДВ.",
    guide: "/guides/akt-vykonanykh-robit",
    files: [
      { href: "/templates/akt-vykonanykh-robit.docx", format: "docx" },
      { href: "/templates/akt-vykonanykh-robit.xlsx", format: "xlsx" },
    ],
    online: "/invoice",
  },
  {
    name: "Акт звірки взаєморозрахунків",
    what: "Звіряє оплати й відвантаження за період: дебет, кредит, сальдо.",
    guide: "/guides/akt-zvirky",
    files: [
      { href: "/templates/akt-zvirky.docx", format: "docx" },
      { href: "/templates/akt-zvirky.xlsx", format: "xlsx" },
    ],
  },
  {
    name: "Інвойс UA/EN",
    what: "Двомовний рахунок для іноземного клієнта: валюта, SWIFT, опис послуг.",
    guide: "/guides/invoys-proforma",
    files: [{ href: "/templates/invoys-ua-en.docx", format: "docx" }],
  },
];

const faqs = [
  {
    q: "Чи потрібна реєстрація, щоб скачати бланк?",
    a: "Ні. Файли Word (.docx) і Excel (.xlsx) завантажуються одразу, без email і реєстрації. Їх можна вільно використовувати й змінювати.",
  },
  {
    q: "Чим Excel-бланк відрізняється від Word?",
    a: "В Excel суми рядків і підсумок рахуються формулами, тож менше ручних помилок. Word зручніший, якщо документ здебільшого текстовий.",
  },
  {
    q: "Чи є затверджені форми цих документів?",
    a: "Для рахунку-фактури, видаткової накладної, акту виконаних робіт і акту звірки типових обов’язкових форм немає. Достатньо реквізитів первинного документа зі ст. 9 Закону «Про бухгалтерський облік та фінансову звітність в Україні».",
  },
  {
    q: "Як не вписувати суму прописом вручну?",
    a: "Заповніть рахунок онлайн у Rakhuno: сума прописом і QR-код для оплати додаються самі, а з того ж рахунку в один клік виходить акт або накладна у PDF.",
  },
];

const ld = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Бланки документів ФОП: Word і Excel",
    url: URL,
    inLanguage: "uk",
    hasPart: blanks.flatMap((b) =>
      b.files.map((f) => ({
        "@type": "DigitalDocument",
        name: `${b.name} — бланк ${f.format === "docx" ? "Word" : "Excel"}`,
        url: `https://rakhuno.com${f.href}`,
        encodingFormat:
          f.format === "docx"
            ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        isAccessibleForFree: true,
      })),
    ),
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
];

export default function BlankyPage() {
  return (
    <>
      <JsonLd data={ld} />
      <SiteShell>
        <h1 className="font-display text-4xl font-semibold text-paper md:text-5xl">
          Бланки документів для ФОП
        </h1>
        <p className="mt-4 max-w-2xl text-mist">
          Word і Excel безкоштовно, без реєстрації. Скачайте бланк і заповніть сам, або{" "}
          <Link href="/invoice" className="text-signal underline-offset-2 hover:underline">
            створіть рахунок онлайн
          </Link>
          : сума прописом і QR-код для оплати заповнюються самі, PDF за 2 хвилини.
        </p>

        <div className="mt-10 max-w-4xl divide-y divide-line border-y border-line">
          {blanks.map((b) => (
            <section key={b.name} className="grid gap-4 py-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h2 className="font-display text-xl text-paper">{b.name}</h2>
                <p className="mt-1 text-sm text-mist">{b.what}</p>
                <p className="mt-2 text-sm">
                  <Link href={b.guide} className="text-signal underline-offset-2 hover:underline">
                    Зразок заповнення й реквізити
                  </Link>
                  {b.online && (
                    <>
                      <span className="text-muted"> · </span>
                      <Link href={b.online} className="text-signal underline-offset-2 hover:underline">
                        Заповнити онлайн
                      </Link>
                    </>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {b.files.map((f) => (
                  <BlankDownloadLink key={f.href} href={f.href} format={f.format} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="max-w-3xl">
          <MidInvoiceCta
            title="Не хочете вписувати суму прописом?"
            text="Заповніть рахунок онлайн: сума прописом і QR-код НБУ додаються самі, а акт чи накладна виходять з того ж рахунку в один клік."
            ctaLabel="Створити рахунок"
          />

          <h2 className="mt-12 font-display text-2xl text-paper">Часті питання</h2>
          <div className="mt-4 divide-y divide-line border-y border-line">
            {faqs.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="cursor-pointer list-none font-semibold text-paper">
                  {f.q}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-mist">{f.a}</p>
              </details>
            ))}
          </div>

          <p className="mt-8 text-xs text-muted">
            Ці бланки також є на{" "}
            <a
              href="https://github.com/tcnfounder/ukrainian-invoice-templates"
              className="text-signal underline-offset-2 hover:underline"
            >
              GitHub
            </a>{" "}
            (ліцензія CC0).
          </p>
          <PageFooterNote />
        </div>
      </SiteShell>
      <SiteFooter />
    </>
  );
}
