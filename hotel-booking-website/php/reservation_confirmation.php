<?php
// reservation_confirmation.php
session_start();

// Rediriger si aucune réservation n'est présente en session
if (!isset($_SESSION['reservation'])) {
    header('Location: reservations.html');
    exit();
}

// Récupérer les détails de la réservation
$reservation = $_SESSION['reservation'];
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation de Réservation - Tripisien</title>
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/reservation.css">
    <script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>
</head>
<body>
    <?php include 'includes/header.php'; ?>
    
    <main class="container">
        <div class="confirmation-container">
            <div class="confirmation-header">
                <i class="fas fa-check-circle"></i>
                <h1>Réservation confirmée</h1>
                <p>Votre réservation a été effectuée avec succès!</p>
            </div>
            
            <div class="reservation-details">
                <div class="reservation-code">
                    <span>Code de réservation:</span>
                    <strong><?php echo htmlspecialchars($reservation['reservation_code']); ?></strong>
                </div>
                
                <div class="detail-section">
                    <h2>Détails de l'hôtel</h2>
                    <div class="hotel-info">
                        <h3><?php echo htmlspecialchars($reservation['hotel_name']); ?></h3>
                        <p><i class="fas fa-map-marker-alt"></i> <?php echo htmlspecialchars($reservation['hotel_address']); ?>, <?php echo htmlspecialchars($reservation['hotel_city']); ?>, <?php echo htmlspecialchars($reservation['hotel_country']); ?></p>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h2>Détails du séjour</h2>
                    <div class="detail-row">
                        <span>Arrivée:</span>
                        <strong><?php echo date('d/m/Y', strtotime($reservation['check_in_date'])); ?></strong>
                    </div>
                    <div class="detail-row">
                        <span>Départ:</span>
                        <strong><?php echo date('d/m/Y', strtotime($reservation['check_out_date'])); ?></strong>
                    </div>
                    <div class="detail-row">
                        <span>Durée:</span>
                        <strong><?php echo $reservation['nights']; ?> nuit(s)</strong>
                    </div>
                    <div class="detail-row">
                        <span>Chambre:</span>
                        <strong><?php echo htmlspecialchars($reservation['room_type']) . ' (n°' . htmlspecialchars($reservation['room_number']) . ')'; ?></strong>
                    </div>
                    <div class="detail-row">
                        <span>Voyageurs:</span>
                        <strong><?php echo $reservation['adults']; ?> adulte(s)</strong>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h2>Détails de paiement</h2>
                    <div class="detail-row">
                        <span>Prix par nuit:</span>
                        <strong><?php echo number_format($reservation['price_per_night'], 2); ?>€</strong>
                    </div>
                    <div class="detail-row">
                        <span>Taxes:</span>
                        <strong><?php echo number_format($reservation['price_total'] * 0.1, 2); ?>€</strong>
                    </div>
                    <div class="detail-row total">
                        <span>Total:</span>
                        <strong><?php echo number_format($reservation['price_total'], 2); ?>€</strong>
                    </div>
                    <div class="payment-status">
                        <span class="badge-pending">Paiement en attente</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h2>Coordonnées</h2>
                    <div class="detail-row">
                        <span>Nom:</span>
                        <strong><?php echo htmlspecialchars($reservation['guest_name']); ?></strong>
                    </div>
                    <div class="detail-row">
                        <span>Email:</span>
                        <strong><?php echo htmlspecialchars($reservation['guest_email']); ?></strong>
                    </div>
                    <div class="detail-row">
                        <span>Téléphone:</span>
                        <strong><?php echo htmlspecialchars($reservation['guest_phone']); ?></strong>
                    </div>
                </div>
                
                <?php if (!empty($reservation['special_requests'])): ?>
                <div class="detail-section">
                    <h2>Demandes spéciales</h2>
                    <p><?php echo nl2br(htmlspecialchars($reservation['special_requests'])); ?></p>
                </div>
                <?php endif; ?>
                
                <div class="confirmation-actions">
                    <a href="index.php" class="btn-primary">Retour à l'accueil</a>
                    <a href="#" class="btn-secondary" onclick="window.print()">Imprimer</a>
                </div>
            </div>
        </div>
    </main>
    
    <?php include 'includes/footer.php'; ?>
    
    <script>
        // Script pour envoyer un e-mail de confirmation (simulation)
        document.addEventListener('DOMContentLoaded', function() {
            console.log("Un email de confirmation a été envoyé à <?php echo htmlspecialchars($reservation['guest_email']); ?>");
        });
    </script>
</body>
</html>

<?php
// Effacer les données de réservation une fois la page affichée
// unset($_SESSION['reservation']);
?>
