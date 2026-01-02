import http from "http";
import app from "./app.js";
import { connectDB } from "./database/DBConnection.js";
import { Constant } from "./utils/Constant.js";
import { initSocket } from "./realtime/socketServer.js";

const PORT = Constant.PORT || 3000;

// Create ONE server
const server = http.createServer(app);

// Init socket on SAME server
initSocket(server);


(async () => {
  try {
    console.log("✅ Socket Connected Successfully ")
    await connectDB();
    console.log("✅ Database connected");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
})();
