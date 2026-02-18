
// import Queue from "bull";

// export const safetyQueue = new Queue("safety-queue", {
//   redis: { host: "127.0.0.1", port: 6379 }
// });



import Queue from "bull";
import { runSafetyWorker } from "../../application/workers/runSafetyWorker.js";
import { runRiderSafetyWorker } from "../../application/workers/runRiderSafetyWorker.js";

export const safetyQueue = new Queue("safety-queue", {
  redis: { 
    host: process.env.REDIS_HOST || "redis",
    port: process.env.REDIS_PORT || 6379 
  }
});

/**
 * Process driver safety reviews (rider → driver)
 */
safetyQueue.process("process-driver-safety", async (job) => {
  const { review, reviewerRole } = job.data;
  
  console.log("🎯 Processing driver safety job:", job.id);
  
  try {
    const result = await runSafetyWorker({ review, reviewerRole });
    console.log("✅ Driver safety job completed:", result);
    return result;
  } catch (error) {
    console.error("❌ Driver safety job failed:", error);
    throw error;
  }
});

/**
 * Process rider safety reviews (driver → rider) ✅ NEW
 */
safetyQueue.process("process-rider-safety", async (job) => {
  const { review, reviewerRole } = job.data;
  
  console.log("🎯 Processing rider safety job:", job.id);
  
  try {
    const result = await runRiderSafetyWorker({ review, reviewerRole });
    console.log("✅ Rider safety job completed:", result);
    return result;
  } catch (error) {
    console.error("❌ Rider safety job failed:", error);
    throw error;
  }
});

console.log("🚀 Safety Queue initialized (driver + rider processing)");