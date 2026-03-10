"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = void 0;
const client_1 = require("@prisma/client");
if (!process.env.DATABASE_URL) {
    console.error(" DATABASE_URL is not defined in environment variables");
    process.exit(1);
}
const prisma = new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
});
const connectDatabase = async () => {
    try {
        await prisma.$connect();
        console.log(" Connected to PostgreSQL via Prisma");
        const result = await prisma.$queryRaw `SELECT 1 as connected`;
        console.log(" Database query test:", result);
    }
    catch (error) {
        console.error(" Failed to connect to PostgreSQL:", error);
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    await prisma.$disconnect();
    console.log(" Prisma disconnected");
};
exports.disconnectDatabase = disconnectDatabase;
exports.default = prisma;
//# sourceMappingURL=database.js.map