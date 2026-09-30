import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArticleLayout } from "@/components/ArticleLayout";
import { JsonLd } from "@/components/JsonLd";
import { MidInvoiceCta } from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "Рахунок-фактура у Word vs онлайн PDF для ФОП",
  description:
    "Рахунок у Word чи онлайн? Порівняння для ФОП: швидкість, помилки в IBAN, нумерація, PDF клієнту. Коли залишити шаблон, а коли зручніше Rakhuno.",
  alternates: { canonical: "https://rakhuno.com/guides/rakhunok-u-word" },
  openGraph: {
    title: "Рахунок у Word vs онлайн PDF · Rakhuno",
    description: "Чому ФОП переходять з Word-бланка на онлайн рахунок-фактуру за 2 хвилини.",
    url: "https://rakhuno.com/guides/rakhunok-u-word",
    images: ["/brand/sample-rakhunok-faktury-card.webp"],
  },
};

const faqs = [
  {
    q: "Чи можна виставляти рахунок ФОП у Word?",
    a: "Так. Word або Google Docs підходять, якщо клієнт вимагає їхній бланк або у вас 1–2 рахунки на місяць і шаблон уже ідеальний.",
  },
  {
    q: "Чому онлайн зручніше за Word?",
    a: "Не копипастите IBAN щоразу, нумерація під рукою, PDF виглядає однаково на телефоні й ПК, менше «final_v7.docx».",
  },
  {
    q: "Чи замінює онлайн-рахунок Медок або Checkbox?",
    a: "Ні. Це різні задачі. Онлайн PDF — швидкий рахунок на оплату. Медок/Checkbox — облік і канали, коли їх вимагає клієнт.",
  },
  {
    q: "Як перейти з Word на Rakhuno?",
    a: "Один раз внесіть ПІБ, ІПН, IBAN у конструктор — збережеться в браузері. Далі лише покупець і позиції → PDF.",
  },
  {
    q: "Чи приймають клієнти PDF замість .docx?",
    a: "Юрособи й ФОП зазвичай просять саме PDF або скан. Word частіше потрібен, якщо так прописано у внутрішньому регламенті замовника.",
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
  headline: "Рахунок-фактура у Word vs онлайн PDF для ФОП",
  description: metadata.description,
  datePublished: "2026-09-30",
  dateModified: "2026-09-30T02:50:00+00:00",
  author: { "@type": "Organization", name: "Rakhuno" },
  publisher: {
    "@type": "Organization",
    name: "Rakhuno",
    logo: { "@type": "ImageObject", url: "https://rakhuno.com/brand/icon-512.png" },
  },
  image: "https://rakhuno.com/brand/sample-rakhunok-faktury-card.webp",
  mainEntityOfPage: "https://rakhuno.com/guides/rakhunok-u-word",
  inLanguage: "uk",
};

export default function Page() {
  return (
    <>
      <JsonLd data={[articleLd, faqLd]} />
      <ArticleLayout
        title="Рахунок-фактура у Word vs онлайн PDF"
        description="Коли Word ще ок, де він гальмує ФОП, і як отримати той самий рахунок клієнту за 2 хвилини без .docx."
        path="/guides/rakhunok-u-word"
        related={[
          { href: "/guides/rahunok-faktura", label: "Що таке рахунок-фактура" },
          { href: "/guides/blank-rakhunku-faktury", label: "Бланк онлайн замість Word" },
          { href: "/invoice", label: "Створити PDF зараз" },
        ]}
      >
        <p>
          Багато ФОП роками тримають <strong>рахунок-фактуру в Word</strong>: скачали бланк,
          підставили ІПН, зберегли «рахунок_12_кінцевий.docx», конвертували в PDF… і через тиждень
          знову шукають актуальний IBAN у чаті з банком. Онлайн-конструктор не «кращий у всьому» —
          він швидший саме там, де Word найчастіше ламається.
        </p>

        <figure className="not-prose my-8">
          <Image
            src="/brand/sample-rakhunok-faktury-card.webp"
            alt="Приклад рахунку-фактури PDF для ФОП — альтернатива бланку Word"
            width={1200}
            height={900}
            className="w-full rounded-xl border border-line"
            priority
          />
          <figcaption className="mt-2 text-sm text-muted">
            Той самий зміст, що в Word-бланку: реквізити, позиції, сума — уже як PDF.
          </figcaption>
        </figure>

        <h2 className="!mt-10 font-display text-2xl text-paper">Коротке порівняння</h2>
        <div className="not-prose overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[28rem] text-left text-sm text-mist">
            <thead className="bg-ink-2/60 text-paper">
              <tr>
                <th className="px-4 py-3 font-display font-medium">Критерій</th>
                <th className="px-4 py-3 font-display font-medium">Word / Docs</th>
                <th className="px-4 py-3 font-display font-medium">Онлайн (Rakhuno)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              <tr>
                <td className="px-4 py-3 text-paper/90">Час на рахунок</td>
                <td className="px-4 py-3">10–20 хв, якщо шаблон «поплив»</td>
                <td className="px-4 py-3">~2 хв після першого заповнення ФОП</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-paper/90">IBAN і ІПН</td>
                <td className="px-4 py-3">Копіпаст, ризик старої версії</td>
                <td className="px-4 py-3">Профіль у браузері</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-paper/90">Нумерація</td>
                <td className="px-4 py-3">Вручну / Excel поруч</td>
                <td className="px-4 py-3">Лічильник у формі</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-paper/90">Файл клієнту</td>
                <td className="px-4 py-3">Часто ще треба «зберегти як PDF»</td>
                <td className="px-4 py-3">PDF одразу в завантаженнях</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-paper/90">Коли обов’язковий</td>
                <td className="px-4 py-3">Регламент замовника = їхній бланк</td>
                <td className="px-4 py-3">«Надішліть рахунок на email / у Telegram»</td>
              </tr>
            </tbody>
          </table>
        </div>

        <MidInvoiceCta
          title="Спробувати онлайн замість Word"
          text="Заповніть ФОП один раз — наступні рахунки збираються з позицій і покупця."
        />

        <h2 className="!mt-10 font-display text-2xl text-paper">Де Word ще має сенс</h2>
        <ul className="list-disc space-y-2 pl-5 text-mist">
          <li>Клієнт надіслав свій корпоративний шаблон і просить «тільки так».</li>
          <li>У документі багато нестандартних блоків (графік платежів на 3 сторінки).</li>
          <li>Рахунків одиниці на рік — немає сенсу міняти звичку.</li>
        </ul>

        <h2 className="!mt-10 font-display text-2xl text-paper">Де Word гальмує ФОП</h2>
        <ul className="list-disc space-y-2 pl-5 text-mist">
          <li>5–30 рахунків на місяць — множаться файли «нова_версія_2».</li>
          <li>Шрифти й таблиці їдуть при відкритті на іншому ПК.</li>
          <li>Помилка в одному символі IBAN коштує тижня «гроші зависли».</li>
          <li>Клієнт просить PDF, а ви надсилаєте .docx — бухгалтерія повертає.</li>
        </ul>
        <p>
          Теорія документа — у гідові{" "}
          <Link
            href="/guides/rahunok-faktura"
            className="text-signal underline-offset-2 hover:underline"
          >
            рахунок-фактура для ФОП
          </Link>
          . Якщо шукаєте саме{" "}
          <Link
            href="/guides/blank-rakhunku-faktury"
            className="text-signal underline-offset-2 hover:underline"
          >
            бланк замість Word
          </Link>{" "}
          — там коротший шлях до полів.
        </p>

        <h2 className="!mt-10 font-display text-2xl text-paper">Як виглядає перехід на онлайн</h2>
        <ol className="list-decimal space-y-3 pl-5 text-mist">
          <li>
            Відкрийте{" "}
            <Link href="/invoice" className="text-signal underline-offset-2 hover:underline">
              конструктор Rakhuno
            </Link>
            .
          </li>
          <li>Перенесіть з Word-шаблону: ПІБ, ІПН, IBAN, банк.</li>
          <li>Додайте покупця й позиції як у звичному бланку.</li>
          <li>Залиште email → скачайте PDF → надішліть клієнту.</li>
        </ol>
        <p>
          Rakhuno не підміняє заголовок вашим брендом сервісу: у PDF лишається{" "}
          <em>ваш</em> ФОП. Це не заміна повного ЕДО — лише швидкий рахунок на оплату.
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
