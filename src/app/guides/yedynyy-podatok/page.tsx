import type { Metadata } from "next";
import { ArticleLayout } from "@/components/ArticleLayout";

export const metadata: Metadata = {
  title: "Єдиний податок: коли платити",
  description: "Типові строки єдиного податку для ФОП і як налаштувати email-нагадування в Rakhuno.",
  alternates: { canonical: "https://rakhuno.com/guides/yedynyy-podatok" },
};

export default function Page() {
  return (
    <ArticleLayout
      title="Єдиний податок: коли платити"
      description="Головний біль не формула — дедлайн. Нагадування рятує частіше за складний софт."
    >
      <p>
        <strong>Єдиний податок</strong> — регулярний платіж для ФОП на спрощеній системі. Точна дата
        залежить від групи та періоду (місяць / квартал). Орієнтуйтесь на календар ДПС і свого
        бухгалтера.
      </p>
      <p>Що працює на практиці:</p>
      <ul className="list-disc space-y-2 pl-5 text-mist">
        <li>поставте нагадування за 3 дні до типового вікна</li>
        <li>окремо тримайте ЄСВ і деклараційні сезони</li>
        <li>не змішуйте «пораду» з «нагадуванням» — різні речі</li>
      </ul>
      <p>
        У Rakhuno після створення рахунку ви залишаєте email саме для таких нагадувань. Ми не
        розраховуємо податок за вас — ми стукаємо в inbox, коли час перевірити календар.
      </p>
    </ArticleLayout>
  );
}
