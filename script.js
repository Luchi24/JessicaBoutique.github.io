// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos del DOM
    const ctaButton = document.getElementById('cta-btn');
    const counterElement = document.getElementById('counter');
    const decrementButton = document.getElementById('decrement');
    const resetButton = document.getElementById('reset');
    const incrementButton = document.getElementById('increment');
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    // Variables
    let counter = 0;
    
    // Funciones del contador
    function updateCounter() {
        counterElement.textContent = counter;
        
        // Cambiar color según el valor
        if (counter > 0) {
            counterElement.style.color = '#32a852'; // Verde
        } else if (counter < 0) {
            counterElement.style.color = '#e74c3c'; // Rojo
        } else {
            counterElement.style.color = '#4a6fa5'; // Azul
        }
    }
    
    // Eventos del contador
    decrementButton.addEventListener('click', function() {
        counter--;
        updateCounter();
    });
    
    incrementButton.addEventListener('click', function() {
        counter++;
        updateCounter();
    });
    
    resetButton.addEventListener('click', function() {
        counter = 0;
        updateCounter();
    });
    
    // Evento del botón CTA
    ctaButton.addEventListener('click', function() {
        alert('¡Gracias por hacer clic! Esta página es un ejemplo de HTML, CSS y JavaScript puro.');
        
        // Cambiar el texto del botón temporalmente
        const originalText = ctaButton.textContent;
        ctaButton.textContent = '¡Gracias!';
        ctaButton.style.backgroundColor = '#166088';
        
        setTimeout(() => {
            ctaButton.textContent = originalText;
            ctaButton.style.backgroundColor = '';
        }, 2000);
    });
    
    // Manejo del formulario de contacto
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obtener valores del formulario
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();
        
        // Validación simple
        if (name === '' || email === '' || message === '') {
            showFormMessage('Por favor, completa todos los campos.', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showFormMessage('Por favor, introduce un correo electrónico válido.', 'error');
            return;
        }
        
        // Simular envío del formulario
        showFormMessage('Enviando mensaje...', 'success');
        
        // Simular retraso de red
        setTimeout(() => {
            showFormMessage(`¡Gracias, ${name}! Tu mensaje ha sido enviado correctamente. Te contactaremos pronto en ${email}.`, 'success');
            contactForm.reset();
        }, 1500);
    });
    
    // Función para mostrar mensajes del formulario
    function showFormMessage(text, type) {
        formMessage.textContent = text;
        formMessage.className = `message ${type}`;
        formMessage.style.display = 'block';
        
        // Ocultar mensaje después de 5 segundos
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    }
    
    // Función para validar email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Menú responsive
    menuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        
        // Cambiar icono del menú
        const icon = menuToggle.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
    
    // Cerrar menú al hacer clic en un enlace
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
    
    // Navegación suave para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Efecto de cambio de color del header al hacer scroll
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.style.backgroundColor = 'rgba(74, 111, 165, 0.95)';
            header.style.backdropFilter = 'blur(5px)';
        } else {
            header.style.backgroundColor = '';
            header.style.backdropFilter = '';
        }
    });
    
    // Inicializar el contador
    updateCounter();
    
    // Mostrar mensaje de bienvenida en la consola
    console.log('¡Página cargada correctamente!');
    console.log('Esta es una página de ejemplo con HTML, CSS y JavaScript puro.');
});