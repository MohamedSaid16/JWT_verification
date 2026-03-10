"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const rate_limit_middleware_1 = require("../middlewares/rate-limit.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const permission_middleware_1 = require("../middlewares/permission.middleware"); // NEW
const router = (0, express_1.Router)();
// ==================== PUBLIC ROUTES ====================
router.post("/register", rate_limit_middleware_1.registerLimiter, auth_controller_1.register);
router.post("/login", rate_limit_middleware_1.loginLimiter, auth_controller_1.login);
router.post("/refresh", rate_limit_middleware_1.refreshLimiter, auth_controller_1.refresh);
router.post("/logout", auth_controller_1.logout);
// ==================== EMAIL VERIFICATION ====================
router.get("/verify-email/:token", auth_controller_1.verifyEmailHandler);
router.post("/resend-verification", auth_controller_1.resendVerificationHandler);
// ==================== PROTECTED ROUTES (All authenticated users) ====================
router.get("/me", auth_middleware_1.requireAuth, auth_controller_1.getMeHandler);
router.post("/change-password", auth_middleware_1.requireAuth, auth_controller_1.changePasswordHandler);
// ==================== ADMIN ROUTES (Using permissions) ====================
// Create user - requires 'users:create' permission
router.post("/admin/create-user", auth_middleware_1.requireAuth, (0, permission_middleware_1.requirePermission)('users:create'), // ✅ Dynamic permission check
auth_controller_1.createUserByAdminHandler);
// Reset password - requires 'users:edit' permission
router.post("/admin/reset-password/:userId", auth_middleware_1.requireAuth, (0, permission_middleware_1.requirePermission)('users:edit'), // ✅ Dynamic permission check
auth_controller_1.adminResetPasswordHandler);
// Get all users - requires 'users:view' permission
router.get("/admin/users", auth_middleware_1.requireAuth, (0, permission_middleware_1.requirePermission)('users:view'), async (req, res) => {
    // Add your get all users logic here
    res.json({ message: "List of users" });
});
// Delete user - requires 'users:delete' permission
router.delete("/admin/users/:userId", auth_middleware_1.requireAuth, (0, permission_middleware_1.requirePermission)('users:delete'), async (req, res) => {
    // Add your delete user logic here
    res.json({ message: "User deleted" });
});
// ==================== ROLE MANAGEMENT ROUTES (Super admin only) ====================
// Create role - requires 'roles:create' permission
router.post("/admin/roles", auth_middleware_1.requireAuth, (0, permission_middleware_1.requirePermission)('roles:create'), async (req, res) => {
    // Add your create role logic here
    res.json({ message: "Role created" });
});
// Assign role to user - requires 'roles:assign' permission
router.post("/admin/users/:userId/roles/:roleId", auth_middleware_1.requireAuth, (0, permission_middleware_1.requirePermission)('roles:assign'), async (req, res) => {
    // Add your assign role logic here
    res.json({ message: "Role assigned" });
});
// ==================== EXAMPLE PROTECTED ROUTE ====================
router.get("/protected", auth_middleware_1.requireAuth, (_req, res) => {
    res.json({ message: "You have access to this protected route!" });
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map