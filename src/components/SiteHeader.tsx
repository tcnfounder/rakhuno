import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="relative z-20 flex items-center justify-between px-5 py-5 md:px-10">
      <Link href="/" className="font-display text-xl font-semibold tracking-tight text-paper md:text-2xl">
        Rakhuno
      </Link>
      <nav className="flex items-center gap-3 text-sm md:gap-5">
        <Link href="/#yak-pratsyuye" className="hidden text-mist transition hover:text-paper sm:inline">
          Як працює
        </Link>
        <Link href="/invoice" className="rounded-full bg-signal px-4 py-2 font-medium text-ink transition hover:bg-white">
          Безкоштовний рахунок
        </Link>
      </nav>
    </header>
  );
}
