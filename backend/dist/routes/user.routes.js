"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const permission_middleware_1 = require("../middlewares/permission.middleware");
const user_service_1 = require("../services/user.service");
const router = (0, express_1.Router)();
const userService = new user_service_1.UserService();
// ==================== PUBLIC PROFILE ====================
/**
 * Get public user profile by ID
 */
router.get("/:id/public", async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        // Remove sensitive information
        const publicProfile = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            roles: user.roles,
        };
        return res.json({
            success: true,
            data: publicProfile,
        });
    }
    catch (error) {
        return res.status(404).json({
            success: false,
            error: { code: "USER_NOT_FOUND", message: error.message },
        });
    }
});
// ==================== PROTECTED ROUTES (Authenticated Users) ====================
/**
 * Get current user profile (detailed)
 */
router.get("/me", auth_middleware_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        const user = await userService.getUserById(req.user.id);
        return res.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "FETCH_USER_FAILED", message: error.message },
        });
    }
});
/**
 * Update current user profile
 */
router.put("/me", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)('profile:edit'), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        const { firstName, lastName } = req.body;
        const user = await userService.updateUser(req.user.id, {
            firstName,
            lastName,
        });
        return res.json({
            success: true,
            data: user,
            message: "Profile updated successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: { code: "UPDATE_PROFILE_FAILED", message: error.message },
        });
    }
});
/**
 * Deactivate own account
 */
router.post("/me/deactivate", auth_middleware_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        await userService.deactivateUser(req.user.id);
        return res.json({
            success: true,
            message: "Account deactivated successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: { code: "DEACTIVATE_FAILED", message: error.message },
        });
    }
});
/**
 * Get current user permissions
 */
router.get("/me/permissions", auth_middleware_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Not authenticated" },
            });
        }
        return res.json({
            success: true,
            data: {
                roles: req.user.roles,
                permissions: req.user.permissions,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "FETCH_PERMISSIONS_FAILED", message: error.message },
        });
    }
});
// ==================== USER MANAGEMENT (Admin Only) ====================
/**
 * Get all users (paginated)
 */
router.get("/", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)('users:view'), async (req, res) => {
    try {
        const { page, limit, search, isActive, roleId } = req.query;
        const result = await userService.getAllUsers({
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            search: search,
            isActive: isActive ? isActive === 'true' : undefined,
            roleId: roleId,
        });
        return res.json({
            success: true,
            data: result.users,
            pagination: result.pagination,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "FETCH_USERS_FAILED", message: error.message },
        });
    }
});
/**
 * Get user by ID (admin)
 */
router.get("/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)('users:view'), async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        return res.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        return res.status(404).json({
            success: false,
            error: { code: "USER_NOT_FOUND", message: error.message },
        });
    }
});
/**
 * Create user (admin)
 */
router.post("/", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)('users:create'), async (req, res) => {
    try {
        const { email, firstName, lastName, roleIds, studentId, employeeId, department, title } = req.body;
        if (!email || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                error: { code: "MISSING_FIELDS", message: "Email, firstName, and lastName are required" },
            });
        }
        const result = await userService.createUser({
            email,
            firstName,
            lastName,
            roleIds,
            studentId,
            employeeId,
            department,
            title,
            createdBy: req.user?.id,
        });
        return res.status(201).json({
            success: true,
            data: {
                user: result.user,
                tempPassword: result.tempPassword,
            },
            message: "User created successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: { code: "CREATE_USER_FAILED", message: error.message },
        });
    }
});
/**
 * Update user (admin)
 */
router.put("/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)('users:edit'), async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, isActive, mustChangePassword } = req.body;
        const user = await userService.updateUser(id, {
            firstName,
            lastName,
            isActive,
            mustChangePassword,
        });
        return res.json({
            success: true,
            data: user,
            message: "User updated successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: { code: "UPDATE_USER_FAILED", message: error.message },
        });
    }
});
/**
 * Delete user (soft delete - deactivate)
 */
router.delete("/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)('users:delete'), async (req, res) => {
    try {
        const { id } = req.params;
        await userService.deleteUser(id);
        return res.json({
            success: true,
            message: "User deactivated successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: { code: "DELETE_USER_FAILED", message: error.message },
        });
    }
});
/**
 * Hard delete user (permanent)
 */
router.delete("/:id/hard", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)('users:delete'), async (req, res) => {
    try {
        const { id } = req.params;
        await userService.hardDeleteUser(id);
        return res.json({
            success: true,
            message: "User permanently deleted",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: { code: "HARD_DELETE_FAILED", message: error.message },
        });
    }
});
/**
 * Activate user
 */
