// Script para cargar el header/sidebar en todas las páginas
document.addEventListener('DOMContentLoaded', function() {
    // Determinar página actual
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Crear estructura del sidebar
    const sidebarHTML = `
        <div class="sidebar">
            <div class="logo-container">
                <div class="logo-icon">
                    <i class="fas fa-store"></i>
                </div>
                <div class="logo-text">
                    <h1>Jessica Boutique</h1>
                    <span>Sistema de Gestión</span>
                </div>
            </div>
            
            <div class="nav-menu">
                <a href="index.html" class="nav-item ${currentPage === 'index.html' ? 'active' : ''}">
                    <i class="fas fa-home"></i>
                    <span>Inicio</span>
                </a>
                <a href="inventario.html" class="nav-item ${currentPage === 'inventario.html' ? 'active' : ''}">
                    <i class="fas fa-boxes"></i>
                    <span>Inventario</span>
                </a>
                <a href="agregar-producto.html" class="nav-item ${currentPage === 'agregar-producto.html' ? 'active' : ''}">
                    <i class="fas fa-plus-circle"></i>
                    <span>Agregar Producto</span>
                </a>
                <a href="ventas.html" class="nav-item ${currentPage === 'ventas.html' ? 'active' : ''}">
                    <i class="fas fa-shopping-cart"></i>
                    <span>Ventas</span>
                </a>
                <a href="reportes.html" class="nav-item ${currentPage === 'reportes.html' ? 'active' : ''}">
                    <i class="fas fa-chart-line"></i>
                    <span>Reportes</span>
                </a>
                <a href="gestion.html" class="nav-item ${currentPage === 'gestion.html' ? 'active' : ''}">
                    <i class="fas fa-cog"></i>
                    <span>Configuración</span>
                </a>
            </div>
            
            <div class="nav-footer">
                <span>© 2024 Jessica Boutique</span>
            </div>
        </div>
        
        <div class="main-content">
            <!-- El contenido específico de cada página irá aquí -->
        </div>
    `;
    
    // Insertar el sidebar en el body
    document.body.innerHTML = sidebarHTML + document.body.innerHTML;
    
    // Mover el contenido existente al main-content
    const mainContent = document.querySelector('.main-content');
    const container = document.querySelector('.container') || document.createElement('div');
    
    if (container.className.includes('container')) {
        const allElements = Array.from(document.body.children);
        
        allElements.forEach(element => {
            if (!element.classList.contains('sidebar') && !element.classList.contains('main-content')) {
                mainContent.appendChild(element);
            }
        });
    }
    
    // Añadir notificaciones container si no existe
    if (!document.getElementById('notificaciones')) {
        const notificationsDiv = document.createElement('div');
        notificationsDiv.id = 'notificaciones';
        notificationsDiv.className = 'notifications';
        document.body.appendChild(notificationsDiv);
    }
});