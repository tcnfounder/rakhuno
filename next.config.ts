import type { NextConfig } from "next";

const onRailway = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY);

// Cloudflare OpenNext helper only for local wrangler-backed `next dev`.
if (!onRailway && process.env.NODE_ENV !== "production") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");
    initOpenNextCloudflareForDev();
  } catch {
    /* optional outside Cloudflare */
  }
}

const nextConfig: NextConfig = {};

export default nextConfig;
