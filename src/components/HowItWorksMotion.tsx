"use client";

/** Compact vertical promo film — no on-screen copy. */
export function HowItWorksMotion({ videoSrc }: { videoSrc: string }) {
  return (
    <div className="mx-auto w-full max-w-[280px] sm:max-w-[320px]">
      <div className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-white/10 bg-ink-2 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/brand/how-1.webp"
          aria-label="Як працює Rakhuno"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
      </div>
    </div>
  );
}
