import prisma from "../config/database";
import { Role } from "@prisma/client";
import { hashPassword, generateRandomPassword } from "../utils/password";
import { RoleService } from "./role.service";

const roleService = new RoleService();

const asString = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] : value || "";

const normalizeRole = (roleValue?: string): Role | undefined => {
  if (!roleValue) return undefined;
  const upper = roleValue.toUpperCase();
  if (upper in Role) {
    return upper as Role;
  }
  return undefined;
};

export class UserService {
  async getAllUsers(options?: {
    isActive?: boolean;
    search?: string;
    roleId?: string;
    page?: number;
    limit?: number;
  }) {
    const { isActive, search, roleId, page = 1, limit = 10 } = options || {};
    const where: any = {};

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
      prisma.user.findMany({
        where,
        include: { student: true, teacher: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
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
  async getUserById(id: string | string[]) {
    const userId = asString(id);
    const user = await prisma.user.findUnique({
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
  async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { student: true, teacher: true },
    });
  }

  /**
   * Create new user (by admin)
   */
  async createUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    roleIds?: string[];
    studentId?: string;
    employeeId?: string;
    department?: string;
    title?: string;
    createdBy?: string;
  }) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Generate temporary password
    const tempPassword = generateRandomPassword(12);
    const hashedPassword = await hashPassword(tempPassword);

    // Create user
    const selectedRole = normalizeRole(data.roleIds?.[0]) || Role.STUDENT;

    const user = await prisma.user.create({
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
    if (selectedRole === Role.STUDENT || data.studentId) {
      await prisma.student.create({
        data: {
          userId: user.id,
          studentId: data.studentId || `STU${Date.now()}`,
        },
      });
    }

    if (selectedRole === Role.TEACHER || data.employeeId) {
      await prisma.teacher.create({
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
  async updateUser(
    id: string | string[],
    data: {
      firstName?: string;
      lastName?: string;
      isActive?: boolean;
      mustChangePassword?: boolean;
    }
  ) {
    return prisma.user.update({
      where: { id: asString(id) },
      data,
    });
  }

  /**
   * Delete user (soft delete by deactivating)
   */
  async deleteUser(id: string | string[]) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: asString(id) },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Soft delete - deactivate user
    return prisma.user.update({
      where: { id: asString(id) },
      data: { isActive: false },
    });
  }

  /**
   * Hard delete user (admin only)
   */
  async hardDeleteUser(id: string | string[]) {
    return prisma.user.delete({
      where: { id: asString(id) },
    });
  }

  // ==================== USER ROLES ====================

  /**
   * Update user roles (replace all)
   */
  async updateUserRoles(userId: string | string[], roleIds: string[], updatedBy?: string) {
    return roleService.assignRolesToUser(asString(userId), roleIds, updatedBy);
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId: string | string[]) {
    return roleService.getUserPermissions(asString(userId));
  }

  /**
   * Check if user has permission
   */
  async checkUserPermission(userId: string | string[], permissionCode: string | string[]) {
    return roleService.checkUserPermission(asString(userId), asString(permissionCode));
  }

  // ==================== USER STATUS ====================

  /**
   * Activate user
   */
  async activateUser(id: string | string[]) {
    return prisma.user.update({
      where: { id: asString(id) },
      data: { isActive: true },
    });
  }

  /**
   * Deactivate user
   */
  async deactivateUser(id: string | string[]) {
    return prisma.user.update({
      where: { id: asString(id) },
      data: { isActive: false },
    });
  }

  /**
   * Reset user password (admin)
   */
  async resetUserPassword(userId: string | string[], _resetBy?: string) {
    const normalizedUserId = asString(userId);
    const user = await prisma.user.findUnique({
      where: { id: normalizedUserId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const tempPassword = generateRandomPassword(12);
    const hashedPassword = await hashPassword(tempPassword);

    await prisma.user.update({
      where: { id: normalizedUserId },
      data: {
        password: hashedPassword,
        mustChangePassword: true,
      },
    });

    // Revoke all refresh tokens
    await prisma.refreshToken.updateMany({
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
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      usersByRole,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.$queryRaw`
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
  async getRecentUsers(limit: number = 5) {
    return prisma.user.findMany({
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

  async getUserRoles(userId: string | string[]) {
    return roleService.getUserRoles(asString(userId));
  }

  async assignRoleToUser(userId: string | string[], roleId: string | string[], assignedBy?: string) {
    return roleService.assignRoleToUser(asString(userId), asString(roleId), assignedBy);
  }

  async removeRoleFromUser(userId: string | string[], roleId: string | string[]) {
    return roleService.removeRoleFromUser(asString(userId), asString(roleId));
  }
}