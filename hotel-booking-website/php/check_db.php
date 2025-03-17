<?php
require_once 'config.php';

header('Content-Type: text/html; charset=utf-8');

echo "<h1>Vérification de la base de données</h1>";

// Vérifier la connexion
echo "<h2>Connexion à la base de données</h2>";
if ($conn) {
    echo "<p style='color:green'>✓ Connexion réussie à la base de données: " . DB_NAME . "</p>";
} else {
    echo "<p style='color:red'>✗ Erreur de connexion: " . mysqli_connect_error() . "</p>";
    exit;
}

// Vérifier si la table users existe
echo "<h2>Vérification des tables</h2>";
$tables = ["users", "remember_tokens"];
foreach ($tables as $table) {
    $query = "SHOW TABLES LIKE '$table'";
    $result = mysqli_query($conn, $query);
    
    if (mysqli_num_rows($result) > 0) {
        echo "<p style='color:green'>✓ La table '$table' existe</p>";
        
        // Vérifier la structure de la table
        echo "<h3>Structure de la table '$table'</h3>";
        $columns_query = "SHOW COLUMNS FROM $table";
        $columns_result = mysqli_query($conn, $columns_query);
        
        echo "<table border='1' cellpadding='5'>";
        echo "<tr><th>Champ</th><th>Type</th><th>Null</th><th>Clé</th><th>Default</th><th>Extra</th></tr>";
        
        while ($row = mysqli_fetch_assoc($columns_result)) {
            echo "<tr>";
            foreach ($row as $key => $value) {
                echo "<td>" . htmlspecialchars($value ?? 'NULL') . "</td>";
            }
            echo "</tr>";
        }
        
        echo "</table>";
    } else {
        echo "<p style='color:red'>✗ La table '$table' n'existe pas!</p>";
        echo "<p>Exécutez le fichier SQL users_tables.sql pour créer cette table.</p>";
    }
}

// Tester l'insertion d'un utilisateur temporaire
echo "<h2>Test d'insertion d'un utilisateur (simulation uniquement)</h2>";
$name = "Utilisateur Test";
$email = "test_" . time() . "@example.com";
$password = password_hash("password123", PASSWORD_DEFAULT);

echo "<p>Tentative d'insertion avec les données suivantes:</p>";
echo "<ul>";
echo "<li>Nom: $name</li>";
echo "<li>Email: $email</li>";
echo "<li>Mot de passe: [HASHED]</li>";
echo "</ul>";

// Vérifier que la requête est valide sans l'exécuter
$sql = "INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())";
$stmt = mysqli_prepare($conn, $sql);

if ($stmt) {
    echo "<p style='color:green'>✓ La préparation de la requête fonctionne</p>";
    mysqli_stmt_close($stmt);
} else {
    echo "<p style='color:red'>✗ Erreur lors de la préparation de la requête: " . mysqli_error($conn) . "</p>";
}

mysqli_close($conn);
?>
