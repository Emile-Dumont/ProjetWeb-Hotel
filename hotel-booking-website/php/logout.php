<?php
require_once 'config.php';

header('Content-Type: application/json');

// Supprimer le cookie remember_token si présent
if (isset($_COOKIE['remember_token'])) {
    $token = mysqli_real_escape_string($conn, $_COOKIE['remember_token']);
    error_log("Suppression du cookie remember_token: " . $token);
    
    // Supprimer le token de la base de données
    $sql = "DELETE FROM remember_tokens WHERE token = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $token);
    $result = mysqli_stmt_execute($stmt);
    
    if ($result) {
        error_log("Token supprimé de la base de données");
    } else {
        error_log("Erreur lors de la suppression du token: " . mysqli_error($conn));
    }
    
    // Supprimer le cookie
    setcookie('remember_token', '', time() - 3600, '/');
}

// Détruire la session
session_unset();
session_destroy();

echo json_encode(['success' => true]);
?>
