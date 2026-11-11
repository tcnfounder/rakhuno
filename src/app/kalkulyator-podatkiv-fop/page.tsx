import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { InvoiceCta, PageFooterNote, SiteShell } from "@/components/SiteShell";
import {
  ESV_MONTH,
  INCOME_LIMIT,
  MILITARY_FIXED_MONTH,
  MIN_WAGE,
  SINGLE_TAX_FIXED,
  formatMoney,
} from "@/lib/fop-tax";
import { TaxCalculator } from "./TaxCalculator";

const URL = "https://rakhuno.com/kalkulyator-podatkiv-fop";

export const metadata: Metadata = {
  title: "Податки ФОП 2026: ЄП, ЄСВ і військовий збір",
  description:
    "Скільки платить ФОП 1, 2 і 3 групи у 2026 році: єдиний податок, ЄСВ 1 902,34 грн і військовий збір. Сума за місяць, ліміт доходу і найближчі терміни сплати.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Калькулятор податків ФОП 2026 · Rakhuno",
    description: "Єдиний податок, ЄСВ і військовий збір для 1, 2 і 3 групи — сума і терміни.",
    url: URL,
  },
};

const faqs = [
  {
    q: "Скільки платить ФОП 3 групи у 2026 році?",
    a: `5% від доходу єдиного податку (3% для платників ПДВ), 1% військового збору і ЄСВ ${formatMoney(ESV_MONTH)} на місяць. Наприклад, з доходу 50 000 грн за місяць — 2 500 + 500 + ${formatMoney(ESV_MONTH)}.`,
  },
  {
    q: "Скільки платить ФОП 2 групи у 2026 році?",
    a: `Фіксовано: єдиний податок ${formatMoney(SINGLE_TAX_FIXED[2])}, військовий збір ${formatMoney(MILITARY_FIXED_MONTH)} і ЄСВ ${formatMoney(ESV_MONTH)} — разом ${formatMoney(SINGLE_TAX_FIXED[2] + MILITARY_FIXED_MONTH + ESV_MONTH)} на місяць, незалежно від доходу в межах ліміту.`,
  },
  {
    q: "Який військовий збір для ФОП у 2026 році?",
    a: `1 і 2 група — ${formatMoney(MILITARY_FIXED_MONTH)} на місяць (10% мінімальної зарплати), до 20 числа поточного місяця. 3 група — 1% від доходу, разом з єдиним податком за квартал.`,
  },
  {
    q: "Коли платити ЄСВ за себе?",
    a: `Щоквартально, до 20 числа місяця після кварталу. Мінімум за квартал — ${formatMoney(ESV_MONTH * 3)}. Деякі ФОП звільнені від ЄСВ за себе (наприклад, пенсіонери за віком, особи з інвалідністю, мобілізовані) — перевірте умови в ДПС.`,
  },
  {
    q: "Що буде, якщо перевищити ліміт доходу?",
    a: "Із суми перевищення сплачується 15% єдиного податку, і потрібно перейти на вищу групу або загальну систему — правила переходу перевірте в ДПС. Калькулятор попереджає, якщо ваш річний дохід виходить за ліміт.",
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

const appLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Калькулятор податків ФОП 2026 — Rakhuno",
  url: URL,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  inLanguage: "uk",
  offers: { "@type": "Offer", price: "0", priceCurrency: "UAH" },
  description: metadata.description,
};

const link = "text-signal underline-offset-2 hover:underline";

export default function TaxCalculatorPage() {
  return (
    <>
      <JsonLd data={[appLd, faqLd]} />
      <SiteShell>
        <h1 className="max-w-3xl font-display text-3xl font-semibold leading-tight text-paper md:text-5xl">
          Калькулятор податків ФОП 2026
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-mist">
          Оберіть групу і впишіть дохід — побачите єдиний податок, ЄСВ і військовий збір за місяць,
          перевірку ліміту і найближчі дати сплати.
        </p>

        <div className="mt-8 max-w-3xl">
          <TaxCalculator />
        </div>

        <div className="prose-rakhuno mt-12 max-w-3xl space-y-5 text-base leading-relaxed text-paper/90">
          <h2 className="font-display text-2xl text-paper">Ставки ФОП у 2026 році</h2>
          <p>
            Мінімальна зарплата з 1 січня 2026 року — {formatMoney(MIN_WAGE)}. Від неї залежать ЄСВ,
            військовий збір 1–2 групи, ставка 2 групи і ліміти доходу.
          </p>
          <div className="not-prose overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm text-mist">
              <thead>
                <tr className="border-b border-line text-paper">
                  <th className="py-2 pr-3 font-display font-medium">Група</th>
                  <th className="py-2 pr-3 font-display font-medium">Єдиний податок</th>
                  <th className="py-2 pr-3 font-display font-medium">Військовий збір</th>
                  <th className="py-2 pr-3 font-display font-medium">ЄСВ</th>
                  <th className="py-2 font-display font-medium">Ліміт доходу на рік</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line/80">
                  <td className="py-2 pr-3 text-paper/90">1</td>
                  <td className="py-2 pr-3">{formatMoney(SINGLE_TAX_FIXED[1])} / міс.</td>
                  <td className="py-2 pr-3">{formatMoney(MILITARY_FIXED_MONTH)} / міс.</td>
                  <td className="py-2 pr-3">{formatMoney(ESV_MONTH)} / міс.</td>
                  <td className="py-2">{formatMoney(INCOME_LIMIT[1])}</td>
                </tr>
                <tr className="border-b border-line/80">
                  <td className="py-2 pr-3 text-paper/90">2</td>
                  <td className="py-2 pr-3">{formatMoney(SINGLE_TAX_FIXED[2])} / міс.</td>
                  <td className="py-2 pr-3">{formatMoney(MILITARY_FIXED_MONTH)} / міс.</td>
                  <td className="py-2 pr-3">{formatMoney(ESV_MONTH)} / міс.</td>
                  <td className="py-2">{formatMoney(INCOME_LIMIT[2])}</td>
                </tr>
                <tr className="border-b border-line/80">
                  <td className="py-2 pr-3 text-paper/90">3</td>
                  <td className="py-2 pr-3">5% доходу (3% з ПДВ)</td>
                  <td className="py-2 pr-3">1% доходу</td>
                  <td className="py-2 pr-3">{formatMoney(ESV_MONTH)} / міс.</td>
                  <td className="py-2">{formatMoney(INCOME_LIMIT[3])}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="!mt-10 font-display text-2xl text-paper">Терміни сплати</h2>
          <ul className="list-disc space-y-2 pl-5 text-mist">
            <li>
              <strong className="text-paper/90">1 і 2 група:</strong> єдиний податок і військовий збір —
              авансом до 20 числа поточного місяця. Річна декларація — протягом 60 днів після кінця року.
            </li>
            <li>
              <strong className="text-paper/90">3 група:</strong> декларація — протягом 40 днів після
              кварталу, єдиний податок і військовий збір — ще протягом 10 днів після цього.
            </li>
            <li>
              <strong className="text-paper/90">ЄСВ:</strong> щоквартально, до 20 числа місяця після
              кварталу.
            </li>
          </ul>
          <p>
            Платите клієнтам за рахунками? У{" "}
            <Link href="/invoice" className={link}>
              рахунку-фактурі Rakhuno
            </Link>{" "}
            є QR-код НБУ: клієнт сканує його в застосунку банку і платить без ручного вводу IBAN. Більше
            про податки — у гіді{" "}
            <Link href="/guides/podatky-fop" className={link}>
              податки ФОП
            </Link>
            .
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
          <p className="text-sm text-mist">
            Розрахунок довідковий і не є податковою консультацією. Ставки — за даними на листопад 2026
            року; звіряйте суми й дати з ДПС.
          </p>
        </div>

        <div className="max-w-3xl">
          <InvoiceCta />
          <PageFooterNote />
        </div>
      </SiteShell>
      <SiteFooter />
    </>
  );
}
