import "dotenv/config";

console.log("🔍 Testing environment variables:");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✅ Found" : "❌ Not found");
console.log("DATABASE_URL value:", process.env.DATABASE_URL?.substring(0, 30) + "...");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);