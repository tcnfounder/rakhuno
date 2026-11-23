import type { Metadata } from "next";
import { SiteShell, PageFooterNote } from "@/components/SiteShell";
import { SiteFooter } from "@/components/SiteFooter";
import { DEFAULT_OG_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Умови використання",
  description: "Умови користування сервісом Rakhuno: рахунок-фактура та нагадування для ФОП.",
  alternates: { canonical: "https://rakhuno.com/terms" },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: "Умови використання · Rakhuno",
    url: "https://rakhuno.com/terms",
  },
};

export default function TermsPage() {
  return (
    <>
      <SiteShell>
        <h1 className="font-display text-4xl font-semibold md:text-5xl">Умови використання</h1>
        <p className="mt-3 text-sm text-muted">Оновлено: 23 листопада 2026</p>

        <div className="mt-10 max-w-3xl space-y-8 text-mist leading-relaxed">
          <section>
            <h2 className="font-display text-xl text-paper">1. Сервіс</h2>
            <p className="mt-3">
              Rakhuno (rakhuno.com) надає інструменти для формування рахунку-фактури, акта,
              видаткової накладної й акта звірки (PDF), рахунків-посилань з оплатою за QR,
              калькулятор податків і email-нагадування про типові строки податків для ФОП. Ці функції
              безкоштовні.
            </p>
            <p className="mt-3">
              Сервіс надає <span className="text-paper">Atakan Dindar</span> (фізична особа), далі —
              «ми». Контакт:{" "}
              <a href="mailto:info@rakhuno.com" className="text-signal hover:underline">
                info@rakhuno.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-paper">2. Платні тарифи</h2>
            <p className="mt-3">
              Платні тарифи (Rakhuno Pro, кабінет бухгалтера) та їхні ціни наведено на сторінці{" "}
              <a href="/pro" className="text-signal hover:underline">
                тарифів
              </a>
              . Підписка продовжується автоматично щомісяця або щороку, доки ви її не скасуєте.
              Скасувати можна будь-коли; тариф діє до кінця оплаченого періоду.
            </p>
            <p className="mt-3">
              Замовлення обробляє наш онлайн-реселер Paddle.com, який є Merchant of Record для всіх
              замовлень і відповідає за обробку платежів, податки та повернення. Під час оплати діють
              також умови Paddle для покупців. Повернення коштів — за{" "}
              <a href="/refund" className="text-signal hover:underline">
                політикою повернення
              </a>{" "}
              (14 днів).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-paper">3. Не консультація</h2>
            <p className="mt-3">
              Rakhuno не є бухгалтером, аудитором чи податковим консультантом. Нагадування носять
              загальний інформаційний характер. Актуальні ставки, строки й обов’язки перевіряйте в
              ДПС або у свого бухгалтера.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-paper">4. Відповідальність за дані</h2>
            <p className="mt-3">
              Ви відповідаєте за правильність ПІБ, ІПН, IBAN, сум і опису послуг у рахунку. PDF
              формується з даних, які ви ввели.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-paper">5. Доступність</h2>
            <p className="mt-3">
              Ми прагнемо стабільної роботи, але не гарантуємо 100% uptime. Сервіс може змінюватися
              або тимчасово бути недоступним.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-paper">6. Контакт</h2>
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
