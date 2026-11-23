"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";

/** Redeems the token with a POST from the page, so link scanners in mail clients cannot use it up. */
export function VerifyLogin() {
  const [state, setState] = useState<"busy" | "error">("busy");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const token = new URLSearchParams(window.location.search).get("token") || "";
    void (async () => {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const body = (await res.json()) as { next?: string; created?: boolean };
        trackEvent(body.created ? "account_created" : "login");
        window.location.replace(body.next || "/account");
      } catch {
        setState("error");
      }
    })();
  }, []);

  if (state === "busy") {
    return <p className="text-lg text-mist" aria-live="polite">Входимо…</p>;
  }
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Посилання не спрацювало</h1>
      <p className="mt-3 text-mist">Воно діє 20 хвилин і лише один раз. Запросіть нове.</p>
      <Link href="/login" className="mt-6 inline-block rounded-xl bg-signal px-5 py-3 font-semibold text-ink">
        Отримати нове посилання
      </Link>
    </div>
  );
}
