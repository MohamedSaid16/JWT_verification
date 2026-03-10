"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const permission_middleware_1 = require("../middlewares/permission.middleware");
const role_service_1 = require("../services/role.service");
const router = (0, express_1.Router)();
const roleService = new role_service_1.RoleService();
// Role CRUD
router.post('/roles', auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)('roles:create'), async (req, res) => {
    try {
        const role = await roleService.createRole(req.body);
        res.json({ success: true, data: role, message: 'Role created' });
    }
    catch (error) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});
router.get('/roles', auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)('roles:view'), async (req, res) => {
    try {
        const roles = await roleService.getAllRoles();
        res.json({ success: true, data: roles });
    }
    catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
});
router.put('/roles/:id', auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)('roles:edit'), async (req, res) => {
    try {
        const role = await roleService.updateRole(req.params.id, req.body);
        res.json({ success: true, data: role, message: 'Role updated' });
    }
    catch (error) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});
router.delete('/roles/:id', auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)('roles:delete'), async (req, res) => {
    try {
        await roleService.deleteRole(req.params.id);
        res.json({ success: true, message: 'Role deleted' });
    }
    catch (error) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});
// Permission assignment
router.post('/roles/:roleId/permissions/:permissionId', auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)('permissions:manage'), async (req, res) => {
    try {
        await roleService.assignPermissionToRole(req.params.roleId, req.params.permissionId);
        res.json({ success: true, message: 'Permission assigned' });
    }
    catch (error) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});
router.delete('/roles/:roleId/permissions/:permissionId', auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)('permissions:manage'), async (req, res) => {
    try {
        await roleService.removePermissionFromRole(req.params.roleId, req.params.permissionId);
        res.json({ success: true, message: 'Permission removed' });
    }
    catch (error) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});
// User role assignment
router.post('/users/:userId/roles/:roleId', auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)('roles:assign'), async (req, res) => {
    try {
        await roleService.assignRoleToUser(req.params.userId, req.params.roleId, req.user?.id);
        res.json({ success: true, message: 'Role assigned to user' });
    }
    catch (error) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});
router.delete('/users/:userId/roles/:roleId', auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)('roles:assign'), async (req, res) => {
    try {
        await roleService.removeRoleFromUser(req.params.userId, req.params.roleId);
        res.json({ success: true, message: 'Role removed from user' });
    }
    catch (error) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});
exports.default = router;
//# sourceMappingURL=admin.routes.js.map