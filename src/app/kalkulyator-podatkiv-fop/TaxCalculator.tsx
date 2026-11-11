"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  calcMonthly,
  formatMoney,
  upcomingDeadlines,
  type FopGroup,
} from "@/lib/fop-tax";

function parseIncome(raw: string) {
  const n = Number(raw.replace(/[\s ₴]|грн/gi, "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

const dateFmt = new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long", year: "numeric" });

export function TaxCalculator() {
  const [group, setGroup] = useState<FopGroup>(3);
  const [vat, setVat] = useState(false);
  const [incomeRaw, setIncomeRaw] = useState("50 000");
  const [now, setNow] = useState<Date | null>(null);

  // Dates depend on "today": compute after mount so server HTML and hydration agree.
  useEffect(() => setNow(new Date()), []);

  const income = parseIncome(incomeRaw);
  const r = useMemo(() => calcMonthly(group, income, vat), [group, income, vat]);
  const deadlines = useMemo(() => (now ? upcomingDeadlines(group, now, 5) : []), [group, now]);

  function pickGroup(g: FopGroup) {
    setGroup(g);
    trackEvent("tax_calc_group", { group: g });
  }

  const row = "flex items-baseline justify-between gap-4 border-b border-line/80 py-2.5";

  return (
    <div className="not-prose rounded-2xl border border-signal/40 bg-signal/5 p-5 md:p-6">
      <p className="font-display text-lg text-paper">Група ФОП</p>
      <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Група ФОП">
        {([1, 2, 3] as FopGroup[]).map((g) => (
          <button
            key={g}
            type="button"
            role="radio"
            aria-checked={group === g}
            onClick={() => pickGroup(g)}
            className={`rounded-xl border py-3 text-base font-semibold transition ${
              group === g
                ? "border-signal bg-signal text-ink"
                : "border-white/15 text-paper hover:border-signal"
            }`}
          >
            {g} група
          </button>
        ))}
      </div>

      <label htmlFor="income" className="mt-5 block font-display text-lg text-paper">
        Дохід за місяць
      </label>
      <input
        id="income"
        inputMode="decimal"
        value={incomeRaw}
        onChange={(e) => setIncomeRaw(e.target.value)}
        className="mt-2 w-full rounded-xl border border-white/15 bg-ink px-4 py-3 text-lg text-paper outline-none focus:border-signal"
      />
      <p className="mt-1 text-xs text-mist">
        {group === 3
          ? "Для 3 групи податки рахуються від доходу."
          : "Для 1–2 групи сума податків фіксована; дохід потрібен, щоб перевірити ліміт."}
      </p>
      {group === 3 ? (
        <label className="mt-3 flex items-center gap-2 text-sm text-mist">
          <input type="checkbox" checked={vat} onChange={(e) => setVat(e.target.checked)} />
          Платник ПДВ (ставка 3% замість 5%)
        </label>
      ) : null}

      <div className="mt-6 rounded-xl border border-white/10 bg-ink/60 px-4 py-2">
        <div className={row}>
          <span className="text-mist">
            Єдиний податок{group === 3 ? ` (${vat ? 3 : 5}%)` : ""}
          </span>
          <span className="shrink-0 whitespace-nowrap tabular-nums text-paper">{formatMoney(r.singleTax)}</span>
        </div>
        <div className={row}>
          <span className="text-mist">ЄСВ (22% мінзарплати)</span>
          <span className="shrink-0 whitespace-nowrap tabular-nums text-paper">{formatMoney(r.esv)}</span>
        </div>
        <div className={row}>
          <span className="text-mist">Військовий збір{group === 3 ? " (1%)" : ""}</span>
          <span className="shrink-0 whitespace-nowrap tabular-nums text-paper">{formatMoney(r.military)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-4 py-3">
          <span className="font-display text-lg text-paper">Разом за місяць</span>
          <span className="shrink-0 whitespace-nowrap font-display text-2xl font-semibold tabular-nums text-signal">
            {formatMoney(r.total)}
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm text-mist">
        За рік: <span className="text-paper">{formatMoney(r.total * 12)}</span>
        {r.effectiveRate !== null ? (
          <>
            {" "}· це <span className="text-paper">{(r.effectiveRate * 100).toFixed(1)}%</span> від
            доходу
          </>
        ) : null}
      </p>
      {r.overLimit ? (
        <p className="mt-3 rounded-lg border border-red-400/40 bg-red-400/10 px-3 py-2 text-sm text-red-200">
          Річний дохід {formatMoney(r.annualIncome)} перевищує ліміт {group} групи (
          {formatMoney(r.limit)}). {group < 3 ? "Варто перейти на вищу групу." : "Варто звернутися до бухгалтера."}
        </p>
      ) : (
        <p className="mt-3 text-xs text-mist">
          Ліміт доходу {group} групи у 2026 році: {formatMoney(r.limit)} на рік.
        </p>
      )}

      <p className="mt-6 font-display text-lg text-paper">Найближчі терміни сплати</p>
      <ul className="mt-2 space-y-2">
        {deadlines.map((d) => (
          <li key={`${d.date.getTime()}-${d.title}`} className="rounded-lg border border-white/10 bg-ink/60 px-3 py-2">
            <p className="text-sm font-semibold text-paper">
              до {dateFmt.format(d.date)} · {d.title}
            </p>
            <p className="text-xs text-mist">{d.detail}</p>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-mist">
        Якщо дата припадає на вихідний, перевірте перенесення в календарі ДПС.
      </p>

      <p className="mt-5 text-sm text-mist">
        Потрібен рахунок для клієнта?{" "}
        <Link href="/invoice" className="text-signal underline-offset-2 hover:underline">
          Зробіть рахунок-фактуру з QR для оплати
        </Link>{" "}
        за 2 хвилини.
      </p>
    </div>
  );
}
