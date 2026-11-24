# PQRS Backend

API REST del sistema PQRS — Node.js + Express + Sequelize + MySQL.

## Requisitos

- Node.js >= 18
- MySQL / MariaDB con la base `pqrs_system` volcada

## Instalación

1. `npm install`
2. Copiar `.env.example` a `.env` y ajustar credenciales reales + `JWT_SECRET` (32+ chars)
3. `npm run dev`
4. Verificar: `http://localhost:3000/api/v1/health`

## Scripts

| Comando         | Descripción                          |
| --------------- | ------------------------------------- |
| `npm run dev` | Servidor en modo desarrollo (nodemon) |
| `npm start`   | Servidor en modo producción          |

## Estado

- [X] 1.1 Estructura y archivos base
- [X] 1.2 Config (env + database)
- [X] 1.3 app.js + server.js (health check)
- [X] 1.4 Ajustes BD (is_internal + user_role_id)
- [X] 1.5 Modelos Sequelize
- [X] 1.6 Utils + middlewares base
- [X] 1.7 Auth (login, me, select-role)
- [X] 1.8 Swagger + Postman + fix-seed



## Esquema de permisos

Los permisos se otorgan **al rol**, no al usuario. Fuente de verdad: `role_module_permission`.

- `role_module_permission(role_id, module_id, permission_id)` — permisos del rol.
- Un usuario hereda todos los permisos de su rol activo.
- Si un usuario necesita permisos distintos, se le asigna otro rol.
- `module_role_user` fue eliminada (obsoleta).

### Reset del esquema

El reset ya está aplicado en la base de datos final. No se incluye `db/pqrs_system_2.sql` ni el script `db:migrate`, porque la BD definitiva ya trae `role_module_permission` y la tabla vieja ya no existe.

### Verificación

| Etapa         | Salida esperada                                                                            |
| ------------- | ------------------------------------------------------------------------------------------ |
| **R1**  | Confirmación de `backup_pre-reset.sql`                                                  |
| **R3**  | Salida del SQL (resumen por rol)                                                           |
| **R4**  | 4 comandos de verificación (tabla vieja vacía, `DESCRIBE`, `SHOW CREATE`, `COUNT`) |
| **R6**  | `node -e ...` con `RoleModulePermission: true \| ModuleRoleUser: false`                 |
| **R9**  | Arranque del servidor (4 mensajes)                                                         |
| **R10** | Admin 6×200. juan: `pqrs-types`/`pqrs-status` 200, el resto 403                       |
| **R11** | `SELECT role_id, COUNT(*)` → `1→21, 2→3`                                            |

Con esas salidas verdes, el esquema queda finalizado y pasamos a **2.2 — CRUD Roles completo** con la nueva tabla.
