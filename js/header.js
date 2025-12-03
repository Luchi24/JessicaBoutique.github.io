// Header y Navegación
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  
  // Marcar enlace activo basado en la URL actual
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPage || 
        (currentPage === '' && linkHref === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
    
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
      }
    });
  });
  
  // Toggle del menú en móviles
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && 
          !sidebar.contains(e.target) && 
          !menuToggle.contains(e.target) &&
          sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
      }
    });
  }
}

function setupThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.body.getAttribute('data-theme') === 'dark';
      
      if (isDark) {
        document.body.removeAttribute('data-theme');
        appState.settings.darkMode = false;
        themeToggle.innerHTML = '<i class="fas fa-moon"></i> Tema Oscuro';
      } else {
        document.body.setAttribute('data-theme', 'dark');
        appState.settings.darkMode = true;
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Tema Claro';
      }
      
      saveToStorage(STORAGE_KEYS.SETTINGS, appState.settings);
    });
  }
}