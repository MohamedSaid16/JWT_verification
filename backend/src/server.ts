import "dotenv/config"; // يجب أن يكون أول سطر
import app from "./app";
import { connectDatabase } from "./config/database";

const PORT = process.env.PORT || 5000;

// تشغيل السيرفر
async function startServer() {
  try {
    // الاتصال بقاعدة البيانات أولاً
    await connectDatabase();
    
    // ثم تشغيل السيرفر
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();