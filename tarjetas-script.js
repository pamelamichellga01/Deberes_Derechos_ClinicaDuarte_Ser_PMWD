// Función para inicializar el carrusel de tarjetas
function initCarrusel(sliderId) {
    let slider = document.getElementById(sliderId);
    if (!slider) return;
    
    let items = slider.querySelectorAll('.item');
    let next = slider.querySelector('.next');
    let prev = slider.querySelector('.prev');

    let active = 0;

    function loadShow() {
        let stt = 0;
        items[active].style.transform = `none`;
        items[active].style.zIndex = 1;
        items[active].style.filter = 'none';
        items[active].style.opacity = 1;
        
        // Resetear el flip de la tarjeta activa
        const activeCard = items[active].querySelector('.card');
        if (activeCard) {
            activeCard.style.transform = 'rotateY(0deg)';
        }
        
        for (let i = active + 1; i < items.length; i++) {
            stt++;
            items[i].style.transform = `translateX(${120 * stt}px) scale(${1 - 0.2 * stt}) perspective(16px) rotateY(-1deg)`;
            items[i].style.zIndex = -stt;
            items[i].style.filter = 'blur(5px)';
            items[i].style.opacity = stt > 2 ? 0 : 0.6;
            
            // Resetear el flip de las tarjetas no activas
            const card = items[i].querySelector('.card');
            if (card) {
                card.style.transform = 'rotateY(0deg)';
            }
        }
        
        stt = 0;
        for (let i = active - 1; i >= 0; i--) {
            stt++;
            items[i].style.transform = `translateX(${-120 * stt}px) scale(${1 - 0.2 * stt}) perspective(16px) rotateY(1deg)`;
            items[i].style.zIndex = -stt;
            items[i].style.filter = 'blur(5px)';
            items[i].style.opacity = stt > 2 ? 0 : 0.6;
            
            // Resetear el flip de las tarjetas no activas
            const card = items[i].querySelector('.card');
            if (card) {
                card.style.transform = 'rotateY(0deg)';
            }
        }
    }

    loadShow();

    if (next) {
        next.onclick = function () {
            active = active + 1 < items.length ? active + 1 : active;
            loadShow();
        }
    }

    if (prev) {
        prev.onclick = function () {
            active = active - 1 >= 0 ? active - 1 : active;
            loadShow();
        }
    }

    // Agregar transición suave al cambiar de tarjeta
    function smoothTransition() {
        const items = slider.querySelectorAll('.item');
        items.forEach(item => {
            item.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    }
    
    smoothTransition();

    // Agregar navegación con teclado
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight') {
            active = active + 1 < items.length ? active + 1 : active;
            loadShow();
        } else if (e.key === 'ArrowLeft') {
            active = active - 1 >= 0 ? active - 1 : active;
            loadShow();
        }
    });

    // Agregar navegación táctil para dispositivos móviles
    let startX = 0;
    let endX = 0;

    slider.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
    });

    slider.addEventListener('touchend', function(e) {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe izquierda - siguiente
                active = active + 1 < items.length ? active + 1 : active;
            } else {
                // Swipe derecha - anterior
                active = active - 1 >= 0 ? active - 1 : active;
            }
            loadShow();
        }
    }
}

// Función para agregar efectos de animación a las tarjetas
function addCardAnimations() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach((card, index) => {
        // Agregar delay de animación para cada tarjeta
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Agregar efecto de hover mejorado con transición suave
        card.addEventListener('mouseenter', function() {
            // Solo aplicar el flip si no está en transición del carrusel
            if (!this.closest('.item').style.transform.includes('translateX')) {
                this.style.transform = 'rotateY(180deg) scale(1.02)';
                this.style.boxShadow = '0 12px 30px rgba(0, 81, 255, 0.3)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            // Solo aplicar el flip si no está en transición del carrusel
            if (!this.closest('.item').style.transform.includes('translateX')) {
                this.style.transform = 'rotateY(0deg) scale(1)';
                this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }
        });
    });
}

// Función para mostrar indicadores de navegación
function addNavigationIndicators() {
    const sliders = document.querySelectorAll('.slider');
    
    sliders.forEach(slider => {
        const items = slider.querySelectorAll('.item');
        const indicatorsContainer = document.createElement('div');
        indicatorsContainer.className = 'navigation-indicators';
        indicatorsContainer.style.cssText = `
            position: absolute;
            bottom: -30px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 8px;
            z-index: 10;
        `;
        
        items.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.className = 'indicator';
            indicator.style.cssText = `
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background-color: rgba(0, 81, 255, 0.3);
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            
            indicator.addEventListener('click', () => {
                // Encontrar el índice activo actual
                const activeItem = slider.querySelector('.item[style*="z-index: 1"]');
                const currentIndex = Array.from(items).indexOf(activeItem);
                
                // Calcular el nuevo índice
                const newIndex = index;
                
                // Actualizar el carrusel
                const event = new CustomEvent('navigateTo', { detail: { index: newIndex } });
                slider.dispatchEvent(event);
            });
            
            indicatorsContainer.appendChild(indicator);
        });
        
        slider.appendChild(indicatorsContainer);
    });
}

// Función para inicializar todo cuando el DOM esté listo
function initTarjetas() {
    // Inicializar ambos carruseles
    initCarrusel('slider-derechos');
    initCarrusel('slider-deberes');
    
    // Agregar animaciones a las tarjetas
    addCardAnimations();
    
    // Agregar indicadores de navegación
    addNavigationIndicators();
    
    // Agregar efecto de carga inicial
    const tarjetasSection = document.querySelector('.derechos-deberes-section');
    if (tarjetasSection) {
        tarjetasSection.style.opacity = '0';
        tarjetasSection.style.transform = 'translateY(30px)';
        tarjetasSection.style.transition = 'all 0.8s ease';
        
        setTimeout(() => {
            tarjetasSection.style.opacity = '1';
            tarjetasSection.style.transform = 'translateY(0)';
        }, 500);
    }
}

// Esperar a que el DOM esté completamente cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTarjetas);
} else {
    initTarjetas();
}

// Función para cerrar sesión (si no existe en script.js)
function cerrarSesion() {
    sessionStorage.removeItem('userData');
    localStorage.removeItem('userData');
    window.location.href = 'index.html';
} 