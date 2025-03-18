// js/reservations.js
document.addEventListener('DOMContentLoaded', function() {
    // Éléments du formulaire
    const form = document.getElementById('reservationForm');
    const formSteps = document.querySelectorAll('.form-step');
    const progressBar = document.getElementById('progress');
    const progressSteps = document.querySelectorAll('.progress-step');
    const nextButtons = document.querySelectorAll('.btn-next');
    const prevButtons = document.querySelectorAll('.btn-prev');
    
    // Données hôtels
    const hotelData = {
        '1': {
            name: 'Hôtel Luxe Paris',
            location: 'Paris, France',
            image: 'assets/images/hotels/hotelparis.jpeg',
            description: 'Élégance parisienne au cœur de la ville lumière.',
            prices: {
                'Standard': 120,
                'Deluxe': 180,
                'Suite': 250
            }
        },
        '2': {
            name: 'Resort Méditerranée',
            location: 'Nice, France',
            image: 'assets/images/hotels/hotelmed.jpg',
            description: 'Séjour enchanteur avec vue sur la Méditerranée.',
            prices: {
                'Standard': 150,
                'Deluxe': 220,
                'Suite': 300
            }
        },
        '3': {
            name: 'Chalet Alpin',
            location: 'Chamonix, France',
            image: 'assets/images/hotels/chaletalpin.jpg',
            description: 'Refuge de montagne avec vue imprenable sur le Mont-Blanc.',
            prices: {
                'Standard': 180,
                'Deluxe': 250,
                'Suite': 380
            }
        }
    };

    // État actuel du formulaire
    let currentStep = 0;
    let reservationData = {};

    // Initialisation
    updateProgressBar();
    initDateInputs();
    setupHotelSelection();
    calculatePrices();
    displaySessionErrors();
    loadSavedFormData();

    // Gestion des boutons suivant/précédent
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (validateCurrentStep()) {
                if (currentStep < formSteps.length - 1) {
                    goToStep(currentStep + 1);
                } else {
                    // Si dernière étape, soumettre le formulaire
                    updateReservationData();
                    showLoadingIndicator();
                    form.submit();
                }
            }
        });
    });

    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            goToStep(currentStep - 1);
        });
    });

    // Vérifier et afficher les erreurs de session
    function displaySessionErrors() {
        // Dans une implémentation réelle, on récupérerait les erreurs via AJAX
        // Ici on simule un contrôle des erreurs via l'URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('errors')) {
            const errorContainer = document.createElement('div');
            errorContainer.className = 'error-container';
            errorContainer.innerHTML = '<p>Des erreurs sont survenues, veuillez vérifier vos informations.</p>';
            
            // Insérer au début du formulaire
            form.insertBefore(errorContainer, form.firstChild);
            
            // Faire défiler vers les erreurs
            errorContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Charger les données du formulaire sauvegardées
    function loadSavedFormData() {
        const savedData = localStorage.getItem('reservation_data');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                // Remplir les champs avec les données sauvegardées
                if (data.hotel_id) document.getElementById('hotel_id').value = data.hotel_id;
                if (data.check_in) document.getElementById('check_in').value = data.check_in;
                if (data.check_out) document.getElementById('check_out').value = data.check_out;
                if (data.guests) document.getElementById('guests').value = data.guests;
                
                // Si on a atteint l'étape où les champs sont disponibles
                if (document.getElementById('name')) {
                    if (data.name) document.getElementById('name').value = data.name;
                    if (data.email) document.getElementById('email').value = data.email;
                    if (data.phone) document.getElementById('phone').value = data.phone;
                    if (data.special_requests) document.getElementById('special_requests').value = data.special_requests;
                }
                
                // Mise à jour des éléments dynamiques
                updateHotelPreview();
                calculatePrices();
            } catch (e) {
                console.error("Erreur lors du chargement des données sauvegardées:", e);
                localStorage.removeItem('reservation_data');
            }
        }
    }

    // Navigation entre les étapes
    function goToStep(step) {
        if (step >= 0 && step < formSteps.length) {
            updateReservationData();
            formSteps[currentStep].classList.remove('active');
            formSteps[step].classList.add('active');
            currentStep = step;
            updateProgressBar();
            updateSummary();
            
            // Scroll vers le haut du formulaire
            formSteps[currentStep].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Mise à jour de la barre de progression
    function updateProgressBar() {
        if (!progressBar || !progressSteps.length) return;
        
        // Calculer la largeur de la barre
        const progress = (currentStep / (formSteps.length - 1)) * 100;
        progressBar.style.width = progress + '%';
        
        // Mettre à jour les étapes
        progressSteps.forEach((step, index) => {
            if (index <= currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    // Validation de l'étape actuelle
    function validateCurrentStep() {
        const currentForm = formSteps[currentStep];
        let isValid = true;
        
        // Validation des champs requis
        const requiredFields = currentForm.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                markFieldAsInvalid(field, "Ce champ est obligatoire");
                isValid = false;
            } else {
                clearFieldValidation(field);
            }
        });
        
        // Validation spécifique par étape
        if (currentStep === 0) {
            // Validation de l'étape 1 (hôtel et dates)
            const checkIn = new Date(document.getElementById('check_in').value);
            const checkOut = new Date(document.getElementById('check_out').value);
            
            if (checkOut <= checkIn) {
                markFieldAsInvalid(document.getElementById('check_out'), 
                    "La date de départ doit être postérieure à la date d'arrivée");
                isValid = false;
            }
        } else if (currentStep === 2) {
            // Validation de l'étape 3 (informations personnelles)
            const emailField = document.getElementById('email');
            const email = emailField.value.trim();
            
            if (email && !isValidEmail(email)) {
                markFieldAsInvalid(emailField, "Veuillez entrer une adresse email valide");
                isValid = false;
            }
            
            const phoneField = document.getElementById('phone');
            const phone = phoneField.value.trim();
            
            if (phone && !isValidPhone(phone)) {
                markFieldAsInvalid(phoneField, "Veuillez entrer un numéro de téléphone valide");
                isValid = false;
            }
        }
        
        return isValid;
    }

    // Utilitaires de validation
    function markFieldAsInvalid(field, message) {
        field.classList.add('invalid');
        
        // Supprimer tout message d'erreur existant
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Créer et ajouter le message d'erreur
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        field.parentNode.appendChild(errorElement);
    }

    function clearFieldValidation(field) {
        field.classList.remove('invalid');
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    function isValidEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    }

    function isValidPhone(phone) {
        // Accepte différents formats internationaux
        const re = /^(\+\d{1,3})?[-.\s]?$ ?\d{1,4} $?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
        return re.test(phone);
    }

    // Initialisation des champs de date
    function initDateInputs() {
        const today = new Date();
        const checkIn = document.getElementById('check_in');
        const checkOut = document.getElementById('check_out');
        
        // Format YYYY-MM-DD
        const formattedToday = today.toISOString().split('T')[0];
        
        // Date minimale = aujourd'hui
        checkIn.min = formattedToday;
        
        // Valeur par défaut = aujourd'hui si non défini
        if (!checkIn.value) {
            checkIn.value = formattedToday;
        }
        
        // Gérer les changements de date d'arrivée
        checkIn.addEventListener('change', function() {
            // Date de départ min = date d'arrivée + 1 jour
            const nextDay = new Date(this.value);
            nextDay.setDate(nextDay.getDate() + 1);
            const formattedNextDay = nextDay.toISOString().split('T')[0];
            
            checkOut.min = formattedNextDay;
            
            // Si date de départ < nouvelle date minimale, mettre à jour
            if (!checkOut.value || checkOut.value < formattedNextDay) {
                checkOut.value = formattedNextDay;
            }
            
            updateSummary();
            calculatePrices();
        });
        
        // Définir date de départ par défaut = date d'arrivée + 1 jour
        if (!checkOut.value && checkIn.value) {
            const nextDay = new Date(checkIn.value);
            nextDay.setDate(nextDay.getDate() + 1);
            checkOut.value = nextDay.toISOString().split('T')[0];
        }
        
        // Recalculer les prix quand les dates changent
        checkOut.addEventListener('change', function() {
            updateSummary();
            calculatePrices();
        });
    }

    // Configuration du sélecteur d'hôtel
    function setupHotelSelection() {
        const hotelSelect = document.getElementById('hotel_id');
        const guestsInput = document.getElementById('guests');
        
        if (hotelSelect) {
            hotelSelect.addEventListener('change', function() {
                updateHotelPreview();
                setupRoomTypeSelection();
                calculatePrices();
                updateSummary();
            });
            
            // Initialiser l'aperçu
            if (hotelSelect.value) {
                updateHotelPreview();
                setupRoomTypeSelection();
            }
        }
        
        if (guestsInput) {
            guestsInput.addEventListener('change', function() {
                updateSummary();
                calculatePrices();
            });
        }
    }

    // Mise à jour de l'aperçu de l'hôtel
    function updateHotelPreview() {
        const hotelId = document.getElementById('hotel_id').value;
        const hotelPreview = document.getElementById('hotel-preview');
        
        if (!hotelPreview) return;
        
        if (hotelId && hotelData[hotelId]) {
            const hotel = hotelData[hotelId];
            hotelPreview.innerHTML = `
                <div class="hotel-preview-content">
                    <img src="${hotel.image}" alt="${hotel.name}" class="hotel-preview-image">
                    <div class="hotel-preview-details">
                        <h3>${hotel.name}</h3>
                        <p><i class="fas fa-map-marker-alt"></i> ${hotel.location}</p>
                        <p class="hotel-description">${hotel.description}</p>
                    </div>
                </div>
            `;
            hotelPreview.style.display = 'block';
        } else {
            hotelPreview.style.display = 'none';
        }
    }

    // Configuration des types de chambres
    function setupRoomTypeSelection() {
        // Si l'étape des chambres est déjà visible
        if (currentStep >= 1) {
            updateRoomOptions();
        }
        
        // Écouteurs pour le changement de type de chambre
        document.querySelectorAll('input[name="room_type"]').forEach(radio => {
            radio.addEventListener('change', function() {
                calculatePrices();
                updateSummary();
            });
        });
    }

    // Mise à jour des options de chambres
    function updateRoomOptions() {
        const hotelId = document.getElementById('hotel_id').value;
        const roomOptionsContainer = document.querySelector('#step-2 .room-options') || document.createElement('div');
        
        if (!hotelId || !hotelData[hotelId]) return;
        
        roomOptionsContainer.innerHTML = '';
        
        Object.entries(hotelData[hotelId].prices).forEach(([type, price], index) => {
            // Descriptions des chambres
            let description = '';
            switch(type) {
                case 'Standard':
                    description = 'Chambre confortable avec toutes les commodités de base.';
                    break;
                case 'Deluxe':
                    description = 'Chambre spacieuse avec vue, offrant un confort supérieur.';
                    break;
                case 'Suite':
                    description = 'Expérience luxueuse avec salon séparé et prestations exclusives.';
                    break;
            }
            
            // Fonctionnalités des chambres
            let features = '';
            switch(type) {
                case 'Standard':
                    features = '<i class="fas fa-wifi"></i> WiFi gratuit <i class="fas fa-tv"></i> TV <i class="fas fa-shower"></i> Douche';
                    break;
                case 'Deluxe':
                    features = '<i class="fas fa-wifi"></i> WiFi haute vitesse <i class="fas fa-tv"></i> TV HD <i class="fas fa-bath"></i> Baignoire <i class="fas fa-coffee"></i> Machine à café';
                    break;
                case 'Suite':
                    features = '<i class="fas fa-wifi"></i> WiFi premium <i class="fas fa-tv"></i> TV HD <i class="fas fa-hot-tub"></i> Jacuzzi <i class="fas fa-coffee"></i> Machine à café <i class="fas fa-concierge-bell"></i> Service en chambre';
                    break;
            }
            
            const roomOption = document.createElement('div');
            roomOption.className = 'room-option';
            roomOption.innerHTML = `
                <input type="radio" name="room_type" id="room-${index}" value="${type}" ${index === 0 ? 'checked' : ''}>
                <label for="room-${index}" class="room-card">
                    <div class="room-card-header">
                        <h3>${type}</h3>
                        <span class="room-price">${price}€ / nuit</span>
                    </div>
                    <div class="room-card-body">
                        <p class="room-description">${description}</p>
                        <div class="room-features">${features}</div>
                    </div>
                </label>
            `;
            
            roomOptionsContainer.appendChild(roomOption);
        });
    }

    // Calcul et mise à jour des prix
    function calculatePrices() {
        const hotelId = document.getElementById('hotel_id').value;
        let selectedRoomType = '';
        
        document.querySelectorAll('input[name="room_type"]').forEach(input => {
            if (input.checked) {
                selectedRoomType = input.value;
            }
        });
        
        if (!hotelId || !selectedRoomType || !hotelData[hotelId] || !hotelData[hotelId].prices[selectedRoomType]) {
            return;
        }
        
        const checkIn = new Date(document.getElementById('check_in').value);
        const checkOut = new Date(document.getElementById('check_out').value);
        
        if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
            return;
        }
        
        // Calcul du nombre de nuits
        const nights = Math.max(1, Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
        
        // Prix de la chambre
        const roomPrice = hotelData[hotelId].prices[selectedRoomType];
        const roomTotal = roomPrice * nights;
        
        // Taxes (10%)
        const taxesTotal = Math.round(roomTotal * 0.1);
        
        // Total
        const grandTotal = roomTotal + taxesTotal;
        
        // Mise à jour de l'affichage des prix
        const roomTotalElement = document.getElementById('room-total');
        const taxesTotalElement = document.getElementById('taxes-total');
        const grandTotalElement = document.getElementById('grand-total');
        const summaryNightsElement = document.getElementById('summary-nights');
        
        if (roomTotalElement) roomTotalElement.textContent = `${roomTotal}€`;
        if (taxesTotalElement) taxesTotalElement.textContent = `${taxesTotal}€`;
        if (grandTotalElement) grandTotalElement.textContent = `${grandTotal}€`;
        if (summaryNightsElement) summaryNightsElement.textContent = `${nights} nuit${nights > 1 ? 's' : ''}`;
        
        // Stocker les informations pour le résumé
        reservationData.nights = nights;
        reservationData.roomPrice = roomPrice;
        reservationData.roomTotal = roomTotal;
        reservationData.taxesTotal = taxesTotal;
        reservationData.grandTotal = grandTotal;
    }

    // Mise à jour du résumé de réservation
    function updateSummary() {
        // Récupérer les valeurs actuelles
        const hotelId = document.getElementById('hotel_id').value;
        const checkIn = document.getElementById('check_in').value;
        const checkOut = document.getElementById('check_out').value;
        const guests = document.getElementById('guests').value;
        
        let roomType = '';
        document.querySelectorAll('input[name="room_type"]').forEach(input => {
            if (input.checked) {
                roomType = input.value;
            }
        });
        
        // Éléments du résumé (si présents)
        const hotelDisplay = document.getElementById('summary-hotel-display');
        const checkinDisplay = document.getElementById('summary-checkin-display');
        const checkoutDisplay = document.getElementById('summary-checkout-display');
        const nightsDisplay = document.getElementById('summary-nights-display');
        const roomDisplay = document.getElementById('summary-room-display');
        const guestsDisplay = document.getElementById('summary-guests-display');
        
        // Mise à jour du résumé si les éléments existent
        if (hotelDisplay && hotelId && hotelData[hotelId]) {
            hotelDisplay.textContent = hotelData[hotelId].name;
        }
        
        if (checkinDisplay && checkIn) {
            checkinDisplay.textContent = formatDate(checkIn);
        }
        
        if (checkoutDisplay && checkOut) {
            checkoutDisplay.textContent = formatDate(checkOut);
        }
        
        if (nightsDisplay && checkIn && checkOut) {
            const nights = calculateNights(checkIn, checkOut);
            nightsDisplay.textContent = `${nights} nuit${nights > 1 ? 's' : ''}`;
        }
        
        if (roomDisplay && roomType) {
            roomDisplay.textContent = roomType;
        }
        
        if (guestsDisplay && guests) {
            guestsDisplay.textContent = `${guests} personne${guests > 1 ? 's' : ''}`;
        }
    }

    // Collecte des données du formulaire
    function updateReservationData() {
        reservationData = {
            hotel_id: document.getElementById('hotel_id').value,
            hotel_name: document.getElementById('hotel_id').options[document.getElementById('hotel_id').selectedIndex].text,
            check_in: document.getElementById('check_in').value,
            check_out: document.getElementById('check_out').value,
            guests: document.getElementById('guests').value,
        };
        
        // Récupérer type de chambre sélectionné
        document.querySelectorAll('input[name="room_type"]').forEach(input => {
            if (input.checked) {
                reservationData.room_type = input.value;
            }
        });
        
        // Récupérer infos personnelles si disponibles
