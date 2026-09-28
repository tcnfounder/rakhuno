import type { Metadata } from "next";
import Link from "next/link";
import { ArticleLayout } from "@/components/ArticleLayout";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Рахунок онлайн для ФОП за 2 хвилини: PDF без Word і Checkbox",
  description:
    "Як виставити рахунок онлайн для ФОП: реквізити, позиції, PDF за 2 хвилини, email-нагадування. Без шаблону Word і без важкої бухгалтерії.",
  alternates: { canonical: "https://rakhuno.com/guides/rahunok-onlayn" },
  openGraph: {
    title: "Рахунок онлайн для ФОП · Rakhuno",
    description: "Алгоритм на 2 хвилини: ФОП → клієнт → позиції → PDF → клієнту.",
    url: "https://rakhuno.com/guides/rahunok-onlayn",
  },
};

const faqs = [
  {
    q: "Як виставити рахунок онлайн ФОП?",
    a: "Відкрийте генератор рахунку, заповніть реквізити ФОП і клієнта, додайте позиції, завантажте PDF і надішліть файл замовнику. У Rakhuno це займає близько двох хвилин після першого збереження профілю.",
  },
  {
    q: "Чи потрібен Word або Excel?",
    a: "Ні. Онлайн-рахунок зразу дає PDF у потрібній структурі. Word має сенс лише якщо клієнт вимагає саме їхній бланк.",
  },
  {
    q: "Чим онлайн-рахунок відрізняється від Checkbox / Медок?",
    a: "Легкий онлайн-рахунок закриває документ на оплату. Checkbox/Медок — облік і звітність. Для «треба PDF сьогодні» часто достатньо першого.",
  },
  {
    q: "Чи залишається в PDF бренд Rakhuno?",
    a: "Ні як заголовок документа: у рахунку фігурує ваш ПІБ ФОП і реквізити. Сервіс лише допомагає зібрати й завантажити файл.",
  },
  {
    q: "Навіщо email при створенні рахунку?",
    a: "Щоб отримати сценарій з PDF і за бажанням підписатися на нагадування про типові податкові вікна. Це не обов’язкова «розсилка заради розсилки».",
  },
  {
    q: "Скільки рахунків можна робити?",
    a: "Створення рахунку й PDF зараз безкоштовні. Дані продавця можна зберігати локально в браузері, щоб не вводити IBAN щоразу.",
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
  headline: "Рахунок онлайн для ФОП за 2 хвилини",
  description: metadata.description,
  author: { "@type": "Organization", name: "Rakhuno" },
  publisher: {
    "@type": "Organization",
    name: "Rakhuno",
    logo: { "@type": "ImageObject", url: "https://rakhuno.com/brand/icon-512.png" },
  },
  mainEntityOfPage: "https://rakhuno.com/guides/rahunok-onlayn",
  inLanguage: "uk",
};

export default function Page() {
  return (
    <>
      <JsonLd data={[articleLd, faqLd]} />
      <ArticleLayout
        title="Рахунок онлайн за 2 хвилини"
        description="Без шаблону Word і без важкої бухгалтерії — тільки зрозумілий PDF клієнту."
        path="/guides/rahunok-onlayn"
        related={[
          { href: "/guides/vystavyty-rakhunok", label: "Як виставити рахунок" },
          { href: "/guides/rahunok-faktura", label: "Що таке рахунок-фактура" },
          { href: "/guides/zrazok-rahunku-faktury", label: "Зразок рахунку-фактури" },
        ]}
      >
        <p>
          <strong>Рахунок онлайн</strong> — це коли ви не шукаєте файл «rahunok_final_v7.docx», а
          відкриваєте сторінку, заповнюєте поля й одразу качаєте PDF. Для ФОП, якому потрібно 5–30
          документів на місяць, саме швидкість і повторюваність важливіші за «важкий» бухгалтерський
          комплекс.
        </p>
        <p>
          Нижче — конкретний алгоритм у Rakhuno й відповіді, коли цього достатньо, а коли варто йти в
          Checkbox / Медок / ЕДО. Якщо потрібна теорія полів документа — див. гід{" "}
          <Link href="/guides/rahunok-faktura" className="text-signal underline-offset-2 hover:underline">
            рахунок-фактура для ФОП
          </Link>
          .
        </p>

        <h2 className="!mt-10 font-display text-2xl text-paper">Алгоритм у Rakhuno</h2>
        <ol className="list-decimal space-y-3 pl-5 text-mist">
          <li>
            Відкрийте{" "}
            <Link href="/invoice" className="text-signal underline-offset-2 hover:underline">
              сторінку рахунку
            </Link>
            .
          </li>
          <li>
            Заповніть блок ФОП: ПІБ, ІПН (РНОКПП), IBAN, контакти за потреби. Збережіть профіль у
            браузері — наступного разу це займе секунди.
          </li>
          <li>Додайте покупця (ТОВ / ФОП / фізособа) і код ЄДРПОУ або ІПН, якщо є.</li>
          <li>
            Впишіть позиції: конкретна назва послуги, кількість, ціна. Уникайте голого слова
            «послуги».
          </li>
          <li>
            Залиште email → завантажте PDF → надішліть клієнту (email, Telegram, Drive) і покладіть
            копію в папку місяця.
          </li>
        </ol>
        <p>
          Перший раз може зайняти 5–7 хвилин, поки зберете реквізити. Другий і третій — справді близько
          двох хвилин, якщо профіль ФОП уже збережено.
        </p>

        <h2 className="!mt-10 font-display text-2xl text-paper">Що підготувати перед відкриттям сторінки</h2>
        <ul className="list-disc space-y-2 pl-5 text-mist">
          <li>IBAN рахунку ФОП (краще з банківської виписки, не «з голови»).</li>
          <li>ІПН / РНОКПП і точне ПІБ як у реєстрації.</li>
          <li>Реквізити клієнта: назва, код, адреса для рахунку.</li>
          <li>Формулювання послуги, яке клієнт зможе показати своєму бухгалтеру.</li>
          <li>Домовленість про суму й строк оплати (хоча б у листі).</li>
        </ul>

        <h2 className="!mt-10 font-display text-2xl text-paper">Чому не Word і не скрін картки</h2>
        <p>
          Word-шаблони живуть у п’яти версіях файлу, їдуть шрифти, губиться нумерація. Скрін номера
          картки юрособа часто не проведе. Онлайн-рахунок фіксує структуру: номер, дата, сторони,
          рядки, підсумок — те, що очікує бухгалтерія замовника.
        </p>
        <p>
          Якщо клієнт вимагає саме їхній бланк або повний електронний документообіг (Вчасно тощо) —
          робіть у їхньому каналі. Якщо просять «надішліть рахунок PDF» — легкий онлайн-сценарій
          якраз сюди.
        </p>

        <h2 className="!mt-10 font-display text-2xl text-paper">Для кого сценарій «2 хвилини»</h2>
        <ul className="list-disc space-y-2 pl-5 text-mist">
          <li>
            ФОП на спрощеній системі (
            <Link href="/guides/fop-3-grupa" className="text-signal underline-offset-2 hover:underline">
              часто 3 група
            </Link>
            ): IT, дизайн, маркетинг, консультації.
          </li>
          <li>Фріланс і мікроагенції з повторюваними клієнтами.</li>
          <li>Ті, хто вже має банк ФОП і кому не потрібен склад / ПРРО «на кожен чек».</li>
        </ul>
        <p>
          Не той інструмент як єдиний облік: ритейл з касою, складська торгівля, десятки актів на день
          через обов’язковий ЕДО, автоматична подача декларацій.
        </p>

        <h2 className="!mt-10 font-display text-2xl text-paper">Email: навіщо він у формі</h2>
        <p>
          Email потрібен не «для спаму», а щоб завершити сценарій (PDF) і за бажанням отримувати
          нагадування про типові податкові вікна —{" "}
          <Link href="/guides/yedynyy-podatok" className="text-signal underline-offset-2 hover:underline">
            єдиний податок
          </Link>
          , ЄСВ. Суми ми не рахуємо; ми стукаємо в inbox, коли час звірити календар. Детальніше про
          дисципліну — у{" "}
          <Link href="/guides/podatky-fop" className="text-signal underline-offset-2 hover:underline">
            чеклісті податків ФОП
          </Link>
          .
        </p>

        <h2 className="!mt-10 font-display text-2xl text-paper">Після PDF: 60 секунд дисципліни</h2>
        <ol className="list-decimal space-y-3 pl-5 text-mist">
          <li>Надіслати файл клієнту з темою «Рахунок №… від …».</li>
          <li>Зберегти копію в <em>2026/09/</em> (або ваш рік/місяць).</li>
          <li>Додати рядок у просту таблицю доходів: клієнт, сума, статус оплати.</li>
        </ol>
        <p>
          Без цих трьох кроків «швидкий рахунок» перетворюється на швидкий хаос через квартал.
        </p>

        <h2 className="!mt-10 font-display text-2xl text-paper">Типові збої</h2>
        <ul className="list-disc space-y-2 pl-5 text-mist">
          <li>Не зберегли профіль ФОП — щоразу вводите IBAN і помиляєтесь у цифрі.</li>
          <li>Позиція «послуги» без деталей — клієнт повертає рахунок на уточнення.</li>
          <li>Забули номер документа — потім не знаходите файл серед десятків PDF.</li>
          <li>Надіслали JPG низької якості замість PDF — частина бухгалтерій просить переробити.</li>
          <li>Не поклали файл в архів — перед податками згадуєте суми «приблизно».</li>
        </ul>

        <h2 className="!mt-10 font-display text-2xl text-paper">Почніть зараз</h2>
        <p>
          Відкрийте{" "}
          <Link href="/invoice" className="text-signal underline-offset-2 hover:underline">
            Rakhuno → Рахунок
          </Link>
          , заповніть продавця один раз і виставте перший PDF. Якщо клієнт корпоративний — перевірте,
          чи їм не потрібен додатково акт або їхній ЕДО. Якщо потрібен лише зрозумілий рахунок на
          оплату — ви вже на правильному сценарії.
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
          Матеріал інформаційний. Вимоги клієнтів і облікові правила відрізняються — звіряйте з
          договором і бухгалтером замовника.
        </p>
      </ArticleLayout>
    </>
  );
}
