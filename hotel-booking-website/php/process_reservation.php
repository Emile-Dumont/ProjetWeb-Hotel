<?php
// php/process_reservation.php
session_start();

// Vérification de la méthode
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../reservations.html');
    exit();
}

// Validation des données
$errors = [];

// Vérification des champs obligatoires
$required_fields = ['hotel_id', 'check_in', 'check_out', 'guests', 'room_type', 'name', 'email', 'phone'];
foreach ($required_fields as $field) {
    if (empty($_POST[$field])) {
        $errors[] = "Le champ '$field' est obligatoire.";
    }
}

// Validation des dates
if (!empty($_POST['check_in']) && !empty($_POST['check_out'])) {
    $check_in = new DateTime($_POST['check_in']);
    $check_out = new DateTime($_POST['check_out']);
    $today = new DateTime();
    $today->setTime(0, 0, 0);
    
    if ($check_in < $today) {
        $errors[] = "La date d'arrivée ne peut pas être dans le passé.";
    }
    
    if ($check_out <= $check_in) {
        $errors[] = "La date de départ doit être postérieure à la date d'arrivée.";
    }
}

// Validation email
if (!empty($_POST['email']) && !filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
    $errors[] = "L'adresse email n'est pas valide.";
}

// Si erreurs, rediriger avec les messages d'erreur
if (!empty($errors)) {
    $_SESSION['reservation_errors'] = $errors;
    $_SESSION['form_data'] = $_POST;
    header('Location: ../reservations.html');
    exit();
}

// Collecter et nettoyer les données du formulaire
$reservation = [
    'hotel_id' => filter_var($_POST['hotel_id'], FILTER_SANITIZE_NUMBER_INT),
    'check_in' => filter_var($_POST['check_in'], FILTER_SANITIZE_STRING),
    'check_out' => filter_var($_POST['check_out'], FILTER_SANITIZE_STRING),
    'guests' => filter_var($_POST['guests'], FILTER_SANITIZE_NUMBER_INT),
    'room_type' => filter_var($_POST['room_type'], FILTER_SANITIZE_STRING),
    'name' => filter_var($_POST['name'], FILTER_SANITIZE_STRING),
    'email' => filter_var($_POST['email'], FILTER_SANITIZE_EMAIL),
    'phone' => filter_var($_POST['phone'], FILTER_SANITIZE_STRING),
    'special_requests' => isset($_POST['special_requests']) ? filter_var($_POST['special_requests'], FILTER_SANITIZE_STRING) : '',
    'user_id' => isset($_SESSION['user_id']) ? $_SESSION['user_id'] : NULL
];

// Connexion à la base de données
require_once 'db_connect.php';

try {
    // Vérifier la disponibilité d'une chambre correspondant aux critères
    // D'abord trouver la catégorie de chambre
    $stmt = $pdo->prepare("SELECT category_id FROM room_categories WHERE category_name = ?");
    $stmt->execute([$reservation['room_type']]);
    $roomCategory = $stmt->fetch();
    
    if (!$roomCategory) {
        throw new Exception("Catégorie de chambre introuvable.");
    }
    
    // Trouver une chambre disponible
    $stmt = $pdo->prepare("
        SELECT r.room_id, r.room_number, rc.category_name, rc.base_price 
        FROM rooms r
        JOIN room_categories rc ON r.category_id = rc.category_id
        WHERE r.hotel_id = ? 
        AND r.category_id = ? 
        AND r.is_available = TRUE
        AND NOT EXISTS (
            SELECT 1 FROM reservations res
            WHERE res.room_id = r.room_id
            AND (
                (res.check_in_date <= ? AND res.check_out_date > ?)
                OR (res.check_in_date < ? AND res.check_out_date >= ?)
                OR (res.check_in_date >= ? AND res.check_out_date <= ?)
            )
        )
        LIMIT 1
    ");
    
    $stmt->execute([
        $reservation['hotel_id'],
        $roomCategory['category_id'],
        $reservation['check_out'],
        $reservation['check_in'],
        $reservation['check_out'],
        $reservation['check_in'],
        $reservation['check_in'],
        $reservation['check_out']
    ]);
    
    $availableRoom = $stmt->fetch();
    
    if (!$availableRoom) {
        $_SESSION['reservation_errors'] = ["Désolé, aucune chambre de ce type n'est disponible pour ces dates."];
        $_SESSION['form_data'] = $reservation;
        header('Location: ../reservations.html');
        exit();
    }
    
    // Calculer le prix total
    $checkInDate = new DateTime($reservation['check_in']);
    $checkOutDate = new DateTime($reservation['check_out']);
    $nights = $checkOutDate->diff($checkInDate)->days;
    $totalPrice = $availableRoom['base_price'] * $nights;
    
    // Générer un code de réservation unique
    $reservationCode = 'BOOK-' . strtoupper(substr(uniqid(), -6));
    
    // Transaction pour garantir l'intégrité des données
    $pdo->beginTransaction();
    
    // Créer la réservation
    $stmt = $pdo->prepare("
        INSERT INTO reservations 
        (reservation_code, user_id, guest_name, guest_email, guest_phone, room_id, 
         check_in_date, check_out_date, adults, children, price_total, special_requests, status_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $reservationCode,
        $reservation['user_id'],
        $reservation['name'],
        $reservation['email'],
        $reservation['phone'],
        $availableRoom['room_id'],
        $reservation['check_in'],
        $reservation['check_out'],
        $reservation['guests'],
        0, // Pas d'enfants spécifié dans le formulaire
        $totalPrice,
        $reservation['special_requests'],
        1 // Statut "confirmée"
    ]);
    
    $reservationId = $pdo->lastInsertId();
    
    // Enregistrer le paiement en attente
    $stmt = $pdo->prepare("
        INSERT INTO payments 
        (reservation_id, amount, payment_method, status) 
        VALUES (?, ?, 'online', 'pending')
    ");
    
    $stmt->execute([$reservationId, $totalPrice]);
    
    // Valider la transaction
    $pdo->commit();
    
    // Récupérer les détails complets pour l'affichage
    $stmt = $pdo->prepare("
        SELECT r.*, h.hotel_name, h.address AS hotel_address, h.city AS hotel_city, 
               h.country AS hotel_country, rm.room_number, rc.category_name AS room_type,
               rc.base_price AS price_per_night
        FROM reservations r
        JOIN rooms rm ON r.room_id = rm.room_id
        JOIN hotels h ON rm.hotel_id = h.hotel_id
        JOIN room_categories rc ON rm.category_id = rc.category_id
        WHERE r.reservation_id = ?
    ");
    
    $stmt->execute([$reservationId]);
    $reservationDetails = $stmt->fetch();
    
    // Stockage des données de réservation en session pour affichage dans la page de confirmation
    $_SESSION['reservation'] = $reservationDetails;
    $_SESSION['reservation']['nights'] = $nights;
    
    // Rediriger vers la page de confirmation
    header('Location: ../reservation_confirmation.php');
    exit();
    
} catch (Exception $e) {
    // Annuler la transaction en cas d'erreur
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    // Log l'erreur
    error_log('Erreur de réservation: ' . $e->getMessage());
    
    // Message d'erreur convivial pour l'utilisateur
    $_SESSION['reservation_errors'] = ["Une erreur est survenue lors de la réservation: " . $e->getMessage()];
    $_SESSION['form_data'] = $reservation;
    header('Location: ../reservations.html');
    exit();
}
?>
