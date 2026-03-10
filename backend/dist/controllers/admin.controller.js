"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentUsers = exports.getUserStats = exports.resetUserPassword = exports.deactivateUser = exports.activateUser = exports.hardDeleteUser = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = exports.getUsersByRole = exports.updateUserRoles = exports.getUserPermissions = exports.getUserRoles = exports.removeRoleFromUser = exports.assignRoleToUser = exports.syncRolePermissions = exports.getRolePermissions = exports.removePermissionFromRole = exports.assignPermissionToRole = exports.getPermissionsByModule = exports.getAllPermissions = exports.deleteRole = exports.updateRole = exports.getRoleById = exports.getAllRoles = exports.createRole = void 0;
const role_service_1 = require("../services/role.service");
const user_service_1 = require("../services/user.service");
const roleService = new role_service_1.RoleService();
const userService = new user_service_1.UserService();
// ==================== ROLE MANAGEMENT ====================
/**
 * Create a new role
 */
const createRole = async (req, res) => {
    try {
        const { name, description, level } = req.body;
        if (!name) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "MISSING_FIELDS",
                    message: "Role name is required",
                },
            });
        }
        const role = await roleService.createRole({
            name,
            description,
            level,
        });
        return res.status(201).json({
            success: true,
            data: role,
            message: "Role created successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: {
                code: "CREATE_ROLE_FAILED",
                message: error.message,
            },
        });
    }
};
exports.createRole = createRole;
/**
 * Get all roles
 */
const getAllRoles = async (req, res) => {
    try {
        const roles = await roleService.getAllRoles();
        return res.json({
            success: true,
            data: roles,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: {
                code: "FETCH_ROLES_FAILED",
                message: error.message,
            },
        });
    }
};
exports.getAllRoles = getAllRoles;
/**
 * Get role by ID
 */
const getRoleById = async (req, res) => {
    try {
        const { id } = req.params;
        const role = await roleService.getRoleById(id);
        if (!role) {
            return res.status(404).json({
                success: false,
                error: {
                    code: "ROLE_NOT_FOUND",
                    message: "Role not found",
                },
            });
        }
        return res.json({
            success: true,
            data: role,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: {
                code: "FETCH_ROLE_FAILED",
                message: error.message,
            },
        });
    }
};
exports.getRoleById = getRoleById;
/**
 * Update role
 */
const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, level } = req.body;
        const role = await roleService.updateRole(id, {
            name,
            description,
            level,
        });
        return res.json({
            success: true,
            data: role,
            message: "Role updated successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: {
                code: "UPDATE_ROLE_FAILED",
                message: error.message,
            },
        });
    }
};
exports.updateRole = updateRole;
/**
 * Delete role
 */
const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;
        await roleService.deleteRole(id);
        return res.json({
            success: true,
            message: "Role deleted successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: {
                code: "DELETE_ROLE_FAILED",
                message: error.message,
            },
        });
    }
};
exports.deleteRole = deleteRole;
// ==================== PERMISSION MANAGEMENT ====================
/**
 * Get all permissions
 */
const getAllPermissions = async (req, res) => {
    try {
        const permissions = await roleService.getAllPermissions();
        return res.json({
            success: true,
            data: permissions,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: {
                code: "FETCH_PERMISSIONS_FAILED",
                message: error.message,
            },
        });
    }
};
exports.getAllPermissions = getAllPermissions;
/**
 * Get permissions by module
 */
const getPermissionsByModule = async (req, res) => {
    try {
        const { module } = req.params;
        const permissions = await roleService.getPermissionsByModule(module);
        return res.json({
            success: true,
            data: permissions,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: {
                code: "FETCH_PERMISSIONS_FAILED",
                message: error.message,
            },
        });
    }
};
exports.getPermissionsByModule = getPermissionsByModule;
/**
 * Assign permission to role
 */
const assignPermissionToRole = async (req, res) => {
    try {
        const { roleId, permissionId } = req.params;
        const result = await roleService.assignPermissionToRole(roleId, permissionId, req.user?.id);
        return res.json({
            success: true,
            data: result,
            message: "Permission assigned to role successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: {
                code: "ASSIGN_PERMISSION_FAILED",
                message: error.message,
            },
        });
    }
};
exports.assignPermissionToRole = assignPermissionToRole;
/**
 * Remove permission from role
 */
const removePermissionFromRole = async (req, res) => {
    try {
        const { roleId, permissionId } = req.params;
        await roleService.removePermissionFromRole(roleId, permissionId);
        return res.json({
            success: true,
            message: "Permission removed from role successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: {
                code: "REMOVE_PERMISSION_FAILED",
                message: error.message,
            },
        });
    }
};
exports.removePermissionFromRole = removePermissionFromRole;
/**
 * Get role permissions
 */
const getRolePermissions = async (req, res) => {
    try {
        const { roleId } = req.params;
        const permissions = await roleService.getRolePermissions(roleId);
        return res.json({
            success: true,
            data: permissions,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: {
                code: "FETCH_PERMISSIONS_FAILED",
                message: error.message,
            },
        });
    }
};
exports.getRolePermissions = getRolePermissions;
/**
 * Sync role permissions (replace all)
 */
