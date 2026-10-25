const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const hamburger = $('.hamburger');
const navMenu = $('.nav-menu');
const navLinks = $$('.nav-link');
const sidebarLinks = $$('.sidebar-link');

hamburger?.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('active');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
});

$$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
        const target = $(link.getAttribute('href'));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        navMenu?.classList.remove('active');
        hamburger?.classList.remove('active');
    });
});

const navbar = $('.navbar');
window.addEventListener('scroll', () => {
    navbar?.classList.toggle('is-scrolled', window.scrollY > 40);
}, { passive: true });

const sections = $$('section[id]');
const updateActiveNav = () => {
    const current = sections.reduce((active, section) => {
        return window.scrollY >= section.offsetTop - 180 ? section.id : active;
    }, 'home');
    [...navLinks, ...sidebarLinks].forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
};
window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });
$$('section').forEach((section) => {
    section.classList.add('reveal');
    observer.observe(section);
});

const contactForm = $('#contactForm');
contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    const formStatus = $('#formStatus');
    const submitButton = $('button[type="submit"]', contactForm);
    const formData = new FormData(contactForm);
    const subject = encodeURIComponent(`${formData.get('inquiry')}: portfolio enquiry from ${formData.get('name')}`);
    const body = encodeURIComponent(
        `Name: ${formData.get('name')}\nEmail: ${formData.get('email')}\nBudget: ${formData.get('budget') || 'Not specified'}\n\n${formData.get('message')}`
    );
    submitButton.disabled = true;
    submitButton.textContent = 'Opening email…';
    window.location.href = `mailto:manikantavinnu999@gmail.com?subject=${subject}&body=${body}`;
    if (formStatus) formStatus.textContent = 'Your email app should open with the message ready to send.';
    window.setTimeout(() => {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Open Email Draft <i class="fas fa-paper-plane"></i>';
    }, 1800);
});
