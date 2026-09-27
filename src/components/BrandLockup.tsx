import Image from "next/image";
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

/** Geometric R + akhuno — same height, baseline-aligned as one word. */
export function BrandLockup({ href = "/", size = "md", className = "" }: BrandLockupProps) {
  const inner = (
    <span
      className={`inline-flex items-end font-display font-semibold leading-none tracking-tight text-paper ${textSize[size]} ${className}`}
    >
      <Image
        src="/brand/r-letter.webp"
        alt=""
        width={90}
        height={100}
        className="block h-[1em] w-auto shrink-0"
        priority={size === "hero" || size === "md"}
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
