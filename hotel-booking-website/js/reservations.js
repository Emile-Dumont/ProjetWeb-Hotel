document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('reservationForm');
    const hotelSelect = document.getElementById('hotel_id');
    const checkInInput = document.getElementById('check_in');
    const checkOutInput = document.getElementById('check_out');
    const roomTypeSelect = document.getElementById('room_type');
    const optionCheckboxes = document.querySelectorAll('input[name="options[]"]');
    
    // Prix fictifs des hôtels par type de chambre
    const hotelPrices = {
        '1': { // Hôtel Luxe Paris
            'standard': 180,
            'deluxe': 250,
            'suite': 400,
            'family': 300
        },
        '2': { // Resort Méditerranée
            'standard': 210,
            'deluxe': 280,
            'suite': 450,
            'family': 350
        },
        '3': { // Chalet Alpin
            'standard': 220,
            'deluxe': 300,
            'suite': 500,
            'family': 380
        }
    };
    
    // Prix des options
    const optionPrices = {
        'breakfast': 15,
        'parking': 10,
        'spa': 25
    };
    
    // Définir la date minimale à aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    checkInInput.setAttribute('min', today);
    
    // Fonction pour mettre à jour la date de départ minimale
    checkInInput.addEventListener('change', function() {
        checkOutInput.setAttribute('min', this.value);
        
        // Si la date de départ est avant la nouvelle date d'arrivée, la réinitialiser
        if (checkOutInput.value && checkOutInput.value < this.value) {
            checkOutInput.value = '';
        }
        
        updatePriceEstimate();
    });
    
    // Mettre à jour l'estimation du prix quand les données changent
    [hotelSelect, roomTypeSelect, checkInInput, checkOutInput].forEach(element => {
        element.addEventListener('change', updatePriceEstimate);
    });
    
    optionCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updatePriceEstimate);
    });
    
    // Fonction pour calculer l'estimation du prix
    function updatePriceEstimate() {
        const hotelId = hotelSelect.value;
        const roomType = roomTypeSelect.value;
        const checkIn = new Date(checkInInput.value);
        const checkOut = new Date(checkOutInput.value);
        
        let roomPrice = 0;
        let optionsPrice = 0;
        let totalPrice = 0;
        
        // Calculer le prix de la chambre
        if (hotelId && roomType && !isNaN(checkIn) && !isNaN(checkOut)) {
            const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            if (nights > 0) {
                roomPrice = hotelPrices[hotelId][roomType] * nights;
            }
        }
        
        // Calculer le prix des options
        optionCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                optionsPrice += optionPrices[checkbox.value];
            }
        });
        
        // Calculer le prix total
        totalPrice = roomPrice + optionsPrice;
        
        // Mettre à jour l'affichage
        document.getElementById('room-price').textContent = roomPrice > 0 ? roomPrice + ' €' : '-- €';
        document.getElementById('options-price').textContent = optionsPrice + ' €';
        document.getElementById('total-price').textContent = totalPrice > 0 ? totalPrice + ' €' : '-- €';
    }
    
    // Validation du formulaire
    form.addEventListener('submit', function(e) {
        const hotelId = hotelSelect.value;
        const checkIn = checkInInput.value;
        const checkOut = checkOutInput.value;
        
        if (!hotelId || !checkIn || !checkOut) {
            e.preventDefault();
            alert('Veuillez remplir tous les champs obligatoires.');
            return false;
        }
        
        return true;
    });
});