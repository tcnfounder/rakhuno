"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { joinProWaitlist } from "@/components/ProOffer";

type Plan = "fop" | "accountant";

export function ProWaitlistForm() {
  const [plan, setPlan] = useState<Plan>("fop");
  const [email, setEmail] = useState("");
  const [clients, setClients] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  // Links to /pro#buhgalteram open the form on the accountant plan.
  useEffect(() => {
    if (window.location.hash === "#buhgalteram") setPlan("accountant");
  }, []);

  async function submit() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setState("error");
      return;
    }
    setState("busy");
    trackEvent("pro_offer_click", { from: "pro_page", plan });
    try {
      const ok = await joinProWaitlist(email.trim(), plan, "pro_page", plan === "accountant" ? clients : undefined);
      setState(ok ? "done" : "error");
      if (ok) trackEvent("pro_waitlist_join", { from: "pro_page", plan });
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="rounded-xl border border-signal/50 bg-signal/10 p-5 text-paper">
        Готово, ви в списку. Напишемо на email, щойно {plan === "accountant" ? "кабінет бухгалтера" : "Pro"} запрацює.
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-signal/50 bg-ink/80 p-5 md:p-6">
      <p className="font-display text-xl text-paper">Записатися в список очікування</p>
      <div className="mt-4 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Хто ви">
        {(
          [
            ["fop", "Я ФОП"],
            ["accountant", "Я бухгалтер"],
          ] as [Plan, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={plan === value}
            onClick={() => setPlan(value)}
            className={`rounded-xl border py-3 font-semibold transition ${
              plan === value ? "border-signal bg-signal text-ink" : "border-white/15 text-paper hover:border-signal"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {plan === "accountant" ? (
        <label className="mt-4 block text-sm text-mist">
          Скільки ФОП ви ведете?
          <select
            value={clients}
            onChange={(e) => setClients(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/15 bg-ink px-4 py-3 text-paper outline-none focus:border-signal"
          >
            <option value="">Оберіть</option>
            <option value="1-5">1–5</option>
            <option value="6-15">6–15</option>
            <option value="16-50">16–50</option>
            <option value="51-150">51–150</option>
            <option value="150+">понад 150</option>
          </select>
        </label>
      ) : null}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          autoComplete="email"
          aria-label="Email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void submit();
          }}
          className="min-w-0 flex-1 rounded-xl border border-white/15 bg-ink px-4 py-3 text-paper outline-none focus:border-signal"
        />
        <button
          type="button"
          disabled={state === "busy"}
          onClick={() => void submit()}
          className="rounded-xl bg-signal px-5 py-3 font-semibold text-ink disabled:opacity-60"
        >
          {state === "busy" ? "…" : "Записатися"}
        </button>
      </div>
      {state === "error" ? <p className="mt-2 text-sm text-red-300">Перевірте email і спробуйте ще раз.</p> : null}
      <p className="mt-3 text-xs text-mist">
        Без оплати зараз. Лише лист, коли запустимося. Відписка в один клік.
      </p>
    </div>
  );
}
