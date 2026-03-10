import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { RoleService } from "../services/role.service";

const roleService = new RoleService();

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
      level: level ? parseInt(level) : 0,
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
    // FIXED: Ensure id is a string
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_ID",
          message: "Role ID is required",
        },
      });
    }

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
    // FIXED: Ensure id is a string
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, description, level } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_ID",
          message: "Role ID is required",
        },
      });
    }

    const role = await roleService.updateRole(id, {
      name,
      description,
      level: level ? parseInt(level) : undefined,
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
    // FIXED: Ensure id is a string
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_ID",
          message: "Role ID is required",
        },
      });
    }

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
    // FIXED: Ensure module is a string
    const module = Array.isArray(req.params.module) ? req.params.module[0] : req.params.module;

    if (!module) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_MODULE",
          message: "Module name is required",
        },
      });
    }

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
    // FIXED: Ensure IDs are strings
    const roleId = Array.isArray(req.params.roleId) ? req.params.roleId[0] : req.params.roleId;
    const permissionId = Array.isArray(req.params.permissionId) ? req.params.permissionId[0] : req.params.permissionId;

    if (!roleId || !permissionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_IDS",
          message: "Role ID and Permission ID are required",
        },
      });
    }

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
    // FIXED: Ensure IDs are strings
    const roleId = Array.isArray(req.params.roleId) ? req.params.roleId[0] : req.params.roleId;
    const permissionId = Array.isArray(req.params.permissionId) ? req.params.permissionId[0] : req.params.permissionId;

    if (!roleId || !permissionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_IDS",
          message: "Role ID and Permission ID are required",
        },
      });
    }

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
    // FIXED: Ensure roleId is a string
    const roleId = Array.isArray(req.params.roleId) ? req.params.roleId[0] : req.params.roleId;

    if (!roleId) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_ROLE_ID",
          message: "Role ID is required",
        },
      });
    }

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
    // FIXED: Ensure roleId is a string
    const roleId = Array.isArray(req.params.roleId) ? req.params.roleId[0] : req.params.roleId;
    const { permissionIds } = req.body;

    if (!roleId) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_ROLE_ID",
          message: "Role ID is required",
        },
      });
    }

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