"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const database_1 = __importDefault(require("../config/database"));
const client_1 = require("@prisma/client");
const password_1 = require("../utils/password");
const role_service_1 = require("./role.service");
const roleService = new role_service_1.RoleService();
const asString = (value) => Array.isArray(value) ? value[0] : value || "";
const normalizeRole = (roleValue) => {
    if (!roleValue)
        return undefined;
    const upper = roleValue.toUpperCase();
    if (upper in client_1.Role) {
        return upper;
    }
    return undefined;
};
class UserService {
    async getAllUsers(options) {
        const { isActive, search, roleId, page = 1, limit = 10 } = options || {};
        const where = {};
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
            ];
        }
        const role = normalizeRole(roleId);
        if (role) {
            where.role = role;
        }
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            database_1.default.user.findMany({
                where,
                include: { student: true, teacher: true },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            database_1.default.user.count({ where }),
        ]);
        return {
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Get user by ID with roles and permissions
     */
    async getUserById(id) {
        const userId = asString(id);
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            include: {
                student: true,
                teacher: true,
            },
        });
        if (!user) {
            throw new Error("User not found");
        }
        // Get permissions
        const permissions = await roleService.getUserPermissions(userId);
        const roles = [user.role];
        return {
            ...user,
            roles,
            permissions,
        };
    }
    /**
     * Get user by email
     */
    async getUserByEmail(email) {
        return database_1.default.user.findUnique({
            where: { email },
            include: { student: true, teacher: true },
        });
    }
    /**
     * Create new user (by admin)
     */
    async createUser(data) {
        // Check if user exists
        const existingUser = await database_1.default.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new Error("User with this email already exists");
        }
        // Generate temporary password
        const tempPassword = (0, password_1.generateRandomPassword)(12);
        const hashedPassword = await (0, password_1.hashPassword)(tempPassword);
        // Create user
        const selectedRole = normalizeRole(data.roleIds?.[0]) || client_1.Role.STUDENT;
        const user = await database_1.default.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                role: selectedRole,
                isActive: true,
                mustChangePassword: true,
            },
        });
        // Create role-specific profile based on roles
        if (selectedRole === client_1.Role.STUDENT || data.studentId) {
            await database_1.default.student.create({
                data: {
                    userId: user.id,
                    studentId: data.studentId || `STU${Date.now()}`,
                },
            });
        }
        if (selectedRole === client_1.Role.TEACHER || data.employeeId) {
            await database_1.default.teacher.create({
                data: {
                    userId: user.id,
                    employeeId: data.employeeId || `TCH${Date.now()}`,
                    department: data.department,
                    title: data.title,
                },
            });
        }
        // Get user with roles
        const userWithRoles = await this.getUserById(user.id);
        return {
            user: userWithRoles,
            tempPassword,
        };
    }
    /**
     * Update user
     */
    async updateUser(id, data) {
        return database_1.default.user.update({
            where: { id: asString(id) },
            data,
        });
    }
    /**
     * Delete user (soft delete by deactivating)
     */
    async deleteUser(id) {
        // Check if user exists
        const user = await database_1.default.user.findUnique({
            where: { id: asString(id) },
        });
        if (!user) {
            throw new Error("User not found");
        }
        // Soft delete - deactivate user
        return database_1.default.user.update({
            where: { id: asString(id) },
            data: { isActive: false },
        });
    }
    /**
     * Hard delete user (admin only)
     */
    async hardDeleteUser(id) {
        return database_1.default.user.delete({
            where: { id: asString(id) },
        });
    }
    // ==================== USER ROLES ====================
    /**
     * Update user roles (replace all)
     */
    async updateUserRoles(userId, roleIds, updatedBy) {
        return roleService.assignRolesToUser(asString(userId), roleIds, updatedBy);
    }
    /**
     * Get user permissions
     */
    async getUserPermissions(userId) {
        return roleService.getUserPermissions(asString(userId));
    }
    /**
     * Check if user has permission
     */
    async checkUserPermission(userId, permissionCode) {
        return roleService.checkUserPermission(asString(userId), asString(permissionCode));
    }
    // ==================== USER STATUS ====================
    /**
     * Activate user
     */
    async activateUser(id) {
        return database_1.default.user.update({
            where: { id: asString(id) },
            data: { isActive: true },
        });
    }
    /**
     * Deactivate user
     */
    async deactivateUser(id) {
        return database_1.default.user.update({
            where: { id: asString(id) },
            data: { isActive: false },
        });
    }
    /**
     * Reset user password (admin)
     */
    async resetUserPassword(userId, _resetBy) {
        const normalizedUserId = asString(userId);
        const user = await database_1.default.user.findUnique({
            where: { id: normalizedUserId },
        });
        if (!user) {
            throw new Error("User not found");
        }
        const tempPassword = (0, password_1.generateRandomPassword)(12);
        const hashedPassword = await (0, password_1.hashPassword)(tempPassword);
        await database_1.default.user.update({
            where: { id: normalizedUserId },
            data: {
                password: hashedPassword,
                mustChangePassword: true,
            },
        });
        // Revoke all refresh tokens
        await database_1.default.refreshToken.updateMany({
            where: { userId: normalizedUserId, revoked: false },
            data: { revoked: true },
        });
        return tempPassword;
    }
    // ==================== STATISTICS ====================
    /**
     * Get user statistics
     */
    async getUserStats() {
        const [totalUsers, activeUsers, inactiveUsers, usersByRole,] = await Promise.all([
            database_1.default.user.count(),
            database_1.default.user.count({ where: { isActive: true } }),
            database_1.default.user.count({ where: { isActive: false } }),
            database_1.default.$queryRaw `
        SELECT r.name, COUNT(ur.user_id) as count
        FROM roles r
        LEFT JOIN user_roles ur ON r.id = ur.role_id
        GROUP BY r.id, r.name
        ORDER BY count DESC
      `,
        ]);
        return {
            total: totalUsers,
            active: activeUsers,
            inactive: inactiveUsers,
            byRole: usersByRole,
        };
    }
    /**
     * Get recent users
     */
    async getRecentUsers(limit = 5) {
        return database_1.default.user.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                isActive: true,
                createdAt: true,
                role: true,
            },
        });
    }
    async getUserRoles(userId) {
        return roleService.getUserRoles(asString(userId));
    }
    async assignRoleToUser(userId, roleId, assignedBy) {
        return roleService.assignRoleToUser(asString(userId), asString(roleId), assignedBy);
    }
    async removeRoleFromUser(userId, roleId) {
        return roleService.removeRoleFromUser(asString(userId), asString(roleId));
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map