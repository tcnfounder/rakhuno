"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { amountInWordsUk, integerToWordsUk } from "@/lib/invoice";
import { trackEvent } from "@/lib/analytics";

/** Accepts «12 345,67», «12345.67», «12 345» — the way people paste amounts from bank apps. */
function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[\s ₴]|грн/gi, "").replace(",", ".");
  if (!cleaned) return null;
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n < 1_000_000_000_000 ? n : null;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function AmountWordsTool() {
  const [raw, setRaw] = useState("12 500,00");
  const [copied, setCopied] = useState<string | null>(null);
  const amount = parseAmount(raw);

  const rows = useMemo(() => {
    if (amount === null) return [];
    const hryvni = Math.floor(amount);
    const kop = String(Math.round((amount - hryvni) * 100)).padStart(2, "0");
    const digits = hryvni.toLocaleString("uk-UA").replace(/ /g, " ");
    return [
      { key: "full", label: "Гривні й копійки", value: amountInWordsUk(amount) },
      {
        key: "doc",
        label: "Для рахунку чи акту",
        value: `${digits},${kop} грн (${amountInWordsUk(amount)})`,
      },
      { key: "number", label: "Лише число", value: capitalize(integerToWordsUk(hryvni)) },
    ];
  }, [amount]);

  async function copy(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      trackEvent("amount_words_copy", { format: key });
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className="not-prose rounded-2xl border border-signal/40 bg-signal/5 p-5 md:p-6">
      <label htmlFor="amount" className="font-display text-lg text-paper">
        Сума цифрами
      </label>
      <input
        id="amount"
        inputMode="decimal"
        autoComplete="off"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder="Наприклад, 12 500,00"
        className="mt-3 w-full rounded-xl border border-line bg-ink px-4 py-3 text-xl font-semibold tabular-nums text-paper outline-none focus:border-signal"
      />
      {amount === null && raw.trim() !== "" ? (
        <p className="mt-2 text-sm text-mist">
          Введіть число, наприклад 1500 або 1 500,50 (до двох знаків після коми).
        </p>
      ) : null}

      <div className="mt-5 space-y-3" aria-live="polite">
        {rows.map((r) => (
          <div key={r.key} className="rounded-xl border border-line bg-ink/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-signal">{r.label}</p>
            <p className="mt-2 text-paper">{r.value}</p>
            <button
              type="button"
              onClick={() => copy(r.key, r.value)}
              className="mt-3 rounded-full border border-signal px-3 py-1 text-sm font-semibold text-signal transition hover:bg-signal hover:text-ink"
            >
              {copied === r.key ? "Скопійовано ✓" : "Копіювати"}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-5 text-sm text-mist">
        Потрібен цілий рахунок, а не лише сума?{" "}
        <Link href="/invoice" className="text-signal underline-offset-2 hover:underline">
          Rakhuno
        </Link>{" "}
        сам допише суму прописом у PDF рахунку-фактури.
      </p>
    </div>
  );
}
