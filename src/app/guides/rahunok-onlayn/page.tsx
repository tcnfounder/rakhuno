import type { Metadata } from "next";
import { ArticleLayout } from "@/components/ArticleLayout";

export const metadata: Metadata = {
  title: "Рахунок онлайн для ФОП",
  description: "Як виставити рахунок онлайн за 2 хвилини: реквізити ФОП, PDF, email-нагадування.",
  alternates: { canonical: "https://rakhuno.com/guides/rahunok-onlayn" },
  openGraph: {
    title: "Рахунок онлайн для ФОП · Rakhuno",
    url: "https://rakhuno.com/guides/rahunok-onlayn",
  },
};

export default function Page() {
  return (
    <ArticleLayout
      title="Рахунок онлайн за 2 хвилини"
      description="Без шаблону Word і без важкої бухгалтерії."
    >
      <p>Алгоритм у Rakhuno:</p>
      <ol className="list-decimal space-y-2 pl-5 text-mist">
        <li>відкрийте сторінку рахунку</li>
        <li>заповніть ФОП, клієнта й позиції</li>
        <li>залиште email</li>
        <li>завантажте PDF і надішліть клієнту</li>
      </ol>
      <p>
        Email потрібен не «для спаму», а щоб пізніше нагадати про типові податкові вікна. Якщо потрібен
        повний електронний документообіг — залишайтеся на Checkbox / Вчасно. Якщо потрібен простий
        рахунок сьогодні — Rakhuno.
      </p>
    </ArticleLayout>
  );
}
