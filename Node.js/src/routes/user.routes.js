// src/routes/user.routes.js
const { Router } = require('express');
const { authRequired } = require('../middlewares/auth.middleware');
const { permissionRequired } = require('../middlewares/permission.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
  createUserSchema,
  updateUserSchema,
  changeStatusSchema,
  changePasswordSchema,
  assignRoleSchema,
} = require('../validators/user.validator');
const userCtl = require('../controllers/security/user.controller');

const router = Router();

/* ===== CRUD Usuarios ===== */
router.get('/',    authRequired, permissionRequired('Usuarios', 'view'),   userCtl.list);
router.get('/:id', authRequired, permissionRequired('Usuarios', 'view'),   userCtl.getOne);
router.post('/',   authRequired, permissionRequired('Usuarios', 'create'), validate(createUserSchema), userCtl.create);
router.put('/:id', authRequired, permissionRequired('Usuarios', 'edit'),   validate(updateUserSchema), userCtl.update);
router.patch('/:id/status',   authRequired, permissionRequired('Usuarios', 'edit'), validate(changeStatusSchema),   userCtl.changeStatus);
router.patch('/:id/password', authRequired, permissionRequired('Usuarios', 'edit'), validate(changePasswordSchema), userCtl.changePassword);
router.delete('/:id', authRequired, permissionRequired('Usuarios', 'delete'), userCtl.remove);

/* ===== Roles del usuario ===== */
router.get('/:id/roles',    authRequired, permissionRequired('Usuarios', 'view'), userCtl.listRoles);
router.post('/:id/roles',   authRequired, permissionRequired('Usuarios', 'edit'), validate(assignRoleSchema), userCtl.assignRole);
router.delete('/:id/roles/:urId', authRequired, permissionRequired('Usuarios', 'edit'), userCtl.revokeRole);

const profileCtl = require('../controllers/security/profile.controller');
const { updateProfileSchema: updateProfileSchema2 } = require('../validators/profile.validator');

router.get('/:id/profile',
  authRequired, permissionRequired('Perfiles', 'view'), profileCtl.getByUser);

router.put('/:id/profile',
  authRequired, permissionRequired('Perfiles', 'edit'),
  validate(updateProfileSchema2), profileCtl.updateByUser);
module.exports = router;