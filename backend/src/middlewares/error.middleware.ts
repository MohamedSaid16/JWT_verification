import { Request, Response, NextFunction } from "express";

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.url} not found`,
    },
  });
};

export const errorHandler = (
  err: any,
  _req: Request, // 👈 استخدم _req للمتغير غير المستخدم
  res: Response,
  _next: NextFunction // 👈 استخدم _next للمتغير غير المستخدم
) => {
  console.error("Error:", err);

  // Validation error
  if (err.name === "ValidationError") {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: err.message,
        details: err.details,
      },
    });
    return; // 👈 return صريح
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid token",
      },
    });
    return; // 👈 return صريح
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      error: {
        code: "TOKEN_EXPIRED",
        message: "Token expired",
      },
    });
    return; // 👈 return صريح
  }

  // Prisma errors
  if (err.code === "P2002") {
    res.status(409).json({
      success: false,
      error: {
        code: "DUPLICATE_ERROR",
        message: "A record with this value already exists",
        field: err.meta?.target,
      },
    });
    return; // 👈 return صريح
  }

  if (err.code === "P2025") {
    res.status(404).json({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Record not found",
      },
    });
    return; // 👈 return صريح
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: err.message || "Something went wrong",
    },
  });
  return; // 👈 return صريح في النهاية
};