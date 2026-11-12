import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BrandLockup } from "@/components/BrandLockup";

export const metadata: Metadata = {
  title: { absolute: "Rakhuno — free invoice PDF generator for Ukrainian sole traders" },
  description:
    "Create a Ukrainian invoice (rakhunok-faktura) as a PDF in two minutes: IBAN, amount in words, act of work and delivery note. Free, no sign-up.",
  alternates: {
    canonical: "https://rakhuno.com/en",
    languages: { uk: "https://rakhuno.com/", en: "https://rakhuno.com/en" },
  },
  openGraph: {
    url: "https://rakhuno.com/en",
    locale: "en_US",
    title: "Rakhuno — invoices for Ukrainian sole traders",
    description: "Invoice PDF in two minutes for Ukrainian FOPs. Free, no sign-up.",
  },
};

const features = [
  {
    title: "Invoice PDF in two minutes",
    text: "Fill in a live A4 page on screen: your FOP details, IBAN, client and line items. The PDF looks exactly the same and downloads right away.",
  },
  {
    title: "Amount in words, done for you",
    text: "Ukrainian accounting departments expect the total written out in words. Rakhuno writes it in correct Ukrainian, hryvnias and kopiyky included.",
  },
  {
    title: "Act and delivery note in one click",
    text: "From the same invoice, get the act of completed work (akt vykonanykh robit) or the delivery note (vydatkova nakladna) with the same items.",
  },
  {
    title: "Saved details",
    text: "Your seller details stay in the browser, so the next invoice is a few clicks. Share the PDF by email or Telegram.",
  },
  {
    title: "Tax deadline reminders",
    text: "Optional emails before the usual single tax (yedynyi podatok) and social contribution (YeSV) deadlines for FOP groups 2 and 3.",
  },
  {
    title: "Free templates and tools",
    text: "Word and Excel invoice templates, an amount-in-words converter and a 2026 FOP tax calculator.",
  },
];

const tools = [
  { href: "/en/invoice", label: "Invoice generator", note: "The main tool, in English: invoice PDF" },
  { href: "/suma-propysom", label: "Amount in words", note: "Any sum written out in Ukrainian" },
  { href: "/kalkulyator-podatkiv-fop", label: "FOP tax calculator 2026", note: "Single tax and YeSV" },
  { href: "/guides", label: "Guides", note: "Templates and how-tos, in Ukrainian" },
];

const faqs = [
  {
    q: "Who is Rakhuno for?",
    a: "Ukrainian sole proprietors (FOP) and freelancers who send 5–30 invoices a month and need a clean PDF for the client, without full accounting software.",
  },
  {
    q: "Is it free?",
    a: "Yes. Creating invoices and downloading PDFs is free. No account is needed; an email is only asked for reminders and to unlock the PDF.",
  },
  {
    q: "Is the app in English?",
    a: "Yes. The invoice editor has an English interface at rakhuno.com/en/invoice. The documents it produces are in Ukrainian, because Ukrainian clients and banks expect Ukrainian documents. The other tools and guides are in Ukrainian.",
  },
  {
    q: "Is this tax advice?",
    a: "No. Rakhuno makes invoices and reminds you of typical deadlines. Check current rules with the tax service or your accountant.",
  },
];

const linkClass = "text-signal underline-offset-2 hover:underline";

export default function EnglishPage() {
  return (
    <main lang="en" className="min-h-screen bg-ink text-paper">
      <header className="relative z-20 mx-auto flex w-full max-w-content items-center justify-between px-5 py-5 md:px-10">
        <BrandLockup size="md" />
        <nav className="flex items-center gap-3 text-sm md:gap-5">
          <Link href="/" hrefLang="uk" className="text-mist transition hover:text-paper">
            Українською
          </Link>
          <Link
            href="/en/invoice"
            className="rounded-full bg-signal px-4 py-2 font-medium text-ink transition hover:bg-white"
          >
            Open the app
          </Link>
        </nav>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-10 md:pb-24">
        <div className="mx-auto grid max-w-content items-center gap-10 lg:grid-cols-2">
          <div>
            <h1 className="font-display text-3xl font-medium leading-tight sm:text-4xl md:text-5xl">
              Free invoice PDFs for Ukrainian sole traders
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-paper/85 sm:text-lg">
              Rakhuno makes the Ukrainian invoice (rakhunok-faktura) a FOP sends to clients: IBAN,
              payment purpose and the amount in words, as a PDF in two minutes. No Word templates, no
              accounting software, no sign-up.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/en/invoice"
                className="inline-flex items-center rounded-full bg-signal px-6 py-3 text-base font-semibold text-ink transition hover:bg-white"
              >
                Create an invoice
              </Link>
              <a
                href="#features"
                className="inline-flex items-center rounded-full border border-white/25 px-6 py-3 text-base text-paper transition hover:border-signal hover:text-signal"
              >
                What it does
              </a>
            </div>
            <p className="mt-4 text-sm text-muted">
              English interface. The invoice itself is in Ukrainian, as Ukrainian clients and banks
              expect.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-2 ring-1 ring-white/5">
            <Image
              src="/brand/sample-rakhunok-faktury.webp"
              alt="Sample Ukrainian invoice made with Rakhuno"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-line px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-content">
          <h2 className="max-w-2xl font-display text-3xl font-semibold md:text-4xl">What it does</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <article key={f.title}>
                <h3 className="font-display text-xl">{f.title}</h3>
                <p className="mt-2 text-mist">{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-ink-2 px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">Why it exists</h2>
          <div className="mt-6 space-y-4 text-mist">
            <p>
              About two million Ukrainians work as FOP (fizychna osoba-pidpryiemets, a registered sole
              proprietor). Clients&apos; accounting departments ask them for an invoice before paying,
              and often for an act of completed work afterwards.
            </p>
            <p>
              Most FOPs still copy an old Word file, retype the IBAN and write the total in words by
              hand. Full accounting systems are too heavy for this one job. Rakhuno does just that job
              and keeps the document looking like the FOP&apos;s own, not like an ad for the service.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-line px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-content">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">Tools</h2>
          <ul className="mt-10 max-w-3xl space-y-5">
            {tools.map((t) => (
              <li key={t.href} className="border-t border-line pt-5">
                <Link
                  href={t.href}
                  className="font-display text-xl text-paper transition hover:text-signal md:text-2xl"
                >
                  {t.label}
                </Link>
                <p className="mt-2 text-mist">{t.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-content">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">FAQ</h2>
          <div className="mt-10 max-w-3xl divide-y divide-line">
            {faqs.map((f) => (
              <div key={f.q} className="py-6">
                <h3 className="font-display text-xl text-paper">{f.q}</h3>
                <p className="mt-2 text-mist">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-line px-5 py-10 text-sm text-muted md:px-10">
        <div className="mx-auto flex max-w-content flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <BrandLockup size="sm" href="/" />
            <span>© {new Date().getFullYear()}</span>
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Footer">
            <Link href="/" hrefLang="uk" className="hover:text-signal">
              Українською
            </Link>
            <Link href="/privacy" className="hover:text-signal">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-signal">
              Terms
            </Link>
            <a href="mailto:info@rakhuno.com" className={linkClass}>
              info@rakhuno.com
            </a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
