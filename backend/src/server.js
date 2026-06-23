import http from "http";
import app from "./app.js";
import { connectDB } from "./database/DBConnection.js";
import { initSocket } from "./realtime/socketServer.js";
import { LedgerService } from "./application/services/LedgerService.js";
import { runExpireRideRequestsWorker } from "./application/workers/expireRideRequestsWorker.js";

const REQUIRED_ENV = [
  "ACCESS_TOKEN_SECRET_KEY",
  "REFRESH_TOKEN_SECRET_KEY",
  "DATABASE_URL",
];

const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(`❌ Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const PORT = Number(process.env.PORT) || 5000;

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

const server = http.createServer(app);

(async () => {
  try {
    await connectDB();
    console.log("✅ Database connected");
    await LedgerService.initializePlatformAccounts();
    runExpireRideRequestsWorker()
    console.log("⏰ Ride expiration worker started");

    initSocket(server);
    console.log("✅ Socket initialized");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();