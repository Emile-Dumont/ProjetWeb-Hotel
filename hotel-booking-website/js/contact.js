// filepath: /c:/Users/clement.rubin/OneDrive - JUNIA Grande école d'ingénieurs/Documents/COURS CIR 2/SEM 2/WEB/Projet/Projet_JS/js/contact.js

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };

        // Simulate form submission
        console.log('Form submitted:', data);
        
        // Display a success message (this can be replaced with actual submission logic)
        alert('Merci pour votre message! Nous vous contacterons bientôt.');
        
        // Reset the form
        contactForm.reset();
    });
});