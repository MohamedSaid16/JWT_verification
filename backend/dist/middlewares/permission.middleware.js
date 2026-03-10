"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAnyPermission = exports.requirePermission = void 0;
const role_service_1 = require("../services/role.service");
const roleService = new role_service_1.RoleService();
const requirePermission = (permissionCode) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
                });
                return;
            }
            const hasPermission = await roleService.checkUserPermission(req.user.id, permissionCode);
            if (!hasPermission) {
                res.status(403).json({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Permission denied' },
                });
                return;
            }
            next();
            return;
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Error checking permissions' },
            });
            return;
        }
    };
};
exports.requirePermission = requirePermission;
const requireAnyPermission = (permissionCodes) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
                });
                return;
            }
            const permissions = await roleService.getUserPermissions(req.user.id);
            const hasAny = permissionCodes.some(code => permissions.includes(code));
            if (!hasAny) {
                res.status(403).json({
                    success: false,
                    error: { code: 'FORBIDDEN', message: 'Permission denied' },
                });
                return;
            }
            next();
            return;
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Error checking permissions' },
            });
            return;
        }
    };
};
exports.requireAnyPermission = requireAnyPermission;
//# sourceMappingURL=permission.middleware.js.map