import Image from "next/image";
import Link from "next/link";

type BrandLockupProps = {
  href?: string;
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
};

const sizes = {
  sm: { mark: 22, text: "text-base", gap: "gap-1", radius: "rounded-md" },
  md: { mark: 34, text: "text-xl md:text-2xl", gap: "gap-1.5", radius: "rounded-lg" },
  lg: { mark: 44, text: "text-3xl md:text-4xl", gap: "gap-2", radius: "rounded-xl" },
  hero: {
    mark: 64,
    text: "text-5xl sm:text-7xl md:text-8xl",
    gap: "gap-2 md:gap-3",
    radius: "rounded-2xl",
  },
} as const;

/** Geometric R mark replaces the letter R → reads as "Rakhuno". */
export function BrandLockup({ href = "/", size = "md", className = "" }: BrandLockupProps) {
  const s = sizes[size];
  const inner = (
    <span className={`inline-flex items-center ${s.gap} text-paper ${className}`}>
      <Image
        src="/brand/mark.webp"
        alt=""
        width={s.mark}
        height={s.mark}
        className={`${s.radius} shrink-0`}
        priority={size === "hero" || size === "md"}
      />
      <span className={`font-display font-semibold tracking-tight ${s.text}`}>akhuno</span>
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} className="inline-flex" aria-label="Rakhuno">
      {inner}
    </Link>
  );
}
