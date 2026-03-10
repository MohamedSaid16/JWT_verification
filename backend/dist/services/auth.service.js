"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.resendVerification = exports.verifyEmail = exports.logoutUser = exports.refreshTokens = exports.registerUser = exports.changePassword = exports.loginUser = exports.adminResetPassword = exports.createUserByAdmin = exports.AuthServiceError = void 0;
const database_1 = __importDefault(require("../config/database"));
const password_1 = require("../utils/password");
const tokens_1 = require("../utils/tokens");
const client_1 = require("@prisma/client");
class AuthServiceError extends Error {
    constructor(message) {
        super(message);
        this.name = "AuthServiceError";
    }
}
exports.AuthServiceError = AuthServiceError;
const buildPayload = (user) => ({
    sub: user.id,
    email: user.email,
    role: user.role,
});
const createSessionTokens = async (user) => {
    const payload = buildPayload(user);
    const accessToken = (0, tokens_1.signAccessToken)(payload);
    const refreshToken = (0, tokens_1.signRefreshToken)(payload);
    await database_1.default.refreshToken.create({
        data: {
            userId: user.id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            revoked: false,
        },
    });
    return { accessToken, refreshToken };
};
const createUserByAdmin = async (data) => {
    const existingUser = await database_1.default.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
        throw new AuthServiceError("User with this email already exists");
    }
    const tempPassword = (0, password_1.generateRandomPassword)(12);
    const hashedPassword = await (0, password_1.hashPassword)(tempPassword);
    const user = await database_1.default.user.create({
        data: {
            email: data.email,
            password: hashedPassword,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role,
            mustChangePassword: true,
            isActive: true,
        },
    });
    if (data.role === client_1.Role.STUDENT) {
        await database_1.default.student.create({
            data: {
                userId: user.id,
                studentId: data.studentId || `STU${Date.now()}`,
            },
        });
    }
    if (data.role === client_1.Role.TEACHER) {
        await database_1.default.teacher.create({
            data: {
                userId: user.id,
                employeeId: data.employeeId || `TCH${Date.now()}`,
                department: data.department,
                title: data.title,
            },
        });
    }
    return {
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        },
        tempPassword,
    };
};
exports.createUserByAdmin = createUserByAdmin;
const adminResetPassword = async (adminId, targetUserId) => {
    const admin = await database_1.default.user.findUnique({ where: { id: adminId } });
    if (!admin || (admin.role !== client_1.Role.ADMIN_SUPER && admin.role !== client_1.Role.ADMIN_FACULTY)) {
        throw new AuthServiceError("Unauthorized: Only admins can reset passwords");
    }
    const targetUser = await database_1.default.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
        throw new AuthServiceError("User not found");
    }
    const tempPassword = (0, password_1.generateRandomPassword)(12);
    const hashedPassword = await (0, password_1.hashPassword)(tempPassword);
    await database_1.default.user.update({
        where: { id: targetUserId },
        data: {
            password: hashedPassword,
            mustChangePassword: true,
        },
    });
    await database_1.default.refreshToken.updateMany({
        where: { userId: targetUserId, revoked: false },
        data: { revoked: true },
    });
    return tempPassword;
};
exports.adminResetPassword = adminResetPassword;
const loginUser = async (email, password) => {
    const user = await database_1.default.user.findUnique({
        where: { email },
        include: { student: true, teacher: true },
    });
    if (!user || !user.isActive) {
        throw new AuthServiceError("Invalid email or password");
    }
    const isValidPassword = await (0, password_1.comparePasswords)(password, user.password);
    if (!isValidPassword) {
        throw new AuthServiceError("Invalid email or password");
    }
    await database_1.default.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
    });
    const { accessToken, refreshToken } = await createSessionTokens(user);
    return {
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            mustChangePassword: user.mustChangePassword,
        },
        accessToken,
        refreshToken,
        requiresPasswordChange: user.mustChangePassword,
    };
};
exports.loginUser = loginUser;
const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await database_1.default.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new AuthServiceError("User not found");
    }
    const isValid = await (0, password_1.comparePasswords)(currentPassword, user.password);
    if (!isValid) {
        throw new AuthServiceError("Current password is incorrect");
    }
    if (!(0, password_1.isStrongPassword)(newPassword)) {
        throw new AuthServiceError("Password must be at least 8 characters and contain uppercase, lowercase, number, and special character");
    }
    const hashedPassword = await (0, password_1.hashPassword)(newPassword);
    await database_1.default.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            mustChangePassword: false,
        },
    });
    await database_1.default.refreshToken.updateMany({
        where: { userId: user.id, revoked: false },
        data: { revoked: true },
    });
};
exports.changePassword = changePassword;
const registerUser = async (data) => {
    if (!(0, password_1.isStrongPassword)(data.password)) {
        throw new AuthServiceError("Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character");
    }
    const existingUser = await database_1.default.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
        throw new AuthServiceError("Email already exists");
    }
    const hashedPassword = await (0, password_1.hashPassword)(data.password);
    const user = await database_1.default.user.create({
        data: {
            email: data.email,
            password: hashedPassword,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role || client_1.Role.STUDENT,
            mustChangePassword: false,
            isActive: true,
        },
    });
    if (user.role === client_1.Role.STUDENT) {
        await database_1.default.student.create({
            data: {
                userId: user.id,
                studentId: data.studentId || `STU${Date.now()}`,
            },
        });
    }
    if (user.role === client_1.Role.TEACHER) {
        await database_1.default.teacher.create({
            data: {
                userId: user.id,
                employeeId: data.employeeId || `TCH${Date.now()}`,
            },
        });
    }
    const { accessToken, refreshToken } = await createSessionTokens(user);
    return {
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        },
        accessToken,
        refreshToken,
        requiresPasswordChange: false,
    };
};
exports.registerUser = registerUser;
const refreshTokens = async (refreshToken) => {
    const jwt = require("jsonwebtoken");
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const storedToken = await database_1.default.refreshToken.findFirst({
        where: {
            token: refreshToken,
            userId: payload.sub,
            revoked: false,
            expiresAt: { gt: new Date() },
        },
    });
    if (!storedToken) {
        throw new AuthServiceError("Invalid refresh token");
    }
    await database_1.default.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true },
    });
    const accessToken = (0, tokens_1.signAccessToken)(payload);
    const nextRefreshToken = (0, tokens_1.signRefreshToken)(payload);
    await database_1.default.refreshToken.create({
        data: {
            userId: payload.sub,
            token: nextRefreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            revoked: false,
        },
    });
    return { accessToken, refreshToken: nextRefreshToken };
};
exports.refreshTokens = refreshTokens;
const logoutUser = async (refreshToken) => {
    await database_1.default.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revoked: true },
    });
};
exports.logoutUser = logoutUser;
const verifyEmail = async (_token) => {
    // Email verification table is not part of the current schema.
    return;
};
exports.verifyEmail = verifyEmail;
const resendVerification = async (_email) => {
    // Email verification table is not part of the current schema.
    return;
};
exports.resendVerification = resendVerification;
const getUserById = async (userId) => {
    const user = await database_1.default.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            mustChangePassword: true,
            lastLogin: true,
            createdAt: true,
            student: true,
            teacher: true,
        },
    });
    if (!user) {
        throw new AuthServiceError("User not found");
    }
    return user;
};
exports.getUserById = getUserById;
//# sourceMappingURL=auth.service.js.map