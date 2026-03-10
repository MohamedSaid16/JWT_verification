import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
  verifyEmail,
  resendVerification,
  getUserById,
  changePassword,
  createUserByAdmin,
  adminResetPassword,
} from "../services/auth.service";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  refreshTokenCookieOptions,
} from "../config/auth";
import { AuthRequest } from "../middlewares/auth.middleware";

// Helper function to safely get string params
const getParamAsString = (param: string | string[] | undefined): string | undefined => {
  if (!param) return undefined;
  return Array.isArray(param) ? param[0] : param;
};

export const register = async (req: Request, res: Response) => {
  try {
    const result = await registerUser(req.body);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, refreshTokenCookieOptions);

    return res.status(201).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
      message: "Registration successful. Please check your email for verification.",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "REGISTRATION_FAILED",
        message: error.message,
      },
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, refreshTokenCookieOptions);

    return res.json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        requiresPasswordChange: result.requiresPasswordChange,
      },
      message: "Login successful",
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: {
        code: "LOGIN_FAILED",
        message: error.message,
      },
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: "REFRESH_TOKEN_MISSING",
          message: "No refresh token provided",
        },
      });
    }

    const { accessToken, refreshToken } = await refreshTokens(token);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, refreshTokenCookieOptions);

    return res.json({
      success: true,
      data: { accessToken },
      message: "Tokens refreshed successfully",
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: {
        code: "REFRESH_FAILED",
        message: error.message,
      },
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
    if (token) {
      await logoutUser(token);
    }

    res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);

    return res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: "LOGOUT_FAILED",
        message: error.message,
      },
    });
  }
};

export const verifyEmailHandler = async (req: Request, res: Response) => {
  try {
    const token = String(req.params.token);
    await verifyEmail(token);

    return res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VERIFICATION_FAILED",
        message: error.message,
      },
    });
  }
};

export const resendVerificationHandler = async (req: Request, res: Response) => {
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
    await resendVerification(email);

    return res.json({
      success: true,
      message: "Verification email sent",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "RESEND_FAILED",
        message: error.message,
      },
    });
  }
};

export const getMeHandler = async (req: AuthRequest, res: Response) => {
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

    const user = await getUserById(req.user.id);

    return res.json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: "GET_ME_FAILED",
        message: error.message,
      },
    });
  }
};

export const changePasswordHandler = async (req: AuthRequest, res: Response) => {
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

    await changePassword(req.user.id, currentPassword, newPassword);

    res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);

    return res.json({
      success: true,
      message: "Password changed successfully. Please login again.",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "PASSWORD_CHANGE_FAILED",
        message: error.message,
      },
    });
  }
};

export const createUserByAdminHandler = async (req: AuthRequest, res: Response) => {
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

    const result = await createUserByAdmin({
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
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "CREATE_USER_FAILED",
        message: error.message,
      },
    });
  }
};

export const adminResetPasswordHandler = async (req: AuthRequest, res: Response) => {
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

    const tempPassword = await adminResetPassword(req.user.id, userId);

    return res.json({
      success: true,
      data: { tempPassword },
      message: "Password reset successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "RESET_PASSWORD_FAILED",
        message: error.message,
      },
    });
  }
};