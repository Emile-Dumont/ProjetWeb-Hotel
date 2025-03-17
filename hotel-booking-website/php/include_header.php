<?php
// Récupérer le contenu du template header
$header_content = file_get_contents(__DIR__ . '/../templates/header.html');

// Identifier la page actuelle
$current_page = basename($_SERVER['PHP_SELF'], '.php');
if ($current_page == 'index') {
    $current_page = 'index';
} 

// Marquer l'élément de navigation actif
$header_content = str_replace('data-page="'.$current_page.'"', 'data-page="'.$current_page.'" class="active"', $header_content);

// Afficher le header
echo $header_content;
?>
