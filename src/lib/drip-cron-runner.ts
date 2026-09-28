import { getWorkerEnv, processDay7Queue } from "@/lib/brevo-drip";

const HOUR_MS = 60 * 60 * 1000;

let started = false;

/**
 * In-process Day 7 drip ticker for Railway (`npm run start`).
 * No extra env: runs in production whenever BREVO_API_KEY is present.
 */
export function startDripCron() {
  if (started) return;
  if (!process.env.BREVO_API_KEY) return;
  // Skip local `next dev` unless explicitly forced.
  if (process.env.NODE_ENV !== "production" && process.env.DRIP_CRON_INLINE !== "1") {
    return;
  }

  started = true;

  const tick = async () => {
    try {
      const env = await getWorkerEnv();
      const result = await processDay7Queue(env);
      console.log("[drip-cron]", JSON.stringify(result));
    } catch (e) {
      console.error("[drip-cron]", e);
    }
  };

  // First run ~2 min after boot (let the server finish warming), then hourly.
  setTimeout(() => {
    void tick();
    setInterval(() => void tick(), HOUR_MS);
  }, 2 * 60 * 1000);

  console.log("[drip-cron] started (hourly, Railway in-process)");
}
