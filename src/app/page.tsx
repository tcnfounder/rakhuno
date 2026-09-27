import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
  return (
    <main className="min-h-screen grid-atmosphere">
      <SiteHeader />

      <section className="relative flex min-h-[88vh] flex-col justify-end px-5 pb-16 pt-10 md:px-10 md:pb-24">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-content">
          <p className="rise font-display text-5xl font-semibold tracking-tight text-paper sm:text-7xl md:text-8xl lg:text-9xl">
            Rakhuno
          </p>
          <h1 className="rise rise-delay-1 mt-6 max-w-3xl font-display text-2xl font-medium leading-tight text-paper sm:text-4xl md:text-5xl">
            Простий рахунок для ФОП
          </h1>
          <p className="rise rise-delay-2 mt-5 max-w-xl text-base leading-relaxed text-mist sm:text-lg">
            Рахунок-фактура за 2 хвилини. Нагадування про єдиний податок у email.
            Без Checkbox. Без зайвої бухгалтерії.
          </p>
          <div className="rise rise-delay-3 mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/invoice"
              className="inline-flex items-center rounded-full bg-signal px-6 py-3 text-base font-semibold text-ink transition hover:bg-white"
            >
              Створити рахунок безкоштовно
            </Link>
            <a
              href="#podatky"
              className="inline-flex items-center rounded-full border border-line px-6 py-3 text-base text-paper transition hover:border-signal hover:text-signal"
            >
              Календар податків
            </a>
          </div>
        </div>
      </section>

      <section id="yak-pratsyuye" className="border-t border-line bg-ink-2/80 px-5 py-20 md:px-10">
        <div className="mx-auto max-w-content">
          <h2 className="font-display text-3xl font-semibold text-paper md:text-4xl">Один інструмент. Дві справи.</h2>
          <p className="mt-3 max-w-2xl text-mist">
            Виставляєте рахунок клієнту. Ми нагадуємо, коли платити податки. Все інше — пізніше.
          </p>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
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
              <div key={item.n} className="border-t border-line pt-5">
                <p className="font-display text-sm text-signal">{item.n}</p>
                <h3 className="mt-3 font-display text-xl text-paper">{item.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="podatky" className="px-5 py-20 md:px-10">
        <div className="mx-auto max-w-content">
          <h2 className="font-display text-3xl font-semibold text-paper md:text-4xl">Нагадування, не консультація</h2>
          <p className="mt-3 max-w-2xl text-mist">
            Rakhuno не замінює бухгалтера й не дає податкових порад. Ми лише нагадуємо типові строки для ФОП
            2–3 групи — щоб ви не забули відкрити календар.
          </p>
          <ul className="mt-10 space-y-4 text-paper">
            <li className="flex gap-3 border-b border-line pb-4">
              <span className="text-signal">→</span>
              <span>Єдиний податок — орієнтовно до 20 числа наступного місяця / кварталу (залежно від групи)</span>
            </li>
            <li className="flex gap-3 border-b border-line pb-4">
              <span className="text-signal">→</span>
              <span>ЄСВ — типові щомісячні / квартальні вікна</span>
            </li>
            <li className="flex gap-3 pb-4">
              <span className="text-signal">→</span>
              <span>Декларація — сезонні нагадування в email</span>
            </li>
          </ul>
          <Link
            href="/invoice"
            className="mt-10 inline-flex rounded-full bg-signal px-6 py-3 font-semibold text-ink transition hover:bg-white"
          >
            Почати з рахунку
          </Link>
        </div>
      </section>

      <footer className="border-t border-line px-5 py-10 text-sm text-muted md:px-10">
        <div className="mx-auto flex max-w-content flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Rakhuno</p>
          <p className="max-w-lg">
            Не є податковою консультацією. Строки загальні; перевіряйте актуальні вимоги ДПС.
          </p>
        </div>
      </footer>
    </main>
  );
}
