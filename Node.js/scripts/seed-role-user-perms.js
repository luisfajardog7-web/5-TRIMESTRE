// scripts/seed-role-user-perms.js
// Siembra permisos básicos al rol "user" (user_role_id=2).
// Idempotente.
require('dotenv').config();
const { Module, Permission, ModuleRoleUser, UserRole, Role } = require('../src/models');

// (module_name, permission_name)
const GRANTS = [
  ['Dashboard', 'view'],
  ['PQRS', 'view'],
  ['PQRS', 'create'],
];

async function run() {
  try {
    const userRole = await UserRole.findOne({
      where: { role_id: 2, status_id: 1 }, // rol "user" activo
      include: [{ model: Role, as: 'role', attributes: ['name'] }],
    });
    if (!userRole) {
      console.error('❌ No existe user_role activo con role_id=2 (user)');
      process.exitCode = 1;
      return;
    }
    console.log(`✅ user_role encontrado: id=${userRole.id} (rol "${userRole.role.name}")`);

    for (const [moduleName, permissionName] of GRANTS) {
      const mod = await Module.findOne({ where: { name: moduleName } });
      const perm = await Permission.findOne({ where: { name: permissionName } });
      if (!mod || !perm) {
        console.log(`⚠️  Saltado (no encontrado): ${moduleName} + ${permissionName}`);
        continue;
      }
      const [, created] = await ModuleRoleUser.findOrCreate({
        where: {
          user_role_id: userRole.id,
          module_id: mod.id,
          permission_id: perm.id,
        },
        defaults: {},
      });
      console.log(`${created ? '➕' : 'ℹ️ '} ${moduleName} + ${permissionName} ${created ? 'agregado' : 'ya existe'}`);
    }
    console.log('\n🎉 Seed de permisos para rol "user" completo');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exitCode = 1;
  } finally {
    await require('../src/models').sequelize.close();
  }
}

run();