document.addEventListener('DOMContentLoaded', function() {
    // Initialiser l'authentification
    if (typeof initAuth === 'function') {
        initAuth();
    }
    
    // Galerie d'images
    const mainImage = document.getElementById('main-gallery-image');
    const thumbs = document.querySelectorAll('.thumb');
    const zoomIcon = document.getElementById('zoom-image');
    const lightbox = document.getElementById('image-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');
    const prevButton = document.getElementById('prev-image');
    const nextButton = document.getElementById('next-image');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const currentImageNum = document.getElementById('current-image');
    const totalImages = document.getElementById('total-images');
    
    let currentIndex = 0;
    
    // Initialisation du compteur d'images
    if (totalImages) {
        totalImages.textContent = thumbs.length;
    }
    
    // Fonction pour précharger les images
    function preloadImages() {
        thumbs.forEach(thumb => {
            const img = new Image();
            img.src = thumb.getAttribute('data-src');
        });
    }
    
    // Précharger les images pour améliorer la qualité d'affichage
    preloadImages();
    
    // Fonction pour changer l'image principale
    function changeMainImage(index) {
        thumbs.forEach(thumb => thumb.classList.remove('active'));
        thumbs[index].classList.add('active');
        
        // Créer une nouvelle image et la remplacer seulement quand elle est chargée
        const newImg = new Image();
        newImg.onload = function() {
            mainImage.src = this.src;
        };
        newImg.src = thumbs[index].getAttribute('data-src');
        
        currentIndex = index;
        
        if (currentImageNum) {
            currentImageNum.textContent = index + 1;
        }
    }
    
    // Ajouter les écouteurs d'événements aux miniatures
    thumbs.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
            changeMainImage(index);
        });
    });
    
    // Navigation avec les flèches
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            let newIndex = currentIndex - 1;
            if (newIndex < 0) newIndex = thumbs.length - 1;
            changeMainImage(newIndex);
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            let newIndex = currentIndex + 1;
            if (newIndex >= thumbs.length) newIndex = 0;
            changeMainImage(newIndex);
        });
    }
    
    // Zoom (ouverture de la lightbox)
    if (zoomIcon) {
        zoomIcon.addEventListener('click', () => {
            lightboxImg.src = mainImage.src;
            lightboxCaption.textContent = thumbs[currentIndex].getAttribute('data-caption') || '';
            lightbox.classList.add('active');
        });
    }
    
    // Fermeture de la lightbox
    if (lightboxClose) {
        lightboxClose.addEventListener('click', () => {
            lightbox.classList.remove('active');
        });
    }
    
    // Navigation dans la lightbox
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', () => {
            let newIndex = currentIndex - 1;
            if (newIndex < 0) newIndex = thumbs.length - 1;
            changeMainImage(newIndex);
            lightboxImg.src = thumbs[newIndex].getAttribute('data-src');
            lightboxCaption.textContent = thumbs[newIndex].getAttribute('data-caption') || '';
        });
    }
    
    if (lightboxNext) {
        lightboxNext.addEventListener('click', () => {
            let newIndex = currentIndex + 1;
            if (newIndex >= thumbs.length) newIndex = 0;
            changeMainImage(newIndex);
            lightboxImg.src = thumbs[newIndex].getAttribute('data-src');
            lightboxCaption.textContent = thumbs[newIndex].getAttribute('data-caption') || '';
        });
    }
    
    // Fermer la lightbox en cliquant en dehors de l'image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
        }
    });
    
    // Touches du clavier pour la navigation
    document.addEventListener('keydown', (e) => {
        if (lightbox.classList.contains('active')) {
            if (e.key === 'Escape') {
                lightbox.classList.remove('active');
            } else if (e.key === 'ArrowLeft') {
                lightboxPrev.click();
            } else if (e.key === 'ArrowRight') {
                lightboxNext.click();
            }
        }
    });
    
    // Formulaire de réservation
    const checkInInput = document.getElementById('check-in');
    const checkOutInput = document.getElementById('check-out');
    
    if (checkInInput && checkOutInput) {
        // Définir la date d'aujourd'hui comme minimum pour l'arrivée
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const formattedToday = today.toISOString().split('T')[0];
        const formattedTomorrow = tomorrow.toISOString().split('T')[0];
        
        checkInInput.min = formattedToday;
        checkInInput.value = formattedToday;
        
        checkOutInput.min = formattedTomorrow;
        checkOutInput.value = formattedTomorrow;
        
        // Mettre à jour la date minimale de départ en fonction de la date d'arrivée
        checkInInput.addEventListener('change', function() {
            const newMinDate = new Date(this.value);
            newMinDate.setDate(newMinDate.getDate() + 1);
            const formattedNewMin = newMinDate.toISOString().split('T')[0];
            
            checkOutInput.min = formattedNewMin;
            
            if (new Date(checkOutInput.value) <= new Date(this.value)) {
                checkOutInput.value = formattedNewMin;
            }
            
            updatePriceSummary();
        });
        
        checkOutInput.addEventListener('change', updatePriceSummary);
        
        // Mettre à jour le récapitulatif des prix
        function updatePriceSummary() {
            const checkIn = new Date(checkInInput.value);
            const checkOut = new Date(checkOutInput.value);
            const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            
            const priceElement = document.querySelector('.room-price .price, .current-price');
            let pricePerNight = 0;
            
            if (priceElement) {
                pricePerNight = parseInt(priceElement.textContent.replace('€', ''), 10);
            }
            
            const totalPrice = pricePerNight * nights;
            
            const priceSummary = document.querySelector('.price-summary');
            if (priceSummary) {
                const priceRow = priceSummary.querySelector('.price-row:not(.total)');
                const totalRow = priceSummary.querySelector('.price-row.total');
                
                if (priceRow && totalRow) {
                    priceRow.innerHTML = `<span>${pricePerNight}€ x ${nights} nuit${nights > 1 ? 's' : ''}</span><span>${totalPrice}€</span>`;
                    totalRow.innerHTML = `<span>Total</span><span>${totalPrice}€</span>`;
                }
            }
        }
        
        // Initial update
        updatePriceSummary();
    }
});
