import { forwardRef } from "react";
import {
  InvoiceData,
  amountInWordsUk,
  calcLine,
  calcTotal,
  formatDateUk,
  formatUah,
  parseAmount,
} from "@/lib/invoice";

const money = new Intl.NumberFormat("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** «ФОП Петренко П. П.» — users often type the name without the ФОП prefix. */
function fopName(name: string) {
  const n = name.trim();
  if (!n) return "ФОП ____________________";
  return /^фоп\b/i.test(n) ? n : `ФОП ${n}`;
}

/**
 * Act of completed work built from the same invoice data. Rendered off-screen and
 * captured by html2canvas, so keep it plain HTML (no inputs) and print-safe colours.
 */
export const ActDocument = forwardRef<HTMLDivElement, { data: InvoiceData; actDate: string }>(
  function ActDocument({ data, actDate }, ref) {
    const total = calcTotal(data.items);
    const items = data.items.filter((i) => i.description.trim() || calcLine(i) > 0);
    const cell = "border border-neutral-400 px-2 py-1.5 align-top";

    return (
      <div
        ref={ref}
        className="w-[210mm] bg-white text-[13px] leading-snug text-[#111]"
        style={{ fontFamily: "Arial, Helvetica, sans-serif", padding: "14mm", boxSizing: "border-box" }}
      >
        <p className="text-center text-[17px] font-bold">АКТ № {data.number || "—"}</p>
        <p className="text-center text-[14px] font-semibold">
          приймання-передачі наданих послуг (виконаних робіт)
        </p>
        <p className="mt-1 text-right">від {formatDateUk(actDate)}</p>

        <p className="mt-5 text-justify">
          Ми, що нижче підписалися, Виконавець — {fopName(data.sellerName)}
          {data.sellerTaxId ? `, РНОКПП ${data.sellerTaxId}` : ""}, з одного боку, і Замовник —{" "}
          {data.buyerName.trim() || "____________________"}
          {data.buyerTaxId ? `, код ${data.buyerTaxId}` : ""}, з іншого боку, склали цей акт про те,
          що Виконавець надав (виконав), а Замовник прийняв такі послуги (роботи) згідно з
          рахунком-фактурою № {data.number || "—"} від {formatDateUk(data.date)}:
        </p>

        <table className="mt-4 w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-neutral-100">
              <th className={`${cell} w-8 text-center`}>№</th>
              <th className={`${cell} text-left`}>Найменування послуги (роботи)</th>
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
                <td className={`${cell} text-right tabular-nums`}>
                  {money.format(parseAmount(item.price))}
                </td>
                <td className={`${cell} text-right tabular-nums`}>{money.format(calcLine(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-3 text-right font-bold">Загальна вартість: {formatUah(total)}</p>
        <p className="mt-1">
          Сума прописом: {amountInWordsUk(total)}
          {data.fopGroup ? `. Виконавець — платник єдиного податку ${data.fopGroup} групи` : ""}. Без
          ПДВ.
        </p>
        <p className="mt-3">
          Послуги надані (роботи виконані) в повному обсязі та в строк. Сторони претензій одна до
          одної не мають.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-8">
          <div className="flex flex-col">
            <p className="font-bold">Виконавець</p>
            <p className="mt-1">{fopName(data.sellerName)}</p>
            {data.sellerTaxId ? <p>РНОКПП {data.sellerTaxId}</p> : null}
            {data.sellerIban ? <p>IBAN {data.sellerIban}</p> : null}
            <div className="h-10" />
            <p className="mt-auto border-t border-neutral-500 pt-1 text-[11px] text-neutral-600">
              підпис
            </p>
          </div>
          <div className="flex flex-col">
            <p className="font-bold">Замовник</p>
            <p className="mt-1">{data.buyerName.trim() || "____________________"}</p>
            {data.buyerTaxId ? <p>Код {data.buyerTaxId}</p> : null}
            {data.buyerAddress ? <p>{data.buyerAddress}</p> : null}
            <div className="h-10" />
            <p className="mt-auto border-t border-neutral-500 pt-1 text-[11px] text-neutral-600">
              підпис, ПІБ
            </p>
          </div>
        </div>
      </div>
    );
  },
);
