import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { RoleService } from "../services/role.service";
import { UserService } from "../services/user.service";

const roleService = new RoleService();
const userService = new UserService();

// ==================== ROLE MANAGEMENT ====================

/**
 * Create a new role
 */
export const createRole = async (req: AuthRequest, res: Response) => {
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
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "CREATE_ROLE_FAILED",
        message: error.message,
      },
    });
  }
};

/**
 * Get all roles
 */
export const getAllRoles = async (req: AuthRequest, res: Response) => {
  try {
    const roles = await roleService.getAllRoles();

    return res.json({
      success: true,
      data: roles,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: "FETCH_ROLES_FAILED",
        message: error.message,
      },
    });
  }
};

/**
 * Get role by ID
 */
export const getRoleById = async (req: AuthRequest, res: Response) => {
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
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: "FETCH_ROLE_FAILED",
        message: error.message,
      },
    });
  }
};

/**
 * Update role
 */
export const updateRole = async (req: AuthRequest, res: Response) => {
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
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "UPDATE_ROLE_FAILED",
        message: error.message,
      },
    });
  }
};

/**
 * Delete role
 */
export const deleteRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await roleService.deleteRole(id);

    return res.json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "DELETE_ROLE_FAILED",
        message: error.message,
      },
    });
  }
};

// ==================== PERMISSION MANAGEMENT ====================

/**
 * Get all permissions
 */
export const getAllPermissions = async (req: AuthRequest, res: Response) => {
  try {
    const permissions = await roleService.getAllPermissions();

    return res.json({
      success: true,
      data: permissions,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: "FETCH_PERMISSIONS_FAILED",
        message: error.message,
      },
    });
  }
};

/**
 * Get permissions by module
 */
export const getPermissionsByModule = async (req: AuthRequest, res: Response) => {
  try {
    const { module } = req.params;

    const permissions = await roleService.getPermissionsByModule(module);

    return res.json({
      success: true,
      data: permissions,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: "FETCH_PERMISSIONS_FAILED",
        message: error.message,
      },
    });
  }
};

/**
 * Assign permission to role
 */
export const assignPermissionToRole = async (req: AuthRequest, res: Response) => {
  try {
    const { roleId, permissionId } = req.params;

    const result = await roleService.assignPermissionToRole(
      roleId,
      permissionId,
      req.user?.id
    );

    return res.json({
      success: true,
      data: result,
      message: "Permission assigned to role successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "ASSIGN_PERMISSION_FAILED",
        message: error.message,
      },
    });
  }
};

/**
 * Remove permission from role
 */
export const removePermissionFromRole = async (req: AuthRequest, res: Response) => {
  try {
    const { roleId, permissionId } = req.params;

    await roleService.removePermissionFromRole(roleId, permissionId);

    return res.json({
      success: true,
      message: "Permission removed from role successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "REMOVE_PERMISSION_FAILED",
        message: error.message,
      },
    });
  }
};

/**
 * Get role permissions
 */
export const getRolePermissions = async (req: AuthRequest, res: Response) => {
  try {
    const { roleId } = req.params;

    const permissions = await roleService.getRolePermissions(roleId);

    return res.json({
      success: true,
      data: permissions,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: "FETCH_PERMISSIONS_FAILED",
        message: error.message,
      },
    });
  }
};

/**
 * Sync role permissions (replace all)
 */
export const syncRolePermissions = async (req: AuthRequest, res: Response) => {
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

    const result = await roleService.syncRolePermissions(
      roleId,
      permissionIds,
      req.user?.id
    );

    return res.json({
      success: true,
      data: result,
      message: "Role permissions synced successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "SYNC_PERMISSIONS_FAILED",
        message: error.message,
      },
    });
  }
};

// ==================== USER-ROLE MANAGEMENT ====================

/**
 * Assign role to user
 */
export const assignRoleToUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, roleId } = req.params;

    const result = await roleService.assignRoleToUser(
      userId,
      roleId,
      req.user?.id
    );

    return res.json({
      success: true,
      data: result,
      message: "Role assigned to user successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "ASSIGN_ROLE_FAILED",
        message: error.message,
      },
    });
  }
};

