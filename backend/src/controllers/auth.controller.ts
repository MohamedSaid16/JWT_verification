import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
  verifyEmail,
  resendVerification,
  getUserById,
} from "../services/auth.service";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../config/auth";
import { AuthRequest } from "../middlewares/auth.middleware";

export const register = async (req: Request, res: Response) => {
  try {
    const result = await registerUser(req.body);

    res.cookie(ACCESS_TOKEN_COOKIE_NAME, result.accessToken, accessTokenCookieOptions);
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, refreshTokenCookieOptions);

    return res.status(201).json({
      success: true,
      data: { user: result.user },
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

    res.cookie(ACCESS_TOKEN_COOKIE_NAME, result.accessToken, accessTokenCookieOptions);
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, refreshTokenCookieOptions);

    return res.json({
      success: true,
      data: { user: result.user },
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

    res.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, accessTokenCookieOptions);
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, refreshTokenCookieOptions);

    return res.json({
      success: true,
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
    await resendVerification(req.body.email);

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