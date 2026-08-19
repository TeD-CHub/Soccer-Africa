document.addEventListener('DOMContentLoaded', () => {
    
    // --- Navbar Scroll Effect ---
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Mobile Menu Toggle ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const icon = hamburger.querySelector('i');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        
        // Toggle icon between bars and times
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });



    // --- Scroll Animations (Intersection Observer) ---
    const scrollElements = document.querySelectorAll('.scroll-animate');

    const elementInView = (el, dividend = 1) => {
        const elementTop = el.getBoundingClientRect().top;
        return (elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend);
    };

    const displayScrollElement = (element) => {
        element.classList.add('show');
    };

    const handleScrollAnimation = () => {
        scrollElements.forEach((el) => {
            if (elementInView(el, 1.25)) {
                displayScrollElement(el);
            }
        });
    }

    // Trigger once on load
    handleScrollAnimation();

    // Trigger on scroll
    window.addEventListener('scroll', () => {
        handleScrollAnimation();
    });

    // --- Dark/Light Mode Toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    if (themeToggle && themeIcon) {
        // Check local storage for theme, default to light
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme !== 'dark') {
            document.body.classList.add('light-mode');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }

        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            let theme = 'dark';
            if (document.body.classList.contains('light-mode')) {
                theme = 'light';
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
            localStorage.setItem('theme', theme);
        });
    }

    // --- Contact Form Submission ---
    const contactForm = document.getElementById('academy-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            const subject = encodeURIComponent(`Inquiry from ${name}`);
            const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
            
            window.location.href = `mailto:info@soccerafricaint.com?subject=${subject}&body=${body}`;
        });
    }

    // --- PWA Installation & Service Worker Registration ---
    
    // Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('service-worker.js')
                .then(reg => console.log('Service Worker registered successfully:', reg.scope))
                .catch(err => console.error('Service Worker registration failed:', err));
        });
    }

    let deferredPrompt = null;
    const urlParams = new URLSearchParams(window.location.search);
    const forceShow = urlParams.get('test-pwa') === 'true';

    // Remove legacy HTML elements if they exist to prevent UI conflicts
    const cleanupLegacyPwaElements = () => {
        const oldBanner = document.getElementById('pwa-install-banner');
        const oldTooltip = document.getElementById('ios-install-tooltip');
        if (oldBanner) oldBanner.remove();
        if (oldTooltip) oldTooltip.remove();
    };
    cleanupLegacyPwaElements();

    // Dynamically inject new PWA install modal HTML
    const injectPWAModal = () => {
        if (document.getElementById('pwa-install-modal')) return;
        
        const modalHtml = `
            <div id="pwa-install-modal" class="pwa-modal">
                <div class="pwa-modal-overlay"></div>
                <div class="pwa-modal-card">
                    <button id="pwa-modal-close-btn" class="pwa-modal-close-btn" aria-label="Close modal">&times;</button>
                    <div class="pwa-modal-header">
                        <img src="assets/images/logo.jpeg" alt="Soccer Africa Logo" class="pwa-modal-logo">
                        <h2>Soccer Africa</h2>
                        <div class="pwa-modal-subtitle">Football Academy</div>
                    </div>
                    <div class="pwa-modal-body">
                        <p class="pwa-modal-description">Install the Soccer Africa App on your device for quick offline access, match updates, training schedules, and easy access!</p>
                        <div id="pwa-modal-platform-content"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    // Detect if device is running iOS or iPadOS (including Apple Silicon iPads)
    const isIos = () => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isStandardIos = /iphone|ipad|ipod/.test(userAgent);
        const isIPadOS = (navigator.maxTouchPoints > 0 && userAgent.includes('macintosh'));
        return isStandardIos || isIPadOS;
    };

    // Detect if device is in standalone mode (already installed)
    const isStandalone = () => {
        if (forceShow) return false;
        return (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator.standalone === true);
    };

    // Check if the user has already dismissed the prompt recently
    const isPromptDismissed = () => {
        if (forceShow) return false;
        const dismissedTime = localStorage.getItem('pwa-prompt-dismissed');
        if (!dismissedTime) return false;
        
        // Show again after 7 days if not installed
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        return (Date.now() - parseInt(dismissedTime, 10)) < oneWeek;
    };

    // Close Modal helper
    const closeModal = () => {
        const modal = document.getElementById('pwa-install-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    };

    // Show PWA Modal and render platform specific instructions/buttons
    const showPWAModal = () => {
        injectPWAModal();
        const modal = document.getElementById('pwa-install-modal');
        const contentDiv = document.getElementById('pwa-modal-platform-content');
        
        if (!modal || !contentDiv) return;
        
        // Clear previous content
        contentDiv.innerHTML = '';
        
        if (deferredPrompt) {
            // Direct install prompt supported
            contentDiv.innerHTML = `
                <button id="pwa-modal-install-btn" class="pwa-modal-action-btn">Install App</button>
                <button id="pwa-modal-later-btn" class="pwa-modal-secondary-btn">Maybe Later</button>
            `;
            
            document.getElementById('pwa-modal-install-btn').addEventListener('click', () => {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    } else {
                        console.log('User dismissed the install prompt');
                    }
                    deferredPrompt = null;
                });
                closeModal();
            });
            
            document.getElementById('pwa-modal-later-btn').addEventListener('click', () => {
                closeModal();
                localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
            });
            
        } else if (isIos()) {
            // iOS instructions
            contentDiv.innerHTML = `
                <div class="pwa-instructions-list">
                    <div class="pwa-instructions-title">
                        <i class="fa-solid fa-mobile-screen-button"></i> iOS Safari Instructions
                    </div>
                    <ul>
                        <li><i class="fa-solid fa-arrow-up-from-bracket"></i> <span>Tap the <strong>Share</strong> button in Safari (at the bottom toolbar).</span></li>
                        <li><i class="fa-regular fa-square-plus"></i> <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span></li>
                        <li><i class="fa-solid fa-circle-check"></i> <span>Tap <strong>Add</strong> in the top-right corner to finish.</span></li>
                    </ul>
                </div>
                <button id="pwa-modal-ok-btn" class="pwa-modal-action-btn">Got It</button>
            `;
            
            document.getElementById('pwa-modal-ok-btn').addEventListener('click', () => {
                closeModal();
                localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
            });
            
        } else {
            // Fallback for other browsers/desktops
            contentDiv.innerHTML = `
                <div class="pwa-instructions-list">
                    <div class="pwa-instructions-title">
                        <i class="fa-solid fa-laptop"></i> How to Install
                    </div>
                    <ul>
                        <li><i class="fa-solid fa-ellipsis-vertical"></i> <span>Click the <strong>Menu</strong> button (three dots/settings) in your browser.</span></li>
                        <li><i class="fa-solid fa-download"></i> <span>Select <strong>Install App</strong> or <strong>Save and share</strong> -> <strong>Install App</strong>.</span></li>
                        <li><i class="fa-solid fa-circle-info"></i> <span>Alternatively, look for the <strong>Install</strong> icon <i class="fa-solid fa-circle-arrow-down"></i> on the right side of the address bar.</span></li>
                    </ul>
                </div>
                <button id="pwa-modal-ok-btn" class="pwa-modal-action-btn">Got It</button>
            `;
            
            document.getElementById('pwa-modal-ok-btn').addEventListener('click', () => {
                closeModal();
                localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
            });
        }
        
        // Setup close events
        document.getElementById('pwa-modal-close-btn').addEventListener('click', () => {
            closeModal();
            localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
        });
        
        modal.querySelector('.pwa-modal-overlay').addEventListener('click', () => {
            closeModal();
            localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
        });

        // Show modal
        setTimeout(() => {
            modal.classList.add('show');
        }, 50);
    };

    // Auto-trigger PWA popup modal on load for iOS/other platforms if not dismissed
    window.addEventListener('load', () => {
        if (!isStandalone() && !isPromptDismissed()) {
            // Trigger auto popup for iOS Safari or other browsers immediately (since beforeinstallprompt is Chrome-specific)
            if (isIos()) {
                const userAgent = window.navigator.userAgent.toLowerCase();
                const isSafari = userAgent.includes('safari') && !userAgent.includes('crios') && !userAgent.includes('fxios');
                if (isSafari || forceShow) {
                    setTimeout(showPWAModal, forceShow ? 500 : 5000);
                }
            } else if (!deferredPrompt && forceShow) {
                // For local desktop testing
                setTimeout(showPWAModal, 500);
            }
        }
    });

    // Handle BeforeInstallPrompt event (Android/Chrome/Edge)
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show our custom unified modal if not installed and not recently dismissed
        if (!isStandalone() && !isPromptDismissed()) {
            setTimeout(showPWAModal, forceShow ? 500 : 5000);
        }
    });

    // Permanent Navbar Download Button Element
    const navDownloadBtn = document.getElementById('nav-download-btn');
    if (navDownloadBtn) {
        navDownloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showPWAModal();
        });
    }
});
