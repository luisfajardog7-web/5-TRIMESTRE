const { pool } = require('../config/mysqlDb');

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
  const [rows] = await pool.query('SELECT * FROM productos');
  return rows;
};

const getById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM productos WHERE id = ?', [id]);
  return rows[0] || null;
};

const create = async (producto) => {
  const datos = validar(producto);
  const query = 'INSERT INTO productos(nombre, precio, stock) VALUES (?, ?, ?)';
  console.log('Consulta', query);
  const [result] = await pool.execute(query, [datos.nombre, datos.precio, datos.stock]);

  return { id: result.insertId, ...datos };
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

  await pool.execute('UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?', [
    datos.nombre,
    datos.precio,
    datos.stock,
    actual.id,
  ]);

  return { id: actual.id, ...datos };
};

const remove = async (id) => {
  const [result] = await pool.execute('DELETE FROM productos WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

module.exports = { getAll, getById, create, update, remove };