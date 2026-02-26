import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET, ACCESS_TOKEN_COOKIE_NAME } from "../config/auth";
import prisma from "../config/database";

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.[ACCESS_TOKEN_COOKIE_NAME] || 
                  req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
      return; // 👈 return صريح بدون قيمة
    }

    const payload = jwt.verify(token, JWT_ACCESS_SECRET) as { sub: string; role: string };
    
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, emailVerified: true },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "User not found",
        },
      });
      return; // 👈 return صريح بدون قيمة
    }

    req.user = { id: user.id, role: user.role };
    next();
    return; // 👈 return صريح في النهاية
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
      },
    });
    return; // 👈 return صريح بدون قيمة
  }
};

export const requireEmailVerified = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
      return; // 👈 return صريح بدون قيمة
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { emailVerified: true },
    });

    if (!user?.emailVerified) {
      res.status(403).json({
        success: false,
        error: {
          code: "EMAIL_NOT_VERIFIED",
          message: "Please verify your email first",
        },
      });
      return; // 👈 return صريح بدون قيمة
    }

    next();
    return; // 👈 return صريح في النهاية
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An error occurred while checking email verification",
      },
    });
    return; // 👈 return صريح بدون قيمة
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        });
        return; // 👈 return صريح بدون قيمة
      }

      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Insufficient permissions",
          },
        });
        return; // 👈 return صريح بدون قيمة
      }

      next();
      return; // 👈 return صريح في النهاية
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while checking permissions",
        },
      });
      return; // 👈 return صريح بدون قيمة
    }
  };
};