
import Queue from "bull";
import { runSafetyWorker } from "../../jobs/safetyWorker.js";

export const safetyQueue = new Queue("safety-queue", {
  redis: { host: "127.0.0.1", port: 6379 }
});

safetyQueue.process(async (job) => {
  await runSafetyWorker(job.data);
});
