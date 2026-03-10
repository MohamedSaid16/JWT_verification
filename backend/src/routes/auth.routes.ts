import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  verifyEmailHandler,
  resendVerificationHandler,
  getMeHandler,
  changePasswordHandler,
  createUserByAdminHandler,
  adminResetPasswordHandler,
} from "../controllers/auth.controller";
import {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
} from "../middlewares/rate-limit.middleware";
import { requireAuth } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/permission.middleware"; // NEW

const router = Router();

// ==================== PUBLIC ROUTES ====================
router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/refresh", refreshLimiter, refresh);
router.post("/logout", logout);

// ==================== EMAIL VERIFICATION ====================
router.get("/verify-email/:token", verifyEmailHandler);
router.post("/resend-verification", resendVerificationHandler);

// ==================== PROTECTED ROUTES (All authenticated users) ====================
router.get("/me", requireAuth, getMeHandler);
router.post("/change-password", requireAuth, changePasswordHandler);

// ==================== ADMIN ROUTES (Using permissions) ====================

// Create user - requires 'users:create' permission
router.post(
  "/admin/create-user", 
  requireAuth, 
  requirePermission('users:create'), // ✅ Dynamic permission check
  createUserByAdminHandler
);

// Reset password - requires 'users:edit' permission
router.post(
  "/admin/reset-password/:userId", 
  requireAuth, 
  requirePermission('users:edit'), // ✅ Dynamic permission check
  adminResetPasswordHandler
);

// Get all users - requires 'users:view' permission
router.get(
  "/admin/users",
  requireAuth,
  requirePermission('users:view'),
  async (req, res) => {
    // Add your get all users logic here
    res.json({ message: "List of users" });
  }
);

// Delete user - requires 'users:delete' permission
router.delete(
  "/admin/users/:userId",
  requireAuth,
  requirePermission('users:delete'),
  async (req, res) => {
    // Add your delete user logic here
    res.json({ message: "User deleted" });
  }
);

// ==================== ROLE MANAGEMENT ROUTES (Super admin only) ====================

// Create role - requires 'roles:create' permission
router.post(
  "/admin/roles",
  requireAuth,
  requirePermission('roles:create'),
  async (req, res) => {
    // Add your create role logic here
    res.json({ message: "Role created" });
  }
);

// Assign role to user - requires 'roles:assign' permission
router.post(
  "/admin/users/:userId/roles/:roleId",
  requireAuth,
  requirePermission('roles:assign'),
  async (req, res) => {
    // Add your assign role logic here
    res.json({ message: "Role assigned" });
  }
);

// ==================== EXAMPLE PROTECTED ROUTE ====================
router.get("/protected", requireAuth, (_req, res) => {
  res.json({ message: "You have access to this protected route!" });
});

export default router;