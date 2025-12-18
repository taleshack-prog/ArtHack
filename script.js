// ===========================
// MOBILE MENU FUNCTIONALITY
// ===========================

function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    }
}

// ===========================
// SMOOTH SCROLLING PARA ÂNCORAS
// ===========================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Ignora links vazios ou apenas "#"
        if (href === '#' || href === '') {
            e.preventDefault();
            return;
        }
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===========================
// ANIMAÇÕES DE SCROLL
// ===========================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            entry.target.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        }
    });
}, observerOptions);

document.querySelectorAll('.category-card, .art-card, .post-card').forEach(el => {
    observer.observe(el);
});

// ===========================
// LIGHTBOX FUNCTIONS
// ===========================

/**
 * Abre o lightbox com a imagem especificada
 * @param {string} imageSrc - Caminho da imagem a ser exibida
 */
function openLightbox(imageSrc) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    
    if (lightbox && lightboxImg) {
        lightboxImg.src = imageSrc;
        lightbox.classList.add('active');
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Previne scroll na página
    }
}

/**
 * Fecha o lightbox
 */
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    
    if (lightbox) {
        lightbox.classList.remove('active');
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restaura scroll
        
        // Limpa a imagem após fechar (melhora performance)
        const lightboxImg = document.getElementById('lightbox-img');
        if (lightboxImg) {
            setTimeout(() => {
                lightboxImg.src = '';
            }, 300);
        }
    }
}

// ===========================
// LIGHTBOX EVENT LISTENERS
// ===========================

// Fecha lightbox ao clicar fora da imagem
window.onclick = function(event) {
    const lightbox = document.getElementById('lightbox');
    if (event.target === lightbox) {
        closeLightbox();
    }
}

// Fecha lightbox com a tecla ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' || event.key === 'Esc') {
        closeLightbox();
    }
});

// Fecha lightbox ao clicar no botão X
document.addEventListener('DOMContentLoaded', function() {
    const closeBtn = document.querySelector('.close-lightbox');
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeLightbox();
        });
    }
});

// ===========================
// CONSOLE MESSAGE
// ===========================

console.log('%c🎨 Tales - Arte & Insight', 'font-size: 20px; font-weight: bold; color: #2c3e50;');
console.log('%cDesenvolvido com foco em arte e inovação', 'font-size: 12px; color: #555;');
