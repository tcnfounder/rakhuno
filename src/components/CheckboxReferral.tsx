"use client";

import { trackEvent } from "@/lib/analytics";

/** Rakhuno's Checkbox partner link (partner.checkbox.ua, account created 2026-11-23). */
const CHECKBOX_REF = "https://checkbox.ua/?partner_ref=wrOvGdMhlI";

export function checkboxUrl(from: string) {
  return `${CHECKBOX_REF}&utm_source=rakhuno&utm_medium=referral&utm_campaign=${encodeURIComponent(from)}`;
}

/** Affiliate block for people who do need a ПРРО. Always discloses the partnership. */
export function CheckboxReferral({ from }: { from: string }) {
  return (
    <div className="not-prose my-8 rounded-2xl border border-signal/40 bg-signal/5 p-5">
      <p className="font-display text-lg text-paper">Потрібен ПРРО? Спробуйте Checkbox</p>
      <ul className="mt-2 space-y-1 text-sm text-mist">
        <li>· Програмна каса в телефоні чи браузері — без апарату</li>
        <li>· Чеки готівкою, карткою, онлайн-оплати й накладений платіж</li>
        <li>· Реєстрацію каси й касира допомагає пройти підтримка</li>
      </ul>
      <a
        href={checkboxUrl(from)}
        target="_blank"
        rel="sponsored noopener"
        onClick={() => trackEvent("checkbox_ref_click", { from })}
        className="mt-4 inline-block rounded-xl bg-signal px-5 py-3 font-semibold text-ink hover:bg-white"
      >
        Підключити Checkbox →
      </a>
      <p className="mt-3 text-xs text-muted">
        Партнерське посилання: якщо ви підключите касу, Rakhuno може отримати винагороду від Checkbox.
        Для вас ціна не змінюється. Безкоштовний ПРРО є й у ДПС — вибір за вами.
      </p>
    </div>
  );
}
