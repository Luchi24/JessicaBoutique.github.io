<?php
// script/server.php

header('Content-Type: application/json');
// Permitir solicitudes CORS (necesario si el frontend y el backend están en dominios diferentes)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// La base de datos SIMULADA estaría aquí.

$metodo = $_SERVER['REQUEST_METHOD'];

// Leer los datos de entrada JSON
$datos_json = file_get_contents('php://input');
$datos = json_decode($datos_json, true);

$respuesta = [
    'estado' => 'error',
    'mensaje' => 'Método no soportado o acción desconocida.'
];

switch ($metodo) {
    case 'POST':
        // Simular la CREACIÓN o EDICIÓN de un producto o categoría
        if (isset($datos['nombre']) && isset($datos['id_categoria'])) {
            // Lógica de Producto
            if (isset($datos['id']) && !empty($datos['id'])) {
                // Simulación: Producto ID {$datos['id']} editado en la base de datos.
                $respuesta = ['estado' => 'ok', 'mensaje' => 'Producto actualizado (SIMULADO).', 'datos_recibidos' => $datos];
            } else {
                // Simulación: Nuevo producto agregado a la base de datos.
                $respuesta = ['estado' => 'ok', 'mensaje' => 'Producto creado (SIMULADO).', 'datos_recibidos' => $datos];
            }
        } elseif (isset($datos['accion']) && $datos['accion'] === 'crearCategoria') {
            // Lógica de Categoría
            // Simulación: Categoría creada en la base de datos.
             $respuesta = ['estado' => 'ok', 'mensaje' => 'Categoría creada (SIMULADO).', 'datos_recibidos' => $datos];
        }
        break;

    case 'DELETE':
        // Simular la ELIMINACIÓN
        $respuesta = ['estado' => 'ok', 'mensaje' => 'Registro eliminado (SIMULADO).'];
        break;

    case 'GET':
        // Simular la LECTURA (Obtener todos los productos)
        // En un entorno real, aquí se haría una consulta a la BD.
        $productos_simulados = [
            ['id' => 10, 'nombre' => 'Vestido Floral', 'stock' => 5, 'precio' => 89.90, 'id_categoria' => 1],
        ];
        $respuesta = ['estado' => 'ok', 'mensaje' => 'Datos obtenidos (SIMULADO).', 'data' => $productos_simulados];
        break;
}

echo json_encode($respuesta);
?>