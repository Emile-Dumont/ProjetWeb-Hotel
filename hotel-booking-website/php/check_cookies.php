<?php
require_once 'config.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Diagnostic des Cookies et Sessions</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
        h1, h2, h3 { color: #333; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Diagnostic des Cookies et Sessions</h1>
    
    <h2>1. Vérification de la Session</h2>
    <?php
    if (isset($_SESSION) && !empty($_SESSION)) {
        echo "<p class='success'>✓ La session est active</p>";
        echo "<pre>";
        print_r($_SESSION);
        echo "</pre>";
    } else {
        echo "<p class='warning'>⚠ Aucune session active trouvée</p>";
    }
    ?>
    
    <h2>2. Vérification des Cookies</h2>
    <?php
    if (isset($_COOKIE) && !empty($_COOKIE)) {
        echo "<p class='success'>✓ Des cookies sont présents</p>";
        echo "<table>";
        echo "<tr><th>Nom</th><th>Valeur</th></tr>";
        foreach ($_COOKIE as $name => $value) {
            echo "<tr><td>".htmlspecialchars($name)."</td><td>".htmlspecialchars(substr($value, 0, 30)).(strlen($value) > 30 ? "..." : "")."</td></tr>";
        }
        echo "</table>";
        
        if (isset($_COOKIE['remember_token'])) {
            echo "<p class='success'>✓ Le cookie 'remember_token' est présent</p>";
        } else {
            echo "<p class='warning'>⚠ Le cookie 'remember_token' n'est pas présent</p>";
        }
    } else {
        echo "<p class='warning'>⚠ Aucun cookie trouvé</p>";
    }
    ?>
    
    <h2>3. Vérification de la Base de Données</h2>
    <?php
    // Vérifier si la table remember_tokens existe
    $table_check = mysqli_query($conn, "SHOW TABLES LIKE 'remember_tokens'");
    if (mysqli_num_rows($table_check) > 0) {
        echo "<p class='success'>✓ La table 'remember_tokens' existe</p>";
        
        // Afficher la structure de la table
        $structure_query = "DESCRIBE remember_tokens";
        $structure_result = mysqli_query($conn, $structure_query);
        
        echo "<h3>Structure de la table 'remember_tokens'</h3>";
        echo "<table>";
        echo "<tr><th>Champ</th><th>Type</th><th>Null</th><th>Clé</th><th>Default</th><th>Extra</th></tr>";
        
        while ($row = mysqli_fetch_assoc($structure_result)) {
            echo "<tr>";
            foreach ($row as $key => $value) {
                echo "<td>".htmlspecialchars($value ?? 'NULL')."</td>";
            }
            echo "</tr>";
        }
        echo "</table>";
        
        // Afficher les tokens existants
        $tokens_query = "SELECT rt.*, u.name as user_name, u.email FROM remember_tokens rt 
                         JOIN users u ON rt.user_id = u.id 
                         ORDER BY rt.created_at DESC";
        $tokens_result = mysqli_query($conn, $tokens_query);
        
        echo "<h3>Tokens enregistrés</h3>";
        if (mysqli_num_rows($tokens_result) > 0) {
            echo "<table>";
            echo "<tr><th>ID</th><th>Utilisateur</th><th>Email</th><th>Token</th><th>Expiration</th><th>Créé le</th></tr>";
            
            while ($token = mysqli_fetch_assoc($tokens_result)) {
                echo "<tr>";
                echo "<td>".htmlspecialchars($token['id'])."</td>";
                echo "<td>".htmlspecialchars($token['user_name'])."</td>";
                echo "<td>".htmlspecialchars($token['email'])."</td>";
                echo "<td>".htmlspecialchars(substr($token['token'], 0, 10))."...</td>";
                echo "<td>".htmlspecialchars($token['expiry'])."</td>";
                echo "<td>".htmlspecialchars($token['created_at'])."</td>";
                echo "</tr>";
            }
            echo "</table>";
        } else {
            echo "<p class='warning'>⚠ Aucun token enregistré</p>";
        }
    } else {
        echo "<p class='error'>✗ La table 'remember_tokens' n'existe pas!</p>";
        echo "<p>Le script est configuré pour créer cette table automatiquement lors de la première utilisation de 'Se souvenir de moi'.</p>";
    }
    ?>
    
    <h2>4. Actions de test</h2>
    <p>Vous pouvez utiliser ces boutons pour tester les fonctionnalités :</p>
    
    <button onclick="testCookieCreation()">Tester la création d'un cookie</button>
    <button onclick="clearCookies()">Effacer tous les cookies</button>
    <button onclick="window.location.reload()">Rafraîchir la page</button>
    
    <script>
        function testCookieCreation() {
            document.cookie = "test_cookie=1; path=/; max-age=3600";
            alert("Cookie de test créé! Rafraîchissez la page pour le voir.");
        }
        
        function clearCookies() {
            document.cookie.split(";").forEach(function(c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/");
            });
            alert("Tous les cookies ont été effacés! Rafraîchissez la page pour confirmer.");
        }
    </script>
</body>
</html>
