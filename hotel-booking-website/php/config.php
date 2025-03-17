<?php
// Configuration de la base de données
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'root');     // Remplacez par votre nom d'utilisateur
define('DB_PASSWORD', 'root');     // Remplacez par votre mot de passe
define('DB_NAME', 'tripisen');     // Remplacez par le nom de votre base de données

// Connexion à la base de données
$conn = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Vérifier la connexion
if($conn === false){
    die("ERREUR: Impossible de se connecter à la base de données. " . mysqli_connect_error());
}

// Configuration des sessions
session_start();
?>
