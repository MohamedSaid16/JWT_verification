"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentUsers = exports.getUserStats = exports.getUserPermissions = exports.updateUserRoles = exports.getUserRoles = exports.resetUserPassword = exports.deactivateUser = exports.activateUser = exports.hardDeleteUser = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = exports.getMyPermissions = exports.deactivateMyAccount = exports.updateMyProfile = exports.getMyProfile = exports.getPublicUser = void 0;
const user_service_1 = require("../services/user.service");
const userService = new user_service_1.UserService();
// ==================== PUBLIC PROFILE ====================
/**
 * Get public user profile by ID
 */
const getPublicUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        // Remove sensitive information
        const publicProfile = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            roles: user.roles?.map((r) => ({ id: r.id, name: r.name })),
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
};
exports.getPublicUser = getPublicUser;
// ==================== OWN PROFILE ====================
/**
 * Get current user profile
 */
const getMyProfile = async (req, res) => {
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
};
exports.getMyProfile = getMyProfile;
/**
 * Update current user profile
 */
const updateMyProfile = async (req, res) => {
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
};
exports.updateMyProfile = updateMyProfile;
/**
 * Deactivate own account
 */
const deactivateMyAccount = async (req, res) => {
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
};
exports.deactivateMyAccount = deactivateMyAccount;
/**
 * Get my permissions
 */
const getMyPermissions = async (req, res) => {
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
};
exports.getMyPermissions = getMyPermissions;
// ==================== USER MANAGEMENT (ADMIN) ====================
/**
 * Get all users
 */
const getAllUsers = async (req, res) => {
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
};
exports.getAllUsers = getAllUsers;
/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
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
};
exports.getUserById = getUserById;
/**
 * Create user
 */
const createUser = async (req, res) => {
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
};
exports.createUser = createUser;
/**
 * Update user
 */
const updateUser = async (req, res) => {
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
};
exports.updateUser = updateUser;
/**
 * Delete user (soft delete)
 */
const deleteUser = async (req, res) => {
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
};
exports.deleteUser = deleteUser;
/**
 * Hard delete user
 */
const hardDeleteUser = async (req, res) => {
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
};
exports.hardDeleteUser = hardDeleteUser;
/**
 * Activate user
 */
const activateUser = async (req, res) => {
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
};
exports.activateUser = activateUser;
/**
 * Deactivate user
 */
const deactivateUser = async (req, res) => {
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
};
exports.deactivateUser = deactivateUser;
/**
 * Reset user password
 */
const resetUserPassword = async (req, res) => {
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
};
exports.resetUserPassword = resetUserPassword;
// ==================== USER ROLES MANAGEMENT ====================
/**
 * Get user roles
 */
const getUserRoles = async (req, res) => {
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
};
exports.getUserRoles = getUserRoles;
/**
 * Update user roles
 */
const updateUserRoles = async (req, res) => {
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
};
exports.updateUserRoles = updateUserRoles;
/**
 * Get user permissions
 */
const getUserPermissions = async (req, res) => {
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
};
exports.getUserPermissions = getUserPermissions;
// ==================== STATISTICS ====================
/**
 * Get user statistics
 */
const getUserStats = async (req, res) => {
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
};
exports.getUserStats = getUserStats;
/**
 * Get recent users
 */
const getRecentUsers = async (req, res) => {
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
};
exports.getRecentUsers = getRecentUsers;
//# sourceMappingURL=user.controller.js.map