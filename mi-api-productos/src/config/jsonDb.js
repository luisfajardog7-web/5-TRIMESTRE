const fs = require('fs/promises');
const path = require('path');

const filePath = path.join(process.cwd(), 'data', 'productos.json');

const asegurarArchivo = async () => {
  try {
    const stats = await fs.stat(filePath);
    if (stats.size === 0) {
      console.log('🆕 Archivo JSON vacío, reiniciando a []');
      await fs.writeFile(filePath, '[]', 'utf-8');
    }
  } catch {
    console.log('🆕 Archivo JSON no existe, creándolo con []');
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, '[]', 'utf-8');
  }
};

const leerDatos = async () => {
  await asegurarArchivo();
  const buffer = await fs.readFile(filePath);
  let texto = buffer.toString('utf-8');

  if (texto.charCodeAt(0) === 0xfeff) texto = texto.slice(1);
  if (texto.charCodeAt(0) === 0xfffe) texto = texto.slice(1);
  if (texto.trim() === '') return [];

  try {
    return JSON.parse(texto);
  } catch (error) {
    console.error('⚠️ JSON corrupto, reiniciando archivo.');
    await fs.writeFile(filePath, '[]', 'utf-8');
    return [];
  }
};

const escribirDatos = async (datos) => {
  await fs.writeFile(filePath, JSON.stringify(datos, null, 2), 'utf-8');
};

const inicializarDB = async () => {
  await asegurarArchivo();
  console.log('✅ JSON DB lista en:', filePath);
};

module.exports = { inicializarDB, leerDatos, escribirDatos };