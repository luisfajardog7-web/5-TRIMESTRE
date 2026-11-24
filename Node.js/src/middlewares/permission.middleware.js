// src/middlewares/permission.middleware.js
const { Module, Permission, RoleModulePermission, UserRole } = require('../models');
const { fail } = require('../utils/response');

/**
 * Middleware factory.
 * Uso: router.get('/x', authRequired, permissionRequired('PQRS', 'view'), handler)
 *
 * El token trae user_role_id; role_module_permission trabaja con role_id.
 * Por eso primero resolvemos el role_id activo y luego verificamos el grant.
 */
function permissionRequired(moduleName, permissionName) {
  return async (req, res, next) => {
    try {
      const { user_role_id } = req.auth || {};
      if (!user_role_id) {
        return fail(res, 'No hay rol activo en el token', 401);
      }

      // 1) user_role_id (token) → role_id (tabla nueva)
      const activeRole = await UserRole.findOne({
        where: { id: user_role_id, status_id: 1 },
        attributes: ['role_id'],
      });
      if (!activeRole) {
        return fail(res, 'El rol activo del token ya no es válido', 401);
      }

      // 2) Resolver módulo y permiso por nombre
      const [mod, perm] = await Promise.all([
        Module.findOne({ where: { name: moduleName, is_active: 1 }, attributes: ['id', 'name'] }),
        Permission.findOne({ where: { name: permissionName }, attributes: ['id', 'name'] }),
      ]);

      if (!mod) return fail(res, `Módulo "${moduleName}" no existe o está inactivo`, 500);
      if (!perm) return fail(res, `Permiso "${permissionName}" no existe`, 500);

      // 3) Verificar asignación en role_module_permission
      const grant = await RoleModulePermission.findOne({
        where: {
          role_id: activeRole.role_id,
          module_id: mod.id,
          permission_id: perm.id,
        },
        attributes: ['id'],
      });

      if (!grant) {
        return fail(
          res,
          `Acceso denegado. Tu rol activo no tiene el permiso "${permissionName}" sobre "${moduleName}".`,
          403
        );
      }

      req.permissionContext = {
        role_id: activeRole.role_id,
        module_id: mod.id,
        module_name: mod.name,
        permission_id: perm.id,
        permission_name: perm.name,
      };
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = { permissionRequired };