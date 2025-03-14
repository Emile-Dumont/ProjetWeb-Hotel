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
            image: 'img/hotel-paris.jpg',
            description: 'Élégance parisienne au cœur de la ville lumière.',
            prices: {
                'standard': 120,
                'deluxe': 180,
                'suite': 250
            }
        },
        '2': {
            name: 'Resort Méditerranée',
            location: 'Nice, France',
            image: 'img/hotel-nice.jpg',
            description: 'Séjour enchanteur avec vue sur la Méditerranée.',
            prices: {
                'standard': 150,
                'deluxe': 220,
                'suite': 300
            }
        },
        '3': {
            name: 'Chalet Alpin',
            location: 'Chamonix, France',
            image: 'img/hotel-chamonix.jpg',
            description: 'Refuge de montagne avec vue imprenable sur le Mont-Blanc.',
            prices: {
                'standard': 180,
                'deluxe': 250,
                'suite': 380
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

    // Gestion des boutons suivant/précédent
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (validateCurrentStep()) {
                if (currentStep < formSteps.length - 1) {
                    goToStep(currentStep + 1);
                } else {
                    // Si dernière étape, soumet le formulaire
                    updateReservationData();
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

    // Fonctions de navigation
    function goToStep(step) {
        if (step >= 0 && step < formSteps.length) {
            updateReservationData();
            formSteps[currentStep].classList.remove('active');
            formSteps[step].classList.add('active');
            currentStep = step;
            updateProgressBar();
            updateSummary();
        }
    }

    function updateProgressBar() {
        progressSteps.forEach((step, index) => {
            if (index <= currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Mise à jour de la barre de progression
        const progress = (currentStep / (progressSteps.length - 1)) * 100;
        progressBar.style.width = progress + '%';
    }

    // Validation des étapes
    function validateCurrentStep() {
        let valid = true;
        const requiredFields = formSteps[currentStep].querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                valid = false;
            } else {
                field.classList.remove('error');
            }
        });
        
        // Validation spécifique à l'étape
        if (!valid) {
            showAlert('Veuillez remplir tous les champs obligatoires.');
            return false;
        }
        
        // Validations spécifiques selon l'étape
        if (currentStep === 0) {
            // Validation des dates
            const checkIn = new Date(document.getElementById('check_in').value);
            const checkOut = new Date(document.getElementById('check_out').value);
            
            if (checkOut <= checkIn) {
                showAlert('La date de départ doit être postérieure à la date d\'arrivée.');
                return false;
            }
        }
        
        return true;
    }

    function showAlert(message) {
        // Création d'une alerte stylisée
        const alertBox = document.createElement('div');
        alertBox.className = 'alert-box';
        alertBox.innerHTML = `
            <div class="alert-content">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
                <button class="alert-close"><i class="fas fa-times"></i></button>
            </div>
        `;
        
        document.body.appendChild(alertBox);
        
        // Animation d'entrée
        setTimeout(() => {
            alertBox.classList.add('show');
        }, 10);
        
        // Fermeture de l'alerte
        const closeBtn = alertBox.querySelector('.alert-close');
        closeBtn.addEventListener('click', () => {
            alertBox.classList.remove('show');
            setTimeout(() => {
                alertBox.remove();
            }, 300);
        });
        
        // Auto-fermeture après 5 secondes
        setTimeout(() => {
            if (document.body.contains(alertBox)) {
                alertBox.classList.remove('show');
                setTimeout(() => {
                    alertBox.remove();
                }, 300);
            }
        }, 5000);
    }

    // Initialisation des dates
    function initDateInputs() {
        const checkInInput = document.getElementById('check_in');
        const checkOutInput = document.getElementById('check_out');
        
        // Date minimale = aujourd'hui
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        const formatDate = date => date.toISOString().split('T')[0];
        
        checkInInput.min = formatDate(today);
        checkOutInput.min = formatDate(tomorrow);
        
        // Par défaut, proposer arrivée aujourd'hui et départ demain
        if (!checkInInput.value) checkInInput.value = formatDate(today);
        if (!checkOutInput.value) checkOutInput.value = formatDate(tomorrow);
        
        // Mise à jour dynamique
        checkInInput.addEventListener('change', function() {
            const newMinCheckout = new Date(this.value);
            newMinCheckout.setDate(newMinCheckout.getDate() + 1);
            checkOutInput.min = formatDate(newMinCheckout);
            
            if (new Date(checkOutInput.value) <= new Date(this.value)) {
                checkOutInput.value = formatDate(newMinCheckout);
            }
            
            calculatePrices();
        });
        
        checkOutInput.addEventListener('change', calculatePrices);
    }

    // Configuration de la sélection d'hôtel
    function setupHotelSelection() {
        const hotelSelect = document.getElementById('hotel_id');
        const hotelPreview = document.getElementById('hotel-preview');
        
        hotelSelect.addEventListener('change', function() {
            const hotelId = this.value;
            
            if (hotelId && hotelData[hotelId]) {
                const hotel = hotelData[hotelId];
                
                hotelPreview.innerHTML = `
                    <div class="hotel-card">
                        <div class="hotel-image">
                            <img src="${hotel.image}" alt="${hotel.name}">
                        </div>
                        <div class="hotel-info">
                            <h3>${hotel.name}</h3>
                            <p class="hotel-location"><i class="fas fa-map-marker-alt"></i> ${hotel.location}</p>
                            <p class="hotel-description">${hotel.description}</p>
                        </div>
                    </div>
                `;
                
                hotelPreview.style.display = 'block';
                
                // Mise à jour des prix des chambres
                updateRoomPrices(hotelId);
            } else {
                hotelPreview.style.display = 'none';
            }
            
            calculatePrices();
        });
        
        // Sélection du type de chambre
        const roomTypeInputs = document.querySelectorAll('input[name="room_type"]');
        roomTypeInputs.forEach(input => {
            input.addEventListener('change', calculatePrices);
        });
    }

    // Mise à jour des prix des chambres selon l'hôtel
    function updateRoomPrices(hotelId) {
        if (!hotelId || !hotelData[hotelId]) return;
        
        const hotel = hotelData[hotelId];
        const roomPriceElements = document.querySelectorAll('.room-price');
        
        roomPriceElements.forEach(el => {
            const roomType = el.closest('.room-option').querySelector('input[name="room_type"]').value;
            if (hotel.prices[roomType]) {
                el.innerHTML = `${hotel.prices[roomType]}€ <small>/nuit</small>`;
            }
        });
    }

    // Calcul et mise à jour des prix
    function calculatePrices() {
        const hotelId = document.getElementById('hotel_id').value;
        const roomTypeInputs = document.querySelectorAll('input[name="room_type"]');
        let selectedRoomType;
        
        roomTypeInputs.forEach(input => {
            if (input.checked) {
                selectedRoomType = input.value;
            }
        });
        
        if (hotelId && selectedRoomType && hotelData[hotelId] && hotelData[hotelId].prices[selectedRoomType]) {
            const checkIn = new Date(document.getElementById('check_in').value);
            const checkOut = new Date(document.getElementById('check_out').value);
            
            if (isNaN(checkIn) || isNaN(checkOut)) return;
            
            // Calcul du nombre de nuits
            const nights = Math.max(1, Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
            
            // Prix de la chambre
            const roomPrice = hotelData[hotelId].prices[selectedRoomType];
            const roomTotal = roomPrice * nights;
            
            // Taxes (10%)
            const taxesTotal = Math.round(roomTotal * 0.1);
            
            // Total
            const grandTotal = roomTotal + taxesTotal;
            
            // Mise à jour de l'affichage
            if (document.getElementById('room-total')) {
                document.getElementById('room-total').textContent = `${roomTotal} €`;
                document.getElementById('taxes-total').textContent = `${taxesTotal} €`;
                document.getElementById('grand-total').textContent = `${grandTotal} €`;
                document.getElementById('summary-nights').textContent = `${nights} nuit${nights > 1 ? 's' : ''}`;
            }
        }
    }

    // Mise à jour du récapitulatif
    function updateSummary() {
        if (currentStep === 3) { // Si on est à l'étape récapitulative
            const hotelId = document.getElementById('hotel_id').value;
            const roomTypeInputs = document.querySelectorAll('input[name="room_type"]');
            let selectedRoomType;
            
            roomTypeInputs.forEach(input => {
                if (input.checked) {
                    selectedRoomType = input.value;
                }
            });
            
            if (hotelId && hotelData[hotelId]) {
                document.getElementById('summary-hotel').textContent = `${hotelData[hotelId].name} - ${hotelData[hotelId].location}`;
                
                // Format de date pour affichage
                const formatDisplayDate = date => {
                    const d = new Date(date);
                    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                };
                
                document.getElementById('summary-checkin').textContent = formatDisplayDate(document.getElementById('check_in').value);
                document.getElementById('summary-checkout').textContent = formatDisplayDate(document.getElementById('check_out').value);
                
                // Type de chambre
                const roomTypeDisplay = selectedRoomType === 'standard' ? 'Standard' : 
                                     selectedRoomType === 'deluxe' ? 'Deluxe' : 'Suite';
                document.getElementById('summary-room').textContent = `Chambre ${roomTypeDisplay}`;
                document.getElementById('room-type-display').textContent = roomTypeDisplay;
                
                // Nombre de personnes
                const guests = document.getElementById('guests').value;
                document.getElementById('summary-guests').textContent = `${guests} personne${guests > 1 ? 's' : ''}`;
            }
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
        
        // Récupérer infos personnelles si remplies
        if (document.getElementById('name') && document.getElementById('name').value) {
            reservationData.name = document.getElementById('name').value;
            reservationData.email = document.getElementById('email').value;
            reservationData.phone = document.getElementById('phone').value;
            reservationData.special_requests = document.getElementById('special_requests').value;
        }
        
        // Stocker dans localStorage pour utilisation entre pages
        localStorage.setItem('reservation_data', JSON.stringify(reservationData));
    }
});