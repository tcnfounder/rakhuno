import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ink text-paper">
      <section className="relative min-h-[100svh] overflow-hidden">
        <Image
          src="/brand/hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="img-pan object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_15%,rgba(198,242,109,0.16),transparent_50%)]" />

        <div className="relative z-10 flex min-h-[100svh] flex-col">
          <SiteHeader />
          <div className="flex flex-1 flex-col justify-end px-5 pb-16 pt-10 md:px-10 md:pb-24">
            <div className="mx-auto w-full max-w-content">
              <p className="rise font-display text-5xl font-semibold tracking-tight sm:text-7xl md:text-8xl lg:text-9xl">
                Rakhuno
              </p>
              <h1 className="rise rise-delay-1 mt-6 max-w-3xl font-display text-2xl font-medium leading-tight sm:text-4xl md:text-5xl">
                Простий рахунок для ФОП
              </h1>
              <p className="rise rise-delay-2 mt-5 max-w-xl text-base leading-relaxed text-paper/85 sm:text-lg">
                Рахунок-фактура за 2 хвилини. Нагадування про єдиний податок у email. Без важкої
                бухгалтерії.
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

      <section id="yak-pratsyuye" className="border-t border-line">
        <div className="mx-auto grid max-w-content lg:grid-cols-2">
          <div className="flex flex-col justify-center px-5 py-16 md:px-10 md:py-24">
            <p className="font-display text-sm uppercase tracking-[0.18em] text-signal">Процес</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-5xl">
              Один інструмент. Дві справи.
            </h2>
            <p className="mt-4 max-w-xl text-mist">
              Виставляєте рахунок клієнту. Ми нагадуємо, коли платити податки. Все інше — пізніше.
            </p>
            <ol className="mt-10 space-y-8">
              {[
                {
                  n: "01",
                  t: "Заповніть реквізити",
                  d: "ФОП, ІПН, IBAN, послуги — звичні поля українською.",
                },
                {
                  n: "02",
                  t: "Залиште email",
                  d: "Отримаєте PDF і календар нагадувань для вашої групи ФОП.",
                },
                {
                  n: "03",
                  t: "Не пропустіть податки",
                  d: "Лист за 3 дні до строку. Pro відкриє автоматичні нагадування.",
                },
              ].map((item) => (
                <li key={item.n} className="border-t border-line pt-5">
                  <p className="font-display text-sm text-signal">{item.n}</p>
                  <h3 className="mt-2 font-display text-xl">{item.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{item.d}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="relative min-h-[320px] overflow-hidden bg-ink-2 lg:min-h-full">
            <Image
              src="/brand/invoice.webp"
              alt="Рахунок на столі — атмосфера Rakhuno"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/50 via-transparent to-transparent lg:from-ink/30" />
          </div>
        </div>
      </section>

      <section id="podatky" className="border-t border-line bg-ink-2">
        <div className="mx-auto grid max-w-content lg:grid-cols-2">
          <div className="relative order-2 min-h-[320px] overflow-hidden lg:order-1 lg:min-h-full">
            <Image
              src="/brand/reminder.webp"
              alt="Нагадування про податки в email"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-ink-2/60 via-transparent to-transparent lg:from-ink-2/40" />
          </div>
          <div className="order-1 flex flex-col justify-center px-5 py-16 md:px-10 md:py-24 lg:order-2">
            <p className="font-display text-sm uppercase tracking-[0.18em] text-signal">Email</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-5xl">
              Нагадування, не консультація
            </h2>
            <p className="mt-4 max-w-xl text-mist">
              Rakhuno не замінює бухгалтера. Ми лише нагадуємо типові строки для ФОП 2–3 групи — щоб ви
              не забули відкрити календар.
            </p>
            <ul className="mt-10 space-y-4">
              <li className="flex gap-3 border-b border-line pb-4">
                <span className="text-signal">→</span>
                <span>Єдиний податок — типове вікно сплати</span>
              </li>
              <li className="flex gap-3 border-b border-line pb-4">
                <span className="text-signal">→</span>
                <span>ЄСВ — щомісячні / квартальні нагадування</span>
              </li>
              <li className="flex gap-3 pb-4">
                <span className="text-signal">→</span>
                <span>Декларація — сезонні листи</span>
              </li>
            </ul>
            <Link
              href="/invoice"
              className="mt-8 inline-flex w-fit rounded-full bg-signal px-6 py-3 font-semibold text-ink transition hover:bg-white"
            >
              Почати з рахунку
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-line px-5 py-16 md:px-10">
        <div className="mx-auto flex max-w-content flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold md:text-3xl">Готові виставити рахунок?</h2>
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

      <footer className="border-t border-line px-5 py-10 text-sm text-muted md:px-10">
        <div className="mx-auto flex max-w-content flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Rakhuno</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/guides" className="hover:text-signal">
              Гіди
            </Link>
            <Link href="/invoice" className="hover:text-signal">
              Рахунок
            </Link>
          </div>
          <p className="max-w-lg">
            Не є податковою консультацією. Строки загальні; перевіряйте актуальні вимоги ДПС.
          </p>
        </div>
      </footer>
    </main>
  );
}
