import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "Гіди для ФОП",
  description: "Рахунок-фактура, ФОП 3 група, єдиний податок — короткі гіди від Rakhuno.",
  alternates: { canonical: "https://rakhuno.com/guides" },
  openGraph: {
    title: "Гіди для ФОП · Rakhuno",
    url: "https://rakhuno.com/guides",
  },
};

const guides = [
  {
    href: "/guides/rahunok-faktura",
    title: "Що таке рахунок-фактура для ФОП",
    blurb: "Навіщо документ, які поля потрібні, як виставити швидко.",
  },
  {
    href: "/guides/fop-3-grupa",
    title: "ФОП 3 група — коротко",
    blurb: "Кому підходить, що пам’ятати про податки та рахунки.",
  },
  {
    href: "/guides/yedynyy-podatok",
    title: "Єдиний податок: коли платити",
    blurb: "Типові строки й нагадування email — без зайвої теорії.",
  },
  {
    href: "/guides/podatky-fop",
    title: "Податки ФОП: чекліст",
    blurb: "Що перевірити щомісяця / щокварталу.",
  },
  {
    href: "/guides/rahunok-onlayn",
    title: "Рахунок онлайн за 2 хвилини",
    blurb: "Як зібрати PDF без Checkbox і Медок.",
  },
];

export default function GuidesIndexPage() {
  return (
    <SiteShell>
      <h1 className="font-display text-4xl font-semibold text-paper md:text-5xl">Гіди для ФОП</h1>
      <p className="mt-4 max-w-2xl text-mist">
        Короткі сторінки під пошукові запити. Потім — у Rakhuno створити рахунок і підписатися на
        нагадування.
      </p>
      <div className="mt-12 max-w-3xl space-y-6">
        {guides.map((g) => (
          <Link
            key={g.href}
            href={g.href}
            className="block border-t border-line pt-5 transition hover:border-signal"
          >
            <h2 className="font-display text-2xl text-paper">{g.title}</h2>
            <p className="mt-2 text-mist">{g.blurb}</p>
          </Link>
        ))}
      </div>
    </SiteShell>
  );
}
