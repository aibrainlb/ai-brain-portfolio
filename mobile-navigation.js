/* ============================================
   MOBILE NAVIGATION & RESPONSIVE FEATURES
   AI Brain Portfolio
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    
    // ==================== 
    // MOBILE MENU TOGGLE
    // ====================
    
    // Create mobile menu toggle button if it doesn't exist
    function createMobileMenu() {
        const nav = document.querySelector('nav');
        const navLinks = document.querySelector('.nav-links');
        
        if (!nav || !navLinks) return;
        
        // Check if toggle button already exists
        let toggleBtn = document.querySelector('.mobile-menu-toggle');
        
        if (!toggleBtn) {
            // Create toggle button
            toggleBtn = document.createElement('button');
            toggleBtn.className = 'mobile-menu-toggle';
            toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
            toggleBtn.setAttribute('aria-label', 'Toggle mobile menu');
            toggleBtn.setAttribute('aria-expanded', 'false');
            
            // Insert before nav links
            navLinks.parentNode.insertBefore(toggleBtn, navLinks);
        }
        
        // Toggle menu on button click
        toggleBtn.addEventListener('click', function() {
            const isActive = navLinks.classList.toggle('active');
            toggleBtn.setAttribute('aria-expanded', isActive);
            
            // Change icon
            const icon = toggleBtn.querySelector('i');
            if (isActive) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });
        
        // Close menu when clicking a link
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                toggleBtn.setAttribute('aria-expanded', 'false');
                toggleBtn.querySelector('i').className = 'fas fa-bars';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!nav.contains(e.target)) {
                navLinks.classList.remove('active');
                toggleBtn.setAttribute('aria-expanded', 'false');
                toggleBtn.querySelector('i').className = 'fas fa-bars';
            }
        });
    }
    
    // ==================== 
    // RESPONSIVE IMAGES
    // ====================
    
    function optimizeImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Add loading="lazy" for better performance
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
            
            // Add responsive image attributes if needed
            if (!img.hasAttribute('srcset') && img.dataset.srcset) {
                img.setAttribute('srcset', img.dataset.srcset);
            }
        });
    }
    
    // ==================== 
    // VIEWPORT HEIGHT FIX (Mobile Safari)
    // ====================
    
    function setVH() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    // ==================== 
    // TOUCH DEVICE DETECTION
    // ====================
    
    function detectTouch() {
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            document.body.classList.add('touch-device');
        }
    }
    
    // ==================== 
    // SCREEN ORIENTATION CHANGE
    // ====================
    
    function handleOrientationChange() {
        if (window.matchMedia("(orientation: portrait)").matches) {
            document.body.classList.add('portrait');
            document.body.classList.remove('landscape');
        } else {
            document.body.classList.add('landscape');
            document.body.classList.remove('portrait');
        }
    }
    
    // ==================== 
    // RESPONSIVE TABLES
    // ====================
    
    function makeTablesResponsive() {
        const tables = document.querySelectorAll('table');
        
        tables.forEach(table => {
            if (!table.parentElement.classList.contains('table-responsive')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-responsive';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
        });
    }
    
    // ==================== 
    // SMOOTH SCROLL FOR MOBILE
    // ====================
    
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                if (href === '#' || href === '') return;
                
                const target = document.querySelector(href);
                
                if (target) {
                    e.preventDefault();
                    
                    const offsetTop = target.offsetTop - 70; // Account for fixed nav
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // ==================== 
    // FORM VALIDATION ENHANCEMENT
    // ====================
    
    function enhanceFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea');
            
            inputs.forEach(input => {
                // Add real-time validation
                input.addEventListener('blur', function() {
                    if (this.checkValidity()) {
                        this.classList.remove('error');
                        this.classList.add('valid');
                    } else {
                        this.classList.remove('valid');
                        this.classList.add('error');
                    }
                });
                
                // Clear error on focus
                input.addEventListener('focus', function() {
                    this.classList.remove('error');
                });
            });
        });
    }
    
    // ==================== 
    // LAZY LOADING ANIMATION
    // ====================
    
    function initLazyAnimation() {
        const elements = document.querySelectorAll('[data-animate]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        elements.forEach(el => observer.observe(el));
    }
    
    // ==================== 
    // PREVENT ZOOM ON INPUT FOCUS (iOS)
    // ====================
    
    function preventZoomOnInput() {
        const inputs = document.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            if (input.style.fontSize === '' || parseInt(input.style.fontSize) < 16) {
                input.style.fontSize = '16px';
            }
        });
    }
    
    // ==================== 
    // BACK TO TOP BUTTON
    // ====================
    
    function initBackToTop() {
        // Create button if it doesn't exist
        let backToTopBtn = document.querySelector('.back-to-top');
        
        if (!backToTopBtn) {
            backToTopBtn = document.createElement('button');
            backToTopBtn.className = 'back-to-top';
            backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
            backToTopBtn.setAttribute('aria-label', 'Back to top');
            document.body.appendChild(backToTopBtn);
        }
        
        // Show/hide on scroll
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
        
        // Scroll to top on click
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // ==================== 
    // RESIZE EVENT HANDLER
    // ====================
    
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            setVH();
            handleOrientationChange();
        }, 250);
    });
    
    // ==================== 
    // INITIALIZE ALL FEATURES
    // ====================
    
    createMobileMenu();
    optimizeImages();
    setVH();
    detectTouch();
    handleOrientationChange();
    makeTablesResponsive();
    initSmoothScroll();
    enhanceFormValidation();
    initLazyAnimation();
    preventZoomOnInput();
    initBackToTop();
    
    // Handle orientation change
    window.addEventListener('orientationchange', handleOrientationChange);
    
    console.log('✅ Mobile optimizations loaded');
});

// ==================== 
// PERFORMANCE MONITORING
// ====================

// Log page load time
window.addEventListener('load', function() {
    if (window.performance) {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        console.log(`📊 Page load time: ${loadTime}ms`);
    }
});
