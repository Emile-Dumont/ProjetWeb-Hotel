// filepath: /c:/Users/clement.rubin/OneDrive - JUNIA Grande école d'ingénieurs/Documents/COURS CIR 2/SEM 2/WEB/Projet/Projet_JS/js/main.js

document.addEventListener('DOMContentLoaded', function() {
    // Search functionality
    const searchButton = document.querySelector('.search-box button');
    const searchInput = document.querySelector('.search-input-container input');

    searchButton.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (query) {
            // Redirect to hotels page with search query
            window.location.href = `hotels.html?search=${encodeURIComponent(query)}`;
        } else {
            alert('Veuillez entrer une destination.');
        }
    });

    // Responsive navigation
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navLinks.contains(event.target) || hamburger.contains(event.target);
        
        if (!isClickInsideNav && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });

    // Highlight active navigation link
    const currentLocation = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-links li');
    
    navItems.forEach(item => {
        const link = item.querySelector('a');
        const href = link.getAttribute('href');
        
        if (currentLocation.includes(href) && href !== 'index.html') {
            item.classList.add('active');
        } else if (currentLocation.endsWith('/') || currentLocation.endsWith('index.html')) {
            if (href === 'index.html') {
                item.classList.add('active');
            }
        }
    });
});