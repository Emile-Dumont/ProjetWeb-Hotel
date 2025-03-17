<?php
// Initialiser la session
session_start();

// Inclure le fichier de connexion à la base de données
require_once 'db_connect.php';

// Fonction pour nettoyer les données d'entrée
function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Vérifier si le formulaire a été soumis
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Récupérer et nettoyer les données du formulaire
    $username = sanitize_input($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    $email = sanitize_input($_POST['email'] ?? '');
    $first_name = sanitize_input($_POST['first_name'] ?? '');
    $last_name = sanitize_input($_POST['last_name'] ?? '');
    $phone = sanitize_input($_POST['phone'] ?? '');
    $address = sanitize_input($_POST['address'] ?? '');
    $city = sanitize_input($_POST['city'] ?? '');
    $country = sanitize_input($_POST['country'] ?? '');
    $postal_code = sanitize_input($_POST['postal_code'] ?? '');
    
    // Initialiser le tableau des erreurs
    $errors = [];
    
    // Validation des champs obligatoires
    if (empty($username)) {
        $errors[] = "Le nom d'utilisateur est requis";
    } else if (!preg_match("/^[a-zA-Z0-9_]{3,20}$/", $username)) {
        $errors[] = "Le nom d'utilisateur doit contenir entre 3 et 20 caractères alphanumériques";
    }
    
    if (empty($email)) {
        $errors[] = "L'adresse e-mail est requise";
    } else if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Format d'adresse e-mail invalide";
    }
    
    if (empty($password)) {
        $errors[] = "Le mot de passe est requis";
    } else if (strlen($password) < 8) {
        $errors[] = "Le mot de passe doit contenir au moins 8 caractères";
    }
    
    if ($password !== $confirm_password) {
        $errors[] = "Les mots de passe ne correspondent pas";
    }
    
    if (empty($first_name)) {
        $errors[] = "Le prénom est requis";
    }
    
    if (empty($last_name)) {
        $errors[] = "Le nom est requis";
    }
    
    // Si aucune erreur, vérifier si l'utilisateur existe déjà
    if (empty($errors)) {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$username, $email]);
        $count = $stmt->fetchColumn();
        
        if ($count > 0) {
            // Vérifier spécifiquement si c'est le nom d'utilisateur ou l'email qui existe déjà
            $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
            $stmt->execute([$username]);
            if ($stmt->rowCount() > 0) {
                $errors[] = "Ce nom d'utilisateur est déjà utilisé";
            }
            
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->rowCount() > 0) {
                $errors[] = "Cette adresse e-mail est déjà utilisée";
            }
        }
    }
    
    // Si toujours aucune erreur, insérer le nouvel utilisateur dans la base de données
    if (empty($errors)) {
        try {
            // Hachage du mot de passe
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            
            // Préparation et exécution de la requête d'insertion
            $stmt = $pdo->prepare("
                INSERT INTO users (username, password, email, first_name, last_name, phone, address, city, country, postal_code, role, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $success = $stmt->execute([
                $username,
                $hashed_password,
                $email,
                $first_name,
                $last_name,
                $phone,
                $address,
                $city,
                $country,
                $postal_code,
                'client' // Par défaut, tous les nouveaux utilisateurs sont des clients
            ]);
            
            if ($success) {
                // Récupérer l'ID du nouvel utilisateur
                $user_id = $pdo->lastInsertId();
                
                // Envoi d'un email de bienvenue (optionnel)
                // send_welcome_email($email, $first_name);
                
                // Enregistrer l'utilisateur dans la session
                $_SESSION['user_id'] = $user_id;
                $_SESSION['username'] = $username;
                $_SESSION['first_name'] = $first_name;
                $_SESSION['role'] = 'client';
                $_SESSION['login_time'] = time();
                
                // Message de succès
                $_SESSION['success_message'] = "Inscription réussie ! Bienvenue, $first_name!";
                
                // Enregistrer l'événement dans un log
                error_log("Nouvel utilisateur inscrit: $username (ID: $user_id)");
                
                // Rediriger vers la page d'accueil ou le tableau de bord
                header("Location: ../index.php");
                exit();
            } else {
                $errors[] = "Erreur lors de l'inscription. Veuillez réessayer.";
            }
        } catch (PDOException $e) {
            $errors[] = "Erreur de base de données: " . $e->getMessage();
            // Pour le débogage uniquement, à supprimer en production
            error_log("Erreur SQL lors de l'inscription: " . $e->getMessage());
        }
    }
    
    // S'il y a des erreurs, les stocker dans la session et rediriger vers le formulaire
    if (!empty($errors)) {
        $_SESSION['registration_errors'] = $errors;
        $_SESSION['form_data'] = [
            'username' => $username,
            'email' => $email,
            'first_name' => $first_name,
            'last_name' => $last_name,
            'phone' => $phone,
            'address' => $address,
            'city' => $city,
            'country' => $country,
            'postal_code' => $postal_code
        ];
        header("Location: ../register.php");
        exit();
    }
    
} else {
    // Si quelqu'un tente d'accéder directement à ce fichier sans soumettre le formulaire
    header("Location: ../register.php");
    exit();
}
?>