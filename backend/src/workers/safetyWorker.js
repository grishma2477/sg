// import { safetyQueue } from "../infrastructure/queue/safetyQueue.js";
// import { runSafetyWorker } from "../application/workers/runSafetyWorker.js";

// console.log("🚦 Safety worker started");

// safetyQueue.process(async (job) => {
//   console.log("⚙️ Processing safety job for review:", job.data.review.id);
//   await runSafetyWorker(job.data);
// });


import { safetyQueue } from "../infrastructure/queue/safetyQueue.js";
import { runSafetyWorker } from "../application/workers/runSafetyWorker.js";

console.log("🚦 Safety worker started - listening for jobs...");

/**
 * Bull Queue Processor for Safety Calculations
 * 
 * Processes review submissions and updates driver safety points.
 */
safetyQueue.process('process-safety-review', async (job) => {
  const { review, reviewerRole } = job.data;
  
  console.log("⚙️ Processing safety job:", job.id);
  console.log("📋 Review ID:", review.id);
  console.log("👤 Reviewer Role:", reviewerRole);

  try {
    const result = await runSafetyWorker({ review, reviewerRole });
    
    if (result?.skipped) {
      console.log("⏭️ Job skipped:", result.reason);
    } else {
      console.log("✅ Safety calculation complete:", result);
    }
    
    return result;
  } catch (error) {
    console.error("❌ Safety worker error:", error.message);
    throw error; // Let Bull handle retry logic
  }
});

// Handle queue events
safetyQueue.on("completed", (job, result) => {
  console.log(`✅ Job ${job.id} completed`);
});

safetyQueue.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
});

safetyQueue.on("error", (error) => {
  console.error("🚨 Queue error:", error.message);
});