"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenCookieOptions = exports.accessTokenCookieOptions = exports.REFRESH_TOKEN_COOKIE_NAME = exports.ACCESS_TOKEN_COOKIE_NAME = exports.REFRESH_TOKEN_TTL = exports.ACCESS_TOKEN_TTL = exports.JWT_REFRESH_SECRET = exports.JWT_ACCESS_SECRET = void 0;
// JWT Secrets
exports.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback-secret-change-me';
exports.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-me';
// Token TTL (Time to Live)
exports.ACCESS_TOKEN_TTL = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
exports.REFRESH_TOKEN_TTL = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
// Cookie names
exports.ACCESS_TOKEN_COOKIE_NAME = 'accessToken';
exports.REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
// Cookie options
exports.accessTokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
};
exports.refreshTokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
//# sourceMappingURL=auth.js.map