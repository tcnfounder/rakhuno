"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const FRAMES = ["/brand/how-1.webp", "/brand/how-2.webp", "/brand/how-3.webp"] as const;

/** Textless how-it-works motion strip + optional looping video. */
export function HowItWorksMotion({ videoSrc }: { videoSrc?: string }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setFrame((f) => (f + 1) % FRAMES.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-sm bg-ink-2">
      <div className="relative aspect-[16/9] w-full">
        {videoSrc ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={FRAMES[0]}
            aria-label="Як працює Rakhuno"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          FRAMES.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt=""
              fill
              sizes="100vw"
              priority={i === 0}
              className={`object-cover transition-opacity duration-700 ${
                i === frame ? "opacity-100" : "opacity-0"
              }`}
            />
          ))
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
      </div>

      {!videoSrc ? (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {FRAMES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition ${
                i === frame ? "bg-signal" : "bg-white/35"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
