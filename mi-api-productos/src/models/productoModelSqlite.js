const db = require('../config/sqliteDb');

/**
 * Valida y normaliza el producto. Mantiene los mismos mensajes que el modelo JSON.
 */
const validar = (producto) => {
  if (!producto || typeof producto !== 'object' || Array.isArray(producto)) {
    const err = new Error('Se esperaba un objeto con nombre y precio');
    err.status = 400;
    throw err;
  }

  const { nombre, precio, stock } = producto;

  if (!nombre || precio === undefined) {
    const err = new Error('nombre y precio son obligatorios');
    err.status = 400;
    throw err;
  }

  return {
    nombre,
    precio: Number(precio),
    stock: Number(stock ?? 0),
  };
};

const getAll = async () => {
  return db.prepare('SELECT * FROM productos').all();
};

const getById = async (id) => {
  return db.prepare('SELECT * FROM productos WHERE id = ?').get(id) || null;
};

const create = async (producto) => {
  const datos = validar(producto);

  const stmt = db.prepare('INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)');
  const info = stmt.run(datos.nombre, datos.precio, datos.stock);

  return { id: info.lastInsertRowid, ...datos };
};

const update = async (id, cambios) => {
  if (!cambios || typeof cambios !== 'object' || Array.isArray(cambios)) {
    const err = new Error('Se esperaba un objeto con nombre y precio');
    err.status = 400;
    throw err;
  }

  const actual = await getById(id);
  if (!actual) {
    return null;
  }

  const datos = validar({ ...actual, ...cambios, id: actual.id });

  db.prepare('UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?').run(
    datos.nombre,
    datos.precio,
    datos.stock,
    actual.id
  );

  return { id: actual.id, ...datos };
};

const remove = async (id) => {
  const info = db.prepare('DELETE FROM productos WHERE id = ?').run(id);
  return info.changes > 0;
};

module.exports = { getAll, getById, create, update, remove };