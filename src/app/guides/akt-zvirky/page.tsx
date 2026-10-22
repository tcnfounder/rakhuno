import type { Metadata } from "next";
import Link from "next/link";
import { ArticleLayout } from "@/components/ArticleLayout";
import { JsonLd } from "@/components/JsonLd";
import { MidInvoiceCta } from "@/components/SiteShell";
import { TemplateDownload } from "@/components/TemplateDownload";

export const metadata: Metadata = {
  title: "Акт звірки взаєморозрахунків: зразок і бланк Word",
  description:
    "Акт звірки для ФОП: що це, як заповнити дебет, кредит і сальдо, приклад заповнення та безкоштовний бланк Word. Коли акт звірки просять клієнти.",
  alternates: { canonical: "https://rakhuno.com/guides/akt-zvirky" },
  openGraph: {
    title: "Акт звірки: зразок і бланк · Rakhuno",
    description: "Дебет, кредит, сальдо — приклад заповнення й бланк Word безкоштовно.",
    url: "https://rakhuno.com/guides/akt-zvirky",
  },
};

const faqs = [
  {
    q: "Чи обов’язково складати акт звірки?",
    a: "Ні, закон не вимагає його регулярно. Акт звірки складають за домовленістю: на прохання бухгалтерії клієнта, наприкінці року, перед закриттям договору або коли суми в обліку сторін не збігаються.",
  },
  {
    q: "Хто складає акт звірки?",
    a: "Будь-яка сторона. Зазвичай той, хто його потребує, готує акт за своїми даними, підписує й надсилає контрагенту. Друга сторона перевіряє, підписує або повертає з розбіжностями.",
  },
  {
    q: "Що таке дебет і кредит в акті звірки ФОП?",
    a: "У стовпці «Дебет» (з боку ФОП-виконавця) — суми, на які ви надали послуги чи передали товар: акти, накладні. У «Кредит» — суми, які клієнт сплатив. Різниця — сальдо, тобто скільки хтось комусь винен.",
  },
  {
    q: "Чи є акт звірки первинним документом?",
    a: "Ні. Він не підтверджує господарську операцію, а лише фіксує стан розрахунків за даними сторін. Підставою для записів в обліку лишаються рахунки, акти, накладні й банківські виписки.",
  },
  {
    q: "Чи можна підписати акт звірки електронно?",
    a: "Так, КЕП (Дія.Підпис, Вчасно, Медок тощо) має таку саму силу, як власноручний підпис. Печатка для ФОП не обов’язкова.",
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
  headline: "Акт звірки взаєморозрахунків: зразок і бланк Word",
  description: metadata.description,
  datePublished: "2026-10-22",
  dateModified: "2026-10-22",
  author: { "@type": "Organization", name: "Rakhuno" },
  publisher: {
    "@type": "Organization",
    name: "Rakhuno",
    logo: { "@type": "ImageObject", url: "https://rakhuno.com/brand/icon-512.png" },
  },
  mainEntityOfPage: "https://rakhuno.com/guides/akt-zvirky",
  inLanguage: "uk",
};

export default function Page() {
  return (
    <>
      <JsonLd data={[articleLd, faqLd]} />
      <ArticleLayout
        title="Акт звірки для ФОП: зразок і бланк"
        description="Що це, як заповнити дебет, кредит і сальдо, приклад і бланк Word безкоштовно."
        path="/guides/akt-zvirky"
        related={[
          { href: "/guides/akt-vykonanykh-robit", label: "Акт виконаних робіт" },
          { href: "/guides/rahunok-faktura", label: "Що таке рахунок-фактура" },
          { href: "/guides/vydatkova-nakladna", label: "Видаткова накладна" },
        ]}
      >
        <p className="rounded-xl border border-line bg-ink-2/40 p-5 text-paper">
          <strong>Акт звірки взаєморозрахунків</strong> — документ, у якому дві сторони фіксують
          стан розрахунків за період: скільки послуг чи товарів передано, скільки оплачено і
          хто кому винен на кінець періоду (сальдо). Він не є первинним документом, але допомагає
          знайти розбіжності між обліком ФОП і бухгалтерією клієнта.
        </p>

        <TemplateDownload
          title="Скачати бланк акту звірки"
          text="Word (.docx), без реєстрації. Період, договір, таблиця «дебет / кредит», сальдо, підписи."
          files={[{ href: "/templates/akt-zvirky.docx", label: "Бланк акту звірки (.docx)", format: "docx" }]}
        />

        <h2 className="!mt-10 font-display text-2xl text-paper">Що має бути в акті звірки</h2>
        <ul className="list-disc space-y-2 pl-5 text-mist">
          <li>назва, період звірки й дата складання;</li>
          <li>сторони: ФОП з РНОКПП і контрагент з кодом ЄДРПОУ або РНОКПП, договір;</li>
          <li>сальдо на початок періоду;</li>
          <li>
            перелік операцій за період: акти, накладні, рахунки (дебет) і платежі (кредит) з датами
            й номерами;
          </li>
          <li>обороти за період і сальдо на кінець;</li>
          <li>підписи обох сторін.</li>
        </ul>

        <h2 className="!mt-10 font-display text-2xl text-paper">Приклад заповнення</h2>
        <div className="not-prose overflow-x-auto">
          <table className="w-full min-w-[320px] border-collapse text-left text-sm text-mist">
            <thead>
              <tr className="border-b border-line text-paper">
                <th className="py-2 pr-3 font-display font-medium">Дата</th>
                <th className="py-2 pr-3 font-display font-medium">Документ</th>
                <th className="py-2 pr-3 font-display font-medium">Дебет</th>
                <th className="py-2 font-display font-medium">Кредит</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-line/80">
                <td className="py-2 pr-3">01.07.2026</td>
                <td className="py-2 pr-3">Сальдо на початок</td>
                <td className="py-2 pr-3">0,00</td>
                <td className="py-2">0,00</td>
              </tr>
              <tr className="border-b border-line/80">
                <td className="py-2 pr-3">31.07.2026</td>
                <td className="py-2 pr-3">Акт № 5</td>
                <td className="py-2 pr-3">12 000,00</td>
                <td className="py-2"></td>
              </tr>
              <tr className="border-b border-line/80">
                <td className="py-2 pr-3">05.08.2026</td>
                <td className="py-2 pr-3">Оплата, платіжна інструкція № 841</td>
                <td className="py-2 pr-3"></td>
                <td className="py-2">12 000,00</td>
              </tr>
              <tr className="border-b border-line/80">
                <td className="py-2 pr-3">30.09.2026</td>
                <td className="py-2 pr-3">Акт № 7</td>
                <td className="py-2 pr-3">16 000,00</td>
                <td className="py-2"></td>
              </tr>
              <tr>
                <td className="py-2 pr-3 text-paper/90" colSpan={2}>
                  Сальдо на 30.09.2026
                </td>
                <td className="py-2 pr-3 text-paper/90">16 000,00</td>
                <td className="py-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Висновок: на 30.09.2026 заборгованість замовника перед ФОП становить 16 000,00 грн —
          акт № 7 ще не оплачено. Суму прописом для акту можна отримати в{" "}
          <Link href="/suma-propysom" className="text-signal underline-offset-2 hover:underline">
            конвертері «сума прописом»
          </Link>
          .
        </p>

        <MidInvoiceCta
          title="Звірка показала борг?"
          text="Виставте рахунок-фактуру на неоплачену суму: PDF з IBAN за 2 хвилини, безкоштовно."
          ctaLabel="Створити рахунок на суму боргу"
        />

        <h2 className="!mt-10 font-display text-2xl text-paper">Як провести звірку за 4 кроки</h2>
        <ol className="list-decimal space-y-3 pl-5 text-mist">
          <li>Зберіть за період усі акти, накладні й рахунки, а також виписку банку з оплатами.</li>
          <li>Заповніть бланк: сальдо на початок, кожен документ і кожен платіж окремим рядком.</li>
          <li>Порахуйте сальдо на кінець, підпишіть і надішліть контрагенту.</li>
          <li>
            Якщо в контрагента інші цифри — порівняйте рядки: найчастіше бракує акту або платежу на
            межі періодів.
          </li>
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
