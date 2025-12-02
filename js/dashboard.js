function inicializarDashboard() {
    actualizarDashboard();
}

function actualizarDashboard() {
    const totalProductos = datos.productos.length;
    document.getElementById('total-productos').textContent = totalProductos;
    
    const hoy = new Date().toLocaleDateString('es-PE');
    const ventasHoy = datos.ventas.filter(v => 
        new Date(v.fecha).toLocaleDateString('es-PE') === hoy
    ).length;
    document.getElementById('ventas-hoy').textContent = ventasHoy;
    
    const stockBajo = datos.productos.filter(p => p.cantidad < 3).length;
    document.getElementById('stock-bajo').textContent = stockBajo;
    
    actualizarTopProductos();
}

function actualizarTopProductos() {
    const container = document.getElementById('top-productos');
    if (!container) return;
    
    const ventasPorProducto = {};
    
    datos.ventas.forEach(venta => {
        venta.items.forEach(item => {
            if (!ventasPorProducto[item.nombre]) {
                ventasPorProducto[item.nombre] = 0;
            }
            ventasPorProducto[item.nombre] += item.cantidad;
        });
    });
    
    const topProductos = Object.entries(ventasPorProducto)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    container.innerHTML = '';
    
    if (topProductos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">No hay ventas aún</p>';
        return;
    }
    
    topProductos.forEach(([nombre, cantidad], index) => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.padding = '0.8rem';
        div.style.background = '#fafafa';
        div.style.borderRadius = '8px';
        
        div.innerHTML = `
            <div>
                <span style="font-weight: bold; margin-right: 0.5rem;">${index + 1}.</span>
                <span>${nombre}</span>
            </div>
            <span style="background: #e91e63; color: white; padding: 0.3rem 0.6rem; border-radius: 20px; font-size: 0.85rem;">
                ${cantidad} vendidos
            </span>
        `;
        
        container.appendChild(div);
    });
}

if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
    document.addEventListener('DOMContentLoaded', inicializarDashboard);
}