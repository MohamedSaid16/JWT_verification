"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.canManageRoles = exports.canManageUsers = exports.isAdmin = exports.isCommitteePresident = exports.isCommitteeMember = exports.isAssignmentManager = exports.isSuperAdmin = exports.isFacultyAdmin = exports.isDepartmentChef = exports.isSpecialiteChef = exports.isDelegate = exports.isTeacher = exports.isStudent = exports.requireAllPermissions = exports.requireAnyPermission = exports.requirePermission = exports.requireRole = exports.requireEmailVerified = exports.requireAuth = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const auth_1 = require("../config/auth");
const database_1 = __importDefault(require("../config/database"));
const role_service_1 = require("../services/role.service");
const roleService = new role_service_1.RoleService();
const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies?.[auth_1.ACCESS_TOKEN_COOKIE_NAME] || req.headers.authorization?.split(" ")[1];
        if (!token) {
            res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "Authentication required" },
            });
            return;
        }
        const payload = jsonwebtoken_1.default.verify(token, auth_1.JWT_ACCESS_SECRET);
        const user = await database_1.default.user.findUnique({ where: { id: payload.sub } });
        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                error: { code: "UNAUTHORIZED", message: "User not found or inactive" },
            });
            return;
        }
        const permissions = await roleService.getUserPermissions(user.id);
        req.user = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            roles: [user.role],
            permissions,
        };
        next();
    }
    catch (_error) {
        res.status(401).json({
            success: false,
            error: { code: "UNAUTHORIZED", message: "Invalid or expired token" },
        });
    }
};
exports.authenticate = authenticate;
exports.requireAuth = exports.authenticate;
const requireEmailVerified = async (_req, _res, next) => {
    // Email verification flag is not part of the current schema.
    next();
};
exports.requireEmailVerified = requireEmailVerified;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Insufficient role" } });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
const requirePermission = (permissionCode) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } });
            return;
        }
        if (!req.user.permissions.includes(permissionCode)) {
            res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Missing permission" } });
            return;
        }
        next();
    };
};
exports.requirePermission = requirePermission;
const requireAnyPermission = (permissionCodes) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } });
            return;
        }
        const hasAny = permissionCodes.some((code) => req.user.permissions.includes(code));
        if (!hasAny) {
            res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Permission denied" } });
            return;
        }
        next();
    };
};
exports.requireAnyPermission = requireAnyPermission;
const requireAllPermissions = (permissionCodes) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } });
            return;
        }
        const hasAll = permissionCodes.every((code) => req.user.permissions.includes(code));
        if (!hasAll) {
            res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Permission denied" } });
            return;
        }
        next();
    };
};
exports.requireAllPermissions = requireAllPermissions;
exports.isStudent = (0, exports.requireRole)([client_1.Role.STUDENT]);
exports.isTeacher = (0, exports.requireRole)([client_1.Role.TEACHER]);
exports.isDelegate = (0, exports.requireRole)([client_1.Role.DELEGATE]);
exports.isSpecialiteChef = (0, exports.requireRole)([client_1.Role.SPECIALITE_CHEF]);
exports.isDepartmentChef = (0, exports.requireRole)([client_1.Role.DEPARTEMENT_CHEF]);
exports.isFacultyAdmin = (0, exports.requireRole)([client_1.Role.ADMIN_FACULTY]);
exports.isSuperAdmin = (0, exports.requireRole)([client_1.Role.ADMIN_SUPER]);
exports.isAssignmentManager = (0, exports.requireRole)([client_1.Role.ASSIGNMENT_MANAGER]);
exports.isCommitteeMember = (0, exports.requireRole)([client_1.Role.COMMITTEE_MEMBER]);
exports.isCommitteePresident = (0, exports.requireRole)([client_1.Role.COMMITTEE_PRESIDENT]);
exports.isAdmin = (0, exports.requireAnyPermission)(["users:create", "users:edit", "users:delete"]);
exports.canManageUsers = (0, exports.requireAnyPermission)(["users:create", "users:edit", "users:delete"]);
exports.canManageRoles = (0, exports.requireAnyPermission)(["roles:create", "roles:edit", "roles:assign"]);
//# sourceMappingURL=auth.middleware.js.map