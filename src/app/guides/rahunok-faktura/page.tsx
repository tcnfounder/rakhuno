import type { Metadata } from "next";
import { ArticleLayout } from "@/components/ArticleLayout";

export const metadata: Metadata = {
  title: "Рахунок-фактура для ФОП",
  description:
    "Що таке рахунок-фактура, які реквізити потрібні ФОП і як швидко зібрати PDF в Rakhuno.",
  alternates: { canonical: "https://rakhuno.com/guides/rahunok-faktura" },
  openGraph: {
    title: "Рахунок-фактура для ФОП · Rakhuno",
    url: "https://rakhuno.com/guides/rahunok-faktura",
  },
};

export default function Page() {
  return (
    <ArticleLayout
      title="Рахунок-фактура для ФОП"
      description="Простий документ для клієнта: що ви зробили і скільки платити."
    >
      <p>
        <strong>Рахунок-фактура</strong> — це документ, яким виконавець (часто ФОП) повідомляє
        замовнику суму до сплати за товари або послуги. Для багатьох ФОП це базовий крок перед
        оплатою: без рахунку клієнт не проведе платіж.
      </p>
      <p>Типовий рахунок містить:</p>
      <ul className="list-disc space-y-2 pl-5 text-mist">
        <li>номер і дату</li>
        <li>реквізити ФОП (ПІБ, ІПН, адреса, IBAN, банк)</li>
        <li>реквізити замовника</li>
        <li>перелік послуг / товарів, кількість, ціну, суму</li>
        <li>примітку зі строком оплати</li>
      </ul>
      <p>
        Rakhuno допомагає зібрати ці поля в PDF за кілька хвилин. Це не заміна Checkbox чи Медок —
        це швидкий рахунок + email-нагадування про типові податкові вікна.
      </p>
      <p>
        Шукаєте шаблон? Краще одразу{" "}
        <a className="text-signal underline-offset-2 hover:underline" href="/invoice">
          створити рахунок онлайн
        </a>{" "}
        — менше помилок у IBAN і описі послуги.
      </p>
    </ArticleLayout>
  );
}
