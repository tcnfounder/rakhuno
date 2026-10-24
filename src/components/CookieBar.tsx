"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Lang = "tr" | "uk" | "ru" | "en";

const COPY: Record<Lang, { title: string; body: string; reject: string; accept: string }> = {
  tr: {
    title: "Çerezler",
    body: "Ziyareti anlamak için çerez kullanıyoruz. Reddederseniz kimlik kaydedilmez; anonim bir ölçüm sinyali yine de gider.",
    reject: "Reddet",
    accept: "Kabul et",
  },
  uk: {
    title: "Файли cookie",
    body: "Ми використовуємо cookie, щоб розуміти візити. Якщо відхилите, ідентифікатор не зберігається, але анонімний сигнал вимірювання все одно надсилається.",
    reject: "Відхилити",
    accept: "Прийняти",
  },
  ru: {
    title: "Файлы cookie",
    body: "Мы используем cookie, чтобы понимать визиты. Если откажетесь, идентификатор не сохранится, но анонимный сигнал измерения всё равно отправится.",
    reject: "Отклонить",
    accept: "Принять",
  },
  en: {
    title: "Cookies",
    body: "We use cookies to understand visits. If you decline, we do not store an identifier, but an anonymous measurement signal is still sent.",
    reject: "Decline",
    accept: "Accept",
  },
};

const STYLES = `
.cookie-bar{position:fixed;z-index:90;left:12px;right:12px;bottom:max(12px,env(safe-area-inset-bottom));display:flex;flex-wrap:wrap;gap:12px 16px;align-items:center;padding:14px 16px;border-radius:18px;background:var(--jb-bg);color:var(--jb-fg);border:1px solid color-mix(in srgb,var(--jb-fg) 14%,transparent);box-shadow:0 16px 40px rgba(0,0,0,.18);font-family:inherit;max-width:720px;margin-inline:auto}
.cookie-bar__copy{flex:1 1 220px;min-width:0}
.cookie-bar__copy strong{display:block;font-size:15px;line-height:1.3;margin:0 0 4px;color:var(--jb-fg)}
.cookie-bar__copy p{margin:0;font-size:14px;line-height:1.45;color:var(--jb-muted)}
.cookie-bar__copy a{color:var(--jb-fg);font-weight:600}
.cookie-bar__actions{display:flex;gap:8px;margin-left:auto}
.cookie-bar button{min-height:44px;padding:0 16px;border-radius:999px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer}
.cookie-bar__no{background:transparent;color:var(--jb-fg);border:1px solid color-mix(in srgb,var(--jb-fg) 24%,transparent)}
.cookie-bar__yes{background:var(--jb-accent);color:var(--jb-accent-fg);border:0}
@media(max-width:640px){.cookie-bar{flex-direction:column;align-items:stretch;left:10px;right:10px}.cookie-bar__actions{margin-left:0}.cookie-bar__actions button{flex:1}}
`;

export function CookieBar({
  storageKey,
  lang = "tr",
  resolveLang,
  accent,
  accentFg = "#ffffff",
  bg = "#ffffff",
  fg = "#1a1a1a",
  muted = "#5c6570",
  policyHref,
  policyLabel,
}: {
  storageKey: string;
  lang?: Lang;
  resolveLang?: (pathname: string) => Lang;
  accent: string;
  accentFg?: string;
  bg?: string;
  fg?: string;
  muted?: string;
  policyHref?: string;
  policyLabel?: string;
}) {
  const pathname = usePathname() ?? "/";
  const activeLang = resolveLang ? resolveLang(pathname) : lang;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      setOpen(stored !== "accepted" && stored !== "rejected");
    } catch {
      setOpen(true);
    }
  }, [storageKey]);

  function choose(next: "accepted" | "rejected") {
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      /* private mode */
    }
    if (next === "accepted") {
      const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
      gtag?.("consent", "update", { analytics_storage: "granted" });
    }
    setOpen(false);
  }

  if (!open) return null;
  const t = COPY[activeLang];

  return (
    <div
      className="cookie-bar"
      role="dialog"
      aria-labelledby="cookie-bar-title"
      aria-describedby="cookie-bar-body"
      style={{
        ["--jb-bg" as string]: bg,
        ["--jb-fg" as string]: fg,
        ["--jb-muted" as string]: muted,
        ["--jb-accent" as string]: accent,
        ["--jb-accent-fg" as string]: accentFg,
      }}
    >
      <style>{STYLES}</style>
      <div className="cookie-bar__copy">
        <strong id="cookie-bar-title">{t.title}</strong>
        <p id="cookie-bar-body">
          {t.body}
          {policyHref ? (
            <>
              {" "}
              <a href={policyHref}>{policyLabel}</a>
            </>
          ) : null}
        </p>
      </div>
      <div className="cookie-bar__actions">
        <button type="button" className="cookie-bar__no" onClick={() => choose("rejected")}>
          {t.reject}
        </button>
        <button type="button" className="cookie-bar__yes" onClick={() => choose("accepted")}>
          {t.accept}
        </button>
      </div>
    </div>
  );
}
