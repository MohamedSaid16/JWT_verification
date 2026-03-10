import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { JWT_ACCESS_SECRET, ACCESS_TOKEN_COOKIE_NAME } from "../config/auth";
import prisma from "../config/database";
import { RoleService } from "../services/role.service";

const roleService = new RoleService();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    roles: string[];
    permissions: string[];
    mustChangePassword: boolean;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.[ACCESS_TOKEN_COOKIE_NAME] || req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
      return;
    }

    const payload = jwt.verify(token, JWT_ACCESS_SECRET) as { sub: string; email: string };

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
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
      mustChangePassword: user.mustChangePassword,
    };

    if (user.mustChangePassword) {
      const isChangingPassword =
        req.method === "POST" && req.originalUrl.includes("/change-password");
      const isLoggingOut = req.originalUrl.includes("/logout");
      if (!isChangingPassword && !isLoggingOut) {
        res.status(403).json({
          success: false,
          error: {
            code: "PASSWORD_CHANGE_REQUIRED",
            message: "You must change your password before accessing this resource.",
            requiresPasswordChange: true,
          },
        });
        return;
      }
    }

    next();
  } catch (_error) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Invalid or expired token" },
    });
  }
};

export const requireAuth = authenticate;

export const requireEmailVerified = async (_req: AuthRequest, _res: Response, next: NextFunction) => {
  // Email verification flag is not part of the current schema.
  next();
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
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

export const requirePermission = (permissionCode: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
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

export const requireAnyPermission = (permissionCodes: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } });
      return;
    }

    const hasAny = permissionCodes.some((code) => req.user!.permissions.includes(code));
    if (!hasAny) {
      res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Permission denied" } });
      return;
    }

    next();
  };
};

export const requireAllPermissions = (permissionCodes: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } });
      return;
    }

    const hasAll = permissionCodes.every((code) => req.user!.permissions.includes(code));
    if (!hasAll) {
      res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Permission denied" } });
      return;
    }

    next();
  };
};

export const isStudent = requireRole([Role.STUDENT]);
export const isTeacher = requireRole([Role.TEACHER]);
export const isDelegate = requireRole([Role.DELEGATE]);
export const isSpecialiteChef = requireRole([Role.SPECIALITE_CHEF]);
export const isDepartmentChef = requireRole([Role.DEPARTEMENT_CHEF]);
export const isFacultyAdmin = requireRole([Role.ADMIN_FACULTY]);
export const isSuperAdmin = requireRole([Role.ADMIN_SUPER]);
export const isAssignmentManager = requireRole([Role.ASSIGNMENT_MANAGER]);
export const isCommitteeMember = requireRole([Role.COMMITTEE_MEMBER]);
export const isCommitteePresident = requireRole([Role.COMMITTEE_PRESIDENT]);

export const isAdmin = requireAnyPermission(["users:create", "users:edit", "users:delete"]);
export const canManageUsers = requireAnyPermission(["users:create", "users:edit", "users:delete"]);
export const canManageRoles = requireAnyPermission(["roles:create", "roles:edit", "roles:assign"]);
