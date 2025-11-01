// =================================================================================
// Archivo: script/layout.js
// Propósito: Define el layout del encabezado y menú principal para inyectarlo
//            en todos los archivos HTML.
// =================================================================================

const LAYOUT_MENU_HTML = `
    <header>
        <h1>🎀 Jessica Boutique | Panel de Control 🎀</h1>
    </header>

    <nav>
        <a href="index.html">🏠 Inicio</a>
        <a href="inventario.html">📦 Inventario</a>
        <a href="ventas.html">💰 Registrar Venta</a>
        <a href="reportes.html">📈 Reportes</a>
    </nav>
`;

/**
 * Función que inyecta el layout de navegación al inicio del body.
 * También añade un elemento para el contenido si es necesario.
 */
function inyectarLayout(paginaActual) {
    const body = document.body;
    
    // Crear un contenedor temporal para el menú y el header
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = LAYOUT_MENU_HTML;
    
    // Inyectar Header y Nav al inicio del body
    while (tempDiv.firstChild) {
        body.insertBefore(tempDiv.firstChild, body.firstChild);
    }

    // Opcional: Marcar el enlace activo
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        // Obtenemos el nombre del archivo del enlace (ej: 'index.html')
        const linkFile = link.getAttribute('href');
        
        // Si el nombre del archivo coincide con la página actual, lo marcamos
        if (paginaActual.includes(linkFile)) {
            link.style.backgroundColor = '#e65a9e'; // Estilo para el botón activo
            link.style.borderRadius = '5px';
        }
    });
}

// Determinar la página actual para marcar el menú activo
const rutaActual = window.location.pathname;
const paginaActual = rutaActual.substring(rutaActual.lastIndexOf('/') + 1);

// Llamar a la función al cargar el script
document.addEventListener('DOMContentLoaded', () => {
    inyectarLayout(paginaActual);
});