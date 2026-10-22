import type { Metadata } from "next";
import Link from "next/link";
import { ArticleLayout } from "@/components/ArticleLayout";
import { JsonLd } from "@/components/JsonLd";
import { MidInvoiceCta } from "@/components/SiteShell";
import { TemplateDownload } from "@/components/TemplateDownload";

export const metadata: Metadata = {
  title: "Акт виконаних робіт і наданих послуг ФОП: зразок, бланк",
  description:
    "Акт виконаних робіт (наданих послуг) для ФОП: реквізити, зразок заповнення без ПДВ і безкоштовний бланк Word. Чим акт відрізняється від рахунку.",
  alternates: { canonical: "https://rakhuno.com/guides/akt-vykonanykh-robit" },
  openGraph: {
    title: "Акт виконаних робіт ФОП: зразок і бланк · Rakhuno",
    description: "Реквізити акту, приклад заповнення й бланк Word безкоштовно.",
    url: "https://rakhuno.com/guides/akt-vykonanykh-robit",
  },
};

const faqs = [
  {
    q: "Чи обов’язковий акт виконаних робіт для ФОП?",
    a: "Закон не вимагає акт для кожної угоди, але він підтверджує, що послугу надано й прийнято. Часто його вимагає договір або бухгалтерія замовника — особливо ТОВ і ФОП на загальній системі. Якщо клієнт просить акт, краще його скласти.",
  },
  {
    q: "Чим акт відрізняється від рахунку-фактури?",
    a: "Рахунок-фактура просить оплатити й містить IBAN. Акт підтверджує, що роботу виконано й прийнято без претензій. Зазвичай спочатку рахунок (або після нього), а акт — після завершення робіт або за підсумком місяця.",
  },
  {
    q: "Хто підписує акт виконаних робіт?",
    a: "Обидві сторони: виконавець (ФОП) і замовник або його уповноважена особа. Печатка не обов’язкова — ФОП може працювати без печатки. Можна підписати електронно через КЕП (Дія.Підпис, Вчасно тощо).",
  },
  {
    q: "Чи можна скласти один акт за місяць?",
    a: "Так. Для регулярних послуг (абонентське обслуговування, розробка, маркетинг) часто складають один акт за календарний місяць з переліком наданих послуг. Так само можна виставляти й один рахунок за місяць.",
  },
  {
    q: "Скільки зберігати акти?",
    a: "Первинні документи зберігають щонайменше 3 роки (строк давності для податкових перевірок), а за трудовими й деякими іншими питаннями — довше. Практично: зберігайте PDF підписаних актів у хмарі разом із рахунками.",
  },
  {
    q: "Що писати в акті, якщо ФОП не платник ПДВ?",
    a: "Вкажіть суму «без ПДВ» і, за бажанням, що виконавець є платником єдиного податку відповідної групи. Ставку ПДВ і суму податку не зазначайте.",
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
  headline: "Акт виконаних робіт і наданих послуг ФОП: зразок, бланк",
  description: metadata.description,
  datePublished: "2026-10-21",
  dateModified: "2026-10-22",
  author: { "@type": "Organization", name: "Rakhuno" },
  publisher: {
    "@type": "Organization",
    name: "Rakhuno",
    logo: { "@type": "ImageObject", url: "https://rakhuno.com/brand/icon-512.png" },
  },
  mainEntityOfPage: "https://rakhuno.com/guides/akt-vykonanykh-robit",
  inLanguage: "uk",
};

const howToLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Як скласти акт виконаних робіт ФОП",
  totalTime: "PT10M",
  step: [
    {
      "@type": "HowToStep",
      name: "Скачати бланк",
      text: "Завантажте бланк акту у Word на сторінці Rakhuno.",
      url: "https://rakhuno.com/templates/akt-vykonanykh-robit.docx",
    },
    {
      "@type": "HowToStep",
      name: "Заповнити реквізити",
      text: "Номер і дата, договір, дані виконавця й замовника, перелік послуг з кількістю, ціною й сумою.",
    },
    {
      "@type": "HowToStep",
      name: "Підписати",
      text: "Підпишіть з обох сторін — на папері або КЕП — і збережіть PDF разом із рахунком.",
    },
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd data={[articleLd, faqLd, howToLd]} />
      <ArticleLayout
        title="Акт виконаних робіт (наданих послуг) для ФОП: зразок і бланк"
        description="Що це за документ, які реквізити обов’язкові, приклад заповнення без ПДВ і бланк Word безкоштовно."
        path="/guides/akt-vykonanykh-robit"
        related={[
          { href: "/guides/rahunok-faktura", label: "Що таке рахунок-фактура" },
          { href: "/guides/zrazok-rahunku-faktury", label: "Зразок рахунку-фактури" },
          { href: "/guides/blank-rakhunku-faktury", label: "Бланк рахунку-фактури Word і Excel" },
        ]}
      >
        <p className="rounded-xl border border-line bg-ink-2/40 p-5 text-paper">
          <strong>Акт виконаних робіт</strong> (акт наданих послуг, акт приймання-передачі) — це
          первинний документ, яким виконавець і замовник підтверджують, що роботи виконано або
          послуги надано в певному обсязі, за певну ціну і замовник прийняв їх без претензій. ФОП
          складає акт після виконання робіт або за підсумком місяця; оплату ж просять{" "}
          <Link href="/guides/rahunok-faktura" className="text-signal underline-offset-2 hover:underline">
            рахунком-фактурою
          </Link>
          .
        </p>

        <TemplateDownload
          title="Скачати бланк акту виконаних робіт"
          text="Word (.docx), без реєстрації. Поля для ФОП без ПДВ: договір, перелік послуг, суми, підписи сторін."
          files={[
            { href: "/templates/akt-vykonanykh-robit.docx", label: "Бланк акту у Word (.docx)", format: "docx" },
          ]}
        />

        <h2 className="!mt-10 font-display text-2xl text-paper">
          Акт виконаних робіт чи акт наданих послуг?
        </h2>
        <p>
          Це один і той самий тип документа, різниться лише назва. <strong>Акт виконаних робіт</strong>{" "}
          пишуть, коли є відчутний результат: ремонт, розробка сайту, дизайн-макет.{" "}
          <strong>Акт наданих послуг</strong> складають для процесу без окремого результату:
          консультації, супровід, маркетинг, абонентське обслуговування. Реквізити однакові, тож
          бланк вище підходить для обох — змініть лише заголовок.
        </p>

        <h2 className="!mt-10 font-display text-2xl text-paper">Обов’язкові реквізити акту</h2>
        <p>
          Акт — первинний документ, тож має містити реквізити зі статті 9 Закону «Про бухгалтерський
          облік та фінансову звітність в Україні»:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-mist">
          <li>назву документа — «Акт виконаних робіт» або «Акт наданих послуг»;</li>
          <li>дату складання (і, за потреби, місце);</li>
          <li>сторони: ПІБ ФОП-виконавця з РНОКПП, назву замовника з кодом ЄДРПОУ або РНОКПП;</li>
          <li>
            зміст і обсяг операції: перелік робіт чи послуг, одиниці виміру, кількість, ціну й суму;
          </li>
          <li>
            загальну вартість цифрами й{" "}
            <Link href="/suma-propysom" className="text-signal underline-offset-2 hover:underline">
              прописом
            </Link>
            , позначку «без ПДВ», якщо ви не платник ПДВ;
          </li>
          <li>підписи осіб, які відповідають за операцію, з обох сторін.</li>
        </ul>
        <p>
          Посилання на договір (номер і дата) формально не обов’язкове, але бухгалтерія замовника
          майже завжди його просить — краще вказати одразу.
        </p>

        <h2 className="!mt-10 font-display text-2xl text-paper">Зразок заповнення акту ФОП</h2>
        <div className="not-prose rounded-xl border border-line bg-ink-2/40 p-5 text-sm leading-relaxed text-mist">
          <p className="font-display text-base text-paper">
            Акт № 7 приймання-передачі наданих послуг від 31.10.2026
          </p>
          <p className="mt-4">
            Замовник ТОВ «Приклад» (ЄДРПОУ 12345678) в особі директора Іваненка І. І. та Виконавець
            ФОП Петренко П. П. (РНОКПП 1234567890) склали цей акт про те, що відповідно до договору
            № 15 від 01.09.2026 Виконавець надав такі послуги:
          </p>
          <p className="mt-4">
            <strong className="text-paper/90">1.</strong> Розробка лендінгу — 1 послуга — 12 000,00
            грн
          </p>
          <p className="mt-2">
            <strong className="text-paper/90">2.</strong> Технічна підтримка сайту, жовтень 2026 —
            10 год × 400,00 — 4 000,00 грн
          </p>
          <p className="mt-2">
            <strong className="text-paper/90">Разом:</strong> 16 000,00 грн (шістнадцять тисяч
            гривень 00 коп.), без ПДВ
          </p>
          <p className="mt-2">
            Послуги надані в повному обсязі та в строк. Сторони претензій одна до одної не мають.
          </p>
          <p className="mt-4">Виконавець: ________ / Петренко П. П. · Замовник: ________ / Іваненко І. І.</p>
        </div>

        <MidInvoiceCta
          title="Акт є — потрібен рахунок на ту саму суму?"
          text="Створіть рахунок-фактуру з тими самими позиціями: PDF з IBAN за 2 хвилини, безкоштовно."
          ctaLabel="Створити рахунок до акту"
        />

        <h2 className="!mt-10 font-display text-2xl text-paper">Рахунок і акт: у якому порядку</h2>
        <ol className="list-decimal space-y-3 pl-5 text-mist">
          <li>
            <strong className="text-paper/90">Передоплата.</strong> Спочатку{" "}
            <Link href="/guides/rakhunok-na-oplatu" className="text-signal underline-offset-2 hover:underline">
              рахунок на оплату
            </Link>
            , після виконання робіт — акт.
          </li>
          <li>
            <strong className="text-paper/90">Постоплата.</strong> Акт і рахунок разом після
            виконання робіт; оплата за рахунком.
          </li>
          <li>
            <strong className="text-paper/90">Щомісячні послуги.</strong> Один акт і один рахунок
            за календарний місяць з однаковим переліком і сумою.
          </li>
        </ol>
        <p>
          Головне — щоб суми й перелік послуг у рахунку, акті й платіжці збігалися. Розбіжності —
          найчастіша причина, чому бухгалтерія замовника повертає документи. Перевірити розрахунки
          за період допомагає{" "}
          <Link href="/guides/akt-zvirky" className="text-signal underline-offset-2 hover:underline">
            акт звірки
          </Link>
          .
        </p>

        <h2 className="!mt-10 font-display text-2xl text-paper">Типові помилки в акті</h2>
        <ul className="list-disc space-y-2 pl-5 text-mist">
          <li>«Послуги згідно з договором» без переліку — бухгалтерія не прийме.</li>
          <li>Дата акту раніше за дату договору або за фактичне виконання.</li>
          <li>Сума в акті не збігається з рахунком.</li>
          <li>Ставка ПДВ у ФОП-неплатника ПДВ.</li>
          <li>Немає підпису замовника — акт без нього нічого не підтверджує.</li>
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
