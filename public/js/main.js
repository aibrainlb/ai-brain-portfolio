// Enhanced Mobile-Responsive Portfolio JavaScript
// AI Brain Portfolio - Mobile Optimized (Navbar Scrolls Normally)


(function() {
    'use strict';

    // ================================================
    // MOBILE MENU FUNCTIONALITY
    // ================================================
    const initMobileMenu = () => {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.getElementById('navLinks');
        const body = document.body;
        let menuOverlay = document.querySelector('.mobile-menu-overlay');

        if (!menuOverlay) {
            menuOverlay = document.createElement('div');
            menuOverlay.className = 'mobile-menu-overlay';
            menuOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 998;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            `;
            body.appendChild(menuOverlay);
        }

        if (!mobileMenuBtn || !navLinks) return;

        const toggleMenu = (forceClose = false) => {
            const isActive = forceClose ? false : navLinks.classList.toggle('active');
            mobileMenuBtn.innerHTML = isActive ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
            menuOverlay.style.opacity = isActive ? '1' : '0';
            menuOverlay.style.visibility = isActive ? 'visible' : 'hidden';
            body.classList.toggle('menu-open', isActive);
            mobileMenuBtn.setAttribute('aria-expanded', isActive);
            navLinks.setAttribute('aria-hidden', !isActive);
        };

        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        menuOverlay.addEventListener('click', () => toggleMenu(true));

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => toggleMenu(true));
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                toggleMenu(true);
            }
        });

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
                    toggleMenu(true);
                }
            }, 250);
        });

        navLinks.addEventListener('click', (e) => e.stopPropagation());
    };

    // ================================================
    // HEADER SCROLL BEHAVIOR (adds 'scrolled' class)
    // ================================================
    const initHeaderScroll = () => {
        const header = document.getElementById('header');
        if (!header) return;

        let ticking = false;
        const updateHeader = () => {
            const currentScroll = window.pageYOffset;
            header.classList.toggle('scrolled', currentScroll > 50);
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateHeader);
                ticking = true;
            }
        });
    };

    // ================================================
    // SMOOTH SCROLLING WITH OFFSET
    // ================================================
    const initSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#' || targetId === '#!') return;

                const targetElement = document.querySelector(targetId);
                if (!targetElement) return;

                e.preventDefault();

                const header = document.getElementById('header');
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
                this.classList.add('active');
            });
        });
    };

    // ================================================
    // FIX ANCHOR LINKS ON PAGE LOAD
    // ================================================
    const fixAnchorOnLoad = () => {
        if (window.location.hash) {
            setTimeout(() => {
                const target = document.querySelector(window.location.hash);
                if (target) {
                    const header = document.getElementById('header');
                    const headerHeight = header ? header.offsetHeight : 0;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            }, 100);
        }
    };

    // ================================================
    // ACTIVE SECTION HIGHLIGHTING
    // ================================================
    const initActiveSection = () => {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
        if (sections.length === 0 || navLinks.length === 0) return;

        let ticking = false;
        const highlightActiveSection = () => {
            const scrollPosition = window.pageYOffset + 150;
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(highlightActiveSection);
                ticking = true;
            }
        });
        highlightActiveSection();
    };

    // ================================================
    // INTERSECTION OBSERVER FOR ANIMATIONS
    // ================================================
    const initScrollAnimations = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible', 'fade-in-up');
                    if (entry.target.classList.contains('skill-card')) {
                        const bar = entry.target.querySelector('.skill-level-bar');
                        if (bar && bar.dataset.width) {
                            setTimeout(() => { bar.style.width = bar.dataset.width; }, 300);
                        }
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.skill-card, .project-card, .stat-card, .contact-info-card')
            .forEach(el => observer.observe(el));
    };

    // ================================================
    // TOUCH DEVICE DETECTION
    // ================================================
    const detectTouchDevice = () => {
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
        if (isTouchDevice) document.body.classList.add('touch-device');
        return isTouchDevice;
    };

    // ================================================
    // PREVENT ZOOM ON DOUBLE TAP (iOS)
    // ================================================
    const preventDoubleTapZoom = () => {
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) e.preventDefault();
            lastTouchEnd = now;
        }, { passive: false });
    };

    // ================================================
    // VIEWPORT HEIGHT FIX FOR MOBILE
    // ================================================
    const fixMobileViewportHeight = () => {
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        setVH();
        window.addEventListener('resize', () => {
            clearTimeout(window.vhTimer);
            window.vhTimer = setTimeout(setVH, 250);
        });
    };

    // ================================================
    // BACK TO TOP BUTTON
    // ================================================
    const initBackToTop = () => {
        let backToTopBtn = document.querySelector('.back-to-top');
        if (!backToTopBtn) {
            backToTopBtn = document.createElement('button');
            backToTopBtn.className = 'back-to-top';
            backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
            backToTopBtn.setAttribute('aria-label', 'Back to top');
            backToTopBtn.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                background: var(--primary, #2196F3);
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                z-index: 999;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            `;
            document.body.appendChild(backToTopBtn);
        }

        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.style.opacity = '1';
                backToTopBtn.style.visibility = 'visible';
            } else {
                backToTopBtn.style.opacity = '0';
                backToTopBtn.style.visibility = 'hidden';
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    };

    // ================================================
    // INITIALIZE ALL FEATURES
    // ================================================
    const init = () => {
        console.log('🎨 AI Brain Portfolio - Mobile Enhanced Version');

        const isTouchDevice = detectTouchDevice();
        console.log('📱 Touch Device:', isTouchDevice);

        // Initialize all features (navbar fix removed)
        initMobileMenu();
        initHeaderScroll();
        initSmoothScroll();
        fixAnchorOnLoad();
        initActiveSection();
        initScrollAnimations();
        fixMobileViewportHeight();
        initBackToTop();

        if (isTouchDevice) {
            preventDoubleTapZoom();
        }

        console.log('✅ Portfolio initialized successfully (navbar scrolls normally)!');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Optional debug object
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.portfolioDebug = {
            version: '3.0.0-mobile-clean',
            detectTouchDevice
        };
    }
})();