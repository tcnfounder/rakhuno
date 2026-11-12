import Link from "next/link";

/** Compact УКР / EN toggle. The current language is plain text, the other one a link. */
export function LangSwitch({
  current,
  ukHref,
  enHref,
}: {
  current: "uk" | "en";
  ukHref: string;
  enHref: string;
}) {
  const base = "px-2.5 py-1 text-xs font-semibold tracking-wide";
  const active = `${base} rounded-full bg-white/10 text-paper`;
  const idle = `${base} rounded-full text-mist transition hover:text-signal`;
  return (
    <span
      className="inline-flex items-center rounded-full border border-white/15 p-0.5"
      aria-label={current === "en" ? "Language" : "Мова"}
    >
      {current === "uk" ? (
        <span className={active} aria-current="true" lang="uk">
          УКР
        </span>
      ) : (
        <Link href={ukHref} hrefLang="uk" lang="uk" className={idle}>
          УКР
        </Link>
      )}
      {current === "en" ? (
        <span className={active} aria-current="true" lang="en">
          EN
        </span>
      ) : (
        <Link href={enHref} hrefLang="en" lang="en" className={idle}>
          EN
        </Link>
      )}
    </span>
  );
}
