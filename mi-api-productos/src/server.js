const app = require('./app');

// MOMENTO 1 — JSON
const { inicializarDB } = require('./config/jsonDb');

// MOMENTO 2 — SQLite (activo)
require('./config/sqliteDb');

// MOMENTO 3 — MySQL
//const { initDB } = require('./config/mysqlDb');

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    //await inicializarDB(); // solo Momento 1
    // await initDB();        // solo Momento 3

    app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
  } catch (error) {
    console.error('❌ Error al iniciar:', error.message);
    process.exit(1);
  }
};

start();