import { forwardRef } from "react";
import {
  InvoiceItem,
  amountInWordsUk,
  calcLine,
  calcTotal,
  formatDateUk,
  formatUah,
  parseAmount,
} from "@/lib/invoice";

/*
 * Print-only A4 documents for the guide-page quick fill. Rendered off-screen and
 * captured by html2canvas (see lib/pdf.ts), so plain HTML and print-safe colours only.
 */

const money = new Intl.NumberFormat("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const cell = "border border-neutral-400 px-2 py-1.5 align-top";
const sheetStyle = { fontFamily: "Arial, Helvetica, sans-serif", padding: "14mm", boxSizing: "border-box" as const };
const blank = "____________________";

export function fopName(name: string) {
  const n = name.trim();
  if (!n) return `ФОП ${blank}`;
  return /^фоп\b/i.test(n) ? n : `ФОП ${n}`;
}

export type PartyData = {
  number: string;
  date: string;
  sellerName: string;
  sellerTaxId: string;
  buyerName: string;
  buyerTaxId: string;
  basis: string;
};

export type NakladnaData = PartyData & { items: InvoiceItem[] };

export const NakladnaDocument = forwardRef<HTMLDivElement, { data: NakladnaData }>(
  function NakladnaDocument({ data }, ref) {
    const items = data.items.filter((i) => i.description.trim() || calcLine(i) > 0);
    const total = calcTotal(items);
    return (
      <div ref={ref} className="w-[210mm] bg-white text-[13px] leading-snug text-[#111]" style={sheetStyle}>
        <p className="text-center text-[17px] font-bold">ВИДАТКОВА НАКЛАДНА № {data.number || "—"}</p>
        <p className="mt-1 text-center">від {formatDateUk(data.date)}</p>

        <table className="mt-5 w-full text-[13px]">
          <tbody>
            <tr>
              <td className="w-32 py-1 align-top font-semibold">Постачальник:</td>
              <td className="py-1">
                {fopName(data.sellerName)}
                {data.sellerTaxId ? `, РНОКПП ${data.sellerTaxId}` : ""}
              </td>
            </tr>
            <tr>
              <td className="py-1 align-top font-semibold">Покупець:</td>
              <td className="py-1">
                {data.buyerName.trim() || blank}
                {data.buyerTaxId ? `, код ${data.buyerTaxId}` : ""}
              </td>
            </tr>
            <tr>
              <td className="py-1 align-top font-semibold">Підстава:</td>
              <td className="py-1">{data.basis.trim() || blank}</td>
            </tr>
          </tbody>
        </table>

        <table className="mt-4 w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-neutral-100">
              <th className={`${cell} w-8 text-center`}>№</th>
              <th className={`${cell} text-left`}>Найменування товару</th>
              <th className={`${cell} w-16 text-center`}>Од.</th>
              <th className={`${cell} w-14 text-right`}>К-сть</th>
              <th className={`${cell} w-24 text-right`}>Ціна, грн</th>
              <th className={`${cell} w-28 text-right`}>Сума, грн</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id}>
                <td className={`${cell} text-center`}>{i + 1}</td>
                <td className={cell}>{item.description || "—"}</td>
                <td className={`${cell} text-center`}>{item.unit}</td>
                <td className={`${cell} text-right tabular-nums`}>{item.qty}</td>
                <td className={`${cell} text-right tabular-nums`}>{money.format(parseAmount(item.price))}</td>
                <td className={`${cell} text-right tabular-nums`}>{money.format(calcLine(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-3 text-right font-bold">Разом: {formatUah(total)}</p>
        <p className="mt-1">Сума прописом: {amountInWordsUk(total)}. Без ПДВ.</p>

        <div className="mt-10 grid grid-cols-2 gap-8">
          <div className="flex flex-col">
            <p className="font-bold">Відвантажив</p>
            <p className="mt-1">{fopName(data.sellerName)}</p>
            <div className="h-10" />
            <p className="mt-auto border-t border-neutral-500 pt-1 text-[11px] text-neutral-600">підпис</p>
          </div>
          <div className="flex flex-col">
            <p className="font-bold">Отримав</p>
            <p className="mt-1">{data.buyerName.trim() || blank}</p>
            <div className="h-10" />
            <p className="mt-auto border-t border-neutral-500 pt-1 text-[11px] text-neutral-600">підпис, ПІБ</p>
          </div>
        </div>
      </div>
    );
  },
);

export type ZvirkaRow = { id: string; date: string; doc: string; debit: string; credit: string };

export type ZvirkaData = PartyData & {
  periodFrom: string;
  periodTo: string;
  /** Opening balance: positive = покупець винен ФОП, negative = ФОП винен покупцю. */
  opening: string;
  rows: ZvirkaRow[];
};

export function zvirkaTotals(data: ZvirkaData) {
  const rows = data.rows.filter((r) => r.doc.trim() || parseAmount(r.debit) || parseAmount(r.credit));
  const debit = rows.reduce((s, r) => s + parseAmount(r.debit), 0);
  const credit = rows.reduce((s, r) => s + parseAmount(r.credit), 0);
  const opening = parseAmount(data.opening);
  return { rows, debit, credit, opening, closing: opening + debit - credit };
}

/** «Заборгованість замовника перед ФОП …» from the seller's side of the ledger. */
export function zvirkaConclusion(data: ZvirkaData) {
  const { closing } = zvirkaTotals(data);
  const when = formatDateUk(data.periodTo);
  const buyer = data.buyerName.trim() || "Покупця";
  if (Math.abs(closing) < 0.005) return `Станом на ${when} заборгованість між сторонами відсутня.`;
  const sum = `${money.format(Math.abs(closing))} грн (${amountInWordsUk(Math.abs(closing))})`;
  return closing > 0
    ? `Станом на ${when} заборгованість ${buyer} перед ${fopName(data.sellerName)} становить ${sum}.`
    : `Станом на ${when} заборгованість ${fopName(data.sellerName)} перед ${buyer} становить ${sum}.`;
}

export const ZvirkaDocument = forwardRef<HTMLDivElement, { data: ZvirkaData }>(
  function ZvirkaDocument({ data }, ref) {
    const { rows, debit, credit, opening, closing } = zvirkaTotals(data);
    const side = (v: number) => (v > 0 ? money.format(v) : "");
    return (
      <div ref={ref} className="w-[210mm] bg-white text-[13px] leading-snug text-[#111]" style={sheetStyle}>
        <p className="text-center text-[17px] font-bold">АКТ ЗВІРКИ ВЗАЄМОРОЗРАХУНКІВ № {data.number || "—"}</p>
        <p className="mt-1 text-center">
          за період з {formatDateUk(data.periodFrom)} по {formatDateUk(data.periodTo)}
        </p>
        <p className="mt-1 text-right">від {formatDateUk(data.date)}</p>

        <p className="mt-5 text-justify">
          Ми, що нижче підписалися, {fopName(data.sellerName)}
          {data.sellerTaxId ? `, РНОКПП ${data.sellerTaxId}` : ""}, з одного боку, і{" "}
          {data.buyerName.trim() || blank}
          {data.buyerTaxId ? `, код ${data.buyerTaxId}` : ""}, з іншого боку, склали цей акт про те, що
          стан взаєморозрахунків{data.basis.trim() ? ` за ${data.basis.trim()}` : ""} за даними{" "}
          {fopName(data.sellerName)} такий:
        </p>

        <table className="mt-4 w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-neutral-100">
              <th className={`${cell} w-24 text-left`}>Дата</th>
              <th className={`${cell} text-left`}>Документ</th>
              <th className={`${cell} w-28 text-right`}>Дебет, грн</th>
              <th className={`${cell} w-28 text-right`}>Кредит, грн</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={cell}>{formatDateUk(data.periodFrom)}</td>
              <td className={cell}>Сальдо на початок періоду</td>
              <td className={`${cell} text-right tabular-nums`}>{side(opening)}</td>
              <td className={`${cell} text-right tabular-nums`}>{side(-opening)}</td>
            </tr>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className={cell}>{r.date ? formatDateUk(r.date) : ""}</td>
                <td className={cell}>{r.doc || "—"}</td>
                <td className={`${cell} text-right tabular-nums`}>{side(parseAmount(r.debit))}</td>
                <td className={`${cell} text-right tabular-nums`}>{side(parseAmount(r.credit))}</td>
              </tr>
            ))}
            <tr className="font-semibold">
              <td className={cell} colSpan={2}>
                Обороти за період
              </td>
              <td className={`${cell} text-right tabular-nums`}>{money.format(debit)}</td>
              <td className={`${cell} text-right tabular-nums`}>{money.format(credit)}</td>
            </tr>
            <tr className="font-bold">
              <td className={cell}>{formatDateUk(data.periodTo)}</td>
              <td className={cell}>Сальдо на кінець періоду</td>
              <td className={`${cell} text-right tabular-nums`}>{side(closing)}</td>
              <td className={`${cell} text-right tabular-nums`}>{side(-closing)}</td>
            </tr>
          </tbody>
        </table>

        <p className="mt-4">{zvirkaConclusion(data)}</p>

        <div className="mt-10 grid grid-cols-2 gap-8">
          <div className="flex flex-col">
            <p className="font-bold">Від {fopName(data.sellerName)}</p>
            <div className="h-10" />
            <p className="mt-auto border-t border-neutral-500 pt-1 text-[11px] text-neutral-600">підпис</p>
          </div>
          <div className="flex flex-col">
            <p className="font-bold">Від {data.buyerName.trim() || blank}</p>
            <div className="h-10" />
            <p className="mt-auto border-t border-neutral-500 pt-1 text-[11px] text-neutral-600">підпис, ПІБ</p>
          </div>
        </div>
      </div>
    );
  },
);
