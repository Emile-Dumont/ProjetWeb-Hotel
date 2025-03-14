<?php
// Paramètres de connexion à la base de données
$host = 'localhost';
$db = 'hotel_booking_db';
$user = 'root';         // Utilisateur par défaut de MAMP
$password = 'root';     // Mot de passe par défaut de MAMP
$port = '8889';         // Port MySQL par défaut de MAMP

// Établir la connexion
try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8", $user, $password);
    // Configuration pour afficher les erreurs SQL
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Configuration pour récupérer les résultats sous forme de tableau associatif
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // En cas d'erreur de connexion
    die("Erreur de connexion à la base de données: " . $e->getMessage());
}
?>