// JavaScript Document


// Portfolio data for carousel
const portfolioData = [
    {
        id: 1,
        title: 'Ataque Controlado con Hydra (FTP)',
        description: 'Ataque controlado con Hydra para evaluar la seguridad de un servidor FTP y medir la resistencia frente a fuerza bruta',
        image: 'images/Foto-Hydra.png',
        tech: ['Hydra', 'FTP', 'Kali']
    },
    {
        id: 2,
        title: 'Hackathon INCIBE',
        description: 'Participación en hackathon de ciberseguridad resolviendo retos de vulnerabilidades y defensa.',
        image: 'images/Foto-Hackathon.jpg',
        tech: ['Seguridad', 'Análisis', 'Trabajo en Equipo']
    },
    {
        id: 3,
        title: 'Diseño de red con topología Cisco',
        description: 'Implementación de una topología Cisco para pruebas de conectividad y administración eficiente de la red.',
        image: 'images/Foto-Cisco.png',
        tech: ['Cisco', 'Redes', 'Segmentación']
    },
    {
        id: 4,
        title: 'Explotación con Metasploit',
        description: 'Configuración inicial de Metasploit para evaluar módulos de explotación.',
        image: 'images/Foto-Metasploit.jpg',
        tech: ['Metasploit', 'Linux', 'Pentesting']
    },
];

// Skills data
const skillsData = [
    { name: 'Windows', icon: '🪟', level: 85, category: 'Sistemas Operativos' },
    { name: 'Windows Server', icon: '🖥️', level: 75, category: 'Sistemas Operativos' },
    { name: 'Linux', icon: '🐧', level: 70, category: 'Sistemas Operativos' },
    { name: 'Nmap', icon: '📡', level: 90, category: 'Ciberseguridad' },
    { name: 'Hydra', icon: '🐉', level: 87, category: 'Ciberseguridad' },
    { name: 'ChatGPT', icon: '🤖', level: 93, category: 'IA' },
    { name: 'Metasploitable', icon: '💣', level: 70, category: 'Ciberseguridad' },
    { name: 'Gemini', icon: '🌌', level: 87, category: 'IA' },
    { name: 'SQLMap', icon: '🛢️', level: 50, category: 'Ciberseguridad' },
    { name: 'Español', icon: '🇪🇸', level: 100, category: 'Idiomas' },
    { name: 'Autopsy', icon: '🕵️‍♂️', level: 65, category: 'Ciberseguridad' },
    { name: 'Dirbuster / Gobuster', icon: '🪓', level: 65, category: 'Ciberseguridad' },
    { name: 'Perplexity', icon: '🔮', level: 90, category: 'IA' },
    { name: 'Enum4Linux', icon: '📜', level: 60, category: 'Ciberseguridad' },
    { name: 'Valenciano', icon: '⚜', level: 75, category: 'Idiomas' },
    { name: 'Claude', icon: '🧠', level: 93, category: 'IA' },
    { name: 'John the Ripper', icon: '🔐', level: 76, category: 'Ciberseguridad' },
    { name: 'Inglés', icon: '🇬🇧', level: 60, category: 'Idiomas' },
    { name: 'Netcat', icon: '📞', level: 70, category: 'Ciberseguridad' },
    { name: 'Copilot', icon: '🛠️', level: 88, category: 'IA' },
];

// Scroll to section function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    const header = document.getElementById('header');
    if (section) {
        const headerHeight = header.offsetHeight;
        const targetPosition = section.offsetTop - headerHeight;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Initialize particles for philosophy section
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Random horizontal position
        particle.style.left = Math.random() * 100 + '%';

        // Start particles at random vertical positions throughout the section
        particle.style.top = Math.random() * 100 + '%';

        // Random animation delay for natural movement
        particle.style.animationDelay = Math.random() * 20 + 's';

        // Random animation duration for variety
        particle.style.animationDuration = (18 + Math.random() * 8) + 's';

        particlesContainer.appendChild(particle);
    }
}

// Initialize carousel
let currentIndex = 0;
const carousel = document.getElementById('carousel');
const indicatorsContainer = document.getElementById('indicators');

