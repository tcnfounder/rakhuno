import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { DEFAULT_OG_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://rakhuno.com/",
    languages: { uk: "https://rakhuno.com/", en: "https://rakhuno.com/en" },
  },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    url: "https://rakhuno.com/",
    title: "Rakhuno — простий рахунок для ФОП",
    description: "Створіть рахунок-фактуру за 2 хвилини. Email-нагадування про податки.",
  },
};

const steps = [
  {
    n: "01",
    title: "Заповніть рахунок",
    text: "ПІБ ФОП, IBAN і позиції — прямо в документі на екрані.",
    icon: "/brand/step-1.webp",
    alt: "Іконка: заповнення рахунку-фактури",
  },
  {
    n: "02",
    title: "Отримайте PDF",
    text: "PDF одразу в браузері. Email — welcome і податкові нагадування.",
    icon: "/brand/step-2.webp",
    alt: "Іконка: завантаження PDF рахунку",
  },
  {
    n: "03",
    title: "Не пропустіть податки",
    text: "Нагадування в inbox перед типовим строком сплати.",
    icon: "/brand/step-3.webp",
    alt: "Іконка: email-нагадування про податки",
  },
];

const guides = [
  {
    href: "/guides/rahunok-faktura",
    tag: "Основи",
    title: "Рахунок-фактура для ФОП",
    text: "Обовʼязкові реквізити, різниця з актом і як скласти PDF за кілька хвилин.",
  },
  {
    href: "/guides/zrazok-rahunku-faktury",
    tag: "Зразок",
    title: "Зразок рахунку-фактури",
    text: "Приклад заповнених полів і готовий документ — без бланка Word.",
  },
  {
    href: "/guides/vystavyty-rakhunok",
    tag: "Покроково",
    title: "Як виставити рахунок на оплату",
    text: "Коли надсилати клієнту, які поля обовʼязкові і що робити після оплати.",
  },
  {
    href: "/guides/akt-vykonanykh-robit",
    tag: "Документи",
    title: "Акт виконаних робіт",
    text: "Реквізити акта для послуг і як не розійтися з рахунком у сумі та назві.",
  },
  {
    href: "/guides/blank-rakhunku-faktury",
    tag: "Шаблони",
    title: "Бланк рахунку Word і Excel",
    text: "Безкоштовні шаблони для завантаження і швидша альтернатива онлайн.",
  },
  {
    href: "/guides/yedynyy-podatok",
    tag: "Податки",
    title: "Єдиний податок: коли платити",
    text: "Строки для 2 і 3 групи, календар і нагадування на email.",
  },
];

