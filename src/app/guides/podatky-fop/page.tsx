import type { Metadata } from "next";
import Link from "next/link";
import { ArticleLayout } from "@/components/ArticleLayout";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Податки ФОП: чекліст на місяць і квартал",
  description:
    "Чекліст податків для ФОП: рахунки, оплати, єдиний податок, ЄСВ, декларація, архів документів. Мінімальний порядок без зайвої теорії.",
  alternates: { canonical: "https://rakhuno.com/guides/podatky-fop" },
  openGraph: {
    title: "Податки ФОП: чекліст · Rakhuno",
    description: "Що перевірити щомісяця й щокварталу — рахунок, строки, документи.",
    url: "https://rakhuno.com/guides/podatky-fop",
  },
};

const faqs = [
  {
    q: "Який мінімальний чекліст податків ФОП?",
    a: "Рахунки виставлені й збережені, оплати збігаються з виписками, у календарі є ЄП і ЄСВ, деклараційний сезон позначений, квитанції сплат у папці періоду.",
  },
  {
    q: "Чи потрібно вести повний облік у Checkbox, щоб не провалити податки?",
    a: "Не обов’язково для простого сервісного ФОП. Потрібні дисципліна календаря, архів рахунків/виписок і звірка з бухгалтером або кабінетом. Повний облік — коли зростає складність.",
  },
  {
    q: "Що перевіряти щомісяця?",
    a: "Усі клієнтські рахунки й PDF, відповідність оплат, наближення строків ЄП/ЄСВ (якщо ваш період місячний), відсутність «висячих» домовленостей без документа.",
  },
  {
    q: "Що перевіряти щокварталу?",
    a: "Зведення доходів за квартал, деклараційні дедлайни (якщо стосуються), сверку з бухгалтером, чи не наблизились до ліміту групи.",
  },
  {
    q: "Чи замінює цей чекліст бухгалтера?",
    a: "Ні. Це операційна пам’ятка. Ставки, коди сплати, ПДВ і нетипові ситуації — лише з фахівцем або офіційними джерелами.",
  },
  {
    q: "Як Rakhuno вписується в чекліст?",
    a: "Швидкий рахунок-фактура PDF + можливість email-нагадування про типові податкові вікна. Суми й подачу звітності сервіс не бере на себе.",
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
  headline: "Податки ФОП: чекліст",
  description: metadata.description,
  author: { "@type": "Organization", name: "Rakhuno" },
  publisher: {
    "@type": "Organization",
    name: "Rakhuno",
    logo: { "@type": "ImageObject", url: "https://rakhuno.com/brand/icon-512.png" },
  },
  mainEntityOfPage: "https://rakhuno.com/guides/podatky-fop",
  inLanguage: "uk",
};

export default function Page() {
  return (
    <>
      <JsonLd data={[articleLd, faqLd]} />
      <ArticleLayout
        title="Податки ФОП: чекліст"
        description="Мінімальний порядок, щоб кінець місяця не перетворювався на хаос."
        path="/guides/podatky-fop"
        related={[
          { href: "/guides/yedynyy-podatok", label: "Єдиний податок: коли платити" },
          { href: "/guides/fop-3-grupa", label: "ФОП 3 група — коротко" },
          { href: "/guides/rahunok-faktura", label: "Рахунок-фактура для ФОП" },
        ]}
      >
        <p>
          Більшість ФОП гублять не «знання кодексу», а <strong>порядок</strong>: рахунки в чатах,
          дати в голові, квитанції в завантаженнях. Цей чекліст — коротка операційна рамка для
          сервісного ФОП (часто{" "}
          <Link href="/guides/fop-3-grupa" className="text-signal underline-offset-2 hover:underline">
            3 група
          </Link>
          ): що пробігти очима щомісяця й щокварталу.
        </p>
        <p>
          Це не заміна бухгалтера й не повний податковий гайд. Мета — щоб ви не відкривали місяць
          питанням «а що я взагалі виставляв у лютому?».
        </p>

        <h2 className="!mt-10 font-display text-2xl text-paper">Щомісячний чекліст</h2>
        <ul className="list-disc space-y-3 pl-5 text-mist">
          <li>
            <strong className="text-paper/90">Рахунки виставлені</strong> — усі закриті домовленості
            мають PDF{" "}
            <Link href="/guides/rahunok-faktura" className="text-signal underline-offset-2 hover:underline">
              рахунку-фактури
            </Link>
            , не лише голосове в месенджері.
          </li>
          <li>
            <strong className="text-paper/90">PDF збережені</strong> — папка{" "}
            <em>рік / місяць</em> (або хмара з тією ж логікою).
          </li>
          <li>
            <strong className="text-paper/90">Оплати збігаються</strong> — виписка банку ↔ суми
            рахунків; розбіжності позначені (часткова оплата, повернення).
          </li>
          <li>
            <strong className="text-paper/90">Календар ЄП / ЄСВ</strong> — якщо період місячний або
            нагадування вже близько, див.{" "}
            <Link href="/guides/yedynyy-podatok" className="text-signal underline-offset-2 hover:underline">
              єдиний податок
            </Link>
            .
          </li>
          <li>
            <strong className="text-paper/90">Особисте ≠ ФОП</strong> — зайві особисті списання з
            рахунку ФОП не «маскуйте» під робочі без розуміння наслідків.
          </li>
        </ul>

        <h2 className="!mt-10 font-display text-2xl text-paper">Щоквартальний чекліст</h2>
        <ul className="list-disc space-y-3 pl-5 text-mist">
          <li>
            <strong className="text-paper/90">Зведення доходів</strong> — хоча б проста таблиця:
            клієнт → сума → дата → номер рахунку.
          </li>
          <li>
            <strong className="text-paper/90">Ліміт групи</strong> — чи не наближаєтесь до річного
            обмеження (актуальну цифру беріть лише з офіційних джерел).
          </li>
          <li>
            <strong className="text-paper/90">Деклараційний сезон</strong> — окрема подія в календарі,
            не «згадаю як буде».
          </li>
          <li>
            <strong className="text-paper/90">Сверка з бухгалтером</strong> — 30–60 хвилин раз на
            квартал дешевше за хаос раз на рік.
          </li>
          <li>
            <strong className="text-paper/90">Архів клієнтів</strong> — актуальні реквізити покупців
            (ЄДРПОУ/ІПН), щоб наступні рахунки не збирались з нуля.
          </li>
        </ul>

        <h2 className="!mt-10 font-display text-2xl text-paper">Документи, які варто мати під рукою</h2>
        <ol className="list-decimal space-y-3 pl-5 text-mist">
          <li>PDF рахунків за період.</li>
          <li>Банківські виписки / підтвердження вхідних оплат.</li>
          <li>Квитанції сплати ЄП і ЄСВ.</li>
          <li>Короткі договори або листи з обсягом робіт (навіть з email/Telegram export).</li>
          <li>Акти — якщо клієнт їх вимагає за договором (окремо від рахунку).</li>
        </ol>
        <p>
          Генератор рахунку не замінює цей архів — він лише прискорює перший пункт.{" "}
          <Link href="/invoice" className="text-signal underline-offset-2 hover:underline">
            Rakhuno
          </Link>{" "}
          якраз для швидкого PDF; далі файл має опинитися у вашій папці, не лише в «Завантаженнях».
        </p>

        <h2 className="!mt-10 font-display text-2xl text-paper">Щоденна мікрозвичка (5 хвилин)</h2>
        <p>
          Якщо чекліст раз на місяць здається важким, зменшіть зерно: після кожної оплати клієнта
          зробіть три дії — зберегти PDF, позначити оплату в таблиці, переконатися що номер рахунку
          унікальний. Тоді місячне «закриття» стає проглядом, а не розкопками.
        </p>

        <h2 className="!mt-10 font-display text-2xl text-paper">Де Rakhuno, а де бухгалтерський софт</h2>
        <ul className="list-disc space-y-2 pl-5 text-mist">
          <li>
            <strong className="text-paper/90">Rakhuno</strong> — рахунок клієнту, PDF, email-нагадування
            про типові вікна.
          </li>
          <li>
            <strong className="text-paper/90">Бухгалтер / Checkbox / Медок</strong> — облік, звіти,
            складні сценарії, інтеграції з ДПС.
          </li>
        </ul>
        <p>
          Не намагайтеся одним інструментом закрити все. Легкий контур для рахунків + дисципліна
          чекліста + людина для складного — стійкіша схема, ніж «ставлю все на один важкий сервіс і
          не відкриваю його місяцями».
        </p>

        <h2 className="!mt-10 font-display text-2xl text-paper">Червоні прапорці</h2>
        <ul className="list-disc space-y-2 pl-5 text-mist">
          <li>Немає жодного рахунку за місяць, хоча гроші на рахунку ФОП заходили.</li>
          <li>Не знаєте, коли наступне вікно ЄП / ЄСВ.</li>
          <li>Бухгалтер просить «скиньте все» — а «все» розмазане по п’яти чатах.</li>
          <li>Працюєте біля ліміту групи «на око», без таблиці доходів.</li>
          <li>Плутаєте сплату податку з наявністю рахунку клієнту — це різні дії.</li>
        </ul>

        <h2 className="!mt-10 font-display text-2xl text-paper">Швидкий старт сьогодні</h2>
        <ol className="list-decimal space-y-3 pl-5 text-mist">
          <li>
            Створіть папку поточного місяця й перенесіть туди наявні PDF.
          </li>
          <li>
            Відкрийте{" "}
            <Link href="/invoice" className="text-signal underline-offset-2 hover:underline">
              рахунок в Rakhuno
            </Link>{" "}
            і збережіть профіль ФОП у браузері.
          </li>
          <li>
            Поставте в календар нагадування за 3 дні до типового вікна (або підпишіться на листи після
            рахунку).
          </li>
          <li>Заведіть один рядок Google Sheet на кожного клієнта цього місяця.</li>
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
          Чекліст інформаційний. Перед рішеннями щодо групи, ставок і звітності зверніться до ДПС
          або бухгалтера.
        </p>
      </ArticleLayout>
    </>
  );
}