function createCarouselItem(data, index) {
    const item = document.createElement('div');
    item.className = 'carousel-item';
    item.dataset.index = index;

    const techBadges = data.tech.map(tech =>
        `<span class="tech-badge">${tech}</span>`
    ).join('');

    item.innerHTML = `
        <div class="card">
            <div class="card-number">0${data.id}</div>
            <div class="card-image">
                <img src="${data.image}" alt="${data.title}">
            </div>
            <h3 class="card-title">${data.title}</h3>
            <p class="card-description">${data.description}</p>
            <div class="card-tech">${techBadges}</div>
            <button class="card-cta" onclick="scrollToSection('about')">Explorar</button>
        </div>
    `;

    // Add click handler to image to open modal (show full image)
    const img = item.querySelector('.card-image img');
    if (img) {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            openImageModal(data.image, data.title || '');
        });
    }

    return item;
}

function initCarousel() {
    // Create carousel items
    portfolioData.forEach((data, index) => {
        const item = createCarouselItem(data, index);
        carousel.appendChild(item);

        // Create indicator
        const indicator = document.createElement('div');
        indicator.className = 'indicator';
        if (index === 0) indicator.classList.add('active');
        indicator.dataset.index = index;
        indicator.addEventListener('click', () => goToSlide(index));
        indicatorsContainer.appendChild(indicator);
    });

    updateCarousel();
}

