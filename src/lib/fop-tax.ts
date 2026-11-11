/**
 * FOP single-tax payers, 2026. Update once a year when the budget law sets a new minimum wage.
 *
 * Sources checked 11.11.2026 (several tax publications agree): minimum wage 8 647 грн from
 * 01.01.2026 (Закон про Держбюджет-2026), прожитковий мінімум для працездатних 3 328 грн.
 * - Єдиний податок: group 1 = 10% ПМ (332,80), group 2 = 20% МЗП (1 729,40), group 3 = 5% of income
 *   (3% for VAT payers).
 * - ЄСВ: 22% МЗП = 1 902,34 грн a month, paid quarterly.
 * - Військовий збір: groups 1–2 = 10% МЗП (864,70 грн a month), group 3 = 1% of income.
 * - Income limits: 167 / 834 / 1 167 МЗП.
 * Not tax advice: the page tells people to check the ДПС calendar.
 */
export const TAX_YEAR = 2026;
export const MIN_WAGE = 8647;
export const SUBSISTENCE_ABLE = 3328;

export type FopGroup = 1 | 2 | 3;

export const ESV_MONTH = round2(MIN_WAGE * 0.22);
export const MILITARY_FIXED_MONTH = round2(MIN_WAGE * 0.1);
export const SINGLE_TAX_FIXED: Record<1 | 2, number> = {
  1: round2(SUBSISTENCE_ABLE * 0.1),
  2: round2(MIN_WAGE * 0.2),
};
export const INCOME_LIMIT: Record<FopGroup, number> = {
  1: MIN_WAGE * 167,
  2: MIN_WAGE * 834,
  3: MIN_WAGE * 1167,
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export type TaxResult = {
  singleTax: number;
  esv: number;
  military: number;
  total: number;
  /** Share of income, 0–1; null when income is 0. */
  effectiveRate: number | null;
  annualIncome: number;
  limit: number;
  overLimit: boolean;
};

/** Monthly amounts for a given monthly income. */
export function calcMonthly(group: FopGroup, monthlyIncome: number, vatPayer = false): TaxResult {
  const income = Math.max(0, monthlyIncome || 0);
  const singleTax =
    group === 3 ? round2(income * (vatPayer ? 0.03 : 0.05)) : SINGLE_TAX_FIXED[group];
  const military = group === 3 ? round2(income * 0.01) : MILITARY_FIXED_MONTH;
  const esv = ESV_MONTH;
  const total = round2(singleTax + military + esv);
  const annualIncome = income * 12;
  return {
    singleTax,
    esv,
    military,
    total,
    effectiveRate: income > 0 ? total / income : null,
    annualIncome,
    limit: INCOME_LIMIT[group],
    overLimit: annualIncome > INCOME_LIMIT[group],
  };
}

export type Deadline = { date: Date; title: string; detail: string };

const DAY = 86_400_000;

function quarterEnd(year: number, q: number) {
  return new Date(year, q * 3, 0); // last day of the quarter
}

/**
 * Upcoming payment deadlines from `from`, by the rules in the Tax Code / ЄСВ law:
 * - groups 1–2: ЄП and військовий збір by the 20th of the current month (advance);
 * - group 3: ЄП and військовий збір within 50 days after the quarter (declaration 40 days + 10);
 * - everyone: ЄСВ by the 20th of the month after the quarter.
 * Dates are not shifted for weekends; the page says so.
 */
export function upcomingDeadlines(group: FopGroup, from: Date, count = 5): Deadline[] {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const out: Deadline[] = [];
  const y0 = start.getFullYear() - 1;

  for (let y = y0; y <= y0 + 2; y++) {
    for (let q = 1; q <= 4; q++) {
      const qEnd = quarterEnd(y, q);
      const esvDate = new Date(qEnd.getFullYear(), qEnd.getMonth() + 1, 20);
      out.push({
        date: esvDate,
        title: "ЄСВ за квартал",
        detail: `${q} квартал ${y}: ${formatMoney(ESV_MONTH * 3)} (3 × ${formatMoney(ESV_MONTH)})`,
      });
      if (group === 3) {
        out.push({
          date: new Date(qEnd.getTime() + 50 * DAY),
          title: "Єдиний податок і військовий збір",
          detail: `${q} квартал ${y}: 5% (або 3%) і 1% від доходу за квартал`,
        });
        out.push({
          date: new Date(qEnd.getTime() + 40 * DAY),
          title: "Декларація платника єдиного податку",
          detail: `${q} квартал ${y}`,
        });
      }
    }
    if (group !== 3) {
      for (let m = 0; m < 12; m++) {
        out.push({
          date: new Date(y, m, 20),
          title: "Єдиний податок і військовий збір",
          detail: `за ${MONTHS[m]}: ${formatMoney(SINGLE_TAX_FIXED[group])} + ${formatMoney(MILITARY_FIXED_MONTH)}`,
        });
      }
      out.push({
        date: new Date(y + 1, 0, 1 + 60 - 1),
        title: "Річна декларація",
        detail: `за ${y} рік — протягом 60 днів після його закінчення`,
      });
    }
  }

  return out
    .filter((d) => d.date.getTime() >= start.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, count);
}

const MONTHS = [
  "січень", "лютий", "березень", "квітень", "травень", "червень",
  "липень", "серпень", "вересень", "жовтень", "листопад", "грудень",
];

export function formatMoney(n: number) {
  return `${n.toLocaleString("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} грн`;
}
