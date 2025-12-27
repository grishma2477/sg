import { runSafetyWorker } from "../../jobs/safetyWorker.js";

const queue = [];

export const safetyQueue = {
  push(review) {
    queue.push(review);
    setImmediate(run);
  }
};

async function run() {
  const review = queue.shift();
  if (review) await runSafetyWorker(review);
}
