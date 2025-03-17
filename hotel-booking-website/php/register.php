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
$name = mysqli_real_escape_string($conn, $data['name']);
$email = mysqli_real_escape_string($conn, $data['email']);
$password = $data['password'];

// Valider l'email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Adresse email non valide']);
    exit;
}

// Valider la longueur du mot de passe
if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Le mot de passe doit contenir au moins 6 caractères']);
    exit;
}

// Vérifier si l'email existe déjà
$sql = "SELECT id FROM users WHERE email = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "s", $email);
mysqli_stmt_execute($stmt);
mysqli_stmt_store_result($stmt);

if (mysqli_stmt_num_rows($stmt) > 0) {
    echo json_encode(['success' => false, 'message' => 'Cette adresse email est déjà utilisée']);
    mysqli_stmt_close($stmt);
    mysqli_close($conn);
    exit;
}

// Hacher le mot de passe
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Insérer le nouvel utilisateur
$sql = "INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "sss", $name, $email, $hashed_password);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode(['success' => true]);
} else {
    // Afficher plus de détails sur l'erreur
    echo json_encode([
        'success' => false, 
        'message' => 'Erreur lors de l\'inscription: ' . mysqli_error($conn),
        'sql_error' => mysqli_stmt_error($stmt)
    ]);
}

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>
