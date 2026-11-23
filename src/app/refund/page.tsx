import type { Metadata } from "next";
import { SiteShell, PageFooterNote } from "@/components/SiteShell";
import { SiteFooter } from "@/components/SiteFooter";
import { DEFAULT_OG_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Повернення коштів",
  description: "Як скасувати платний тариф Rakhuno і повернути оплату.",
  alternates: { canonical: "https://rakhuno.com/refund" },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: "Повернення коштів · Rakhuno",
    url: "https://rakhuno.com/refund",
  },
};

const link = "text-signal hover:underline";

export default function RefundPage() {
  return (
    <>
      <SiteShell>
        <h1 className="font-display text-4xl font-semibold md:text-5xl">Повернення коштів</h1>
        <p className="mt-3 text-sm text-muted">Оновлено: 23 листопада 2026</p>

        <div className="mt-10 max-w-3xl space-y-8 text-mist leading-relaxed">
          <section>
            <h2 className="font-display text-xl text-paper">1. Що безкоштовно</h2>
            <p className="mt-3">
              Рахунок-фактура, акт, видаткова накладна, акт звірки, калькулятор податків, нагадування й
              кабінет — безкоштовні. За них ми нічого не списуємо.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-paper">2. Платні тарифи</h2>
            <p className="mt-3">
              Платні тарифи (Rakhuno Pro і кабінет бухгалтера, див.{" "}
              <a href="/pro" className={link}>
                тарифи
              </a>
              ) — щомісячна або щорічна підписка. Оплату приймає Paddle.com — наш реселер і
              Merchant of Record: саме Paddle виставляє вам чек і обробляє платіж і повернення.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-paper">3. Повернення протягом 14 днів</h2>
            <p className="mt-3">
              Якщо тариф вам не підійшов, ми повернемо повну суму першого платежу або чергового
              продовження, якщо ви попросите про це протягом 14 днів від дати списання. Причину
              пояснювати не обов’язково.
            </p>
            <p className="mt-3">
              Щоб повернути кошти, напишіть на{" "}
              <a href="mailto:info@rakhuno.com" className={link}>
                info@rakhuno.com
              </a>{" "}
              з email, на який оформлено підписку, або скористайтеся посиланням у чеку від Paddle.
              Кошти повертаються на ту саму картку; строк зарахування залежить від вашого банку
              (зазвичай 5–10 банківських днів).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-paper">4. Скасування підписки</h2>
            <p className="mt-3">
              Скасувати підписку можна будь-коли — у кабінеті, за посиланням у чеку Paddle або листом
              на info@rakhuno.com. Після скасування тариф діє до кінця оплаченого періоду, наступне
              списання не відбудеться. Безкоштовні функції залишаються доступними.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-paper">5. Пробний період</h2>
            <p className="mt-3">
              Якщо тариф має безкоштовний пробний період (наприклад, 15 днів для кабінету
              бухгалтера), за нього нічого не списується. Ви можете скасувати підписку до кінця
              пробного періоду без оплати.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-paper">6. Хто надає сервіс</h2>
            <p className="mt-3">
              Rakhuno надає Atakan Dindar (фізична особа). Контакт:{" "}
              <a href="mailto:info@rakhuno.com" className={link}>
                info@rakhuno.com
              </a>
              . Детальніше — в{" "}
              <a href="/terms" className={link}>
                умовах використання
              </a>
              .
            </p>
          </section>
        </div>
        <PageFooterNote />
      </SiteShell>
      <SiteFooter />
    </>
  );
}
