document.addEventListener('DOMContentLoaded', function() {
    // Gestion de la galerie d'images améliorée
    const mainImage = document.getElementById('main-gallery-image');
    const thumbnails = document.querySelectorAll('.thumbnail-images .thumb');
    const currentImageIndicator = document.getElementById('current-image');
    const totalImagesIndicator = document.getElementById('total-images');
    const prevButton = document.getElementById('prev-image');
    const nextButton = document.getElementById('next-image');
    const zoomButton = document.getElementById('zoom-image');
    
    // Variables de gestion de la galerie
    let currentImageIndex = 0;
    const totalImages = thumbnails.length;
    
    // Initialiser les indicateurs
    totalImagesIndicator.textContent = totalImages;
    currentImageIndicator.textContent = currentImageIndex + 1;
    
    // Fonction pour changer l'image principale
    function changeMainImage(index) {
        // Mettre à jour l'image active
        thumbnails.forEach((thumb, idx) => {
            if (idx === index) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
        
        // Définir la nouvelle image
        const newSrc = thumbnails[index].getAttribute('data-src');
        const newAlt = thumbnails[index].getAttribute('alt');
        
        // Animation de transition
        mainImage.style.opacity = '0';
        setTimeout(() => {
            mainImage.src = newSrc;
            mainImage.alt = newAlt;
            mainImage.style.opacity = '1';
            currentImageIndicator.textContent = index + 1;
        }, 200);
        
        // Mettre à jour l'index courant
        currentImageIndex = index;
    }
    
    // Ajouter des événements de clic sur les miniatures
    thumbnails.forEach((thumb, index) => {
        thumb.addEventListener('click', function() {
            changeMainImage(index);
        });
    });
    
    // Navigation avec les boutons précédent/suivant
    prevButton.addEventListener('click', function() {
        const newIndex = (currentImageIndex - 1 + totalImages) % totalImages;
        changeMainImage(newIndex);
    });
    
    nextButton.addEventListener('click', function() {
        const newIndex = (currentImageIndex + 1) % totalImages;
        changeMainImage(newIndex);
    });
    
    // Gestion du Lightbox
    const lightbox = document.getElementById('image-lightbox');
    const lightboxImage = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    
    // Fonction pour ouvrir le lightbox
    function openLightbox(index) {
        const src = thumbnails[index].getAttribute('data-src');
        const caption = thumbnails[index].getAttribute('data-caption');
        
        lightboxImage.src = src;
        lightboxCaption.textContent = caption || '';
        
        // Afficher le lightbox
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Empêcher le défilement
        
        // Mettre à jour l'index courant
        currentImageIndex = index;
    }
    
    // Fonction pour fermer le lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Réactiver le défilement
    }
    
    // Ouvrir le lightbox en cliquant sur l'icône de zoom ou sur l'image principale
    zoomButton.addEventListener('click', function() {
        openLightbox(currentImageIndex);
    });
    
    mainImage.addEventListener('click', function() {
        openLightbox(currentImageIndex);
    });
    
    // Fermer le lightbox
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function(e) {
        // Fermer seulement si on clique en dehors du contenu
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Navigation dans le lightbox
    lightboxPrev.addEventListener('click', function() {
        const newIndex = (currentImageIndex - 1 + totalImages) % totalImages;
        currentImageIndex = newIndex;
        
        const src = thumbnails[newIndex].getAttribute('data-src');
        const caption = thumbnails[newIndex].getAttribute('data-caption');
        
        lightboxImage.style.opacity = '0';
        setTimeout(() => {
            lightboxImage.src = src;
            lightboxCaption.textContent = caption || '';
            lightboxImage.style.opacity = '1';
        }, 200);
    });
    
    lightboxNext.addEventListener('click', function() {
        const newIndex = (currentImageIndex + 1) % totalImages;
        currentImageIndex = newIndex;
        
        const src = thumbnails[newIndex].getAttribute('data-src');
        const caption = thumbnails[newIndex].getAttribute('data-caption');
        
        lightboxImage.style.opacity = '0';
        setTimeout(() => {
            lightboxImage.src = src;
            lightboxCaption.textContent = caption || '';
            lightboxImage.style.opacity = '1';
        }, 200);
    });
    
    // Navigation avec touches du clavier dans le lightbox
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') lightboxPrev.click();
        if (e.key === 'ArrowRight') lightboxNext.click();
    });
    
    // Le reste de votre code existant pour la réservation
    // Gestion du formulaire de réservation
    const bookingForm = document.querySelector('.booking-form form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Récupérer les valeurs du formulaire
            const checkIn = document.getElementById('check-in').value;
            const checkOut = document.getElementById('check-out').value;
            const guests = document.getElementById('guests').value;
            const roomType = document.getElementById('room-type').value;
            
            // Ici, vous pourriez ajouter du code pour envoyer ces données à un serveur
            // ou rediriger vers une page de confirmation
            
            console.log('Réservation:', { checkIn, checkOut, guests, roomType });
            alert('Votre réservation a été effectuée avec succès !');
        });
    }
    
    // Calculer dynamiquement le prix total
    const updatePriceCalculation = () => {
        const checkIn = new Date(document.getElementById('check-in').value);
        const checkOut = new Date(document.getElementById('check-out').value);
        const roomType = document.getElementById('room-type').value;
        
        // Si les dates sont valides
        if (checkIn && checkOut && checkIn < checkOut) {
            const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            let pricePerNight = 180; // Prix par défaut pour chambre standard
            
            // Ajuster le prix selon le type de chambre
            if (roomType === 'deluxe') pricePerNight = 250;
            if (roomType === 'suite') pricePerNight = 400;
            
            const totalBeforeDiscount = pricePerNight * nights;
            const discount = Math.round(totalBeforeDiscount * 0.2); // Réduction de 20%
            const total = totalBeforeDiscount - discount;
            
            // Mettre à jour l'affichage du prix
            const priceElements = document.querySelectorAll('.price-summary .price-row');
            if (priceElements.length >= 3) {
                priceElements[0].innerHTML = `<span>${pricePerNight}€ x ${nights} nuit${nights > 1 ? 's' : ''}</span><span>${totalBeforeDiscount}€</span>`;
                priceElements[1].innerHTML = `<span>Réduction</span><span>-${discount}€</span>`;
                priceElements[2].innerHTML = `<span>Total</span><span>${total}€</span>`;
            }
        }
    };
    
    // Ajouter des écouteurs d'événements pour le prix
    const checkInInput = document.getElementById('check-in');
    const checkOutInput = document.getElementById('check-out');
    const roomTypeSelect = document.getElementById('room-type');
    
    if (checkInInput && checkOutInput && roomTypeSelect) {
        checkInInput.addEventListener('change', updatePriceCalculation);
        checkOutInput.addEventListener('change', updatePriceCalculation);
        roomTypeSelect.addEventListener('change', updatePriceCalculation);
    }
});