/**
 * Remove role from user
 */
export const removeRoleFromUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, roleId } = req.params;

    await roleService.removeRoleFromUser(userId, roleId);

    return res.json({
      success: true,
      message: "Role removed from user successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "REMOVE_ROLE_FAILED",
        message: error.message,
      },
    });
  }
};

/**
 * Get user roles
 */
export const getUserRoles = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const roles = await roleService.getUserRoles(userId);

    return res.json({
      success: true,
      data: roles,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: "FETCH_ROLES_FAILED",
        message: error.message,
      },
    });
  }
};

/**
 * Get user permissions
 */
export const getUserPermissions = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const permissions = await roleService.getUserPermissions(userId);

    return res.json({
      success: true,
      data: permissions,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: "FETCH_PERMISSIONS_FAILED",
        message: error.message,
      },
    });
  }
};

/**
 * Update user roles (replace all)
 */
export const updateUserRoles = async (req: AuthRequest, res: Response) => {
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
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "UPDATE_USER_ROLES_FAILED",
        message: error.message,
      },
    });
  }
};

/**
 * Get users by role
 */
export const getUsersByRole = async (req: AuthRequest, res: Response) => {
  try {
    const { roleId } = req.params;

    const users = await roleService.getUsersByRole(roleId);

    return res.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: "FETCH_USERS_FAILED",
        message: error.message,
      },
    });
  }
};

// ==================== USER MANAGEMENT ====================

/**
 * Get all users
 */
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, search, isActive, roleId } = req.query;

    const result = await userService.getAllUsers({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      isActive: isActive ? isActive === 'true' : undefined,
      roleId: roleId as string,
    });

    return res.json({
      success: true,
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: "FETCH_USERS_FAILED",
        message: error.message,
      },
    });
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await userService.getUserById(id);

    return res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      error: {
        code: "USER_NOT_FOUND",
        message: error.message,
      },
    });
  }
};

/**
 * Create user (by admin)
 */
export const createUser = async (req: AuthRequest, res: Response) => {
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
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "CREATE_USER_FAILED",
        message: error.message,
      },
    });
  }
};

/**
 * Update user
 */
export const updateUser = async (req: AuthRequest, res: Response) => {
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
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "UPDATE_USER_FAILED",
        message: error.message,
      },
    });
  }
};

/**
 * Delete user (soft delete)
 */
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await userService.deleteUser(id);

    return res.json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "DELETE_USER_FAILED",
        message: error.message,
      },
    });
  }
};

/**
 * Hard delete user (permanent)
 */
export const hardDeleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await userService.hardDeleteUser(id);

    return res.json({
      success: true,
      message: "User permanently deleted",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "HARD_DELETE_FAILED",
        message: error.message,
      },
    });
  }
};

/**
 * Activate user
 */
export const activateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await userService.activateUser(id);

    return res.json({
      success: true,
      message: "User activated successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "ACTIVATE_USER_FAILED",
        message: error.message,
      },
    });
  }
};

/**
 * Deactivate user
 */
export const deactivateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await userService.deactivateUser(id);

    return res.json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "DEACTIVATE_USER_FAILED",
        message: error.message,
      },
    });
  }
};

/**
 * Reset user password
 */
export const resetUserPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const tempPassword = await userService.resetUserPassword(id, req.user?.id);

    return res.json({
      success: true,
      data: { tempPassword },
      message: "Password reset successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "RESET_PASSWORD_FAILED",
        message: error.message,
      },
    });
  }
};

// ==================== STATISTICS ====================

/**
 * Get user statistics
 */
export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await userService.getUserStats();

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: "FETCH_STATS_FAILED",
        message: error.message,
      },
    });
  }
};

/**
 * Get recent users
 */
export const getRecentUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { limit } = req.query;
    const users = await userService.getRecentUsers(limit ? parseInt(limit as string) : 5);

    return res.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: "FETCH_USERS_FAILED",
        message: error.message,
      },
    });
  }
};