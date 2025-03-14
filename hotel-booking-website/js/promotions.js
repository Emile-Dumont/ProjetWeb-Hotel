document.addEventListener('DOMContentLoaded', function() {
    // Système de filtrage
    const filterButtons = document.querySelectorAll('.filter-btn');
    const promotions = document.querySelectorAll('.promotion');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Retirer la classe active de tous les boutons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Ajouter la classe active au bouton cliqué
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            // Afficher ou masquer les promotions en fonction du filtre
            promotions.forEach(promo => {
                if (filterValue === 'all' || promo.getAttribute('data-category') === filterValue) {
                    promo.style.display = 'block';
                    setTimeout(() => {
                        promo.style.opacity = '1';
                    }, 50);
                } else {
                    promo.style.opacity = '0';
                    setTimeout(() => {
                        promo.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // Compte à rebours
    const countdowns = document.querySelectorAll('.countdown');
    
    countdowns.forEach(countdown => {
        const targetDate = new Date(countdown.getAttribute('data-date')).getTime();
        
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;
            
            if (distance < 0) {
                countdown.innerHTML = '<p>Cette offre a expiré</p>';
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            
            countdown.querySelector('.days').textContent = days.toString().padStart(2, '0');
            countdown.querySelector('.hours').textContent = hours.toString().padStart(2, '0');
            countdown.querySelector('.minutes').textContent = minutes.toString().padStart(2, '0');
        };
        
        updateCountdown();
        setInterval(updateCountdown, 60000); // Mise à jour chaque minute
    });
    
    // Carrousel de témoignages
    const testimonials = document.querySelectorAll('.testimonial');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentIndex = 0;
    
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            testimonials[currentIndex].classList.remove('active');
            currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
            testimonials[currentIndex].classList.add('active');
        });
        
        nextBtn.addEventListener('click', () => {
            testimonials[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % testimonials.length;
            testimonials[currentIndex].classList.add('active');
        });
        
        // Rotation automatique des témoignages
        setInterval(() => {
            nextBtn.click();
        }, 5000);
    }
});