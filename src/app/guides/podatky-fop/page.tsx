import type { Metadata } from "next";
import { ArticleLayout } from "@/components/ArticleLayout";

export const metadata: Metadata = {
  title: "Податки ФОП: чекліст",
  description: "Короткий чекліст податків для ФОП: рахунок, строки, документи. Без зайвої теорії.",
  alternates: { canonical: "https://rakhuno.com/guides/podatky-fop" },
};

export default function Page() {
  return (
    <ArticleLayout
      title="Податки ФОП: чекліст"
      description="Мінімальний порядок, щоб кінець місяця не перетворювався на хаос."
    >
      <p>Щомісяця / щокварталу пробіжіться списком:</p>
      <ul className="list-disc space-y-2 pl-5 text-mist">
        <li>усі клієнтські рахунки виставлені й збережені в PDF</li>
        <li>оплати збігаються з рахунками (хоча б у таблиці)</li>
        <li>єдиний податок — дата в календарі</li>
        <li>ЄСВ — дата в календарі</li>
        <li>декларація — якщо сезон</li>
      </ul>
      <p>
        Rakhuno закриває «рахунок + нагадування». Складний облік, МТТ, ПДВ і звіти — це зона
        бухгалтера або Checkbox / Медок.
      </p>
    </ArticleLayout>
  );
}
