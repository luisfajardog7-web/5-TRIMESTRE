// src/middlewares/permission.middleware.js
const { Module, Permission, ModuleRoleUser } = require('../models');
const { fail } = require('../utils/response');

/**
 * Middleware factory.
 * Uso: router.post('/', authRequired, permissionRequired('Usuarios', 'create'), handler)
 *
 * Requiere que `authRequired` haya corrido antes para tener req.auth.user_role_id.
 * Verifica que el user_role activo tenga el (module, permission) en module_role_user.
 */
function permissionRequired(moduleName, permissionName) {
  return async (req, res, next) => {
    try {
      const { user_role_id } = req.auth || {};
      if (!user_role_id) {
        return fail(res, 'No hay rol activo en el token', 401);
      }

      // 1. Resolver module y permission por nombre
      const [mod, perm] = await Promise.all([
        Module.findOne({ where: { name: moduleName, is_active: 1 }, attributes: ['id', 'name'] }),
        Permission.findOne({ where: { name: permissionName }, attributes: ['id', 'name'] }),
      ]);

      if (!mod) return fail(res, `Módulo "${moduleName}" no existe o está inactivo`, 500);
      if (!perm) return fail(res, `Permiso "${permissionName}" no existe`, 500);

      // 2. Verificar asignación
      const grant = await ModuleRoleUser.findOne({
        where: {
          user_role_id,
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

      // Adjuntar para inspección si algún controlador lo necesita
      req.permissionContext = {
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