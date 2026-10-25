const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const hamburger = $('.hamburger');
const navMenu = $('.nav-menu');
const navLinks = $$('.nav-link');
const sidebarLinks = $$('.sidebar-link');
const projectCards = $$('.project-card[data-details-url]');
const liveClock = $('#liveClock');
const copyrightYear = $('#copyrightYear');
const budgetControl = $('.budget-select-wrap');
const customSelects = $$('.custom-select-wrap');

const updateTime = () => {
    const now = new Date();
    if (liveClock) {
        liveClock.textContent = new Intl.DateTimeFormat(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(now);
        liveClock.dateTime = now.toISOString();
    }
    if (copyrightYear) copyrightYear.textContent = String(now.getFullYear());
};
updateTime();
window.setInterval(updateTime, 1000);

if (budgetControl) {
    const trigger = $('.budget-trigger', budgetControl);
    const menu = $('.budget-menu', budgetControl);
    const value = $('.budget-value', budgetControl);
    const options = $$('.budget-menu [role="option"]', budgetControl);

    const closeBudgetMenu = () => {
        menu.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
    };

    trigger.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', String(isOpen));
    });

    options.forEach((option) => {
        option.addEventListener('click', () => {
            value.value = option.dataset.value || '';
            $('span', trigger).textContent = option.textContent;
            options.forEach((item) => item.setAttribute('aria-selected', String(item === option)));
            closeBudgetMenu();
        });
    });

    document.addEventListener('click', (event) => {
        if (!budgetControl.contains(event.target)) closeBudgetMenu();
    });

    trigger.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeBudgetMenu();
    });
}

customSelects.forEach((control) => {
    const trigger = $('.custom-select-trigger', control);
    const menu = $('.custom-select-menu', control);
    const value = $('.custom-select-value', control);
    const options = $$('.custom-select-menu [role="option"]', control);

    const closeMenu = () => {
        menu.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
    };

    trigger.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', String(isOpen));
    });

    options.forEach((option) => {
        option.addEventListener('click', () => {
            value.value = option.dataset.value || '';
            $('span', trigger).textContent = option.querySelector('strong')?.textContent || option.textContent;
            options.forEach((item) => item.setAttribute('aria-selected', String(item === option)));
            closeMenu();
        });
    });

    document.addEventListener('click', (event) => {
        if (!control.contains(event.target)) closeMenu();
    });

    trigger.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
    });
});

hamburger?.addEventListener('click', () => {
    if (!navMenu) return;
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
        hamburger?.setAttribute('aria-expanded', 'false');
    });

});

projectCards.forEach((card) => {
    const openDetails = () => {
        window.location.assign(card.dataset.detailsUrl);
    };

    card.addEventListener('click', (event) => {
        if (event.target.closest('a, button')) return;
        openDetails();
    });

    card.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        openDetails();
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
    const webmailFallback = $('#webmailFallback');
    const submitButton = $('button[type="submit"]', contactForm);
    const formData = new FormData(contactForm);
    const subject = encodeURIComponent(`${formData.get('inquiry')}: portfolio enquiry from ${formData.get('name')}`);
    const body = encodeURIComponent(
        `Name: ${formData.get('name')}\nEmail: ${formData.get('email')}\nBudget: ${formData.get('budget') || 'Not specified'}\n\n${formData.get('message')}`
    );
    const mailtoUrl = `mailto:manikantavinnu999@gmail.com?subject=${subject}&body=${body}`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=manikantavinnu999%40gmail.com&su=${subject}&body=${body}`;
    submitButton.disabled = true;
    submitButton.textContent = 'Opening email…';
    if (webmailFallback) {
        webmailFallback.href = gmailUrl;
        webmailFallback.hidden = true;
    }
    if (formStatus) formStatus.textContent = 'Opening your email app with a ready-to-send draft…';
    const mailtoLink = document.createElement('a');
    mailtoLink.href = mailtoUrl;
    mailtoLink.setAttribute('aria-hidden', 'true');
    mailtoLink.style.display = 'none';
    document.body.append(mailtoLink);
    mailtoLink.click();
    mailtoLink.remove();
    window.setTimeout(() => {
        if (formStatus) formStatus.textContent = 'If your email app did not open, use the Gmail fallback below.';
        if (webmailFallback) webmailFallback.hidden = false;
    }, 1200);
    window.setTimeout(() => {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Open Email Draft <i class="fas fa-paper-plane"></i>';
    }, 2200);
});
