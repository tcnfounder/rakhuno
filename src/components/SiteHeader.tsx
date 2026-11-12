import Link from "next/link";
import { BrandLockup } from "@/components/BrandLockup";
import { LangSwitch } from "@/components/LangSwitch";

export function SiteHeader({
  lang = "uk",
  ukHref = "/",
  enHref = "/en",
}: {
  lang?: "uk" | "en";
  /** Ukrainian version of the current page. */
  ukHref?: string;
  /** English version of the current page; /en when the page has none. */
  enHref?: string;
}) {
  if (lang === "en") {
    return (
      <header className="relative z-20 mx-auto flex w-full max-w-content items-center justify-between px-5 py-5 md:px-10">
        <BrandLockup size="md" href="/en" />
        <nav className="flex items-center gap-3 text-sm md:gap-5">
          <Link href="/en" className="hidden text-mist transition hover:text-paper sm:inline">
            About
          </Link>
          <LangSwitch current="en" ukHref={ukHref} enHref={enHref} />
        </nav>
      </header>
    );
  }
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-content items-center justify-between px-5 py-5 md:px-10">
      <BrandLockup size="md" />
      <nav className="flex items-center gap-3 text-sm md:gap-5">
        <Link href="/guides" className="hidden text-mist transition hover:text-paper sm:inline">
          Гіди
        </Link>
        <Link href="/#yak-pratsyuye" className="hidden text-mist transition hover:text-paper md:inline">
          Як працює
        </Link>
        <LangSwitch current="uk" ukHref={ukHref} enHref={enHref} />
        <Link
          href="/invoice"
          className="rounded-full bg-signal px-4 py-2 font-medium text-ink transition hover:bg-white"
        >
          <span className="sm:hidden">Створити</span>
          <span className="hidden sm:inline">Безкоштовний рахунок</span>
        </Link>
      </nav>
    </header>
  );
}
