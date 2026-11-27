//const Producto = require('../models/productoModelMysql');

// Cambiar esta línea según el momento del taller:
//const Producto = require('../models/productoModelJson');
const Producto = require('../models/productoModelSqlite');

const listar = async (req, res) => {
  try {
    const productos = await Producto.getAll();
    res.json(productos);
  } catch (error) {
    console.error('❌ Error en listar:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const obtener = async (req, res) => {
  try {
    const producto = await Producto.getById(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    console.error('❌ Error en obtener:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const crear = async (req, res) => {
  try {
    const nuevo = await Producto.create(req.body ?? {});
    res.status(201).json(nuevo);
  } catch (error) {
    console.error('❌ Error en crear:', error.message);
    res.status(error.status || 400).json({ error: error.message || 'Error al crear producto' });
  }
};

const actualizar = async (req, res) => {
  try {
    const actualizado = await Producto.update(req.params.id, req.body ?? {});
    if (!actualizado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(actualizado);
  } catch (error) {
    console.error('❌ Error en actualizar:', error.message);
    res.status(error.status || 400).json({ error: error.message || 'Error al actualizar producto' });
  }
};

const eliminar = async (req, res) => {
  try {
    const eliminado = await Producto.remove(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(204).end();
  } catch (error) {
    console.error('❌ Error en eliminar:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };