import Image from "next/image";
import Link from "next/link";

type BrandLockupProps = {
  href?: string;
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
};

const sizes = {
  sm: { mark: 22, text: "text-base", gap: "gap-2", radius: "rounded-md" },
  md: { mark: 36, text: "text-xl md:text-2xl", gap: "gap-2.5", radius: "rounded-[10px]" },
  lg: { mark: 48, text: "text-3xl md:text-4xl", gap: "gap-3", radius: "rounded-xl" },
  hero: { mark: 72, text: "text-5xl sm:text-7xl md:text-8xl", gap: "gap-4 md:gap-5", radius: "rounded-2xl" },
} as const;

/** Geometric R mark first, then the word "Rakhuno". */
export function BrandLockup({ href = "/", size = "md", className = "" }: BrandLockupProps) {
  const s = sizes[size];
  const inner = (
    <span className={`inline-flex items-center ${s.gap} text-paper ${className}`}>
      <Image
        src="/brand/mark.webp"
        alt=""
        width={s.mark}
        height={s.mark}
        className={s.radius}
        priority={size === "hero" || size === "md"}
      />
      <span className={`font-display font-semibold tracking-tight ${s.text}`}>Rakhuno</span>
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} className="inline-flex" aria-label="Rakhuno">
      {inner}
    </Link>
  );
}