router.post("/:id/activate", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)('users:edit'), async (req, res) => {
    try {
        const { id } = req.params;
        await userService.activateUser(id);
        return res.json({
            success: true,
            message: "User activated successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: { code: "ACTIVATE_USER_FAILED", message: error.message },
        });
    }
});
/**
 * Deactivate user
 */
router.post("/:id/deactivate", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)('users:edit'), async (req, res) => {
    try {
        const { id } = req.params;
        await userService.deactivateUser(id);
        return res.json({
            success: true,
            message: "User deactivated successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: { code: "DEACTIVATE_USER_FAILED", message: error.message },
        });
    }
});
/**
 * Reset user password (admin)
 */
router.post("/:id/reset-password", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)('users:edit'), async (req, res) => {
    try {
        const { id } = req.params;
        const tempPassword = await userService.resetUserPassword(id, req.user?.id);
        return res.json({
            success: true,
            data: { tempPassword },
            message: "Password reset successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: { code: "RESET_PASSWORD_FAILED", message: error.message },
        });
    }
});
// ==================== USER ROLES MANAGEMENT ====================
/**
 * Get user roles
 */
router.get("/:id/roles", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)('roles:view'), async (req, res) => {
    try {
        const { id } = req.params;
        const roles = await userService.getUserRoles(id);
        return res.json({
            success: true,
            data: roles,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "FETCH_ROLES_FAILED", message: error.message },
        });
    }
});
/**
 * Update user roles (replace all)
 */
router.put("/:id/roles", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)('roles:assign'), async (req, res) => {
    try {
        const { id } = req.params;
        const { roleIds } = req.body;
        if (!roleIds || !Array.isArray(roleIds)) {
            return res.status(400).json({
                success: false,
                error: { code: "INVALID_INPUT", message: "roleIds array is required" },
            });
        }
        const result = await userService.updateUserRoles(id, roleIds, req.user?.id);
        return res.json({
            success: true,
            data: result,
            message: "User roles updated successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: { code: "UPDATE_ROLES_FAILED", message: error.message },
        });
    }
});
/**
 * Assign role to user
 */
router.post("/:id/roles/:roleId", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)('roles:assign'), async (req, res) => {
    try {
        const { id, roleId } = req.params;
        const result = await userService.assignRoleToUser(id, roleId, req.user?.id);
        return res.json({
            success: true,
            data: result,
            message: "Role assigned successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: { code: "ASSIGN_ROLE_FAILED", message: error.message },
        });
    }
});
/**
 * Remove role from user
 */
router.delete("/:id/roles/:roleId", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)('roles:assign'), async (req, res) => {
    try {
        const { id, roleId } = req.params;
        await userService.removeRoleFromUser(id, roleId);
        return res.json({
            success: true,
            message: "Role removed successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: { code: "REMOVE_ROLE_FAILED", message: error.message },
        });
    }
});
// ==================== USER PERMISSIONS ====================
/**
 * Get user permissions
 */
router.get("/:id/permissions", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)('permissions:view'), async (req, res) => {
    try {
        const { id } = req.params;
        const permissions = await userService.getUserPermissions(id);
        return res.json({
            success: true,
            data: permissions,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "FETCH_PERMISSIONS_FAILED", message: error.message },
        });
    }
});
/**
 * Check if user has specific permission
 */
router.get("/:id/permissions/:permissionCode", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)('permissions:view'), async (req, res) => {
    try {
        const { id, permissionCode } = req.params;
        const hasPermission = await userService.checkUserPermission(id, permissionCode);
        return res.json({
            success: true,
            data: { hasPermission },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "CHECK_PERMISSION_FAILED", message: error.message },
        });
    }
});
// ==================== STATISTICS ====================
/**
 * Get user statistics (admin only)
 */
router.get("/stats/summary", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)('users:view'), async (req, res) => {
    try {
        const stats = await userService.getUserStats();
        return res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "FETCH_STATS_FAILED", message: error.message },
        });
    }
});
/**
 * Get recent users
 */
router.get("/stats/recent", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)('users:view'), async (req, res) => {
    try {
        const { limit } = req.query;
        const users = await userService.getRecentUsers(limit ? parseInt(limit) : 5);
        return res.json({
            success: true,
            data: users,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "FETCH_USERS_FAILED", message: error.message },
        });
    }
});
exports.default = router;
//# sourceMappingURL=user.routes.js.map