"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminResetPasswordHandler = exports.createUserByAdminHandler = exports.changePasswordHandler = exports.getMeHandler = exports.resendVerificationHandler = exports.verifyEmailHandler = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const auth_1 = require("../config/auth");
// Helper function to safely get string params
const getParamAsString = (param) => {
    if (!param)
        return undefined;
    return Array.isArray(param) ? param[0] : param;
};
const register = async (req, res) => {
    try {
        const result = await (0, auth_service_1.registerUser)(req.body);
        res.cookie(auth_1.REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, auth_1.refreshTokenCookieOptions);
        return res.status(201).json({
            success: true,
            data: {
                user: result.user,
                accessToken: result.accessToken,
            },
            message: "Registration successful. Please check your email for verification.",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: {
                code: "REGISTRATION_FAILED",
                message: error.message,
            },
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await (0, auth_service_1.loginUser)(email, password);
        res.cookie(auth_1.REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, auth_1.refreshTokenCookieOptions);
        return res.json({
            success: true,
            data: {
                user: result.user,
                accessToken: result.accessToken,
                requiresPasswordChange: result.requiresPasswordChange,
            },
            message: "Login successful",
        });
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            error: {
                code: "LOGIN_FAILED",
                message: error.message,
            },
        });
    }
};
exports.login = login;
const refresh = async (req, res) => {
    try {
        const token = req.cookies?.[auth_1.REFRESH_TOKEN_COOKIE_NAME];
        if (!token) {
            return res.status(401).json({
                success: false,
                error: {
                    code: "REFRESH_TOKEN_MISSING",
                    message: "No refresh token provided",
                },
            });
        }
        const { accessToken, refreshToken } = await (0, auth_service_1.refreshTokens)(token);
        res.cookie(auth_1.REFRESH_TOKEN_COOKIE_NAME, refreshToken, auth_1.refreshTokenCookieOptions);
        return res.json({
            success: true,
            data: { accessToken },
            message: "Tokens refreshed successfully",
        });
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            error: {
                code: "REFRESH_FAILED",
                message: error.message,
            },
        });
    }
};
exports.refresh = refresh;
const logout = async (req, res) => {
    try {
        const token = req.cookies?.[auth_1.REFRESH_TOKEN_COOKIE_NAME];
        if (token) {
            await (0, auth_service_1.logoutUser)(token);
        }
        res.clearCookie(auth_1.ACCESS_TOKEN_COOKIE_NAME);
        res.clearCookie(auth_1.REFRESH_TOKEN_COOKIE_NAME);
        return res.json({
            success: true,
            message: "Logout successful",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: {
                code: "LOGOUT_FAILED",
                message: error.message,
            },
        });
    }
};
exports.logout = logout;
const verifyEmailHandler = async (req, res) => {
    try {
        const token = String(req.params.token);
        await (0, auth_service_1.verifyEmail)(token);
        return res.json({
            success: true,
            message: "Email verified successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: {
                code: "VERIFICATION_FAILED",
                message: error.message,
            },
        });
    }
};
exports.verifyEmailHandler = verifyEmailHandler;
const resendVerificationHandler = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "MISSING_EMAIL",
                    message: "Email is required",
                },
            });
        }
        await (0, auth_service_1.resendVerification)(email);
        return res.json({
            success: true,
            message: "Verification email sent",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: {
                code: "RESEND_FAILED",
                message: error.message,
            },
        });
    }
};
exports.resendVerificationHandler = resendVerificationHandler;
const getMeHandler = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                },
            });
        }
        const user = await (0, auth_service_1.getUserById)(req.user.id);
        return res.json({
            success: true,
            data: { user },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: {
                code: "GET_ME_FAILED",
                message: error.message,
            },
        });
    }
};
exports.getMeHandler = getMeHandler;
const changePasswordHandler = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                },
            });
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "MISSING_FIELDS",
                    message: "Current password and new password are required",
                },
            });
        }
        await (0, auth_service_1.changePassword)(req.user.id, currentPassword, newPassword);
        res.clearCookie(auth_1.ACCESS_TOKEN_COOKIE_NAME);
        res.clearCookie(auth_1.REFRESH_TOKEN_COOKIE_NAME);
        return res.json({
            success: true,
            message: "Password changed successfully. Please login again.",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: {
                code: "PASSWORD_CHANGE_FAILED",
                message: error.message,
            },
        });
    }
};
exports.changePasswordHandler = changePasswordHandler;
const createUserByAdminHandler = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                },
            });
        }
        const { email, firstName, lastName, role, studentId, employeeId, department, title } = req.body;
        if (!email || !firstName || !lastName || !role) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "MISSING_FIELDS",
                    message: "Email, firstName, lastName, and role are required",
                },
            });
        }
        const result = await (0, auth_service_1.createUserByAdmin)({
            email,
            firstName,
            lastName,
            role,
            studentId,
            employeeId,
            department,
            title,
            createdBy: req.user.id,
        });
        return res.status(201).json({
            success: true,
            data: {
                user: result.user,
                tempPassword: result.tempPassword,
            },
            message: "User created successfully with temporary password",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: {
                code: "CREATE_USER_FAILED",
                message: error.message,
            },
        });
    }
};
exports.createUserByAdminHandler = createUserByAdminHandler;
const adminResetPasswordHandler = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                },
            });
        }
        const userId = getParamAsString(req.params.userId);
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "MISSING_USER_ID",
                    message: "User ID is required",
                },
            });
        }
        const tempPassword = await (0, auth_service_1.adminResetPassword)(req.user.id, userId);
        return res.json({
            success: true,
            data: { tempPassword },
            message: "Password reset successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: {
                code: "RESET_PASSWORD_FAILED",
                message: error.message,
            },
        });
    }
};
exports.adminResetPasswordHandler = adminResetPasswordHandler;
//# sourceMappingURL=auth.controller.js.map