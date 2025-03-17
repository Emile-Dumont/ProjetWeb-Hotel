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

// Vérifier si l'utilisateur existe
$sql = "SELECT id, name, email, password FROM users WHERE email = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "s", $email);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) == 1) {
    $user = mysqli_fetch_assoc($result);
    
    // Vérifier le mot de passe
    if (password_verify($password, $user['password'])) {
        // Mot de passe correct, créer la session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        
        // Si "Se souvenir de moi" est coché, créer un cookie
        if ($remember_me) {
            $token = bin2hex(random_bytes(32));
            $expiry = time() + (30 * 24 * 60 * 60); // 30 jours
            
            // Stocker le token dans la base de données
            $sql = "INSERT INTO remember_tokens (user_id, token, expiry) VALUES (?, ?, ?)";
            $stmt = mysqli_prepare($conn, $sql);
            mysqli_stmt_bind_param($stmt, "iss", $user['id'], $token, date('Y-m-d H:i:s', $expiry));
            mysqli_stmt_execute($stmt);
            
            // Créer le cookie
            setcookie('remember_token', $token, $expiry, '/');
        }
        
        echo json_encode(['success' => true]);
    } else {
        // Mot de passe incorrect
        echo json_encode(['success' => false, 'message' => 'Email ou mot de passe incorrect']);
    }
} else {
    // Utilisateur non trouvé
    echo json_encode(['success' => false, 'message' => 'Email ou mot de passe incorrect']);
}

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>
