document.addEventListener('DOMContentLoaded', function() {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    checkIfLoggedIn();
    
    // Gestion des onglets de profil
    const tabs = document.querySelectorAll('.profile-menu li');
    const tabContents = document.querySelectorAll('.profile-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Supprimer la classe active de tous les onglets
            tabs.forEach(t => t.classList.remove('active'));
            
            // Cacher tous les contenus d'onglets
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Ajouter la classe active à l'onglet cliqué
            this.classList.add('active');
            
            // Afficher le contenu correspondant
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Charger les informations de l'utilisateur
    loadUserProfile();
    
    // Formulaire des informations personnelles
    const personalInfoForm = document.getElementById('personal-info-form');
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updatePersonalInfo();
        });
    }
    
    // Formulaire de changement de mot de passe
    const changePasswordForm = document.getElementById('change-password-form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updatePassword();
        });
    }
    
    // Formulaire de préférences
    const preferencesForm = document.getElementById('preferences-form');
    if (preferencesForm) {
        preferencesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updatePreferences();
        });
    }
});

// Vérifier si l'utilisateur est connecté
function checkIfLoggedIn() {
    fetch('php/check_login.php')
        .then(response => response.json())
        .then(data => {
            if (!data.isLoggedIn) {
                // Rediriger vers la page de connexion
                window.location.href = 'login.html';
            }
        })
        .catch(error => {
            console.error('Erreur lors de la vérification de connexion:', error);
            window.location.href = 'login.html';
        });
}

// Charger le profil de l'utilisateur
function loadUserProfile() {
    fetch('php/get_user_profile.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Mettre à jour les informations de la sidebar
                document.getElementById('sidebar-username').textContent = data.user.name;
                document.getElementById('sidebar-email').textContent = data.user.email;
                
                // Remplir le formulaire d'informations personnelles
                document.getElementById('name').value = data.user.name || '';
                document.getElementById('email').value = data.user.email || '';
                document.getElementById('phone').value = data.user.phone || '';
                document.getElementById('address').value = data.user.address || '';
                document.getElementById('city').value = data.user.city || '';
                document.getElementById('postal_code').value = data.user.postal_code || '';
                document.getElementById('country').value = data.user.country || '';
                
                // Remplir les préférences si disponibles
                if (data.user.preferences) {
                    document.getElementById('notifications_promotions').checked = data.user.preferences.notifications_promotions;
                    document.getElementById('notifications_bookings').checked = data.user.preferences.notifications_bookings;
                    document.getElementById('notifications_newsletter').checked = data.user.preferences.notifications_newsletter;
                    document.getElementById('preference_city').checked = data.user.preferences.preference_city;
                    document.getElementById('preference_beach').checked = data.user.preferences.preference_beach;
                    document.getElementById('preference_mountain').checked = data.user.preferences.preference_mountain;
                    document.getElementById('preference_countryside').checked = data.user.preferences.preference_countryside;
                }
                
                // Charger les réservations si disponibles
                if (data.bookings && data.bookings.length > 0) {
                    const bookingList = document.querySelector('.booking-list');
                    bookingList.innerHTML = ''; // Vider la liste
                    
                    data.bookings.forEach(booking => {
                        const bookingItem = document.createElement('div');
                        bookingItem.className = 'booking-item';
                        bookingItem.innerHTML = `
                            <h3>${booking.hotel_name}</h3>
                            <div class="booking-details">
                                <div class="booking-info">
                                    <p><strong>Réservation n°:</strong> ${booking.booking_id}</p>
                                    <p><strong>Date d'arrivée:</strong> ${booking.check_in}</p>
                                    <p><strong>Date de départ:</strong> ${booking.check_out}</p>
                                    <p><strong>Nombre de personnes:</strong> ${booking.guests}</p>
                                    <p><strong>Statut:</strong> <span class="status-${booking.status.toLowerCase()}">${booking.status}</span></p>
                                </div>
                                <div class="booking-actions">
                                    <a href="booking-details.html?id=${booking.booking_id}" class="btn btn-sm btn-primary">Voir détails</a>
                                </div>
                            </div>
                        `;
                        bookingList.appendChild(bookingItem);
                    });
                }
            } else {
                showMessage('update-info-message', 'Impossible de charger vos informations de profil.', 'error');
            }
        })
        .catch(error => {
            console.error('Erreur lors du chargement du profil:', error);
            showMessage('update-info-message', 'Une erreur est survenue lors du chargement du profil. Veuillez réessayer plus tard.', 'error');
        });
}

