"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error" | "off">("idle");

  async function submit() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setState("error");
      return;
    }
    setState("busy");
    const next = new URLSearchParams(window.location.search).get("next") || "/account";
    try {
      const res = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), next }),
      });
      if (res.status === 503) {
        setState("off");
        return;
      }
      setState(res.ok ? "sent" : "error");
      if (res.ok) trackEvent("login_link_request");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="mt-8 rounded-2xl border border-signal/50 bg-signal/10 p-5">
        <p className="font-semibold text-paper">Перевірте пошту</p>
        <p className="mt-1 text-sm text-mist">
          Ми надіслали посилання для входу на <span className="text-paper">{email.trim()}</span>. Воно діє 20
          хвилин. Немає листа — перевірте «Спам» або «Промоакції».
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-ink/60 p-5">
      <label htmlFor="login-email" className="text-sm text-mist">
        Email
      </label>
      <input
        id="login-email"
        type="email"
        autoComplete="email"
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") void submit();
        }}
        className="mt-1 w-full rounded-xl border border-white/15 bg-ink px-4 py-3 text-paper outline-none focus:border-signal"
      />
      <button
        type="button"
        disabled={state === "busy"}
        onClick={() => void submit()}
        className="mt-3 w-full rounded-xl bg-signal py-3 font-semibold text-ink disabled:opacity-60"
      >
        {state === "busy" ? "…" : "Надіслати посилання"}
      </button>
      {state === "error" ? <p className="mt-2 text-sm text-red-300">Перевірте email і спробуйте ще раз.</p> : null}
      {state === "off" ? <p className="mt-2 text-sm text-red-300">Вхід тимчасово недоступний.</p> : null}
    </div>
  );
}
