import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteShell } from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "Гіди для ФОП: рахунок, податки, 3 група",
  description:
    "Практичні гіди Rakhuno: рахунок на оплату, бланк, зразок, виставити рахунок, рахунок-фактура, ФОП 3 група.",
  alternates: { canonical: "https://rakhuno.com/guides" },
  openGraph: {
    title: "Гіди для ФОП · Rakhuno",
    description: "Рахунок-фактура, податки й ФОП 3 група — коротко, потім одразу до PDF.",
    url: "https://rakhuno.com/guides",
  },
};

/** Money-intent guides first — stronger internal PageRank for SEO cluster. */
const guides = [
  {
    href: "/guides/rahunok-faktura",
    title: "Що таке рахунок-фактура для ФОП",
    blurb: "Навіщо документ, які поля потрібні, як виставити швидко.",
  },
  {
    href: "/guides/rakhunok-na-oplatu",
    title: "Рахунок на оплату для ФОП",
    blurb: "Зразок полів, реквізити й онлайн PDF — без Excel.",
  },
  {
    href: "/guides/vystavyty-rakhunok",
    title: "Як виставити рахунок на оплату ФОП",
    blurb: "Коли надсилати клієнту, які поля й PDF за 2 хвилини.",
  },
  {
    href: "/guides/zrazok-rahunku-faktury",
    title: "Зразок рахунку-фактури для ФОП",
    blurb: "Приклад полів і шлях до PDF онлайн — без Word-бланка.",
  },
  {
    href: "/guides/rahunok-onlayn",
    title: "Рахунок онлайн за 2 хвилини",
    blurb: "Як зібрати PDF без Checkbox і Медок.",
  },
  {
    href: "/guides/blank-rakhunku-faktury",
    title: "Бланк рахунку-фактури",
    blurb: "Замість Word: заповніть онлайн і скачайте PDF.",
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
];

export default function GuidesIndexPage() {
  return (
    <>
      <SiteShell>
        <h1 className="font-display text-4xl font-semibold text-paper md:text-5xl">Гіди для ФОП</h1>
        <p className="mt-4 max-w-2xl text-mist">
          Короткі сторінки під пошукові запити. Почніть з{" "}
          <Link href="/guides/rahunok-faktura" className="text-signal underline-offset-2 hover:underline">
            рахунку-фактури
          </Link>
          , потім{" "}
          <Link href="/invoice" className="text-signal underline-offset-2 hover:underline">
            створіть PDF у Rakhuno
          </Link>{" "}
          і підпишіться на нагадування про податки.
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
      <SiteFooter />
    </>
  );
}
