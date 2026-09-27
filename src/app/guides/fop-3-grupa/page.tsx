import type { Metadata } from "next";
import { ArticleLayout } from "@/components/ArticleLayout";

export const metadata: Metadata = {
  title: "ФОП 3 група — коротко",
  description: "Кому підходить ФОП 3 група, що пам’ятати про податки та рахунки клієнтам.",
  alternates: { canonical: "https://rakhuno.com/guides/fop-3-grupa" },
};

export default function Page() {
  return (
    <ArticleLayout
      title="ФОП 3 група — коротко"
      description="Популярний формат для послуг і невеликого бізнесу. Головне — не губити строки й рахунки."
    >
      <p>
        Запит <em>фоп 3 група</em> часто означає одне: «як мені працювати просто». Третя група зручна
        для багатьох фрілансерів і сервісних ФОП, але умови (ліміти, ставки, ПДВ) змінюються — їх
        треба звіряти з ДПС або бухгалтером.
      </p>
      <p>Практичний мінімум на кожен день:</p>
      <ul className="list-disc space-y-2 pl-5 text-mist">
        <li>виставляйте зрозумілий рахунок клієнту (IBAN + опис)</li>
        <li>тримайте PDF у папці місяця</li>
        <li>не пропускайте типові вікна єдиного податку / ЄСВ</li>
      </ul>
      <p>
        Rakhuno закриває перші два пункти одразу й нагадує про третій листом. Це не податкова
        консультація — лише інструмент «не забути».
      </p>
    </ArticleLayout>
  );
}