const syncRolePermissions = async (req, res) => {
    try {
        const { roleId } = req.params;
        const { permissionIds } = req.body;
        if (!permissionIds || !Array.isArray(permissionIds)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "INVALID_INPUT",
                    message: "permissionIds array is required",
                },
            });
        }
        const result = await roleService.syncRolePermissions(roleId, permissionIds, req.user?.id);
        return res.json({
            success: true,
            data: result,
            message: "Role permissions synced successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: {
                code: "SYNC_PERMISSIONS_FAILED",
                message: error.message,
            },
        });
    }
};
exports.syncRolePermissions = syncRolePermissions;
// ==================== USER-ROLE MANAGEMENT ====================
/**
 * Assign role to user
 */
const assignRoleToUser = async (req, res) => {
    try {
        const { userId, roleId } = req.params;
        const result = await roleService.assignRoleToUser(userId, roleId, req.user?.id);
        return res.json({
            success: true,
            data: result,
            message: "Role assigned to user successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: {
                code: "ASSIGN_ROLE_FAILED",
                message: error.message,
            },
        });
    }
};
exports.assignRoleToUser = assignRoleToUser;
/**
 * Remove role from user
 */
const removeRoleFromUser = async (req, res) => {
    try {
        const { userId, roleId } = req.params;
        await roleService.removeRoleFromUser(userId, roleId);
        return res.json({
            success: true,
            message: "Role removed from user successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: {
                code: "REMOVE_ROLE_FAILED",
                message: error.message,
            },
        });
    }
};
exports.removeRoleFromUser = removeRoleFromUser;
/**
 * Get user roles
 */
const getUserRoles = async (req, res) => {
    try {
        const { userId } = req.params;
        const roles = await roleService.getUserRoles(userId);
        return res.json({
            success: true,
            data: roles,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: {
                code: "FETCH_ROLES_FAILED",
                message: error.message,
            },
        });
    }
};
exports.getUserRoles = getUserRoles;
/**
 * Get user permissions
 */
const getUserPermissions = async (req, res) => {
    try {
        const { userId } = req.params;
        const permissions = await roleService.getUserPermissions(userId);
        return res.json({
            success: true,
            data: permissions,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: {
                code: "FETCH_PERMISSIONS_FAILED",
                message: error.message,
            },
        });
    }
};
exports.getUserPermissions = getUserPermissions;
/**
 * Update user roles (replace all)
 */
const updateUserRoles = async (req, res) => {
    try {
        const { userId } = req.params;
        const { roleIds } = req.body;
        if (!roleIds || !Array.isArray(roleIds)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "INVALID_INPUT",
                    message: "roleIds array is required",
                },
            });
        }
        const result = await userService.updateUserRoles(userId, roleIds, req.user?.id);
        return res.json({
            success: true,
            data: result,
            message: "User roles updated successfully",
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: {
                code: "UPDATE_USER_ROLES_FAILED",
                message: error.message,
            },
        });
    }
};
exports.updateUserRoles = updateUserRoles;
/**
 * Get users by role
 */
const getUsersByRole = async (req, res) => {
    try {
        const { roleId } = req.params;
        const users = await roleService.getUsersByRole(roleId);
        return res.json({
            success: true,
            data: users,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: {
                code: "FETCH_USERS_FAILED",
                message: error.message,
            },
        });
    }
};
exports.getUsersByRole = getUsersByRole;
// ==================== USER MANAGEMENT ====================
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
            error: {
                code: "FETCH_USERS_FAILED",
                message: error.message,
            },
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
            error: {
                code: "USER_NOT_FOUND",
                message: error.message,
            },
        });
    }
};
exports.getUserById = getUserById;
/**
 * Create user (by admin)
 */
const createUser = async (req, res) => {
    try {
        const { email, firstName, lastName, roleIds, studentId, employeeId, department, title } = req.body;
        if (!email || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "MISSING_FIELDS",
                    message: "Email, firstName, and lastName are required",
                },
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
            error: {
                code: "CREATE_USER_FAILED",
                message: error.message,
            },
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
            error: {
                code: "UPDATE_USER_FAILED",
                message: error.message,
            },
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
            error: {
                code: "DELETE_USER_FAILED",
                message: error.message,
            },
        });
    }
};
exports.deleteUser = deleteUser;
/**
 * Hard delete user (permanent)
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
            error: {
                code: "HARD_DELETE_FAILED",
                message: error.message,
            },
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
            error: {
                code: "ACTIVATE_USER_FAILED",
                message: error.message,
            },
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
            error: {
                code: "DEACTIVATE_USER_FAILED",
                message: error.message,
            },
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
            error: {
                code: "RESET_PASSWORD_FAILED",
                message: error.message,
            },
        });
    }
};
exports.resetUserPassword = resetUserPassword;
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
            error: {
                code: "FETCH_STATS_FAILED",
                message: error.message,
            },
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
            error: {
                code: "FETCH_USERS_FAILED",
                message: error.message,
            },
        });
    }
};
exports.getRecentUsers = getRecentUsers;
//# sourceMappingURL=admin.controller.js.map