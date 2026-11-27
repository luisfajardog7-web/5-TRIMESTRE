<?php

/**
 * API REST de Tareas con JWT — PHP Nativo
 *
 * Rutas:
 *   POST   /login           -> genera el token JWT
 *   GET    /tareas          -> lista las tareas (protegida)
 *   POST   /tareas          -> crea una tarea (protegida)
 *   PUT    /tareas/{id}     -> actualiza una tarea (protegida)
 *   DELETE /tareas/{id}     -> elimina una tarea (protegida)
 *
 * Ejecución:
 *   php -S localhost:8000 index.php
 */

require __DIR__ . '/vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

define('SECRET_KEY', 'mi_clave_secreta_ultrasegura_php');
$data_file = __DIR__ . '/data.json';

function leerDatos(string $file): array
{
    if (! file_exists($file)) {
        return [];
    }

    $contenido = file_get_contents($file);

    return json_decode($contenido, true) ?? [];
}

function escribirDatos(string $file, array $data): void
{
    file_put_contents(
        $file,
        json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
    );
}

function enviarRespuesta(int $status_code, array $data): void
{
    http_response_code($status_code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * Cabeceras compatibles con Apache, FPM y el servidor embebido de PHP.
 */
function obtenerHeaders(): array
{
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (is_array($headers)) {
            return $headers;
        }
    }

    $headers = [];
    foreach ($_SERVER as $key => $value) {
        if (strpos($key, 'HTTP_') === 0) {
            $name = str_replace(
                ' ',
                '-',
                ucwords(strtolower(str_replace('_', ' ', substr($key, 5))))
            );
            $headers[$name] = $value;
        }
    }

    return $headers;
}

function buscarHeader(array $headers, string $nombre): string
{
    foreach ($headers as $key => $value) {
        if (strcasecmp($key, $nombre) === 0) {
            return trim((string) $value);
        }
    }

    return '';
}

function leerBody(): array
{
    $raw = file_get_contents('php://input');

    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $input = json_decode($raw, true);

    return is_array($input) ? $input : [];
}

$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
$method      = $_SERVER['REQUEST_METHOD'];

// ---------------------------------------------------------------------------
// LOGIN -> Genera el JWT
// ---------------------------------------------------------------------------
if ($method === 'POST' && strpos($request_uri, '/login') !== false) {
    $input    = leerBody();
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';

    if ($username === 'admin' && $password === '123456') {
        $issuedAt = time();
        $payload  = [
            'iat'  => $issuedAt,
            'exp'  => $issuedAt + 3600,
            'data' => [
                'userId'   => 1,
                'username' => 'admin',
                'role'     => 'administrador',
            ],
        ];

        $jwt = JWT::encode($payload, SECRET_KEY, 'HS256');

        enviarRespuesta(200, [
            'success' => true,
            'status'  => 200,
            'message' => 'Autenticación exitosa. Token generado.',
            'token'   => $jwt,
        ]);
    }

    enviarRespuesta(401, [
        'success' => false,
        'status'  => 401,
        'error'   => 'Unauthorized',
        'message' => 'Credenciales inválidas. Usa username: admin / password: 123456',
    ]);
}

// ---------------------------------------------------------------------------
// VERIFICACIÓN DEL JWT
// ---------------------------------------------------------------------------
$headers    = obtenerHeaders();
$authHeader = buscarHeader($headers, 'Authorization');

if ($authHeader === '') {
    enviarRespuesta(401, [
        'success' => false,
        'status'  => 401,
        'error'   => 'Unauthorized',
        'message' => 'Cabecera de autorización (Authorization) faltante',
    ]);
}

$jwt = null;
if (preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
    $jwt = trim($matches[1]);
}

if (! $jwt) {
    enviarRespuesta(401, [
        'success' => false,
        'status'  => 401,
        'error'   => 'Unauthorized',
        'message' => 'Formato de token inválido. Use: Bearer <token>',
    ]);
}

try {
    $decoded       = JWT::decode($jwt, new Key(SECRET_KEY, 'HS256'));
    $usuarioActual = $decoded->data;
} catch (Exception $e) {
    enviarRespuesta(401, [
        'success' => false,
        'status'  => 401,
        'error'   => 'Unauthorized',
        'message' => 'Token inválido o expirado',
        'detalle' => $e->getMessage(),
    ]);
}

// ---------------------------------------------------------------------------
// ROUTING CRUD /tareas
// ---------------------------------------------------------------------------
if (strpos($request_uri, '/tareas') === false) {
    enviarRespuesta(404, [
        'success' => false,
        'status'  => 404,
        'error'   => 'Not Found',
        'message' => 'Ruta no encontrada',
    ]);
}

preg_match('/\/tareas\/([0-9]+)/', $request_uri, $matches);
$id     = isset($matches[1]) ? intval($matches[1]) : null;
$tareas = leerDatos($data_file);

switch ($method) {
    case 'GET':
        enviarRespuesta(200, [
            'success' => true,
            'status'  => 200,
            'mensaje' => "Acceso concedido para usuario: {$usuarioActual->username}",
            'total'   => count($tareas),
            'data'    => $tareas,
        ]);
        break;

    case 'POST':
        $input  = leerBody();
        $titulo = trim($input['titulo'] ?? '');

        if ($titulo === '') {
            enviarRespuesta(400, [
                'success' => false,
                'status'  => 400,
                'error'   => 'Bad Request',
                'message' => "El campo 'titulo' es obligatorio",
            ]);
        }

        $nuevoId    = count($tareas) > 0 ? max(array_column($tareas, 'id')) + 1 : 1;
        $nuevaTarea = [
            'id'         => $nuevoId,
            'titulo'     => $titulo,
            'completado' => false,
        ];

        $tareas[] = $nuevaTarea;
        escribirDatos($data_file, $tareas);

        enviarRespuesta(201, [
            'success' => true,
            'status'  => 201,
            'message' => 'Tarea creada con éxito',
            'data'    => $nuevaTarea,
        ]);
        break;

    case 'PUT':
        if (! $id) {
            enviarRespuesta(400, [
                'success' => false,
                'status'  => 400,
                'error'   => 'Bad Request',
                'message' => 'Se requiere ID de la tarea',
            ]);
        }

        $input      = leerBody();
        $encontrado = false;

        foreach ($tareas as &$tarea) {
            if ($tarea['id'] === $id) {
                if (isset($input['titulo'])) {
                    $tarea['titulo'] = trim($input['titulo']);
                }
                if (isset($input['completado'])) {
                    $tarea['completado'] = filter_var($input['completado'], FILTER_VALIDATE_BOOLEAN);
                }
                $encontrado        = true;
                $tareaActualizada  = $tarea;
                break;
            }
        }
        unset($tarea);

        if (! $encontrado) {
            enviarRespuesta(404, [
                'success' => false,
                'status'  => 404,
                'error'   => 'Not Found',
                'message' => "No se encontró la tarea con ID {$id}",
            ]);
        }

        escribirDatos($data_file, $tareas);

        enviarRespuesta(200, [
            'success' => true,
            'status'  => 200,
            'message' => 'Tarea actualizada correctamente',
            'data'    => $tareaActualizada,
        ]);
        break;

    case 'DELETE':
        if (! $id) {
            enviarRespuesta(400, [
                'success' => false,
                'status'  => 400,
                'error'   => 'Bad Request',
                'message' => 'Se requiere ID de la tarea',
            ]);
        }

        $encontradoIndex = -1;
        foreach ($tareas as $index => $tarea) {
            if ($tarea['id'] === $id) {
                $encontradoIndex = $index;
                break;
            }
        }

        if ($encontradoIndex === -1) {
            enviarRespuesta(404, [
                'success' => false,
                'status'  => 404,
                'error'   => 'Not Found',
                'message' => "No se encontró la tarea con ID {$id}",
            ]);
        }

        $tareaEliminada = array_splice($tareas, $encontradoIndex, 1);
        escribirDatos($data_file, $tareas);

        enviarRespuesta(200, [
            'success' => true,
            'status'  => 200,
            'message' => 'Tarea eliminada con éxito',
            'data'    => $tareaEliminada[0],
        ]);
        break;

    default:
        enviarRespuesta(405, [
            'success' => false,
            'status'  => 405,
            'error'   => 'Method Not Allowed',
            'message' => "El método {$method} no está permitido en esta ruta",
        ]);
}