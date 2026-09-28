import Link from "next/link";
import { BrandLockup } from "@/components/BrandLockup";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-ink px-5 py-10 text-sm text-muted md:px-10">
      <div className="mx-auto flex max-w-content flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <BrandLockup size="sm" href="/" />
            <span>© {new Date().getFullYear()}</span>
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Підвал">
            <Link href="/guides" className="hover:text-signal">
              Гіди
            </Link>
            <Link href="/guides/rahunok-faktura" className="hover:text-signal">
              Рахунок-фактура
            </Link>
            <Link href="/guides/zrazok-rahunku-faktury" className="hover:text-signal">
              Зразок
            </Link>
            <Link href="/invoice" className="hover:text-signal">
              Рахунок
            </Link>
            <Link href="/privacy" className="hover:text-signal">
              Конфіденційність
            </Link>
            <Link href="/terms" className="hover:text-signal">
              Умови
            </Link>
            <a href="mailto:info@rakhuno.com" className="hover:text-signal">
              info@rakhuno.com
            </a>
          </nav>
        </div>
        <p className="max-w-2xl text-xs leading-relaxed">
          Не є податковою консультацією. Строки загальні; перевіряйте актуальні вимоги ДПС.
        </p>
      </div>
    </footer>
  );
}
