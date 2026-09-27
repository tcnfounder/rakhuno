import Link from "next/link";
import { InvoiceCta, PageFooterNote, SiteShell } from "@/components/SiteShell";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";

export function ArticleLayout({
  title,
  description,
  path,
  children,
  related = [],
}: {
  title: string;
  description: string;
  /** Canonical path for breadcrumbs, e.g. /guides/rahunok-faktura */
  path?: string;
  children: React.ReactNode;
  related?: { href: string; label: string }[];
}) {
  const breadcrumbLd = path
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Rakhuno",
            item: "https://rakhuno.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Гіди",
            item: "https://rakhuno.com/guides",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: title,
            item: `https://rakhuno.com${path}`,
          },
        ],
      }
    : null;

  return (
    <>
      {breadcrumbLd ? <JsonLd data={breadcrumbLd} /> : null}
      <SiteShell>
        <nav aria-label="Breadcrumb" className="text-sm text-signal">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li>
              <Link href="/" className="hover:underline">
                Rakhuno
              </Link>
            </li>
            <li aria-hidden="true" className="text-muted">
              /
            </li>
            <li>
              <Link href="/guides" className="hover:underline">
                Гіди
              </Link>
            </li>
            <li aria-hidden="true" className="text-muted">
              /
            </li>
            <li className="text-mist">{title}</li>
          </ol>
        </nav>
        <h1 className="mt-4 max-w-3xl font-display text-3xl font-semibold leading-tight text-paper md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-mist">{description}</p>
        <div className="prose-rakhuno mt-10 max-w-3xl space-y-5 text-base leading-relaxed text-paper/90">
          {children}
        </div>
        {related.length > 0 && (
          <aside className="mt-12 max-w-3xl border-t border-line pt-8">
            <p className="font-display text-sm uppercase tracking-[0.18em] text-signal">Читайте також</p>
            <ul className="mt-4 space-y-3">
              {related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="text-paper transition hover:text-signal">
                    → {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
        <div className="max-w-3xl">
          <InvoiceCta />
          <PageFooterNote />
        </div>
      </SiteShell>
      <SiteFooter />
    </>
  );
}