function updateCarousel() {
    const items = document.querySelectorAll('.carousel-item');
    const indicators = document.querySelectorAll('.indicator');
    const totalItems = items.length;
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024;

    items.forEach((item, index) => {
        // Calculate relative position
        let offset = index - currentIndex;

        // Wrap around for continuous rotation
        if (offset > totalItems / 2) {
            offset -= totalItems;
        } else if (offset < -totalItems / 2) {
            offset += totalItems;
        }

        const absOffset = Math.abs(offset);
        const sign = offset < 0 ? -1 : 1;

        // Reset transform
        item.style.transform = '';
        item.style.opacity = '';
        item.style.zIndex = '';
        item.style.transition = 'all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)';

        // Adjust spacing based on screen size
        let spacing1 = 400;
        let spacing2 = 600;
        let spacing3 = 750;

        if (isMobile) {
            spacing1 = 280;
            spacing2 = 420;
            spacing3 = 550;
        } else if (isTablet) {
            spacing1 = 340;
            spacing2 = 520;
            spacing3 = 650;
        }

        if (absOffset === 0) {
            // Center item
            item.style.transform = 'translate(-50%, -50%) translateZ(0) scale(1)';
            item.style.opacity = '1';
            item.style.zIndex = '10';
        } else if (absOffset === 1) {
            // Side items
            const translateX = sign * spacing1;
            const rotation = isMobile ? 25 : 30;
            const scale = isMobile ? 0.88 : 0.85;
            item.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(-200px) rotateY(${-sign * rotation}deg) scale(${scale})`;
            item.style.opacity = '0.8';
            item.style.zIndex = '5';
        } else if (absOffset === 2) {
            // Further side items
            const translateX = sign * spacing2;
            const rotation = isMobile ? 35 : 40;
            const scale = isMobile ? 0.75 : 0.7;
            item.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(-350px) rotateY(${-sign * rotation}deg) scale(${scale})`;
            item.style.opacity = '0.5';
            item.style.zIndex = '3';
        } else if (absOffset === 3) {
            // Even further items
            const translateX = sign * spacing3;
            const rotation = isMobile ? 40 : 45;
            const scale = isMobile ? 0.65 : 0.6;
            item.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(-450px) rotateY(${-sign * rotation}deg) scale(${scale})`;
            item.style.opacity = '0.3';
            item.style.zIndex = '2';
        } else {
            // Hidden items (behind)
            item.style.transform = 'translate(-50%, -50%) translateZ(-500px) scale(0.5)';
            item.style.opacity = '0';
            item.style.zIndex = '1';
        }
    });

    // Update indicators
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentIndex);
    });
}

function nextSlide() {
    currentIndex = (currentIndex + 1) % portfolioData.length;
    updateCarousel();
}

function prevSlide() {
    currentIndex = (currentIndex - 1 + portfolioData.length) % portfolioData.length;
    updateCarousel();
}

function goToSlide(index) {
    currentIndex = index;
    updateCarousel();
}

// Initialize hexagonal skills grid
function initSkillsGrid() {
    const skillsGrid = document.getElementById('skillsGrid');
    const categoryTabs = document.querySelectorAll('.category-tab');

    function displaySkills(category = 'all') {
        skillsGrid.innerHTML = '';

        // CORRECCIÓN APLICADA AQUÍ: Se acepta 'all' O 'Todas'
        const filteredSkills = (category === 'all' || category === 'Todas')
            ? skillsData
            : skillsData.filter(skill => skill.category === category);

        filteredSkills.forEach((skill, index) => {
            const hexagon = document.createElement('div');
            hexagon.className = 'skill-hexagon';
            hexagon.style.animationDelay = `${index * 0.1}s`;

            hexagon.innerHTML = `
                <div class="hexagon-inner">
                    <div class="hexagon-content">
                        <div class="skill-icon-hex">${skill.icon}</div>
                        <div class="skill-name-hex">${skill.name}</div>
                        <div class="skill-level">
                            <div class="skill-level-fill" style="width: ${skill.level}%"></div>
                        </div>
                        <div class="skill-percentage-hex">${skill.level}%</div>
                    </div>
                </div>
            `;

            skillsGrid.appendChild(hexagon);
        });
    }

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            displaySkills(tab.dataset.category);
        });
    });

    displaySkills();
}

// Event listeners
document.getElementById('nextBtn').addEventListener('click', nextSlide);
document.getElementById('prevBtn').addEventListener('click', prevSlide);

// Auto-rotate carousel
setInterval(nextSlide, 5000);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
});

// Update carousel on window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        updateCarousel();
    }, 250);
});

// Initialize on load
initCarousel();
initSkillsGrid();
initParticles();

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
});

// Header scroll effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Smooth scrolling and active navigation
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
            const headerHeight = header.offsetHeight;
            const targetPosition = targetSection.offsetTop - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    });
});

// Update active navigation on scroll
function updateActiveNav() {
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href').substring(1);
                if (href === sectionId) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNav);

// Animated counter for stats
function animateCounter(element) {
    const target = parseInt(element.dataset.target);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const counter = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target;
            clearInterval(counter);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Intersection Observer for stats animation
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(number => {
                if (!number.classList.contains('animated')) {
                    number.classList.add('animated');
                    animateCounter(number);
                }
            });
        }
    });
}, observerOptions);

const statsSection = document.querySelector('.stats-section');
if (statsSection) {
    observer.observe(statsSection);
}

// Form submission
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    // Show success message
    alert(`Thank you ${data.name}! Your message has been transmitted successfully. We'll respond within 24 hours.`);

    // Reset form
    contactForm.reset();
});

// Loading screen
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        loader.classList.add('hidden');
    }, 1500);
});

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.hero');
    if (parallax) {
        parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Image modal implementation
let imageModal = null;

function createImageModal() {
    const modal = document.createElement('div');
    modal.id = 'imageModal';
    Object.assign(modal.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.85)',
        zIndex: '20000',
        padding: '20px',
        boxSizing: 'border-box'
    });

    modal.innerHTML = `
        <div class="modal-content" style="max-width:1100px; max-height:90vh; width:100%; position:relative;">
            <button class="modal-close" aria-label="Close" style="position:absolute; right:8px; top:8px; background:transparent; color:#fff; border:0; font-size:32px; cursor:pointer;">×</button>
            <img src="" alt="" style="width:100%; height:auto; display:block; border-radius:8px; box-shadow:0 10px 40px rgba(0,0,0,0.6); max-height:80vh; object-fit:contain;" />
            <div class="modal-caption" style="color:#fff; text-align:center; margin-top:10px; font-size:16px;"></div>
        </div>
    `;

    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeImageModal();
    });

    // Close button
    modal.querySelector('.modal-close').addEventListener('click', closeImageModal);

    // Esc key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeImageModal();
    });

    document.body.appendChild(modal);
    imageModal = modal;
}

function openImageModal(src, caption) {
    if (!imageModal) createImageModal();
    const img = imageModal.querySelector('img');
    const cap = imageModal.querySelector('.modal-caption');
    img.src = src;
    img.alt = caption || '';
    cap.textContent = caption || '';
    imageModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeImageModal() {
    if (!imageModal) return;
    imageModal.style.display = 'none';
    const img = imageModal.querySelector('img');
    if (img) img.src = '';
    document.body.style.overflow = '';
}