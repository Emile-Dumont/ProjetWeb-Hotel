document.addEventListener('DOMContentLoaded', function() {
    // Système d'onglets pour connexion/inscription
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            
            // Désactive tous les onglets et formulaires
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            
            // Active l'onglet et le formulaire sélectionnés
            this.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });
    
    // Validation des formulaires
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            // La validation côté client peut être ajoutée ici
            // Par exemple, vérifier que les champs ne sont pas vides
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value.trim();
            
            if (!email || !password) {
                e.preventDefault();
                alert('Veuillez remplir tous les champs obligatoires.');
            }
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            // Validation du formulaire d'inscription
            const firstname = document.getElementById('register-firstname').value.trim();
            const lastname = document.getElementById('register-lastname').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value.trim();
            const confirmPassword = document.getElementById('register-confirm-password').value.trim();
            const terms = document.getElementById('terms').checked;
            
            // Vérification des champs obligatoires
            if (!firstname || !lastname || !email || !password || !confirmPassword) {
                e.preventDefault();
                alert('Veuillez remplir tous les champs obligatoires.');
                return;
            }
            
            // Vérification que les mots de passe correspondent
            if (password !== confirmPassword) {
                e.preventDefault();
                alert('Les mots de passe ne correspondent pas.');
                return;
            }
            
            // Validation de l'email avec une expression régulière simple
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                e.preventDefault();
                alert('Veuillez entrer une adresse email valide.');
                return;
            }
            
            // Vérification des conditions d'utilisation
            if (!terms) {
                e.preventDefault();
                alert('Vous devez accepter les conditions d\'utilisation pour créer un compte.');
                return;
            }
            
            // Vérification de la force du mot de passe (au moins 8 caractères)
            if (password.length < 8) {
                e.preventDefault();
                alert('Le mot de passe doit contenir au moins 8 caractères.');
                return;
            }
        });
    }
    
    // Toggle pour afficher/masquer le mot de passe
    const togglePasswordVisibility = function(inputId) {
        const passwordInput = document.getElementById(inputId);
        const icon = passwordInput.nextElementSibling;
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    };
    
    // On pourrait ajouter des icônes pour afficher/masquer les mots de passe
    // et les associer à cette fonction
});
