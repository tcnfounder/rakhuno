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

/** Geometric R as the first letter of "akhuno" — one wordmark. */
export function BrandLockup({ href = "/", size = "md", className = "" }: BrandLockupProps) {
  const inner = (
    <span
      className={`inline-flex items-center font-display font-semibold tracking-tight text-paper ${textSize[size]} ${className}`}
    >
      <Image
        src="/brand/r-letter.webp"
        alt=""
        width={80}
        height={90}
        className="relative top-[0.06em] mr-[0.02em] h-[0.86em] w-auto shrink-0"
        priority={size === "hero" || size === "md"}
      />
      <span>akhuno</span>
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} className="inline-flex" aria-label="Rakhuno">
      {inner}
    </Link>
  );
}