// Mettre à jour les informations personnelles
function updatePersonalInfo() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const postal_code = document.getElementById('postal_code').value;
    const country = document.getElementById('country').value;
    
    const formData = {
        name: name,
        phone: phone,
        address: address,
        city: city,
        postal_code: postal_code,
        country: country
    };
    
    fetch('php/update_profile.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage('update-info-message', 'Vos informations ont été mises à jour avec succès!', 'success');
            
            // Mettre à jour le nom dans la sidebar
            document.getElementById('sidebar-username').textContent = name;
            
            // Mettre à jour le nom dans la navbar
            if (document.getElementById('username')) {
                document.getElementById('username').textContent = name;
            }
        } else {
            showMessage('update-info-message', data.message || 'Une erreur est survenue lors de la mise à jour.', 'error');
        }
    })
    .catch(error => {
        console.error('Erreur lors de la mise à jour du profil:', error);
        showMessage('update-info-message', 'Une erreur est survenue. Veuillez réessayer plus tard.', 'error');
    });
}

// Mettre à jour le mot de passe
function updatePassword() {
    const currentPassword = document.getElementById('current_password').value;
    const newPassword = document.getElementById('new_password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    
    // Vérifier que les mots de passe correspondent
    if (newPassword !== confirmPassword) {
        showMessage('update-password-message', 'Les nouveaux mots de passe ne correspondent pas.', 'error');
        return;
    }
    
    // Vérifier la longueur du mot de passe
    if (newPassword.length < 6) {
        showMessage('update-password-message', 'Le nouveau mot de passe doit contenir au moins 6 caractères.', 'error');
        return;
    }
    
    const passwordData = {
        current_password: currentPassword,
        new_password: newPassword
    };
    
    fetch('php/update_password.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage('update-password-message', 'Votre mot de passe a été mis à jour avec succès!', 'success');
            document.getElementById('change-password-form').reset();
        } else {
            showMessage('update-password-message', data.message || 'Une erreur est survenue lors de la mise à jour du mot de passe.', 'error');
        }
    })
    .catch(error => {
        console.error('Erreur lors de la mise à jour du mot de passe:', error);
        showMessage('update-password-message', 'Une erreur est survenue. Veuillez réessayer plus tard.', 'error');
    });
}

// Mettre à jour les préférences
function updatePreferences() {
    const preferences = {
        notifications_promotions: document.getElementById('notifications_promotions').checked,
        notifications_bookings: document.getElementById('notifications_bookings').checked,
        notifications_newsletter: document.getElementById('notifications_newsletter').checked,
        preference_city: document.getElementById('preference_city').checked,
        preference_beach: document.getElementById('preference_beach').checked,
        preference_mountain: document.getElementById('preference_mountain').checked,
        preference_countryside: document.getElementById('preference_countryside').checked
    };
    
    fetch('php/update_preferences.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage('update-preferences-message', 'Vos préférences ont été mises à jour avec succès!', 'success');
        } else {
            showMessage('update-preferences-message', data.message || 'Une erreur est survenue lors de la mise à jour des préférences.', 'error');
        }
    })
    .catch(error => {
        console.error('Erreur lors de la mise à jour des préférences:', error);
        showMessage('update-preferences-message', 'Une erreur est survenue. Veuillez réessayer plus tard.', 'error');
    });
}

// Afficher un message
function showMessage(elementId, message, type) {
    const messageElement = document.getElementById(elementId);
    messageElement.textContent = message;
    messageElement.className = 'message ' + type;
    
    // Faire défiler jusqu'au message
    messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Masquer le message après 5 secondes si c'est un succès
    if (type === 'success') {
        setTimeout(() => {
            messageElement.textContent = '';
            messageElement.className = 'message';
        }, 5000);
    }
}
