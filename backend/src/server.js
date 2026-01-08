import http from "http";
import app from "./app.js";
import { connectDB } from "./database/DBConnection.js";
import { initSocket } from "./realtime/socketServer.js";

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
