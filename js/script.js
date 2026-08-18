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
            // Note: service-worker.js is located at the web root
            navigator.serviceWorker.register('service-worker.js')
                .then(reg => console.log('Service Worker registered successfully:', reg.scope))
                .catch(err => console.error('Service Worker registration failed:', err));
        });
    }

    // PWA Install Banner Elements
    const pwaBanner = document.getElementById('pwa-install-banner');
    const pwaInstallBtn = document.getElementById('pwa-install-btn');
    const pwaCloseBtn = document.getElementById('pwa-close-btn');
    
    // iOS Tooltip Elements
    const iosTooltip = document.getElementById('ios-install-tooltip');
    const iosCloseBtn = document.getElementById('ios-close-btn');

    let deferredPrompt = null;

    // Detect testing mode via URL parameter (e.g. ?test-pwa=true)
    const urlParams = new URLSearchParams(window.location.search);
    const forceShow = urlParams.get('test-pwa') === 'true';

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

    // Helper to show PWA banner
    const showPWABanner = () => {
        if (pwaBanner) {
            setTimeout(() => {
                pwaBanner.classList.remove('hidden');
                setTimeout(() => pwaBanner.classList.add('show'), 50);
            }, forceShow ? 500 : 3000);
        }
    };

    // Helper to show iOS tooltip
    const showIOSTooltip = () => {
        if (iosTooltip) {
            setTimeout(() => {
                iosTooltip.classList.remove('hidden');
                setTimeout(() => iosTooltip.classList.add('show'), 50);
            }, forceShow ? 500 : 3000);
        }
    };

    // Handle BeforeInstallPrompt event (Android/Chrome)
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        
        // Show our custom banner if not installed and not recently dismissed
        if (!isStandalone() && !isPromptDismissed()) {
            showPWABanner();
        }
    });

    // Handle install button click
    if (pwaInstallBtn) {
        pwaInstallBtn.addEventListener('click', () => {
            if (deferredPrompt) {
                // Show the native prompt
                deferredPrompt.prompt();
                // Wait for the user to respond to the prompt
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    } else {
                        console.log('User dismissed the install prompt');
                    }
                    deferredPrompt = null;
                });
                
                // Hide banner
                if (pwaBanner) {
                    pwaBanner.classList.remove('show');
                    setTimeout(() => pwaBanner.classList.add('hidden'), 500);
                }
            } else {
                // Fallback for when deferredPrompt is not available (e.g. testing on desktop)
                alert('To install the app:\n1. Click your browser menu button (e.g., three dots in Chrome, or settings).\n2. Select "Save and share" -> "Install app", or click the install icon in the URL bar.');
            }
        });
    }

    // Handle close button click
    if (pwaCloseBtn) {
        pwaCloseBtn.addEventListener('click', () => {
            if (pwaBanner) {
                pwaBanner.classList.remove('show');
                setTimeout(() => pwaBanner.classList.add('hidden'), 500);
                // Save dismiss state
                localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
            }
        });
    }

    // Show iOS Add to Home Screen Tooltip
    // Only show on iOS, if using Safari, not already installed, and not recently dismissed
    if (forceShow || (isIos() && !isStandalone() && !isPromptDismissed())) {
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isSafari = userAgent.includes('safari') && !userAgent.includes('crios') && !userAgent.includes('fxios');
        
        if (isSafari || forceShow) {
            showIOSTooltip();
        }
    }


    // Handle iOS tooltip close button click
    if (iosCloseBtn) {
        iosCloseBtn.addEventListener('click', () => {
            if (iosTooltip) {
                iosTooltip.classList.remove('show');
                setTimeout(() => iosTooltip.classList.add('hidden'), 500);
                // Save dismiss state
                localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
            }
        });
    }
});
