<?php
require_once 'config.php';

header('Content-Type: application/json');

// Vérifier si l'utilisateur est connecté via la session
if (isset($_SESSION['user_id'])) {
    echo json_encode(['isLoggedIn' => true, 'username' => $_SESSION['user_name']]);
    exit;
}

// Vérifier si l'utilisateur est connecté via le cookie "remember_me"
if (isset($_COOKIE['remember_token'])) {
    $token = mysqli_real_escape_string($conn, $_COOKIE['remember_token']);
    
    $sql = "SELECT u.id, u.name, u.email FROM users u 
            JOIN remember_tokens rt ON u.id = rt.user_id 
            WHERE rt.token = ? AND rt.expiry > NOW()";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $token);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (mysqli_num_rows($result) == 1) {
        $user = mysqli_fetch_assoc($result);
        
        // Créer la session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        
        echo json_encode(['isLoggedIn' => true, 'username' => $user['name']]);
        exit;
    }
}

// Utilisateur non connecté
echo json_encode(['isLoggedIn' => false]);
?>
