import type { Metadata } from "next";
import { SiteShell, PageFooterNote } from "@/components/SiteShell";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Політика конфіденційності",
  description: "Як Rakhuno обробляє email та дані ФОП для рахунків і нагадувань.",
  alternates: { canonical: "https://rakhuno.com/privacy" },
  openGraph: {
    title: "Політика конфіденційності · Rakhuno",
    url: "https://rakhuno.com/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <>
      <SiteShell>
        <h1 className="font-display text-4xl font-semibold md:text-5xl">
          Політика конфіденційності
        </h1>
        <p className="mt-3 text-sm text-muted">Оновлено: 27 вересня 2026</p>

        <div className="mt-10 max-w-3xl space-y-8 text-mist leading-relaxed">
          <section>
            <h2 className="font-display text-xl text-paper">1. Хто ми</h2>
            <p className="mt-3">
              Rakhuno (rakhuno.com) — вебсервіс для створення рахунку-фактури та email-нагадувань
              про типові строки податків для ФОП. Контакт:{" "}
              <a href="mailto:info@rakhuno.com" className="text-signal hover:underline">
                info@rakhuno.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-paper">2. Які дані збираємо</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Email — якщо ви залишаєте його для PDF або нагадувань.</li>
              <li>Група ФОП (якщо вказали) — щоб надсилати релевантні нагадування.</li>
              <li>
                Дані рахунку (ПІБ, IBAN, позиції) зберігаються лише у вашому браузері (localStorage),
                поки ви самі їх не очистите. На сервер ми їх не надсилаємо для зберігання профілю.
              </li>
              <li>Технічні логи (IP, час запиту) — для безпеки та стабільності сервісу.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-paper">3. Навіщо</h2>
            <p className="mt-3">
              Email потрібен, щоб завершити сценарій створення PDF у браузері та (за бажанням)
              надсилати нагадування про типові строки сплати. Рахунок вашому клієнту ми не надсилаємо.
              Ми не продаємо контакти третім сторонам для реклами.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-paper">4. Де обробляємо</h2>
            <p className="mt-3">
              Хостинг — Cloudflare. Email-розсилка — Brevo (Sendinblue). Дані можуть оброблятися в
              ЄС / відповідно до політик цих провайдерів.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-paper">5. Ваші права</h2>
            <p className="mt-3">
              Можете попросити видалити email з розсилки: напишіть на{" "}
              <a href="mailto:info@rakhuno.com" className="text-signal hover:underline">
                info@rakhuno.com
              </a>{" "}
              або скористайтеся посиланням відписки в листі.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-paper">6. Cookies</h2>
            <p className="mt-3">
              Сервіс використовує лише технічно необхідні cookies / localStorage для роботи
              інтерфейсу рахунку. Окремої маркетингової аналітики cookies наразі немає.
            </p>
          </section>
        </div>
        <PageFooterNote />
      </SiteShell>
      <SiteFooter />
    </>
  );
}
