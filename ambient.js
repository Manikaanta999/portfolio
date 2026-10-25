const pointerTrail = document.createElement('div');
pointerTrail.className = 'pointer-trail';
pointerTrail.setAttribute('aria-hidden', 'true');
document.body.append(pointerTrail);
let lastTrailX = 0;
let lastTrailY = 0;

const particleCanvas = document.createElement('canvas');
particleCanvas.className = 'ambient-particles';
particleCanvas.setAttribute('aria-hidden', 'true');
document.body.prepend(particleCanvas);
const particleContext = particleCanvas.getContext('2d');
const symbols = ['</>', '{ }', 'API', '+', '[]'];
let particles = [];
let particleFrame;

const createZone = (selector, className, items) => {
    const zone = document.querySelector(selector);
    if (!zone) return;
    const layer = document.createElement('div');
    layer.className = className;
    layer.setAttribute('aria-hidden', 'true');
    items.forEach((item, index) => {
        const node = document.createElement('span');
        node.textContent = item;
        node.style.setProperty('--i', index);
        layer.append(node);
    });
    zone.append(layer);
};

createZone('.sidebar', 'sidebar-particles', ['·', '✦', '·', '＋', '·', '✦']);
createZone('.navbar', 'header-particles', ['01', '⌁', '•', '02']);
const sidebar = document.querySelector('.sidebar');
if (sidebar) {
    const orbitalDecor = document.createElement('div');
    orbitalDecor.className = 'sidebar-orbit';
    orbitalDecor.setAttribute('aria-hidden', 'true');
    orbitalDecor.innerHTML = '<span class="sidebar-orbit-ring"></span><span class="sidebar-orbit-ring sidebar-orbit-ring-offset"></span><span class="sidebar-orbit-dot"></span>';
    sidebar.append(orbitalDecor);
}

const createParticles = () => {
    const density = Math.min(34, Math.max(18, Math.floor(window.innerWidth / 38)));
    particles = Array.from({ length: density }, (_, index) => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 2.2 + 1,
        speedX: (Math.random() - 0.5) * 0.16,
        speedY: (Math.random() - 0.5) * 0.16,
        opacity: Math.random() * 0.28 + 0.1,
        symbol: symbols[index % symbols.length],
        symbolSize: Math.random() * 3 + 9
    }));
};

const resizeParticleCanvas = () => {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    particleCanvas.width = window.innerWidth * pixelRatio;
    particleCanvas.height = window.innerHeight * pixelRatio;
    particleCanvas.style.width = `${window.innerWidth}px`;
    particleCanvas.style.height = `${window.innerHeight}px`;
    particleContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    createParticles();
};

const drawParticles = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    particleContext.clearRect(0, 0, width, height);
    particles.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        if (particle.x < -30) particle.x = width + 30;
        if (particle.x > width + 30) particle.x = -30;
        if (particle.y < -30) particle.y = height + 30;
        if (particle.y > height + 30) particle.y = -30;

        particleContext.beginPath();
        particleContext.fillStyle = `rgba(125, 211, 252, ${particle.opacity})`;
        particleContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        particleContext.fill();

        if (particle.symbol) {
            particleContext.fillStyle = `rgba(192, 132, 252, ${particle.opacity * 0.75})`;
            particleContext.font = `${particle.symbolSize}px "JetBrains Mono", monospace`;
            particleContext.fillText(particle.symbol, particle.x + 7, particle.y - 6);
        }
    });

    particles.forEach((particle, index) => {
        particles.slice(index + 1).forEach((other) => {
            const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
            if (distance > 135) return;
            particleContext.beginPath();
            particleContext.strokeStyle = `rgba(125, 211, 252, ${(1 - distance / 135) * 0.09})`;
            particleContext.lineWidth = 1;
            particleContext.moveTo(particle.x, particle.y);
            particleContext.lineTo(other.x, other.y);
            particleContext.stroke();
        });
    });
    particleFrame = window.requestAnimationFrame(drawParticles);
};

resizeParticleCanvas();
window.addEventListener('resize', resizeParticleCanvas, { passive: true });
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) drawParticles();

const moveGlow = (event) => {
    const point = event.touches?.[0] || event;
    if (typeof point.clientX !== 'number' || typeof point.clientY !== 'number') return;
    const distance = Math.hypot(point.clientX - lastTrailX, point.clientY - lastTrailY);
    if (distance < 18) return;
    lastTrailX = point.clientX;
    lastTrailY = point.clientY;
    const particle = document.createElement('span');
    particle.className = 'trail-particle';
    particle.textContent = Math.random() > .5 ? '·' : '+';
    particle.style.left = `${point.clientX + (Math.random() * 12 - 6)}px`;
    particle.style.top = `${point.clientY + (Math.random() * 12 - 6)}px`;
    particle.style.setProperty('--trail-x', `${Math.random() * 28 - 14}px`);
    particle.style.setProperty('--trail-y', `${Math.random() * -30 - 8}px`);
    pointerTrail.append(particle);
    window.setTimeout(() => particle.remove(), 750);
};

window.addEventListener('pointermove', moveGlow, { passive: true });
window.addEventListener('touchstart', moveGlow, { passive: true });
window.addEventListener('touchmove', moveGlow, { passive: true });

window.addEventListener('pagehide', () => window.cancelAnimationFrame(particleFrame));
