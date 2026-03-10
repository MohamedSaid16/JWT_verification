import prisma from "../config/database";
import { Role } from "@prisma/client";

type Permission = {
  id: string;
  name: string;
  code: string;
  module: string;
};

type RoleSummary = {
  id: string;
  name: string;
  description: string;
  level: number;
  isSystem: boolean;
};

const ROLE_LEVELS: Record<Role, number> = {
  STUDENT: 10,
  DELEGATE: 20,
  TEACHER: 30,
  SPECIALITE_CHEF: 40,
  DEPARTEMENT_CHEF: 50,
  ADMIN_FACULTY: 80,
  ADMIN_SUPER: 100,
  ASSIGNMENT_MANAGER: 60,
  COMMITTEE_MEMBER: 55,
  COMMITTEE_PRESIDENT: 65,
};

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  STUDENT: ["profile:view", "profile:edit", "grades:view:own"],
  DELEGATE: ["profile:view", "profile:edit", "grades:view:own", "users:view"],
  TEACHER: ["profile:view", "profile:edit", "grades:enter", "grades:edit", "grades:view:all"],
  SPECIALITE_CHEF: ["profile:view", "profile:edit", "department:view", "department:manage"],
  DEPARTEMENT_CHEF: ["profile:view", "profile:edit", "department:view", "department:manage"],
  ADMIN_FACULTY: ["users:view", "users:create", "users:edit", "roles:view", "roles:assign"],
  ADMIN_SUPER: [
    "users:view",
    "users:create",
    "users:edit",
    "users:delete",
    "roles:view",
    "roles:create",
    "roles:edit",
    "roles:delete",
    "roles:assign",
    "permissions:manage",
    "system:configure",
  ],
  ASSIGNMENT_MANAGER: ["projects:view", "projects:assign", "projects:create"],
  COMMITTEE_MEMBER: ["committee:cases:view", "committee:hearings:participate"],
  COMMITTEE_PRESIDENT: ["committee:cases:view", "committee:hearings:participate", "committee:decisions:make"],
};

const ALL_PERMISSIONS: Permission[] = [
  { id: "profile:view", name: "View own profile", code: "profile:view", module: "profile" },
  { id: "profile:edit", name: "Edit own profile", code: "profile:edit", module: "profile" },
  { id: "grades:view:own", name: "View own grades", code: "grades:view:own", module: "grades" },
  { id: "grades:view:all", name: "View all grades", code: "grades:view:all", module: "grades" },
  { id: "grades:enter", name: "Enter grades", code: "grades:enter", module: "grades" },
  { id: "grades:edit", name: "Edit grades", code: "grades:edit", module: "grades" },
  { id: "projects:view", name: "View projects", code: "projects:view", module: "projects" },
  { id: "projects:create", name: "Create projects", code: "projects:create", module: "projects" },
  { id: "projects:assign", name: "Assign projects", code: "projects:assign", module: "projects" },
  { id: "users:view", name: "View users", code: "users:view", module: "users" },
  { id: "users:create", name: "Create users", code: "users:create", module: "users" },
  { id: "users:edit", name: "Edit users", code: "users:edit", module: "users" },
  { id: "users:delete", name: "Delete users", code: "users:delete", module: "users" },
  { id: "roles:view", name: "View roles", code: "roles:view", module: "roles" },
  { id: "roles:create", name: "Create roles", code: "roles:create", module: "roles" },
  { id: "roles:edit", name: "Edit roles", code: "roles:edit", module: "roles" },
  { id: "roles:delete", name: "Delete roles", code: "roles:delete", module: "roles" },
  { id: "roles:assign", name: "Assign roles", code: "roles:assign", module: "roles" },
  { id: "permissions:manage", name: "Manage permissions", code: "permissions:manage", module: "permissions" },
  { id: "committee:cases:view", name: "View committee cases", code: "committee:cases:view", module: "committee" },
  { id: "committee:hearings:participate", name: "Participate in hearings", code: "committee:hearings:participate", module: "committee" },
  { id: "committee:decisions:make", name: "Make committee decisions", code: "committee:decisions:make", module: "committee" },
  { id: "department:view", name: "View department", code: "department:view", module: "department" },
  { id: "department:manage", name: "Manage department", code: "department:manage", module: "department" },
  { id: "system:configure", name: "Configure system", code: "system:configure", module: "system" },
];

const toRole = (value: string): Role => {
  const upper = value.toUpperCase();
  if (upper in Role) {
    return upper as Role;
  }
  throw new Error(`Invalid role: ${value}`);
};

const buildRoleSummary = (role: Role): RoleSummary => ({
  id: role,
  name: role,
  description: `${role} role`,
  level: ROLE_LEVELS[role],
  isSystem: true,
});

const asString = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] : value || "";

export class RoleService {
  async createRole(data: { name: string; description?: string; level?: number }) {
    const role = toRole(data.name);
    return buildRoleSummary(role);
  }

  /**
   * Get all roles with their permissions
   */
  async getAllRoles() {
    return Object.values(Role).map(buildRoleSummary).sort((a, b) => b.level - a.level);
  }

  /**
   * Get role by ID with permissions
   */
  async getRoleById(id: string | string[]) {
    return buildRoleSummary(toRole(asString(id)));
  }

