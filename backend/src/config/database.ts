import { PrismaClient } from "@prisma/client";

// التحقق من وجود DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not defined in environment variables");
  process.exit(1);
}

// تهيئة PrismaClient
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
});

// دالة الاتصال بقاعدة البيانات
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log("✅ Connected to PostgreSQL via Prisma");
    
    // اختبار الاتصال باستعلام بسيط
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log("📊 Database query test:", result);
  } catch (error) {
    console.error("❌ Failed to connect to PostgreSQL:", error);
    throw error;
  }
};

// دالة قطع الاتصال
export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  console.log("🛑 Prisma disconnected");
};

export default prisma;