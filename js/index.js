// js/index.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de inicio cargada');
    
    // Ejemplo: Botón de recargar dashboard
    const btnRecargar = document.getElementById('btnRecargar');
    if (btnRecargar) {
        btnRecargar.addEventListener('click', function() {
            Sistema.mostrarMensaje('info', 'Recargando datos...', 2000);
            // Aquí iría la lógica para recargar los datos del dashboard
            setTimeout(() => {
                Sistema.mostrarMensaje('success', 'Datos actualizados correctamente');
            }, 1000);
        });
    }
    
    // Cargar datos del dashboard
    cargarDashboard();
});

function cargarDashboard() {
    // Simular carga de datos
    setTimeout(() => {
        // Actualizar las tarjetas con datos de ejemplo
        document.getElementById('totalProductos').textContent = '150';
        document.getElementById('ventasDia').textContent = 'S/. 1,250.50';
        document.getElementById('stockBajo').textContent = '8';
        document.getElementById('productoTendencia').textContent = 'Vestido Lila';
        
        // Actualizar tabla de últimas ventas
        const tablaVentas = document.getElementById('ultimasVentas');
        if (tablaVentas) {
            tablaVentas.innerHTML = `
                <tr>
                    <td>María González</td>
                    <td>2 productos</td>
                    <td>S/. 189.98</td>
                    <td>2024-01-15</td>
                </tr>
                <tr>
                    <td>Carlos López</td>
                    <td>1 producto</td>
                    <td>S/. 89.99</td>
                    <td>2024-01-14</td>
                </tr>
            `;
        }
        
        // Actualizar tabla de productos con stock bajo
        const tablaStockBajo = document.getElementById('productosStockBajo');
        if (tablaStockBajo) {
            tablaStockBajo.innerHTML = `
                <tr>
                    <td>Blusa Rosada</td>
                    <td>Blusas</td>
                    <td>3</td>
                    <td>5</td>
                    <td><a href="agregar-producto.html?id=2" class="btn btn-warning btn-sm">Reponer</a></td>
                </tr>
            `;
        }
    }, 500);
}