export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { startDripCron } = await import("@/lib/drip-cron-runner");
  startDripCron();
}
