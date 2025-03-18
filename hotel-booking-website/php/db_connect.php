<?php
// php/db_connect.php

// Paramètres de connexion à la base de données
$host = "localhost";  // Généralement localhost
$dbname = "tripisien"; // Utilisation de la base tripisien existante
$username = "root";  // Nom d'utilisateur par défaut souvent root
$password = "root";      // Mot de passe (vide par défaut pour XAMPP/WAMP)

// Tentative de connexion à la base de données
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    
    // Configuration des options PDO
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    
} catch (PDOException $e) {
    // Journalisation de l'erreur
    error_log("Erreur de connexion à la base de données: " . $e->getMessage());
    
    // Message d'erreur convivial
    die("Désolé, nous rencontrons un problème technique. Veuillez réessayer plus tard.");
}
?>
