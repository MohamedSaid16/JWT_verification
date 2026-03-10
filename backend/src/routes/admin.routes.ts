import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import { requirePermission } from '../middlewares/permission.middleware'
import { RoleService } from '../services/role.service'

const router = Router()
const roleService = new RoleService()

// Role CRUD
router.post('/roles', authenticate, requirePermission('roles:create'), async (req, res) => {
  try {
    const role = await roleService.createRole(req.body)
    res.json({ success: true, data: role, message: 'Role created' })
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } })
  }
})

router.get('/roles', authenticate, requirePermission('roles:view'), async (req, res) => {
  try {
    const roles = await roleService.getAllRoles()
    res.json({ success: true, data: roles })
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } })
  }
})

router.put('/roles/:id', authenticate, requirePermission('roles:edit'), async (req, res) => {
  try {
    const role = await roleService.updateRole(req.params.id, req.body)
    res.json({ success: true, data: role, message: 'Role updated' })
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } })
  }
})

router.delete('/roles/:id', authenticate, requirePermission('roles:delete'), async (req, res) => {
  try {
    await roleService.deleteRole(req.params.id)
    res.json({ success: true, message: 'Role deleted' })
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } })
  }
})

// Permission assignment
router.post('/roles/:roleId/permissions/:permissionId', 
  authenticate, 
  requirePermission('permissions:manage'),
  async (req, res) => {
    try {
      await roleService.assignPermissionToRole(req.params.roleId, req.params.permissionId)
      res.json({ success: true, message: 'Permission assigned' })
    } catch (error: any) {
      res.status(400).json({ success: false, error: { message: error.message } })
    }
  }
)

router.delete('/roles/:roleId/permissions/:permissionId',
  authenticate,
  requirePermission('permissions:manage'),
  async (req, res) => {
    try {
      await roleService.removePermissionFromRole(req.params.roleId, req.params.permissionId)
      res.json({ success: true, message: 'Permission removed' })
    } catch (error: any) {
      res.status(400).json({ success: false, error: { message: error.message } })
    }
  }
)

// User role assignment
router.post('/users/:userId/roles/:roleId',
  authenticate,
  requirePermission('roles:assign'),
  async (req, res) => {
    try {
      await roleService.assignRoleToUser(req.params.userId, req.params.roleId, req.user?.id)
      res.json({ success: true, message: 'Role assigned to user' })
    } catch (error: any) {
      res.status(400).json({ success: false, error: { message: error.message } })
    }
  }
)

router.delete('/users/:userId/roles/:roleId',
  authenticate,
  requirePermission('roles:assign'),
  async (req, res) => {
    try {
      await roleService.removeRoleFromUser(req.params.userId, req.params.roleId)
      res.json({ success: true, message: 'Role removed from user' })
    } catch (error: any) {
      res.status(400).json({ success: false, error: { message: error.message } })
    }
  }
)

export default router