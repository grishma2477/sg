import { runSafetyWorker } from "../../jobs/safetyWorker.js";

const queue = [];
const deadLetterQueue = [];

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

export const safetyQueue = {
  push(review) {
    queue.push({ review, attempts: 0 });
    setImmediate(run);
  },
  getDeadLetters() {
    return [...deadLetterQueue];
  }
};

async function run() {
  const item = queue.shift();
  if (!item) return;

  const { review, attempts } = item;

  try {
    await runSafetyWorker(review);
  } catch (err) {
    const nextAttempt = attempts + 1;
    if (nextAttempt < MAX_RETRIES) {
      console.error(`[safetyQueue] attempt ${nextAttempt} failed for review ${review.id}, retrying in ${RETRY_DELAY_MS}ms:`, err.message);
      setTimeout(() => {
        queue.push({ review, attempts: nextAttempt });
        setImmediate(run);
      }, RETRY_DELAY_MS);
    } else {
      console.error(`[safetyQueue] review ${review.id} exhausted ${MAX_RETRIES} retries, moving to DLQ:`, err.message);
      deadLetterQueue.push({ review, error: err.message, failedAt: new Date().toISOString() });
    }
  }
}
