// Common functionality
document.addEventListener('DOMContentLoaded', function() {
    // Determine which page we're on
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Common functionality for all pages
    initializeNavbar();
    
    // Page-specific functionality
    switch(currentPage) {
        case 'index.html':
            initializeHomePage();
            break;
        case 'hotels.html':
            initializeHotelsPage();
            break;
        case 'reservations.html':
            initializeReservationsPage();
            break;
        case 'promotions.html':
            initializePromotionsPage();
            break;
        case 'contact.html':
            initializeContactPage();
            break;
    }
});

// Navbar functionality
function initializeNavbar() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            hamburger.classList.toggle('active');
        });
    }
}

// Page-specific functions
function initializeHomePage() {
    // Code from index.js
    console.log('Home page initialized');
    // Add all functionality from index.js here
}

function initializeHotelsPage() {
    // Code from hotels.js
    console.log('Hotels page initialized');
    // Add all functionality from hotels.js here
}

function initializeReservationsPage() {
    // Code from reservations.js
    console.log('Reservations page initialized');
    // Add all functionality from reservations.js here
}

function initializePromotionsPage() {
    // Code from promotions.js
    console.log('Promotions page initialized');
    // Add all functionality from promotions.js here
}

function initializeContactPage() {
    // Code from contact.js
    console.log('Contact page initialized');
    
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Form submission logic here
            alert('Message envoyé avec succès!');
            this.reset();
        });
    }
}