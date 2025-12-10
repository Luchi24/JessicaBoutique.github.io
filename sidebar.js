// sidebar.js - Carga dinámica de la barra lateral
class SidebarLoader {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        
        const pageMap = {
            'index.html': 'dashboard',
            'inventario.html': 'inventario',
            'agregar.html': 'agregar',
            'ventas.html': 'ventas',
            'estadisticas.html': 'estadisticas',
            'proveedores.html': 'proveedores',
            'promociones.html': 'promociones',
            'configuracion.html': 'configuracion'
        };
        
        return pageMap[page] || 'dashboard';
    }

    async init() {
        await this.loadSidebar();
        this.setupSidebarEvents();
        this.updateActiveMenu();
    }

    async loadSidebar() {
        try {
            const response = await fetch('sidebar.html');
            if (!response.ok) {
                throw new Error('No se pudo cargar la barra lateral');
            }
            const html = await response.text();
            
            // Crear contenedor para la sidebar
            const sidebarContainer = document.createElement('div');
            sidebarContainer.id = 'sidebar-container';
            sidebarContainer.innerHTML = html;
            
            // Insertar al inicio del body
            document.body.insertBefore(sidebarContainer, document.body.firstChild);
            
            // Insertar botón de toggle
            const menuToggle = document.createElement('button');
            menuToggle.className = 'menu-toggle';
            menuToggle.id = 'menuToggle';
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            document.body.insertBefore(menuToggle, sidebarContainer);
            
            console.log('Sidebar cargada correctamente');
        } catch (error) {
            console.error('Error cargando la sidebar:', error);
            this.createFallbackSidebar();
        }
    }

    createFallbackSidebar() {
        const sidebarHTML = `
            <nav class="sidebar">
                <div class="logo">
                    <a href="index.html" class="logo-link">
                        <i class="fas fa-store"></i>
                        <h2>Jessica Boutique</h2>
                    </a>
                </div>
                
                <div class="menu-items">
                    <a href="index.html" class="menu-item">
                        <i class="fas fa-home"></i>
                        <span>Panel</span>
                    </a>
                    
                    <a href="inventario.html" class="menu-item">
                        <i class="fas fa-boxes"></i>
                        <span>Inventario</span>
                    </a>
                    
                    <a href="agregar.html" class="menu-item">
                        <i class="fas fa-plus-circle"></i>
                        <span>Agregar Producto</span>
                    </a>
                    
                    <a href="ventas.html" class="menu-item">
                        <i class="fas fa-shopping-cart"></i>
                        <span>Ventas</span>
                    </a>
                    
                    <a href="estadisticas.html" class="menu-item">
                        <i class="fas fa-chart-line"></i>
                        <span>Estadísticas</span>
                    </a>
                    
                    <a href="proveedores.html" class="menu-item">
                        <i class="fas fa-truck"></i>
                        <span>Proveedores</span>
                    </a>
                    
                    <a href="promociones.html" class="menu-item">
                        <i class="fas fa-percentage"></i>
                        <span>Promociones</span>
                    </a>
                    
                    <a href="configuracion.html" class="menu-item">
                        <i class="fas fa-cog"></i>
                        <span>Configuración</span>
                    </a>
                </div>
                
                <div class="sidebar-footer">
                    <div class="user-info">
                        <i class="fas fa-user-circle"></i>
                        <div>
                            <strong>Administrador</strong>
                            <small>Jessica Boutique</small>
                        </div>
                    </div>
                    <a href="#" class="btn-logout" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i>
                    </a>
                </div>
            </nav>
        `;
        
        const container = document.createElement('div');
        container.id = 'sidebar-container';
        container.innerHTML = sidebarHTML;
        document.body.insertBefore(container, document.body.firstChild);
        
        const menuToggle = document.createElement('button');
        menuToggle.className = 'menu-toggle';
        menuToggle.id = 'menuToggle';
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.insertBefore(menuToggle, container);
    }

    setupSidebarEvents() {
        // Evento del toggle del menú
        document.getElementById('menuToggle')?.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.toggle('active');
                document.body.classList.toggle('sidebar-open');
            }
        });

        // Cerrar sidebar al hacer clic en un item en móviles
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    document.querySelector('.sidebar')?.classList.remove('active');
                    document.body.classList.remove('sidebar-open');
                }
            });
        });

        // Evento del botón de logout (será manejado por el sistema principal)
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                document.dispatchEvent(new CustomEvent('userLogout'));
            });
        }
    }

    updateActiveMenu() {
        // Remover activo de todos los items
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Activar item correspondiente a la página actual
        const activeItem = document.querySelector(`.menu-item[data-page="${this.currentPage}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.sidebarLoader = new SidebarLoader();
});