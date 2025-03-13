<?php
// Start session to store reservation data
session_start();

// Check if the form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect form data
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
    
    // Validate required fields
    $required_fields = ['name', 'email', 'check_in', 'check_out', 'guests'];
    $errors = [];
    
    foreach ($required_fields as $field) {
        if (empty($reservation[$field])) {
            $errors[] = "Le champ '".ucfirst($field)."' est obligatoire.";
        }
    }
    
    // Validate email format
    if (!empty($reservation['email']) && !filter_var($reservation['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = "L'adresse email n'est pas valide.";
    }
    
    // Check if there are validation errors
    if (!empty($errors)) {
        // Store errors and redirect back to form
        $_SESSION['reservation_errors'] = $errors;
        $_SESSION['form_data'] = $reservation; // Keep the form data
        header("Location: reservations.html");
        exit;
    }
    
    // In a real application, you would save to database here
    // For demonstration, we'll just store in session and redirect to confirmation
    $_SESSION['reservation'] = $reservation;
    
    // Redirect to confirmation page
    header("Location: reservation_confirmation.php");
    exit;
} else {
    // If someone tries to access this file directly, redirect to reservations page
    header("Location: reservations.html");
    exit;
}
?>