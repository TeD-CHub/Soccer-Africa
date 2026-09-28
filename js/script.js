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

    const isAndroid = () => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        return userAgent.includes('android');
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
            
        } else if (isAndroid()) {
            // Android Direct APK download fallback
            contentDiv.innerHTML = `
                <div class="pwa-instructions-list" style="text-align: center; padding: 20px;">
                    <i class="fa-solid fa-circle-arrow-down" style="font-size: 3rem; color: var(--primary); margin-bottom: 15px;"></i>
                    <p style="margin-bottom: 0;">Your browser doesn't support direct web installation. Download the official Android App package (APK) directly to install it.</p>
                </div>
                <a href="soccer-africa.apk" download="soccer-africa.apk" id="pwa-modal-download-btn" class="pwa-modal-action-btn" style="display: block; text-decoration: none; text-align: center; line-height: 1;">Download APK</a>
                <button id="pwa-modal-ok-btn" class="pwa-modal-secondary-btn">Maybe Later</button>
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
            if (isAndroid()) {
                // Download APK directly (download app directly)
                window.location.href = 'soccer-africa.apk';
            } else if (deferredPrompt) {
                e.preventDefault();
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    }
                    deferredPrompt = null;
                });
            } else {
                e.preventDefault();
                showPWAModal();
            }
        });
    }

    // --- Scholarship News Spotlight & Interactive Lightbox ---
    const initScholarshipSpotlight = () => {
        const spotlightImg = document.getElementById('spotlight-main-img');
        const badgeLabel = document.getElementById('spotlight-badge-label');
        const tabs = document.querySelectorAll('.spotlight-tab');
        const insetBtn = document.getElementById('spotlight-inset-btn');
        const lightboxModal = document.getElementById('scholarship-lightbox-modal');
        const lightboxImg = document.getElementById('lightbox-modal-img');
        const lightboxTitle = document.getElementById('lightbox-modal-title');
        const lightboxDesc = document.getElementById('lightbox-modal-desc');
        const lightboxCounter = document.getElementById('lightbox-counter');
        const closeBtn = document.querySelector('.scholarship-modal-close');
        const overlay = document.querySelector('.scholarship-modal-overlay');
        const prevBtn = document.querySelector('.lightbox-nav-btn.prev-btn');
        const nextBtn = document.querySelector('.lightbox-nav-btn.next-btn');
        const zoomBtn = document.getElementById('open-scholarship-lightbox');
        const viewPhotosBtn = document.getElementById('btn-view-photos');
        const mediaContainer = document.getElementById('scholarship-media-container');

        if (!spotlightImg && !lightboxModal) return;

        const galleryData = [
            {
                src: 'assets/images/hospital-hill-scholarship.jpg',
                label: 'Hospital Hill High School',
                title: 'Hospital Hill School Grade 10 Scholarship',
                desc: 'Joel Okhanya and Rason Chitu in their official green school uniform alongside Coach Arnold Maina and mentor upon arriving at Hospital Hill School.',
                alt: 'Joel Okhanya and Rason Chitu in Hospital Hill School Uniform with Coach Arnold Maina'
            },
            {
                src: 'assets/images/okhanya-joel-grassroots.jpg',
                label: 'Soccer Africa Pitch Roots',
                title: 'Grassroots Roots & Academy Dedication',
                desc: 'Joel Okhanya (#69) at the academy grounds — representing years of grueling practice, relentless training, and character development at Soccer Africa.',
                alt: 'Joel Okhanya in Soccer Africa red jersey #69 at grassroots training'
            },
            {
                src: 'assets/images/scholarship-announcement.jpg',
                label: 'Official Scholarship Release',
                title: 'Official Community & Partner Release',
                desc: 'Official announcement celebrating Joel Okhanya and Rason Chitu securing their football scholarship brokered by Coach Arnold Maina.',
                alt: 'Official social announcement celebrating the football scholarship'
            }
        ];

        let currentIndex = 0;

        const updateSpotlightView = (index) => {
            if (index < 0 || index >= galleryData.length) return;
            currentIndex = index;
            const item = galleryData[index];

            if (spotlightImg) {
                spotlightImg.style.opacity = '0.25';
                setTimeout(() => {
                    spotlightImg.src = item.src;
                    spotlightImg.alt = item.alt;
                    spotlightImg.style.opacity = '1';
                }, 160);
            }

            if (badgeLabel) {
                badgeLabel.innerHTML = `<i class="fas fa-camera"></i> ${item.label}`;
            }

            tabs.forEach((tab, i) => {
                tab.classList.toggle('active', i === index);
            });
        };

        tabs.forEach((tab, index) => {
            tab.addEventListener('click', (e) => {
                e.stopPropagation();
                updateSpotlightView(index);
            });
        });

        if (insetBtn) {
            insetBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const nextIndex = currentIndex === 1 ? 0 : 1;
                updateSpotlightView(nextIndex);
            });
        }

        const openLightbox = (index) => {
            if (!lightboxModal) return;
            currentIndex = index;
            const item = galleryData[index];
            if (lightboxImg) {
                lightboxImg.src = item.src;
                lightboxImg.alt = item.alt;
            }
            if (lightboxTitle) lightboxTitle.textContent = item.title;
            if (lightboxDesc) lightboxDesc.textContent = item.desc;
            if (lightboxCounter) lightboxCounter.textContent = `${index + 1} / ${galleryData.length}`;

            lightboxModal.classList.add('show');
            lightboxModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        };

        const closeLightbox = () => {
            if (!lightboxModal) return;
            lightboxModal.classList.remove('show');
            lightboxModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };

        const navigateLightbox = (direction) => {
            let nextIndex = currentIndex + direction;
            if (nextIndex < 0) nextIndex = galleryData.length - 1;
            if (nextIndex >= galleryData.length) nextIndex = 0;
            openLightbox(nextIndex);
            updateSpotlightView(nextIndex);
        };

        if (zoomBtn) {
            zoomBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openLightbox(currentIndex);
            });
        }

        if (mediaContainer) {
            mediaContainer.addEventListener('click', (e) => {
                if (!e.target.closest('.spotlight-inset-preview') && !e.target.closest('.spotlight-zoom-btn')) {
                    openLightbox(currentIndex);
                }
            });
        }

        if (viewPhotosBtn) {
            viewPhotosBtn.addEventListener('click', () => {
                openLightbox(0);
            });
        }

        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        if (overlay) overlay.addEventListener('click', closeLightbox);
        if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(-1); });
        if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(1); });

        // Keyboard navigation for lightbox
        document.addEventListener('keydown', (e) => {
            if (!lightboxModal || !lightboxModal.classList.contains('show')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') navigateLightbox(-1);
            if (e.key === 'ArrowRight') navigateLightbox(1);
        });
    };
    initScholarshipSpotlight();
});