const faqs = [
  {
    q: "Як створити рахунок-фактуру онлайн?",
    a: "Відкрийте Rakhuno → Рахунок, вкажіть дані ФОП та позиції, залиште email — PDF завантажиться одразу.",
    href: "/invoice",
    linkLabel: "Відкрити рахунок",
  },
  {
    q: "Що таке рахунок-фактура для ФОП?",
    a: "Документ на оплату з реквізитами, позиціями й сумою. Короткий розбір — у гіді, далі одразу PDF у Rakhuno.",
    href: "/guides/rahunok-faktura",
    linkLabel: "Читати гід",
  },
  {
    q: "Чи потрібен Checkbox або Медок?",
    a: "Ні. Rakhuno — легкий онлайн-рахунок для ФОП без важкої бухгалтерії.",
    href: "/guides/rahunok-onlayn",
    linkLabel: "Рахунок онлайн за 2 хвилини",
  },
  {
    q: "Чи можна зробити акт виконаних робіт або видаткову накладну?",
    a: "Так. Після рахунку акт (для послуг) або видаткова накладна (для товару) формуються в один клік з тими самими сторонами, позиціями й сумою.",
    href: "/guides/akt-vykonanykh-robit",
    linkLabel: "Що має бути в акті",
  },
  {
    q: "Де зберігаються мої реквізити?",
    a: "Реквізити ФОП, клієнти й останні рахунки зберігаються лише у вашому браузері, на сервер вони не передаються. Ми отримуємо тільки email (і групу ФОП, якщо ви її вказали) — для податкових нагадувань.",
    href: "/privacy",
    linkLabel: "Політика конфіденційності",
  },
  {
    q: "Що з податками?",
    a: "Ми лише нагадуємо типові строки (єдиний податок, ЄСВ). Це не податкова консультація.",
    href: "/guides/yedynyy-podatok",
    linkLabel: "Коли платити єдиний податок",
  },
  {
    q: "Чи безкоштовно?",
    a: "Так. Створення рахунку-фактури та PDF зараз безкоштовні.",
    href: "/invoice",
    linkLabel: "Створити безкоштовно",
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

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ink text-paper">
      <JsonLd data={faqLd} />
      <section className="relative min-h-[100svh] overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/brand/hero.webp"
          aria-hidden
        >
          <source src="/brand/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/35" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_15%,rgba(198,242,109,0.14),transparent_50%)]" />

        <div className="relative z-10 flex min-h-[100svh] flex-col">
          <SiteHeader />
          <div className="flex flex-1 flex-col justify-end pb-16 pt-10 md:pb-24">
            <div className="mx-auto w-full max-w-content px-5 md:px-10">
              <p className="rise inline-flex items-center gap-2 rounded-full border border-white/15 bg-ink/40 px-3.5 py-1.5 text-sm text-mist backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden />
                Для ФОП · безкоштовно · без реєстрації
              </p>
              <h1 className="rise rise-delay-1 mt-6 max-w-4xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
                Рахунок-фактура за 2 хвилини.
                <span className="block text-signal">Без Word.</span>
              </h1>
              <p className="rise rise-delay-2 mt-6 max-w-2xl text-base leading-relaxed text-paper/85 sm:text-lg">
                Вписуєте реквізити й позиції — Rakhuno сам пише суму прописом, додає QR-код для оплати
                і віддає PDF, який можна одразу надіслати клієнту. Акт і видаткова накладна — з того
                самого рахунку.
              </p>
              <div className="rise rise-delay-3 mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/invoice"
                  className="inline-flex items-center rounded-full bg-signal px-6 py-3 text-base font-semibold text-ink transition hover:bg-white"
                >
                  Створити рахунок безкоштовно
                </Link>
                <a
                  href="#yak-pratsyuye"
                  className="inline-flex items-center rounded-full border border-white/25 px-6 py-3 text-base text-paper transition hover:border-signal hover:text-signal"
                >
                  Як це працює
                </a>
              </div>
              <ul className="rise rise-delay-3 mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-mist">
                <li className="flex items-center gap-2">
                  <span className="text-signal" aria-hidden>✓</span> Сума прописом українською
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-signal" aria-hidden>✓</span> QR-код НБУ для оплати
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-signal" aria-hidden>✓</span> PDF без логотипу сервісу
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="yak-pratsyuye" className="border-t border-line py-16 md:py-24">
        <div className="mx-auto max-w-content px-5 md:px-10">
          <p className="font-display text-sm uppercase tracking-[0.18em] text-signal">Як це працює</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold md:text-5xl">
            Три кроки до рахунку
          </h2>

          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((step, i) => (
              <article
                key={step.n}
                className="step-rise flex flex-col"
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-ink-2 ring-1 ring-white/5 sm:h-20 sm:w-20">
                  <Image
                    src={step.icon}
                    alt={step.alt}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <p className="mt-5 font-display text-sm text-signal">{step.n}</p>
                <h3 className="mt-2 font-display text-2xl">{step.title}</h3>
                <p className="mt-2 text-mist">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-content lg:grid-cols-2">
          <div className="flex flex-col justify-center px-5 py-16 md:px-10 md:py-24">
            <p className="font-display text-sm uppercase tracking-[0.18em] text-signal">Рахунок</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-5xl">
              Документ, який можна надіслати клієнту
            </h2>
            <p className="mt-4 max-w-xl text-mist">
              Редагуєте живий A4 на екрані. PDF виглядає так само — з вашим ПІБ і опційним логотипом
              ФОП, не з брендом сервісу як заголовком.
            </p>
            <Link
              href="/invoice"
              className="mt-8 inline-flex w-fit rounded-full bg-signal px-6 py-3 font-semibold text-ink transition hover:bg-white"
            >
              Відкрити рахунок
            </Link>
          </div>
          <div className="relative min-h-[280px] overflow-hidden bg-ink-2 lg:min-h-[420px]">
            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/brand/invoice.webp"
              aria-label="Демонстрація редагування рахунку-фактури"
            >
              <source src="/brand/invoice.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-r from-ink/40 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <section id="podatky" className="border-t border-line bg-ink-2">
        <div className="mx-auto grid max-w-content lg:grid-cols-2">
          <div className="relative order-2 min-h-[280px] overflow-hidden lg:order-1 lg:min-h-[420px]">
            <Image
              src="/brand/reminder.webp"
              alt="Email-нагадування про податки для ФОП"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="img-pan object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-ink-2/50 via-transparent to-transparent" />
          </div>
          <div className="order-1 flex flex-col justify-center px-5 py-16 md:px-10 md:py-24 lg:order-2">
            <p className="font-display text-sm uppercase tracking-[0.18em] text-signal">Email</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-5xl">
              Нагадування, не консультація
            </h2>
            <p className="mt-4 max-w-xl text-mist">
              Rakhuno лише нагадує типові строки для ФОП 2–3 групи. Бухгалтера не замінює.
            </p>
            <ul className="mt-10 space-y-4">
              <li className="flex gap-3 border-b border-line pb-4">
                <span className="text-signal">→</span>
                <span>Єдиний податок</span>
              </li>
              <li className="flex gap-3 border-b border-line pb-4">
                <span className="text-signal">→</span>
                <span>ЄСВ</span>
              </li>
              <li className="flex gap-3">
                <span className="text-signal">→</span>
                <span>Декларація — сезонні листи</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section id="dlya-kogo" className="border-t border-line py-16 md:py-24">
        <div className="mx-auto w-full max-w-content px-5 md:px-10">
          <div className="max-w-3xl">
            <p className="font-display text-sm uppercase tracking-[0.18em] text-signal">Для кого</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-5xl">
              Рахунок-фактура онлайн без важкої бухгалтерії
            </h2>
            <div className="mt-6 space-y-4 text-mist">
              <p>
                Rakhuno допомагає ФОП і фрілансерам{" "}
                <strong className="text-paper/90">виставити рахунок на оплату</strong> і скачати PDF за
                кілька хвилин: ПІБ, ІПН, IBAN, позиції, сума. Без Word-шаблону, без Checkbox і без Медок
                — якщо вам потрібен саме зрозумілий документ клієнту, а не повний ЕДО.
              </p>
              <p>
                Типовий сценарій: 5–30 рахунків на місяць, клієнти просять PDF на email або в Telegram,
                бухгалтерія замовника не приймає «скрін картки». Ви заповнюєте живий A4 на екрані —
                PDF виглядає так само, з вашим ПІБ ФОП, не з логотипом сервісу як заголовком.
              </p>
              <p>
                Після першого рахунку профіль продавця можна зберегти в браузері: наступні PDF — ближче
                до двох хвилин. Окремо підписуєтесь на email-нагадування про типові строки єдиного
                податку й ЄСВ (це нагадування, не податкова консультація). Детальніше — у гідах{" "}
                <a href="/guides/rahunok-faktura" className="text-signal underline-offset-2 hover:underline">
                  рахунок-фактура для ФОП
                </a>{" "}
                і{" "}
                <a href="/guides/rahunok-onlayn" className="text-signal underline-offset-2 hover:underline">
                  рахунок онлайн
                </a>
                .
              </p>
              <p>
                Якщо потрібні акти, податкові накладні, складський облік або інтеграція з банком —
                оберіть бухгалтерський контур. Якщо задача «швидко PDF клієнту + не забути податки» —
                почніть із{" "}
                <a href="/invoice" className="text-signal underline-offset-2 hover:underline">
                  безкоштовного рахунку
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="gidy" className="border-t border-line py-16 md:py-24">
        <div className="mx-auto max-w-content px-5 md:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-display text-sm uppercase tracking-[0.18em] text-signal">Гіди</p>
              <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold md:text-5xl">
                Коротко про рахунок і ФОП
              </h2>
              <p className="mt-4 max-w-xl text-mist">
                Практичні сторінки під типові запити: що вказати, як оформити, коли платити.
              </p>
            </div>
            <Link
              href="/guides"
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm text-paper transition hover:border-signal hover:text-signal"
            >
              Усі гіди <span aria-hidden>→</span>
            </Link>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((g) => (
              <li key={g.href}>
                <Link
                  href={g.href}
                  className="group flex h-full flex-col rounded-2xl border border-white/10 bg-ink-2/60 p-6 transition hover:border-signal/50 hover:bg-ink-2"
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    {g.tag}
                  </span>
                  <span className="mt-3 font-display text-lg font-semibold leading-snug text-paper transition group-hover:text-signal">
                    {g.title}
                  </span>
                  <span className="mt-2 flex-1 text-sm leading-relaxed text-mist">{g.text}</span>
                  <span className="mt-5 text-sm font-medium text-signal" aria-hidden>
                    Читати →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="faq" className="border-t border-line py-16 md:py-24">
        <div className="mx-auto grid max-w-content gap-10 px-5 md:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
          <div className="lg:sticky lg:top-10 lg:self-start">
            <p className="font-display text-sm uppercase tracking-[0.18em] text-signal">FAQ</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-5xl">Часті питання</h2>
            <p className="mt-4 max-w-sm text-mist">
              Не знайшли відповідь? Напишіть на{" "}
              <a href="mailto:info@rakhuno.com" className="text-signal underline-offset-2 hover:underline">
                info@rakhuno.com
              </a>
              .
            </p>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {faqs.map((f, i) => (
              <details key={f.q} className="group py-1" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-lg text-paper transition hover:text-signal [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-signal transition group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <div className="pb-6 pr-14">
                  <p className="leading-relaxed text-mist">{f.a}</p>
                  <Link
                    href={f.href}
                    className="mt-3 inline-block text-sm text-signal underline-offset-2 hover:underline"
                  >
                    {f.linkLabel} →
                  </Link>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line py-16">
        <div className="mx-auto flex max-w-content flex-col items-start justify-between gap-6 px-5 md:flex-row md:items-center md:px-10">
          <div>
            <h2 className="font-display text-2xl font-semibold md:text-3xl">
              Готові виставити рахунок?
            </h2>
            <p className="mt-2 text-mist">Безкоштовно. PDF одразу. Email — для нагадувань.</p>
          </div>
          <Link
            href="/invoice"
            className="inline-flex rounded-full bg-signal px-6 py-3 font-semibold text-ink transition hover:bg-white"
          >
            Відкрити Rakhuno
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
