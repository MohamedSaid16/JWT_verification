import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth.middleware'
import { RoleService } from '../services/role.service'

const roleService = new RoleService()

export const requirePermission = (permissionCode: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        })
        return
      }

      const hasPermission = await roleService.checkUserPermission(
        req.user.id,
        permissionCode
      )

      if (!hasPermission) {
        res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Permission denied' },
        })
        return
      }

      next()
      return
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error checking permissions' },
      })
      return
    }
  }
}

export const requireAnyPermission = (permissionCodes: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        })
        return
      }

      const permissions = await roleService.getUserPermissions(req.user.id)
      const hasAny = permissionCodes.some(code => permissions.includes(code))

      if (!hasAny) {
        res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Permission denied' },
        })
        return
      }

      next()
      return
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error checking permissions' },
      })
      return
    }
  }
}