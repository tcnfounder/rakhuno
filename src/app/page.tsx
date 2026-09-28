import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BrandLockup } from "@/components/BrandLockup";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  alternates: { canonical: "https://rakhuno.com" },
  openGraph: {
    url: "https://rakhuno.com",
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
          <div className="flex flex-1 flex-col justify-end px-5 pb-16 pt-10 md:px-10 md:pb-24">
            <div className="mx-auto w-full max-w-content">
              <div className="rise">
                <BrandLockup size="hero" href="" />
              </div>
              <h1 className="rise rise-delay-1 mt-6 max-w-3xl font-display text-2xl font-medium leading-tight sm:text-4xl md:text-5xl">
                Простий рахунок-фактура для ФОП
              </h1>
              <p className="rise rise-delay-2 mt-5 max-w-xl text-base leading-relaxed text-paper/85 sm:text-lg">
                Онлайн рахунок за 2 хвилини. PDF клієнту одразу. Email-нагадування про єдиний податок
                і ЄСВ — без важкої бухгалтерії.
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
            </div>
          </div>
        </div>
      </section>

      <section id="yak-pratsyuye" className="border-t border-line px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-content">
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

      <section id="gidy" className="border-t border-line px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-content">
          <p className="font-display text-sm uppercase tracking-[0.18em] text-signal">Гіди</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold md:text-5xl">
            Коротко про рахунок і ФОП
          </h2>
          <p className="mt-4 max-w-xl text-mist">
            Практичні сторінки під типові запити — потім одразу до рахунку в Rakhuno.
          </p>
          <ul className="mt-10 max-w-3xl space-y-5">
            <li className="border-t border-line pt-5">
              <Link
                href="/guides/rahunok-faktura"
                className="font-display text-xl text-paper transition hover:text-signal md:text-2xl"
              >
                Рахунок-фактура для ФОП
              </Link>
              <p className="mt-2 text-mist">Реквізити, різниця з актом, PDF онлайн за кілька хвилин.</p>
            </li>
            <li className="border-t border-line pt-5">
              <Link
                href="/guides/zrazok-rahunku-faktury"
                className="font-display text-xl text-paper transition hover:text-signal md:text-2xl"
              >
                Зразок рахунку-фактури
              </Link>
              <p className="mt-2 text-mist">Приклад полів і готовий PDF — без бланка Word.</p>
            </li>
            <li className="border-t border-line pt-5">
              <Link
                href="/guides/vystavyty-rakhunok"
                className="font-display text-xl text-paper transition hover:text-signal md:text-2xl"
              >
                Як виставити рахунок на оплату
              </Link>
              <p className="mt-2 text-mist">Коли надсилати клієнту, які поля й PDF за 2 хвилини.</p>
            </li>
            <li className="border-t border-line pt-5">
              <Link
                href="/guides/rahunok-onlayn"
                className="font-display text-xl text-paper transition hover:text-signal md:text-2xl"
              >
                Рахунок онлайн за 2 хвилини
              </Link>
              <p className="mt-2 text-mist">Алгоритм без Word і Checkbox — одразу PDF клієнту.</p>
            </li>
            <li className="border-t border-line pt-5">
              <Link
                href="/guides/fop-3-grupa"
                className="font-display text-xl text-paper transition hover:text-signal md:text-2xl"
              >
                ФОП 3 група — коротко
              </Link>
              <p className="mt-2 text-mist">Кому підходить, рахунки клієнтам, що не забути про податки.</p>
            </li>
            <li className="border-t border-line pt-5">
              <Link
                href="/guides/yedynyy-podatok"
                className="font-display text-xl text-paper transition hover:text-signal md:text-2xl"
              >
                Єдиний податок: коли платити
              </Link>
              <p className="mt-2 text-mist">Типові вікна, календар і email-нагадування — без зайвої теорії.</p>
            </li>
            <li className="border-t border-line pt-5">
              <Link
                href="/guides/podatky-fop"
                className="font-display text-xl text-paper transition hover:text-signal md:text-2xl"
              >
                Податки ФОП: чекліст
              </Link>
              <p className="mt-2 text-mist">Щомісяця й щокварталу: рахунки, строки, архів документів.</p>
            </li>
            <li className="border-t border-line pt-5">
              <Link
                href="/guides"
                className="text-signal underline-offset-2 transition hover:underline"
              >
                Усі гіди →
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <section id="faq" className="border-t border-line px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-content">
          <p className="font-display text-sm uppercase tracking-[0.18em] text-signal">FAQ</p>
          <h2 className="mt-3 font-display text-3xl font-semibold md:text-5xl">Часті питання</h2>
          <div className="mt-12 max-w-3xl divide-y divide-line">
            {faqs.map((f) => (
              <div key={f.q} className="py-6">
                <h3 className="font-display text-xl text-paper">{f.q}</h3>
                <p className="mt-2 text-mist">{f.a}</p>
                <Link
                  href={f.href}
                  className="mt-3 inline-block text-sm text-signal underline-offset-2 hover:underline"
                >
                  {f.linkLabel} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line px-5 py-16 md:px-10">
        <div className="mx-auto flex max-w-content flex-col items-start justify-between gap-6 md:flex-row md:items-center">
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
