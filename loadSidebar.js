// Cargar la barra lateral
fetch('sidebar.html')
  .then(response => response.text())
  .then(data => {
      document.getElementById('sidebar-container').innerHTML = data;
      
      // Determinar la página actual
      let currentPage = window.location.pathname.split('/').pop();
      if (currentPage === '' || currentPage === 'index.html') {
          currentPage = 'dashboard';
      } else {
          currentPage = currentPage.replace('.html', '');
      }
      
      // Marcar el item activo
      const menuItem = document.querySelector(`.menu-item[data-page="${currentPage}"]`);
      if (menuItem) {
          menuItem.classList.add('active');
      }
      
      // Configurar el evento del botón de logout (si existe)
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
          logoutBtn.addEventListener('click', (e) => {
              e.preventDefault();
              // Aquí iría la lógica de logout, por ahora solo un alert
              if (confirm('¿Estás seguro de cerrar sesión?')) {
                  // Redirigir al login o limpiar sesión
                  window.location.href = 'index.html';
              }
          });
      }
      
      // Configurar el evento del toggle del menú en móviles
      const menuToggle = document.getElementById('menuToggle');
      if (menuToggle) {
          menuToggle.addEventListener('click', () => {
              document.querySelector('.sidebar').classList.toggle('active');
          });
      }
  })
  .catch(error => console.error('Error cargando la barra lateral:', error));