import app from "./app.js";
import { connectDB } from './database/DBConnection.js';
import { Constant } from "./utils/Constant.js";

const PORT = Constant.PORT;
try {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
} catch (err) {
  console.error('❌ Could not connect to DB:', err.message);
  process.exit(1);
}
