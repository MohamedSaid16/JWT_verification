"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRawToken = exports.hashToken = exports.signRefreshToken = exports.signAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const auth_1 = require("../config/auth");
const accessSecret = auth_1.JWT_ACCESS_SECRET;
const refreshSecret = auth_1.JWT_REFRESH_SECRET;
const accessOptions = {
    expiresIn: auth_1.ACCESS_TOKEN_TTL,
};
const refreshOptions = {
    expiresIn: auth_1.REFRESH_TOKEN_TTL,
};
// توقيع access token
const signAccessToken = (payload) => jsonwebtoken_1.default.sign(payload, accessSecret, accessOptions);
exports.signAccessToken = signAccessToken;
// توقيع refresh token
const signRefreshToken = (payload) => jsonwebtoken_1.default.sign(payload, refreshSecret, refreshOptions);
exports.signRefreshToken = signRefreshToken;
// تشفير التوكن للتخزين في قاعدة البيانات
const hashToken = (token) => crypto_1.default.createHash("sha256").update(token).digest("hex");
exports.hashToken = hashToken;
// توليد توكن عشوائي (للتحقق من البريد الإلكتروني)
const generateRawToken = () => crypto_1.default.randomBytes(48).toString("hex");
exports.generateRawToken = generateRawToken;
//# sourceMappingURL=tokens.js.map