<?php
require_once 'config.php';

// Vérifier si la requête est une requête POST et au format JSON
header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Données non valides']);
    exit;
}

// Récupérer et nettoyer les données
$email = mysqli_real_escape_string($conn, $data['email']);
$password = $data['password'];
$remember_me = isset($data['remember_me']) ? $data['remember_me'] : false;

// Debug - enregistrer les données
error_log("Tentative de connexion: " . $email);
error_log("Se souvenir de moi: " . ($remember_me ? 'oui' : 'non'));

// Vérifier si l'utilisateur existe
$sql = "SELECT id, name, email, password FROM users WHERE email = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "s", $email);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) == 1) {
    $user = mysqli_fetch_assoc($result);
    
    // Debug - vérifier le hash
    error_log("Hash stocké dans la BDD: " . $user['password']);
    error_log("Mot de passe fourni (non haché): " . $password);
    error_log("Résultat de password_verify: " . (password_verify($password, $user['password']) ? 'true' : 'false'));
    
    // Vérifier le mot de passe
    if (password_verify($password, $user['password'])) {
        // Mot de passe correct, créer la session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['is_logged_in'] = true; // Ajouter un flag explicite
        
        // Si "Se souvenir de moi" est coché, créer un cookie
        if ($remember_me) {
            try {
                // Vérifier si la table remember_tokens existe
                $table_check_query = "SHOW TABLES LIKE 'remember_tokens'";
                $table_check_result = mysqli_query($conn, $table_check_query);
                
                if (mysqli_num_rows($table_check_result) == 0) {
                    // Créer la table si elle n'existe pas
                    $create_table_query = "
                    CREATE TABLE IF NOT EXISTS remember_tokens (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT NOT NULL,
                        token VARCHAR(64) NOT NULL UNIQUE,
                        expiry DATETIME NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                    ";
                    mysqli_query($conn, $create_table_query);
                    error_log("Table remember_tokens créée");
                }
                
                // Générer un token unique
                $token = bin2hex(random_bytes(32));
                $expiry = time() + (30 * 24 * 60 * 60); // 30 jours
                $expiry_date = date('Y-m-d H:i:s', $expiry);
                
                // Supprimer les anciens tokens de cet utilisateur
                $delete_sql = "DELETE FROM remember_tokens WHERE user_id = ?";
                $delete_stmt = mysqli_prepare($conn, $delete_sql);
                mysqli_stmt_bind_param($delete_stmt, "i", $user['id']);
                mysqli_stmt_execute($delete_stmt);
                
                // Stocker le token dans la base de données
                $token_sql = "INSERT INTO remember_tokens (user_id, token, expiry) VALUES (?, ?, ?)";
                $token_stmt = mysqli_prepare($conn, $token_sql);
                mysqli_stmt_bind_param($token_stmt, "iss", $user['id'], $token, $expiry_date);
                $token_result = mysqli_stmt_execute($token_stmt);
                
                if ($token_result) {
                    // Créer le cookie
                    setcookie('remember_token', $token, $expiry, '/');
                    error_log("Cookie 'remember_token' créé avec succès pour l'utilisateur ID: " . $user['id']);
                } else {
                    error_log("Erreur lors de l'insertion du token: " . mysqli_error($conn));
                }
            } catch (Exception $e) {
                error_log("Exception lors de la création du token: " . $e->getMessage());
                // On continue la connexion même si le "Se souvenir de moi" échoue
            }
        }
        
        echo json_encode(['success' => true]);
        error_log("Connexion réussie pour: " . $email);
    } else {
        // Mot de passe incorrect
        echo json_encode(['success' => false, 'message' => 'Email ou mot de passe incorrect']);
        error_log("Échec de connexion - mot de passe incorrect pour: " . $email);
    }
} else {
    // Utilisateur non trouvé
    echo json_encode(['success' => false, 'message' => 'Email ou mot de passe incorrect']);
    error_log("Échec de connexion - utilisateur non trouvé: " . $email);
}

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>
