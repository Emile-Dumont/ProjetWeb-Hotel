document.addEventListener('DOMContentLoaded', function() {
    // Gestion des onglets
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Supprimer la classe active de tous les onglets et formulaires
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            
            // Ajouter la classe active à l'onglet cliqué
            this.classList.add('active');
            
            // Afficher le formulaire correspondant
            const formId = this.getAttribute('data-tab') + '-form';
            document.getElementById(formId).classList.add('active');
        });
    });
    
    // Gestion du formulaire de connexion
    const loginForm = document.getElementById('form-login');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;
        
        const loginData = {
            email: email,
            password: password,
            remember_me: rememberMe
        };
        
        fetch('php/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Redirection vers la page d'accueil
                window.location.href = 'index.html';
            } else {
                // Afficher un message d'erreur
                document.getElementById('login-error').textContent = data.message || 'Identifiants incorrects. Veuillez réessayer.';
            }
        })
        .catch(error => {
            console.error('Erreur lors de la connexion:', error);
            document.getElementById('login-error').textContent = 'Une erreur est survenue. Veuillez réessayer plus tard.';
        });
    });
    
    // Gestion du formulaire d'inscription
    const registerForm = document.getElementById('form-register');
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        
        // Vérifier que les mots de passe correspondent
        if (password !== confirmPassword) {
            document.getElementById('register-error').textContent = 'Les mots de passe ne correspondent pas.';
            return;
        }
        
        const registerData = {
            name: name,
            email: email,
            password: password
        };
        
        // Afficher un message de chargement
        document.getElementById('register-error').textContent = 'Traitement en cours...';
        
        fetch('php/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        })
        .then(response => {
            // Vérifier si la réponse est OK
            if (!response.ok) {
                throw new Error('Erreur réseau: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log('Réponse du serveur:', data); // Ajouter pour débogage
            
            if (data.success) {
                // Redirection vers la page de connexion avec message de succès
                alert('Compte créé avec succès! Vous pouvez maintenant vous connecter.');
                
                // Basculer vers l'onglet de connexion
                document.querySelector('[data-tab="login"]').click();
            } else {
                // Afficher un message d'erreur
                document.getElementById('register-error').textContent = data.message || 'Erreur lors de la création du compte.';
                console.error('Détails de l\'erreur:', data);
            }
        })
        .catch(error => {
            console.error('Erreur lors de l\'inscription:', error);
            document.getElementById('register-error').textContent = 'Une erreur est survenue. Veuillez réessayer plus tard. (' + error.message + ')';
        });
    });
});
