let datos = {
    productos: [],
    colores: ['Rojo', 'Azul', 'Negro', 'Blanco', 'Rosa'],
    categorias: ['Blusas', 'Pantalones', 'Vestidos', 'Faldas'],
    ventas: [],
    config: { tasaIGV: 0.18 }
};

function cargarDatos() {
    const guardados = localStorage.getItem('boutique_jessica');
    if (guardados) {
        try {
            datos = JSON.parse(guardados);
        } catch (e) {
            console.log('Error cargando datos');
        }
    }
    inicializarPagina();
}

function guardarDatos() {
    localStorage.setItem('boutique_jessica', JSON.stringify(datos));
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    const container = document.getElementById('notificaciones');
    if (!container) return;
    
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    notificacion.innerHTML = `
        <i class="fas fa-${tipo === 'exito' ? 'check' : 'exclamation'}-circle"></i>
        <span>${mensaje}</span>
        <button class="btn-cerrar" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    container.appendChild(notificacion);
    setTimeout(() => notificacion.remove(), 3000);
}

function mostrarConfirmacion(mensaje) {
    return new Promise(resolve => {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-contenido">
                <div class="modal-header">
                    <h3>Confirmar</h3>
                    <button class="btn-cerrar" onclick="cerrarModal(this.closest('.modal'))">&times;</button>
                </div>
                <div class="modal-body">
                    <p>${mensaje}</p>
                    <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                        <button class="btn-secundario" onclick="cerrarModal(this.closest('.modal'))">Cancelar</button>
                        <button class="btn-principal" onclick="confirmarAccion(this.closest('.modal'))">Aceptar</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        window.confirmarAccion = (m) => {
            m.remove();
            resolve(true);
        };
        
        window.cerrarModal = (m) => {
            m.remove();
            resolve(false);
        };
    });
}

function inicializarPagina() {
    const pagina = window.location.pathname.split('/').pop();
    if (pagina === 'inventario.html' && window.cargarInventario) cargarInventario();
    if (pagina === 'agregar-producto.html' && window.inicializarAgregar) inicializarAgregar();
    if (pagina === 'ventas.html' && window.inicializarVentas) inicializarVentas();
    if (pagina === 'index.html' && window.inicializarDashboard) inicializarDashboard();
}

document.addEventListener('DOMContentLoaded', cargarDatos);