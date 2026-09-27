import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ink text-paper">
      <section className="relative min-h-[100svh] overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
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

      <section id="yak-pratsyuye" className="border-t border-line px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-content">
          <p className="font-display text-sm uppercase tracking-[0.18em] text-signal">Як це працює</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold md:text-5xl">
            Три кроки. Без зайвого.
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Заповніть документ",
                d: "ПІБ ФОП, IBAN, позиції — як у звичайному рахунку.",
              },
              {
                n: "02",
                t: "Залиште email",
                d: "Отримаєте PDF і потрапите в календар нагадувань.",
              },
              {
                n: "03",
                t: "Не пропустіть податки",
                d: "Лист за кілька днів до типового строку сплати.",
              },
            ].map((step, i) => (
              <div
                key={step.n}
                className="step-rise border-t border-line pt-6"
                style={{ animationDelay: `${0.12 * i}s` }}
              >
                <p className="font-display text-sm text-signal">{step.n}</p>
                <h3 className="mt-3 font-display text-2xl">{step.t}</h3>
                <p className="mt-3 text-mist">{step.d}</p>
              </div>
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
              Редагуєте живий рахунок на екрані. PDF виглядає так само — з вашим ПІБ, не з логотипом
              сервісу як заголовком.
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
              poster="/brand/invoice.webp"
              aria-hidden
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
              alt="Нагадування про податки"
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
          <p className="flex items-center gap-2">
            <Image src="/brand/mark.webp" alt="" width={22} height={22} className="rounded" />
            © {new Date().getFullYear()} Rakhuno
          </p>
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
