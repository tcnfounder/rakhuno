"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { PRO_FEATURES_EN, PRO_FEATURES_UK } from "@/lib/pro";

type Plan = "fop" | "accountant";

/** Sends Pro waitlist interest; resolves true only when the contact was saved in Brevo. */
export async function joinProWaitlist(email: string, plan: Plan, from: string, clients?: string) {
  const res = await fetch("/api/pro-interest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, plan, from, ...(clients ? { clients } : {}) }),
  });
  if (!res.ok) return false;
  const body = (await res.json()) as { saved?: boolean };
  return body.saved === true;
}

/** Shown after the PDF unlock: the visitor already gave an email, so joining is one click. */
export function ProOffer({ email, lang = "uk" }: { email: string; lang?: "uk" | "en" }) {
  const en = lang === "en";
  const L = (uk: string, eng: string) => (en ? eng : uk);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const root = useRef<HTMLDivElement>(null);

  // The invoice page mounts a mobile and a desktop layout; count the view only for the visible one.
  useEffect(() => {
    if (root.current?.offsetParent) trackEvent("pro_offer_view", { from: "invoice" });
  }, []);

  async function join() {
    trackEvent("pro_offer_click", { from: "invoice", plan: "fop" });
    setState("busy");
    try {
      const ok = await joinProWaitlist(email.trim(), "fop", "invoice");
      setState(ok ? "done" : "error");
      if (ok) trackEvent("pro_waitlist_join", { from: "invoice", plan: "fop" });
    } catch {
      setState("error");
    }
  }

  return (
    <div ref={root} className="mt-4 rounded-lg border border-signal/50 bg-ink/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-signal">
        {L("Скоро · Rakhuno Pro", "Coming soon · Rakhuno Pro")}
      </p>
      <p className="mt-1 font-semibold text-paper">
        {L("Щоб клієнти платили швидше", "Get paid faster")}
      </p>
      <ul className="mt-2 space-y-1 text-sm text-mist">
        {(en ? PRO_FEATURES_EN : PRO_FEATURES_UK).map((f) => (
          <li key={f}>· {f}</li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-paper">
        {L("149 грн/міс. Для списку очікування — перший місяць безкоштовно.", "UAH 149/month. First month free for the waitlist.")}
      </p>
      {state === "done" ? (
        <p className="mt-3 text-sm text-signal">
          {L("Ви в списку. Напишемо на email, щойно Pro запрацює.", "You are on the list. We will email you when Pro launches.")}
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={state === "busy"}
            onClick={() => void join()}
            className="rounded-lg bg-signal px-4 py-2.5 text-sm font-semibold text-ink hover:bg-white disabled:opacity-60"
          >
            {state === "busy" ? "…" : L("Хочу Pro", "I want Pro")}
          </button>
          <Link
            href={en ? "/pro" : "/pro#buhgalteram"}
            onClick={() => trackEvent("pro_offer_accountant_click", { from: "invoice" })}
            className="text-sm text-mist underline-offset-2 hover:text-signal hover:underline"
          >
            {L("Я бухгалтер, веду кілька ФОП →", "I am an accountant with several clients →")}
          </Link>
        </div>
      )}
      {state === "error" ? (
        <p className="mt-2 text-sm text-red-300">{L("Не вдалося. Спробуйте ще раз.", "Something went wrong. Try again.")}</p>
      ) : null}
    </div>
  );
}
