<?php
// Démarrer la session
session_start();

// Inclure le fichier de connexion à la base de données
require_once 'db_connect.php';

// Vérifier si le formulaire a été soumis
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collecter les données du formulaire
    $reservation = [
        'hotel_id' => $_POST['hotel_id'] ?? '',
        'name' => $_POST['name'] ?? '',
        'email' => $_POST['email'] ?? '',
        'phone' => $_POST['phone'] ?? '',
        'check_in' => $_POST['check_in'] ?? '',
        'check_out' => $_POST['check_out'] ?? '',
        'guests' => $_POST['guests'] ?? '',
        'room_type' => $_POST['room_type'] ?? '',
        'special_requests' => $_POST['special_requests'] ?? '',
        'timestamp' => date('Y-m-d H:i:s'),
        'reservation_id' => uniqid('BOOK-')
    ];
    
    // Valider les champs requis
    $required_fields = ['name', 'email', 'check_in', 'check_out', 'guests', 'hotel_id'];
    $errors = [];
    
    foreach ($required_fields as $field) {
        if (empty($reservation[$field])) {
            $errors[] = "Le champ '".ucfirst($field)."' est obligatoire.";
        }
    }
    
    // Valider le format de l'email
    if (!empty($reservation['email']) && !filter_var($reservation['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = "L'adresse email n'est pas valide.";
    }
    
    // Vérifier s'il y a des erreurs de validation
    if (!empty($errors)) {
        // Stocker les erreurs et rediriger vers le formulaire
        $_SESSION['reservation_errors'] = $errors;
        $_SESSION['form_data'] = $reservation;
        header("Location: ../reservations.html");
        exit;
    }
    
    try {
        // Vérifier si l'utilisateur existe déjà ou créer un nouvel utilisateur
        $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ?");
        $stmt->execute([$reservation['email']]);
        $user = $stmt->fetch();
        
        $userId = null;
        
        if ($user) {
            // Utilisateur existant
            $userId = $user['user_id'];
        } else {
            // Créer un nouvel utilisateur
            $name_parts = explode(' ', $reservation['name'], 2);
            $first_name = $name_parts[0];
            $last_name = isset($name_parts[1]) ? $name_parts[1] : '';
            
            $stmt = $pdo->prepare("INSERT INTO users (username, password, email, first_name, last_name, phone, role) 
                          VALUES (?, ?, ?, ?, ?, ?, 'client')");
            $stmt->execute([
                $reservation['email'], // username = email
                password_hash(uniqid(), PASSWORD_DEFAULT), // mot de passe temporaire
                $reservation['email'],
                $first_name,
                $last_name,
                $reservation['phone']
            ]);
            
            $userId = $pdo->lastInsertId();
        }
        
        // Trouver une chambre disponible qui correspond aux critères
        $stmt = $pdo->prepare("
            SELECT r.* FROM rooms r
            JOIN room_categories rc ON r.category_id = rc.category_id
            WHERE r.hotel_id = ? 
            AND rc.category_name LIKE ? 
            AND r.capacity >= ?
            AND r.is_available = true
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
        
        $categorySearch = '%' . $reservation['room_type'] . '%';
        $stmt->execute([
            $reservation['hotel_id'],
            $categorySearch,
            $reservation['guests'],
            $reservation['check_in'],
            $reservation['check_in'],
            $reservation['check_out'],
            $reservation['check_out'],
            $reservation['check_in'],
            $reservation['check_out']
        ]);
        
        $room = $stmt->fetch();
        
        if (!$room) {
            // Aucune chambre disponible
            $_SESSION['reservation_errors'] = ["Désolé, aucune chambre n'est disponible pour ces dates."];
            $_SESSION['form_data'] = $reservation;
            header("Location: ../reservations.html");
            exit;
        }
        
        // Calculer le prix total
        $checkIn = new DateTime($reservation['check_in']);
        $checkOut = new DateTime($reservation['check_out']);
        $nights = $checkOut->diff($checkIn)->days;
        $totalPrice = $room['price_per_night'] * $nights;
        
        // Créer la réservation
        $stmt = $pdo->prepare("
            INSERT INTO reservations 
            (user_id, room_id, check_in_date, check_out_date, adults, children, price_total, special_requests, status_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $adults = $reservation['guests'];
        $children = 0;
        $statusConfirmed = 1; // ID du statut 'Confirmée'
        
        $stmt->execute([
            $userId,
            $room['room_id'],
            $reservation['check_in'],
            $reservation['check_out'],
            $adults,
            $children,
            $totalPrice,
            $reservation['special_requests'],
            $statusConfirmed
        ]);
        
        $reservationId = $pdo->lastInsertId();
        
        // Ajouter le paiement en attente
        $stmt = $pdo->prepare("
            INSERT INTO payments 
            (reservation_id, amount, payment_method, status) 
            VALUES (?, ?, 'online', 'pending')
        ");
        
        $stmt->execute([$reservationId, $totalPrice]);
        
        // Récupérer les détails complets pour l'affichage
        $stmt = $pdo->prepare("
            SELECT r.*, u.first_name, u.last_name, u.email, u.phone, h.hotel_name,
                   rc.category_name as room_type
            FROM reservations r
            JOIN users u ON r.user_id = u.user_id
            JOIN rooms rm ON r.room_id = rm.room_id
            JOIN hotels h ON rm.hotel_id = h.hotel_id
            JOIN room_categories rc ON rm.category_id = rc.category_id
            WHERE r.reservation_id = ?
        ");
        
        $stmt->execute([$reservationId]);
        $completeReservation = $stmt->fetch();
        
        // Stocker dans la session pour la page de confirmation
        $_SESSION['reservation'] = array_merge($completeReservation, [
            'reservation_id' => "BOOK-" . $reservationId,
            'name' => $completeReservation['first_name'] . ' ' . $completeReservation['last_name']
        ]);
        
        // Rediriger vers la page de confirmation
        header("Location: reservation_confirmation.php");
        exit;
        
    } catch (PDOException $e) {
        // Gérer les erreurs de base de données
        $_SESSION['reservation_errors'] = ["Une erreur est survenue lors du traitement de la réservation: " . $e->getMessage()];
        $_SESSION['form_data'] = $reservation;
        header("Location: ../reservations.html");
        exit;
    }
} else {
    // Si quelqu'un essaie d'accéder directement à ce fichier, rediriger vers la page de réservations
    header("Location: ../reservations.html");
    exit;
}
?>