<?php
// Start session to retrieve reservation data
session_start();

// Check if reservation exists in session
if (!isset($_SESSION['reservation'])) {
    // Redirect to reservations page if no reservation data exists
    header("Location: reservations.html");
    exit;
}

$reservation = $_SESSION['reservation'];
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation de Réservation | BookMyStay</title>
    <link rel="stylesheet" href="css/common.css">
    <link rel="stylesheet" href="css/reservations.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
    <nav class="navbar">
        <div class="logo">BookMyStay</div>
        <ul class="nav-links">
            <li><a href="index.html"><i class="fas fa-home"></i> Accueil</a></li>
            <li><a href="hotels.html"><i class="fas fa-hotel"></i> Hôtels</a></li>
            <li class="active"><a href="reservations.html"><i class="fas fa-calendar-check"></i> Réservations</a></li>
            <li><a href="promotions.html"><i class="fas fa-percent"></i> Promotions</a></li>
            <li><a href="contact.html"><i class="fas fa-envelope"></i> Contact</a></li>
        </ul>
        <div class="hamburger">
            <span></span>
            <span></span>
            <span></span>
        </div>
    </nav>

    <div class="container">
        <h2><i class="fas fa-check-circle" style="color: var(--secondary-color);"></i> Réservation Confirmée</h2>
        
        <div class="confirmation">
            <p>Votre réservation a été confirmée avec succès! Vous recevrez bientôt un e-mail de confirmation.</p>
        </div>
        
        <div class="reservation-details">
            <h3>Détails de votre réservation</h3>
            <p><strong>Numéro de réservation:</strong> <?php echo htmlspecialchars($reservation['reservation_id']); ?></p>
            
            <div class="details-grid">
                <div class="detail-item">
                    <span class="label">Nom:</span>
                    <span class="value"><?php echo htmlspecialchars($reservation['name']); ?></span>
                </div>
                
                <div class="detail-item">
                    <span class="label">Email:</span>
                    <span class="value"><?php echo htmlspecialchars($reservation['email']); ?></span>
                </div>
                
                <div class="detail-item">
                    <span class="label">Téléphone:</span>
                    <span class="value"><?php echo htmlspecialchars($reservation['phone']); ?></span>
                </div>
                
                <div class="detail-item">
                    <span class="label">Arrivée:</span>
                    <span class="value"><?php echo htmlspecialchars($reservation['check_in']); ?></span>
                </div>
                
                <div class="detail-item">
                    <span class="label">Départ:</span>
                    <span class="value"><?php echo htmlspecialchars($reservation['check_out']); ?></span>
                </div>
                
                <div class="detail-item">
                    <span class="label">Nombre de personnes:</span>
                    <span class="value"><?php echo htmlspecialchars($reservation['guests']); ?></span>
                </div>
                
                <div class="detail-item">
                    <span class="label">Type de chambre:</span>
                    <span class="value"><?php echo htmlspecialchars($reservation['room_type']); ?></span>
                </div>
            </div>
            
            <?php if (!empty($reservation['special_requests'])): ?>
            <div class="special-requests">
                <h4>Demandes spéciales:</h4>
                <p><?php echo nl2br(htmlspecialchars($reservation['special_requests'])); ?></p>
            </div>
            <?php endif; ?>
        </div>
        
        <div class="actions">
            <a href="index.html" class="btn btn-secondary"><i class="fas fa-home"></i> Retour à l'accueil</a>
            <button onclick="window.print()" class="btn btn-primary"><i class="fas fa-print"></i> Imprimer la confirmation</button>
        </div>
    </div>

    <footer>
        <div class="footer-content">
            <div class="footer-section">
                <h3>BookMyStay</h3>
                <p>Votre partenaire pour des séjours inoubliables partout dans le monde.</p>
            </div>
            <div class="footer-section">
                <h3>Liens utiles</h3>
                <ul>
                    <li><a href="hotels.html">Hôtels</a></li>
                    <li><a href="reservations.html">Réservations</a></li>
                    <li><a href="promotions.html">Promotions</a></li>
                    <li><a href="contact.html">Contact</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h3>Suivez-nous</h3>
                <div class="social-links">
                    <a href="#"><i class="fab fa-facebook-f"></i></a>
                    <a href="#"><i class="fab fa-twitter"></i></a>
                    <a href="#"><i class="fab fa-instagram"></i></a>
                </div>
            </div>
        </div>
    </footer>

    <script src="js/main.js"></script>
</body>
</html>