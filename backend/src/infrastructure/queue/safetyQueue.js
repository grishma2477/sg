
import Queue from "bull";

export const safetyQueue = new Queue("safety-queue", {
  redis: { host: "127.0.0.1", port: 6379 }
});

