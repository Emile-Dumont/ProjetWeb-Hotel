<?php
session_start();

// Vérifier si la réservation existe dans la session
if (!isset($_SESSION['reservation'])) {
    header("Location: ../reservations.html");
    exit;
}

$reservation = $_SESSION['reservation'];

// Inclure le fichier de connexion à la base de données
require_once 'db_connect.php';

// Récupérer des détails supplémentaires si nécessaire
try {
    if (isset($reservation['reservation_id'])) {
        // Supposons que l'ID est numérique sans le préfixe BOOK-
        $id = str_replace('BOOK-', '', $reservation['reservation_id']);
        
        $stmt = $pdo->prepare("
            SELECT r.*, h.hotel_name, h.address as hotel_address, h.city as hotel_city, 
                   rm.room_number, rc.category_name as room_type
            FROM reservations r
            JOIN rooms rm ON r.room_id = rm.room_id
            JOIN hotels h ON rm.hotel_id = h.hotel_id
            JOIN room_categories rc ON rm.category_id = rc.category_id
            WHERE r.reservation_id = ?
        ");
        
        $stmt->execute([$id]);
        $extraDetails = $stmt->fetch();
        
        if ($extraDetails) {
            // Fusionner les détails supplémentaires
            $reservation = array_merge($reservation, $extraDetails);
        }
    }
} catch (PDOException $e) {
    // Gérer silencieusement les erreurs - utilisez les données de session existantes
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation de réservation - BookMyStay</title>
    <link rel="stylesheet" href="../css/common.css">
    <link rel="stylesheet" href="../css/confirmation.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
    <header>
        <div class="logo">
            <h1>BookMyStay</h1>
        </div>
        <nav>
            <ul>
                <li><a href="../index.html">Accueil</a></li>
                <li><a href="../hotels.html">Hôtels</a></li>
                <li><a href="../reservations.html">Réservations</a></li>
                <li><a href="../promotions.html">Promotions</a></li>
                <li><a href="../contact.html">Contact</a></li>
            </ul>
        </nav>
    </header>

    <div class="confirmation-container">
        <div class="confirmation-header">
            <i class="fas fa-check-circle"></i>
            <h1>Merci pour votre réservation!</h1>
            <p>Votre réservation a été confirmée et un email de confirmation a été envoyé à <?php echo htmlspecialchars($reservation['email']); ?>.</p>
        </div>

        <div class="confirmation-card">
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
                    <span class="label">Hôtel:</span>
                    <span class="value"><?php echo htmlspecialchars($reservation['hotel_name']); ?></span>
                </div>

                <div class="detail-item">
                    <span class="label">Type de chambre:</span>
                    <span class="value"><?php echo htmlspecialchars($reservation['room_type']); ?></span>
                </div>
                
                <div class="detail-item">
                    <span class="label">Numéro de chambre:</span>
                    <span class="value"><?php echo htmlspecialchars($reservation['room_number'] ?? 'Attribué à l\'arrivée'); ?></span>
                </div>
                
                <div class="detail-item">
                    <span class="label">Arrivée:</span>
                    <span class="value"><?php echo htmlspecialchars($reservation['check_in_date']); ?></span>
                </div>
                
                <div class="detail-item">
                    <span class="label">Départ:</span>
                    <span class="value"><?php echo htmlspecialchars($reservation['check_out_date']); ?></span>
                </div>
                
                <div class="detail-item">
                    <span class="label">Nombre d'adultes:</span>
                    <span class="value"><?php echo htmlspecialchars($reservation['adults']); ?></span>
                </div>
                
                <div class="detail-item">
                    <span class="label">Prix total:</span>
                    <span class="value price"><?php echo htmlspecialchars($reservation['price_total']) . ' €'; ?></span>
                </div>
            </div>
            
            <?php if (!empty($reservation['special_requests'])): ?>
            <div class="special-requests">
                <h4>Demandes spéciales:</h4>
                <p><?php echo nl2br(htmlspecialchars($reservation['special_requests'])); ?></p>
            </div>
            <?php endif; ?>

            <div class="payment-info">
                <h4>Statut du paiement:</h4>
                <p class="payment-status pending">En attente</p>
                <p>Vous devrez régler votre séjour à l'arrivée à l'hôtel.</p>
            </div>
        </div>
        
        <div class="actions">
            <a href="../index.html" class="btn btn-secondary"><i class="fas fa-home"></i> Retour à l'accueil</a>
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
                    <li><a href="../hotels.html">Hôtels</a></li>
                    <li><a href="../reservations.html">Réservations</a></li>
                    <li><a href="../promotions.html">Promotions</a></li>
                    <li><a href="../contact.html">Contact</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h3>Suivez-nous</h3>
                <div class="social-links">
                    <a href="#"><i class="fab fa-facebook-f"></i></a>
                    <a href="#"><i class="fab fa-twitter"></i></a>
                    <a href="#"><i class="fab fa-instagram"></i></a>
                    <a href="#"><i class="fab fa-linkedin-in"></i></a>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2023 BookMyStay. Tous droits réservés.</p>
        </div>
    </footer>
</body>
</html>