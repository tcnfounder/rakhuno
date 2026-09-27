import Link from "next/link";

type BrandLockupProps = {
  href?: string;
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
};

const textSize = {
  sm: "text-base",
  md: "text-xl md:text-2xl",
  lg: "text-3xl md:text-4xl",
  hero: "text-5xl sm:text-7xl md:text-8xl",
} as const;

/**
 * Geometric R + "akhuno" as one word.
 * R height is always 1em of the wordmark font-size — equal everywhere.
 */
export function BrandLockup({ href = "/", size = "md", className = "" }: BrandLockupProps) {
  const inner = (
    <span
      className={`inline-flex items-end font-display font-semibold leading-none tracking-tight text-paper ${textSize[size]} ${className}`}
    >
      {/* native img: Next/Image ignores em height reliably */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/r-letter.webp"
        alt=""
        aria-hidden
        draggable={false}
        className="block shrink-0 select-none"
        style={{ height: "1em", width: "auto" }}
      />
      <span className="leading-none">akhuno</span>
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} className="inline-flex leading-none" aria-label="Rakhuno">
      {inner}
    </Link>
  );
}
