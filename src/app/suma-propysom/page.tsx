import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { InvoiceCta, PageFooterNote, SiteShell } from "@/components/SiteShell";
import { amountInWordsUk } from "@/lib/invoice";
import { AmountWordsTool } from "./AmountWordsTool";

export const metadata: Metadata = {
  title: "Сума прописом онлайн: гривні й копійки українською",
  description:
    "Перетворіть суму цифрами на суму прописом українською: гривні, копійки, готовий рядок для рахунку чи акту. Безкоштовно, одразу в браузері.",
  alternates: { canonical: "https://rakhuno.com/suma-propysom" },
  openGraph: {
    title: "Сума прописом онлайн · Rakhuno",
    description: "Сума цифрами → прописом українською для рахунку, акту чи договору.",
    url: "https://rakhuno.com/suma-propysom",
  },
};

const EXAMPLES = [1, 2, 5, 21, 1001, 12500, 2342.52, 1_000_000];

const faqs = [
  {
    q: "Як правильно: «одна гривня» чи «один гривня»?",
    a: "«Одна гривня», «дві гривні», «двадцять одна гривня» — слово «гривня» жіночого роду, тому числівник узгоджується з ним. А от «один долар», «два долари» — чоловічий рід.",
  },
  {
    q: "Як писати копійки в сумі прописом?",
    a: "Зазвичай гривні пишуть словами, а копійки — цифрами: «Дванадцять тисяч пʼятсот гривень 00 копійок». Так роблять банки й бухгалтерії, щоб рядок був коротшим і не допускав двозначності.",
  },
  {
    q: "З великої чи з малої літери?",
    a: "Якщо сума прописом стоїть окремим рядком або на початку речення — з великої. Якщо в дужках після суми цифрами — можна з малої. Головне — однаково в усіх документах.",
  },
  {
    q: "Чи обов’язкова сума прописом у рахунку-фактурі?",
    a: "Єдиної затвердженої форми рахунку немає, тож формально — ні. Але бухгалтерії клієнтів очікують суму і цифрами, і прописом: так менше ризику помилки в платежі. В акті виконаних робіт і договорах суму прописом зазвичай вказують завжди.",
  },
  {
    q: "А якщо сума в доларах чи євро?",
    a: "Скористайтеся рядком «Лише число» і допишіть валюту в правильному відмінку: «одна тисяча двісті один долар США 00 центів». Зверніть увагу на рід: «один долар», «одне євро».",
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
  name: "Сума прописом онлайн — Rakhuno",
  url: "https://rakhuno.com/suma-propysom",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  inLanguage: "uk",
  offers: { "@type": "Offer", price: "0", priceCurrency: "UAH" },
  description: metadata.description,
};

export default function SumaPropysomPage() {
  return (
    <>
      <JsonLd data={[appLd, faqLd]} />
      <SiteShell>
        <h1 className="max-w-3xl font-display text-3xl font-semibold leading-tight text-paper md:text-5xl">
          Сума прописом онлайн
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-mist">
          Введіть суму цифрами — отримаєте її прописом українською: з гривнями й копійками, у
          форматі для рахунку чи акту або просто числом.
        </p>

        <div className="mt-8 max-w-3xl">
          <AmountWordsTool />
        </div>

        <div className="prose-rakhuno mt-12 max-w-3xl space-y-5 text-base leading-relaxed text-paper/90">
          <h2 className="font-display text-2xl text-paper">Приклади суми прописом</h2>
          <div className="not-prose overflow-x-auto">
            <table className="w-full min-w-[320px] border-collapse text-left text-sm text-mist">
              <thead>
                <tr className="border-b border-line text-paper">
                  <th className="py-2 pr-3 font-display font-medium">Цифрами</th>
                  <th className="py-2 font-display font-medium">Прописом</th>
                </tr>
              </thead>
              <tbody>
                {EXAMPLES.map((n) => (
                  <tr key={n} className="border-b border-line/80">
                    <td className="py-2 pr-3 whitespace-nowrap tabular-nums text-paper/90">
                      {n.toLocaleString("uk-UA", { minimumFractionDigits: 2 })} грн
                    </td>
                    <td className="py-2">{amountInWordsUk(n)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="!mt-10 font-display text-2xl text-paper">Правила, які варто знати</h2>
          <ul className="list-disc space-y-2 pl-5 text-mist">
            <li>
              <strong className="text-paper/90">Гривня — жіночого роду:</strong> одна гривня, дві
              гривні, двадцять одна гривня, але пʼять гривень.
            </li>
            <li>
              <strong className="text-paper/90">Тисяча — теж жіночого роду:</strong> одна тисяча, дві
              тисячі; мільйон і мільярд — чоловічого: один мільйон, два мільйони.
            </li>
            <li>
              <strong className="text-paper/90">Числа 11–14</strong> завжди дають «гривень»:
              одинадцять гривень, чотирнадцять гривень.
            </li>
            <li>
              <strong className="text-paper/90">Копійки</strong> найчастіше пишуть цифрами:
              «… гривень 05 копійок».
            </li>
            <li>
              <strong className="text-paper/90">Сума цифрами й прописом мають збігатися.</strong>{" "}
              Якщо є розбіжність, банк або бухгалтерія клієнта поверне документ.
            </li>
          </ul>

          <h2 className="!mt-10 font-display text-2xl text-paper">Де потрібна сума прописом</h2>
          <p>
            У{" "}
            <Link
              href="/guides/rahunok-faktura"
              className="text-signal underline-offset-2 hover:underline"
            >
              рахунку-фактурі
            </Link>
            ,{" "}
            <Link
              href="/guides/akt-vykonanykh-robit"
              className="text-signal underline-offset-2 hover:underline"
            >
              акті виконаних робіт
            </Link>
            , договорах і розписках. У рахунку її пишуть під підсумком: «Разом: 12 500,00 грн
            (Дванадцять тисяч пʼятсот гривень 00 копійок), без ПДВ». Приклад повного документа — у{" "}
            <Link
              href="/guides/zrazok-rahunku-faktury"
              className="text-signal underline-offset-2 hover:underline"
            >
              зразку рахунку-фактури
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
