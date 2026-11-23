"use client";

import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { isSignedIn } from "@/lib/cloud";
import type { InvoiceData } from "@/lib/invoice";

type State = "idle" | "busy" | "confirm" | "ready" | "error";

/**
 * «Send as a link»: the client opens rakhuno.com/r/<id> and pays by QR. Needs an account,
 * so a visitor who is not signed in gets a login email first; once the cookie appears
 * (link opened in another tab of this browser) the link is created without another click.
 */
export function InvoiceLinkShare({ data, email, lang = "uk" }: { data: InvoiceData; email: string; lang?: "uk" | "en" }) {
  const en = lang === "en";
  const L = (uk: string, eng: string) => (en ? eng : uk);
  const [state, setState] = useState<State>("idle");
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const waiting = useRef<number | null>(null);

  useEffect(() => () => {
    if (waiting.current) window.clearInterval(waiting.current);
  }, []);

  async function create() {
    setState("busy");
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice: data }),
      });
      if (res.status === 401) {
        document.cookie = "rk_in=; path=/; max-age=0";
        return void requestLogin();
      }
      const body = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !body.url) {
        setMessage(
          body.error === "incomplete_invoice"
            ? L("Заповніть ПІБ, IBAN і хоча б одну позицію з ціною.", "Fill in the name, IBAN and at least one priced item.")
            : body.error === "daily_limit"
              ? L("Забагато посилань за добу. Спробуйте завтра.", "Too many links today. Try tomorrow.")
              : L("Не вдалося створити посилання.", "Could not create the link."),
        );
        setState("error");
        return;
      }
      setUrl(body.url);
      setState("ready");
      trackEvent("invoice_link_create", {});
    } catch {
      setMessage(L("Не вдалося створити посилання.", "Could not create the link."));
      setState("error");
    }
  }

  async function requestLogin() {
    const address = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      setMessage(L("Вкажіть email вище — на нього прийде лист для входу.", "Enter your email above to get a sign-in link."));
      setState("error");
      return;
    }
    setState("busy");
    try {
      await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: address, next: "/account" }),
      });
      setState("confirm");
      trackEvent("invoice_link_login_request", {});
      if (waiting.current) window.clearInterval(waiting.current);
      waiting.current = window.setInterval(() => {
        if (!isSignedIn()) return;
        if (waiting.current) window.clearInterval(waiting.current);
        waiting.current = null;
        void create();
      }, 2000);
    } catch {
      setMessage(L("Не вдалося надіслати лист.", "Could not send the email."));
      setState("error");
    }
  }

  function start() {
    trackEvent("invoice_link_click", { signed_in: isSignedIn() });
    if (isSignedIn()) void create();
    else void requestLogin();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }

  const shareText = `Рахунок № ${data.number || "—"}: ${url}`;
  const pill = "rounded-full border border-white/15 px-3 py-1.5 text-sm text-mist hover:border-signal hover:text-signal";

  return (
    <div className="mt-4 rounded-lg border border-white/10 bg-ink/60 p-3">
      <p className="font-semibold text-paper">{L("Надіслати клієнту посиланням", "Send to the client as a link")}</p>
      <p className="mt-1 text-sm text-mist">
        {L(
          "Клієнт відкриє рахунок у браузері й оплатить за QR. Ви побачите в кабінеті, коли він його відкрив.",
          "Your client opens the invoice in a browser and pays by QR. Your account shows when they opened it.",
        )}
      </p>

      {state === "ready" ? (
        <div className="mt-3">
          <div className="flex gap-2">
            <input
              readOnly
              value={url}
              aria-label={L("Посилання на рахунок", "Invoice link")}
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-paper"
            />
            <button type="button" onClick={() => void copy()} className="rounded-lg bg-signal px-3 py-2 text-sm font-semibold text-ink">
              {copied ? "✓" : L("Копіювати", "Copy")}
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <a
              className={pill}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("invoice_link_share", { via: "telegram" })}
              href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Рахунок № ${data.number || "—"}`)}`}
            >
              Telegram
            </a>
            <a
              className={pill}
              onClick={() => trackEvent("invoice_link_share", { via: "viber" })}
              href={`viber://forward?text=${encodeURIComponent(shareText)}`}
            >
              Viber
            </a>
            <a
              className={pill}
              onClick={() => trackEvent("invoice_link_share", { via: "email" })}
              href={`mailto:?subject=${encodeURIComponent(`Рахунок № ${data.number || "—"}`)}&body=${encodeURIComponent(shareText)}`}
            >
              Email
            </a>
            <a className={pill} href={url} target="_blank" rel="noopener noreferrer">
              {L("Відкрити", "Open")}
            </a>
          </div>
        </div>
      ) : state === "confirm" ? (
        <p className="mt-3 text-sm text-signal">
          {L(
            `Підтвердіть email: ми надіслали лист на ${email.trim()}. Відкрийте посилання з листа в цьому браузері — посилання на рахунок з’явиться тут саме.`,
            `Confirm your email: we sent a message to ${email.trim()}. Open its link in this browser and the invoice link will appear here.`,
          )}
        </p>
      ) : (
        <button
          type="button"
          disabled={state === "busy"}
          onClick={start}
          className="mt-3 rounded-lg border border-signal px-4 py-2.5 text-sm font-semibold text-signal hover:bg-signal hover:text-ink disabled:opacity-60"
        >
          {state === "busy" ? "…" : L("Створити посилання", "Create link")}
        </button>
      )}
      {state === "error" ? <p className="mt-2 text-sm text-red-300">{message}</p> : null}
    </div>
  );
}
