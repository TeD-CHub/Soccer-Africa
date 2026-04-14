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


});
