<?php
require_once 'config.php';

header('Content-Type: application/json');

// Supprimer le cookie remember_token si présent
if (isset($_COOKIE['remember_token'])) {
    $token = mysqli_real_escape_string($conn, $_COOKIE['remember_token']);
    
    // Supprimer le token de la base de données
    $sql = "DELETE FROM remember_tokens WHERE token = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $token);
    mysqli_stmt_execute($stmt);
    
    // Supprimer le cookie
    setcookie('remember_token', '', time() - 3600, '/');
}

// Détruire la session
session_unset();
session_destroy();

echo json_encode(['success' => true]);
?>
