
# PQRS Backend API

API REST del sistema PQRS (Peticiones, Quejas, Reclamos y Sugerencias) construida con Node.js, Express, Sequelize y MySQL.

## 🚀 Tecnologías

- **Node.js** v18+ / **Express** 4
- **Sequelize** (ORM) + **MySQL** / MariaDB
- **JWT** para autenticación
- **Zod** para validación de datos
- **Swagger** para documentación

## 🛠️ Instalación

1. `npm install`
2. Copiar `.env.example` a `.env` y configurar credenciales.
3. Ejecutar migraciones y seeds:
   ```bash
   npm run db:migrate      # Ajustes de tablas base (role_module_permission)
   npm run fix:seed        # Resetea contraseñas de admin/juan a 'admin123'
   npm run seed:manager    # Crea rol manager y usuario 'carlos' (carlos123)
   ```
