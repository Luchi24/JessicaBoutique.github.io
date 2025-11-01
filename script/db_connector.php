<?php
// script/db_connector.php

// 1. CONFIGURACIÓN DE LA CONEXIÓN A LA BASE DE DATOS
// NOTA: Asegúrate de que tu XAMPP esté corriendo y MySQL esté activo.
$servername = "localhost"; // Generalmente 'localhost' en XAMPP
$username = "root";        // Usuario por defecto de XAMPP
$password = "";            // Contraseña por defecto de XAMPP (vacía)
$dbname = "jessicaboutique"; // Nombre que le darás a tu base de datos

// 2. RECIBIR DATOS DEL FRONTEND (JavaScript)
header('Content-Type: application/json');
$datos_json = file_get_contents('php://input');
$datos = json_decode($datos_json, true);

$accion = $datos['accion'] ?? '';

$respuesta = ['estado' => 'error', 'mensaje' => 'Operación no válida.'];

// 3. ESTABLECER CONEXIÓN
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar la conexión
if ($conn->connect_error) {
    $respuesta['mensaje'] = "Error de conexión a la BD: " . $conn->connect_error;
    echo json_encode($respuesta);
    exit();
}

// 4. MANEJAR ACCIÓN DE CREAR PRODUCTO
if ($accion === 'crearProducto' && $datos) {
    // Validar y sanear datos
    $nombre = $conn->real_escape_string($datos['nombre']);
    $stock = (int)$datos['stock'];
    $precio = (float)$datos['precio'];
    $id_categoria = (int)$datos['id_categoria'];
    
    // Consulta SQL para insertar
    $sql = "INSERT INTO Productos (nombre, stock_actual, precio_venta, id_categoria) 
            VALUES ('$nombre', $stock, $precio, $id_categoria)";
    
    if ($conn->query($sql) === TRUE) {
        $respuesta['estado'] = 'ok';
        $respuesta['mensaje'] = "Producto '$nombre' guardado con éxito en la base de datos.";
        $respuesta['id_insertado'] = $conn->insert_id;
    } else {
        $respuesta['mensaje'] = "Error al insertar producto: " . $conn->error;
    }
} 
// Aquí se agregarían 'eliminarProducto', 'editarProducto', etc.

$conn->close();

echo json_encode($respuesta);
?>