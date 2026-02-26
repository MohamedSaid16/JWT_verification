import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  verifyEmailHandler,
  resendVerificationHandler,
  getMeHandler,
} from "../controllers/auth.controller";
import {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
} from "../middlewares/rate-limit.middleware";
import { requireAuth, requireEmailVerified } from "../middlewares/auth.middleware";

const router = Router();

// Public routes
router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/refresh", refreshLimiter, refresh);
router.post("/logout", logout);

// Email verification routes
router.get("/verify-email/:token", verifyEmailHandler);
router.post("/resend-verification", resendVerificationHandler);

// Protected routes
router.get("/me", requireAuth, getMeHandler);

// Example of a route that requires email verification
router.get("/protected", requireAuth, requireEmailVerified, (_req, res) => {
  res.json({ message: "You have access to this protected route!" });
});

export default router;