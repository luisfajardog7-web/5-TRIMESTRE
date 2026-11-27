const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = 'mi_clave_secreta_ultrasegura_node';
const DATA_FILE = path.join(__dirname, 'data.json');

const leerDatos = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
};

const escribirDatos = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

// LOGIN -> Genera el Token JWT
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (username === 'admin' && password === '123456') {
        const payload = { userId: 1, username: 'admin', role: 'administrador' };
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });

        return res.status(200).json({
            success: true,
            status: 200,
            message: 'Autenticación exitosa. Token generado.',
            token: token
        });
    }

    return res.status(401).json({
        success: false,
        status: 401,
        error: 'Unauthorized',
        message: 'Credenciales inválidas. Usa username: admin / password: 123456'
    });
});

// Middleware de verificación de Token
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            status: 401,
            error: 'Unauthorized',
            message: 'Cabecera de autorización (Authorization) faltante'
        });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            status: 401,
            error: 'Unauthorized',
            message: 'Token no encontrado en la cabecera'
        });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                status: 401,
                error: 'Unauthorized',
                message: 'Token inválido o expirado',
                detalle: err.message
            });
        }
        req.user = decoded;
        next();
    });
};

// CRUD SOBRE JSON
app.get('/api/tareas', verificarToken, (req, res) => {
    const tareas = leerDatos();
    res.status(200).json({
        success: true,
        status: 200,
        mensaje: `Acceso concedido para usuario: ${req.user.username}`,
        total: tareas.length,
        data: tareas
    });
});

app.post('/api/tareas', verificarToken, (req, res) => {
    const { titulo } = req.body;
    if (!titulo) {
        return res.status(400).json({
            success: false,
            status: 400,
            error: 'Bad Request',
            message: 'El campo "titulo" es obligatorio'
        });
    }

    const tareas = leerDatos();
    const nuevaTarea = {
        id: tareas.length > 0 ? tareas[tareas.length - 1].id + 1 : 1,
        titulo,
        completado: false
    };

    tareas.push(nuevaTarea);
    escribirDatos(tareas);

    res.status(201).json({
        success: true,
        status: 201,
        message: 'Tarea creada con éxito',
        data: nuevaTarea
    });
});

app.put('/api/tareas/:id', verificarToken, (req, res) => {
    const id = parseInt(req.params.id);
    const { titulo, completado } = req.body;

    let tareas = leerDatos();
    const index = tareas.findIndex(t => t.id === id);

    if (index === -1) {
        return res.status(404).json({
            success: false,
            status: 404,
            error: 'Not Found',
            message: `No se encontró la tarea con ID ${id}`
        });
    }

    tareas[index] = {
        ...tareas[index],
        titulo: titulo !== undefined ? titulo : tareas[index].titulo,
        completado: completado !== undefined ? completado : tareas[index].completado
    };

    escribirDatos(tareas);

    res.status(200).json({
        success: true,
        status: 200,
        message: 'Tarea actualizada correctamente',
        data: tareas[index]
    });
});

app.delete('/api/tareas/:id', verificarToken, (req, res) => {
    const id = parseInt(req.params.id);
    let tareas = leerDatos();
    const index = tareas.findIndex(t => t.id === id);

    if (index === -1) {
        return res.status(404).json({
            success: false,
            status: 404,
            error: 'Not Found',
            message: `No se encontró la tarea con ID ${id}`
        });
    }

    const tareaEliminada = tareas.splice(index, 1);
    escribirDatos(tareas);

    res.status(200).json({
        success: true,
        status: 200,
        message: 'Tarea eliminada con éxito',
        data: tareaEliminada[0]
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor Node.js corriendo en http://localhost:${PORT}`));