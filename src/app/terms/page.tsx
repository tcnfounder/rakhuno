import type { Metadata } from "next";
import { SiteShell, PageFooterNote } from "@/components/SiteShell";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Умови використання",
  description: "Умови користування сервісом Rakhuno: рахунок-фактура та нагадування для ФОП.",
  alternates: { canonical: "https://rakhuno.com/terms" },
  openGraph: {
    title: "Умови використання · Rakhuno",
    url: "https://rakhuno.com/terms",
  },
};

export default function TermsPage() {
  return (
    <>
      <SiteShell>
        <h1 className="font-display text-4xl font-semibold md:text-5xl">Умови використання</h1>
        <p className="mt-3 text-sm text-muted">Оновлено: 27 вересня 2026</p>

        <div className="mt-10 max-w-3xl space-y-8 text-mist leading-relaxed">
          <section>
            <h2 className="font-display text-xl text-paper">1. Сервіс</h2>
            <p className="mt-3">
              Rakhuno надає інструмент для формування рахунку-фактури (PDF) та email-нагадувань про
              типові строки податків для ФОП. Сервіс безкоштовний у поточній версії.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-paper">2. Не консультація</h2>
            <p className="mt-3">
              Rakhuno не є бухгалтером, аудитором чи податковим консультантом. Нагадування носять
              загальний інформаційний характер. Актуальні ставки, строки й обов’язки перевіряйте в
              ДПС або у свого бухгалтера.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-paper">3. Відповідальність за дані</h2>
            <p className="mt-3">
              Ви відповідаєте за правильність ПІБ, ІПН, IBAN, сум і опису послуг у рахунку. PDF
              формується з даних, які ви ввели.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-paper">4. Доступність</h2>
            <p className="mt-3">
              Ми прагнемо стабільної роботи, але не гарантуємо 100% uptime. Сервіс може змінюватися
              або тимчасово бути недоступним.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-paper">5. Контакт</h2>
            <p className="mt-3">
              Питання:{" "}
              <a href="mailto:info@rakhuno.com" className="text-signal hover:underline">
                info@rakhuno.com
              </a>
            </p>
          </section>
        </div>
        <PageFooterNote />
      </SiteShell>
      <SiteFooter />
    </>
  );
}