  /**
   * Get role by name
   */
  async getRoleByName(name: string | string[]) {
    return buildRoleSummary(toRole(asString(name)));
  }

  /**
   * Update role
   */
  async updateRole(id: string | string[], data: { name?: string; description?: string; level?: number }) {
    const role = toRole(data.name || asString(id));
    return {
      ...buildRoleSummary(role),
      description: data.description || `${role} role`,
      level: data.level ?? ROLE_LEVELS[role],
    };
  }

  /**
   * Delete role (only if not system role and no users assigned)
   */
  async deleteRole(id: string | string[]) {
    toRole(asString(id));
    return { deleted: false, message: "Built-in enum roles cannot be deleted" };
  }

  // ==================== PERMISSION MANAGEMENT ====================

  /**
   * Get all permissions
   */
  async getAllPermissions() {
    return ALL_PERMISSIONS;
  }

  /**
   * Get permissions by module
   */
  async getPermissionsByModule(module: string | string[]) {
    const moduleName = asString(module);
    return ALL_PERMISSIONS.filter((permission) => permission.module === moduleName);
  }

  /**
   * Assign permission to role
   */
  async assignPermissionToRole(roleId: string | string[], permissionId: string | string[], grantedBy?: string) {
    return {
      roleId: asString(roleId),
      permissionId: asString(permissionId),
      grantedBy,
      message: "Static permission map is not mutable at runtime",
    };
  }

  /**
   * Remove permission from role
   */
  async removePermissionFromRole(roleId: string | string[], permissionId: string | string[]) {
    return {
      roleId: asString(roleId),
      permissionId: asString(permissionId),
      message: "Static permission map is not mutable at runtime",
    };
  }

  /**
   * Get role permissions
   */
  async getRolePermissions(roleId: string | string[]) {
    const role = toRole(asString(roleId));
    const allowedCodes = new Set(ROLE_PERMISSIONS[role] || []);
    return ALL_PERMISSIONS.filter((permission) => allowedCodes.has(permission.code));
  }

  // ==================== USER-ROLE MANAGEMENT ====================

  /**
   * Assign role to user
   */
  async assignRoleToUser(userId: string | string[], roleId: string | string[], assignedBy?: string) {
    const normalizedUserId = asString(userId);
    const role = toRole(asString(roleId));
    const user = await prisma.user.update({
      where: { id: normalizedUserId },
      data: { role },
      select: { id: true, firstName: true, lastName: true, email: true, role: true },
    });
    return { user, assignedBy };
  }

  /**
   * Assign multiple roles to user
   */
  async assignRolesToUser(userId: string | string[], roleIds: string[], assignedBy?: string) {
    if (!roleIds.length) return [];
    const lastRoleId = roleIds[roleIds.length - 1];
    const result = await this.assignRoleToUser(asString(userId), lastRoleId, assignedBy);
    return [result];
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(userId: string | string[], roleId: string | string[]) {
    const normalizedUserId = asString(userId);
    const role = toRole(asString(roleId));
    const user = await prisma.user.findUnique({ where: { id: normalizedUserId }, select: { role: true } });
    if (!user) {
      throw new Error("User not found");
    }
    if (user.role !== role) {
      return { changed: false, message: "Role is not assigned to this user" };
    }
    await prisma.user.update({ where: { id: normalizedUserId }, data: { role: Role.STUDENT } });
    return { changed: true };
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: string | string[]) {
    const user = await prisma.user.findUnique({ where: { id: asString(userId) }, select: { role: true } });
    if (!user) return [];
    return [buildRoleSummary(user.role)];
  }

  /**
   * Get user permissions (unique list)
   */
  async getUserPermissions(userId: string | string[]): Promise<string[]> {
    const user = await prisma.user.findUnique({ where: { id: asString(userId) }, select: { role: true } });
    if (!user) return [];
    return ROLE_PERMISSIONS[user.role] || [];
  }

  /**
   * Check if user has specific permission
   */
  async checkUserPermission(userId: string | string[], permissionCode: string | string[]): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(asString(permissionCode));
  }

  /**
   * Check if user has any of the given permissions
   */
  async checkUserAnyPermission(userId: string | string[], permissionCodes: string[]): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissionCodes.some(code => permissions.includes(code));
  }

  /**
   * Check if user has all of the given permissions
   */
  async checkUserAllPermissions(userId: string | string[], permissionCodes: string[]): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissionCodes.every(code => permissions.includes(code));
  }

  /**
   * Get users by role
   */
  async getUsersByRole(roleId: string | string[]) {
    const role = toRole(asString(roleId));
    return prisma.user.findMany({
      where: { role },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
      },
    });
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Sync role permissions (replace all)
   */
  async syncRolePermissions(roleId: string | string[], permissionIds: string[], grantedBy?: string) {
    return {
      roleId: asString(roleId),
      permissionIds,
      grantedBy,
      message: "Static permission map is not mutable at runtime",
    };
  }

  /**
   * Get users with their roles and permissions
   */
  async getUsersWithPermissions(userIds?: string[]) {
    const users = await prisma.user.findMany({
      where: userIds?.length ? { id: { in: userIds } } : undefined,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
        role: true,
      },
    });

    return users.map((user) => ({
      ...user,
      permissions: ROLE_PERMISSIONS[user.role] || [],
    }));
  }
}