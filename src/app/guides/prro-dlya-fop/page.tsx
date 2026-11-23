import type { Metadata } from "next";
import Link from "next/link";
import { ArticleLayout } from "@/components/ArticleLayout";
import { CheckboxReferral } from "@/components/CheckboxReferral";
import { JsonLd } from "@/components/JsonLd";
import { DEFAULT_OG_IMAGE } from "@/lib/site";

const URL = "https://rakhuno.com/guides/prro-dlya-fop";

export const metadata: Metadata = {
  title: "ПРРО для ФОП у 2026: чи потрібен, кому, штрафи",
  description:
    "Чи потрібен ФОП 1, 2 і 3 групи ПРРО (касовий апарат) у 2026 році: при оплаті карткою, готівкою, на IBAN і через LiqPay. Штрафи 100% і 150%, як підключити.",
  alternates: { canonical: URL },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: "ПРРО для ФОП у 2026 — коротко · Rakhuno",
    description: "Кому потрібна програмна каса, коли можна без неї і які штрафи.",
    url: URL,
  },
};

const faqs = [
  {
    q: "Чи потрібен ПРРО ФОП 1 групи?",
    a: "Ні. ФОП 1 групи не зобов’язані застосовувати РРО/ПРРО.",
  },
  {
    q: "Чи потрібен ПРРО ФОП 2 і 3 групи?",
    a: "Так, якщо ви приймаєте оплату готівкою, карткою через термінал, онлайн через платіжний сервіс (LiqPay, WayForPay, Monopay тощо) або накладеним платежем. Якщо клієнт платить переказом на ваш рахунок IBAN за рахунком-фактурою, ПРРО зазвичай не потрібен.",
  },
  {
    q: "Чи потрібен ПРРО, якщо клієнти платять на IBAN?",
    a: "Для переказів з рахунку ТОВ чи іншого ФОП на ваш IBAN за рахунком-фактурою — зазвичай ні. Щодо переказів від фізичних осіб тлумачення різняться, тому якщо ви продаєте людям, уточніть у бухгалтера або в роз’ясненнях ДПС.",
  },
  {
    q: "Які штрафи за роботу без ПРРО?",
    a: "З 1 серпня 2025 року повернулися повні штрафи: 100% суми розрахунку за перше порушення і 150% — за кожне наступне.",
  },
  {
    q: "Скільки коштує ПРРО?",
    a: "ДПС має власний безкоштовний ПРРО. Платні сервіси (Checkbox, Вчасно.Каса та інші) коштують кілька сотень гривень на місяць за касу, зате мають інтеграції, підтримку і зручні чеки.",
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
  headline: "ПРРО для ФОП у 2026: чи потрібен, кому, штрафи",
  description: metadata.description,
  author: { "@type": "Organization", name: "Rakhuno" },
  publisher: {
    "@type": "Organization",
    name: "Rakhuno",
    logo: { "@type": "ImageObject", url: "https://rakhuno.com/brand/icon-512.png" },
  },
  mainEntityOfPage: URL,
  dateModified: "2026-11-23",
  inLanguage: "uk",
};

const link = "text-signal underline-offset-2 hover:underline";
const th = "border border-white/15 px-3 py-2 text-left font-semibold text-paper";
const td = "border border-white/15 px-3 py-2 align-top";

const rows: [string, string][] = [
  ["Готівка", "Потрібен"],
  ["Картка через термінал (POS)", "Потрібен"],
  ["Онлайн-оплата через LiqPay, WayForPay, Monopay та інші сервіси", "Потрібен"],
  ["Накладений платіж (Нова пошта, Meest)", "Потрібен"],
  ["Переказ від ТОВ або ФОП на ваш IBAN за рахунком", "Зазвичай не потрібен"],
  ["Переказ від фізособи на ваш IBAN", "Тлумачення різняться — уточніть"],
];

export default function Page() {
  return (
    <>
      <JsonLd data={[articleLd, faqLd]} />
      <ArticleLayout
        title="ПРРО для ФОП у 2026"
        description="Чи потрібна вам програмна каса, коли можна без неї і що буде за чек, якого не було."
        path="/guides/prro-dlya-fop"
        related={[
          { href: "/kalkulyator-podatkiv-fop", label: "Калькулятор податків ФОП" },
          { href: "/guides/fop-3-grupa", label: "ФОП 3 група — коротко" },
          { href: "/guides/rahunok-faktura", label: "Рахунок-фактура для ФОП" },
        ]}
      >
        <div className="not-prose rounded-2xl border border-white/10 bg-ink/60 p-5">
          <p className="font-display text-lg text-paper">Коротко</p>
          <ul className="mt-2 space-y-2 text-mist">
            <li>
              <strong className="text-paper">1 група</strong> — ПРРО не потрібен.
            </li>
            <li>
              <strong className="text-paper">2 і 3 група</strong> — потрібен, якщо приймаєте готівку, картку,
              онлайн-оплату через платіжний сервіс або накладений платіж.
            </li>
            <li>
              <strong className="text-paper">Оплата на IBAN за рахунком</strong> від ТОВ чи ФОП — ПРРО
              зазвичай не потрібен.
            </li>
            <li>
              <strong className="text-paper">Штраф</strong> з 1 серпня 2025 — 100% суми розрахунку, при
              повторному порушенні 150%.
            </li>
          </ul>
        </div>

        <h2 className="!mt-10 font-display text-2xl text-paper">Чи потрібен ПРРО: залежить від способу оплати</h2>
        <p>
          Обов’язок застосовувати РРО чи ПРРО визначає не стільки група ФОП, скільки те, як вам платять.
          Для ФОП 2 і 3 групи:
        </p>
        <div className="not-prose overflow-x-auto">
          <table className="w-full border-collapse text-sm text-mist">
            <thead>
              <tr className="bg-white/5">
                <th className={th}>Як платить клієнт</th>
                <th className={th}>ПРРО</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([how, need]) => (
                <tr key={how}>
                  <td className={td}>{how}</td>
                  <td className={`${td} ${need === "Потрібен" ? "text-paper" : ""}`}>{need}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Якщо оплати змішані — частина готівкою чи карткою, частина на рахунок, — каса потрібна для всіх
          розрахунків, крім прямих переказів на IBAN.
        </p>

        <h2 className="!mt-10 font-display text-2xl text-paper">Якщо вам платять на IBAN за рахунком</h2>
        <p>
          Типовий сценарій для послуг B2B: ви виставляєте рахунок-фактуру, ТОВ чи інший ФОП платить на ваш
          рахунок. Тут ПРРО зазвичай не потрібен — потрібен нормальний рахунок з IBAN і призначенням
          платежу.{" "}
          <Link href="/invoice" className={link}>
            Створіть рахунок у Rakhuno
          </Link>{" "}
          — з QR НБУ, який клієнт сканує в застосунку банку, або надішліть його посиланням.
        </p>
        <p>
          Якщо клієнти — фізичні особи, які платять переказом, тлумачення ДПС і бухгалтерів різняться.
          Перед тим як працювати без каси, уточніть свою ситуацію в бухгалтера або в роз’ясненнях ДПС.
        </p>

        <h2 className="!mt-10 font-display text-2xl text-paper">Штрафи з 1 серпня 2025</h2>
        <p>
          Пільгові санкції (25% і 50%) діяли до 31 липня 2025 року. Тепер за розрахунок без чека, чек на
          неповну суму або продаж без РРО/ПРРО — <strong>100%</strong> суми розрахунку за перше порушення і{" "}
          <strong>150%</strong> за кожне наступне. Для ФОП, що приймає картки, один такий випадок може коштувати
          більше, ніж рік підписки на касу.
        </p>

        <h2 className="!mt-10 font-display text-2xl text-paper">РРО чи ПРРО</h2>
        <p>
          <strong>РРО</strong> — фізичний касовий апарат, який треба купити, обслуговувати й реєструвати.{" "}
          <strong>ПРРО</strong> — програма на телефоні, планшеті чи комп’ютері: чеки можна друкувати або
          надсилати електронно. Для більшості ФОП ПРРО простіший і дешевший.
        </p>
        <p>
          ДПС має власний безкоштовний ПРРО. Платні сервіси коштують кілька сотень гривень на місяць за
          касу, але дають інтеграції з еквайрингом, інтернет-магазином і службами доставки, звітність і
          підтримку.
        </p>

        <CheckboxReferral from="prro_guide" />

        <h2 className="!mt-10 font-display text-2xl text-paper">Як підключити ПРРО</h2>
        <ol className="list-decimal space-y-2 pl-5 text-mist">
          <li>Отримайте КЕП (електронний підпис) — у Дії, банку чи кваліфікованого надавача.</li>
          <li>Зареєструйте господарську одиницю (точку продажу) — форма 20-ОПП в Електронному кабінеті.</li>
          <li>Оберіть ПРРО і зареєструйте касу — через сам сервіс або в Електронному кабінеті.</li>
          <li>Додайте касира і видавайте чек на кожен розрахунок: паперовий або електронний.</li>
        </ol>

        <h2 className="!mt-10 font-display text-2xl text-paper">Питання й відповіді</h2>
        <div className="space-y-5">
          {faqs.map((f) => (
            <div key={f.q}>
              <h3 className="font-semibold text-paper">{f.q}</h3>
              <p className="mt-1">{f.a}</p>
            </div>
          ))}
        </div>

        <p className="!mt-10 text-sm text-muted">
          Оновлено 23 листопада 2026. Сторінка має довідковий характер і не є податковою консультацією:
          правила змінюються, перевіряйте чинну редакцію законодавства і роз’яснення ДПС.
        </p>
      </ArticleLayout>
    </>
  );
}
