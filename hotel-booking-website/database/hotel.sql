-- Création de la base de données
CREATE DATABASE IF NOT EXISTS hotel_booking_db;
USE hotel_booking_db;

-- Table des utilisateurs (comptes clients)
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Stockage du hachage du mot de passe
    email VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    role ENUM('client', 'admin', 'manager') NOT NULL DEFAULT 'client',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des hôtels
CREATE TABLE IF NOT EXISTS hotels (
    hotel_id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_name VARCHAR(100) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(255),
    star_rating DECIMAL(2,1) DEFAULT 0,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    main_image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des images d'hôtels (une à plusieurs)
CREATE TABLE IF NOT EXISTS hotel_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(hotel_id) ON DELETE CASCADE
);

-- Table des catégories de chambres
CREATE TABLE IF NOT EXISTS room_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL,
    description TEXT
);

-- Table des chambres
CREATE TABLE IF NOT EXISTS rooms (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    category_id INT NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    floor VARCHAR(10),
    capacity INT NOT NULL DEFAULT 2,
    price_per_night DECIMAL(10,2) NOT NULL,
    description TEXT,
    area_sqm INT,
    has_wifi BOOLEAN DEFAULT FALSE,
    has_tv BOOLEAN DEFAULT FALSE,
    has_air_conditioning BOOLEAN DEFAULT FALSE,
    has_heating BOOLEAN DEFAULT FALSE,
    has_kitchen BOOLEAN DEFAULT FALSE,
    has_balcony BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES room_categories(category_id),
    UNIQUE KEY (hotel_id, room_number)
);

-- Table des images de chambres
CREATE TABLE IF NOT EXISTS room_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
);

-- Table des statuts de réservation
CREATE TABLE IF NOT EXISTS reservation_status (
    status_id INT AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL,
    description VARCHAR(255)
);

-- Table des réservations
CREATE TABLE IF NOT EXISTS reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    adults INT NOT NULL DEFAULT 1,
    children INT DEFAULT 0,
    price_total DECIMAL(10,2) NOT NULL,
    special_requests TEXT,
    status_id INT NOT NULL,
    payment_status ENUM('pending', 'paid', 'cancelled', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES reservation_status(status_id)
);

-- Table des paiements
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id)
);

-- Table des avis/commentaires clients
CREATE TABLE IF NOT EXISTS reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    user_id INT NOT NULL,
    reservation_id INT,
    rating DECIMAL(2,1) NOT NULL,
    comment TEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_approved BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id) ON DELETE SET NULL
);

-- Table des commodités d'hôtels
CREATE TABLE IF NOT EXISTS amenities (
    amenity_id INT AUTO_INCREMENT PRIMARY KEY,
    amenity_name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    icon VARCHAR(50)
);

-- Table de relation hôtels et commodités (many-to-many)
CREATE TABLE IF NOT EXISTS hotel_amenities (
    hotel_id INT NOT NULL,
    amenity_id INT NOT NULL,
    PRIMARY KEY (hotel_id, amenity_id),
    FOREIGN KEY (hotel_id) REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(amenity_id) ON DELETE CASCADE
);

-- Table des promotions
CREATE TABLE IF NOT EXISTS promotions (
    promotion_id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    promotion_name VARCHAR(100) NOT NULL,
    description TEXT,
    discount_percent DECIMAL(5,2),
    discount_amount DECIMAL(10,2),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    coupon_code VARCHAR(50),
    minimum_stay INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES hotels(hotel_id) ON DELETE CASCADE
);

-- Table des devis (pour les réservations de groupes)
CREATE TABLE IF NOT EXISTS quotes (
    quote_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    hotel_id INT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    num_rooms INT NOT NULL,
    num_guests INT NOT NULL,
    special_requests TEXT,
    status ENUM('pending', 'approved', 'declined', 'expired') DEFAULT 'pending',
    quoted_price DECIMAL(10,2),
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(hotel_id) ON DELETE CASCADE
);

-- Table des jetons de réinitialisation de mot de passe
CREATE TABLE IF NOT EXISTS password_resets (
    reset_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Table des blocs de disponibilité (pour bloquer certaines dates)
CREATE TABLE IF NOT EXISTS availability_blocks (
    block_id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    room_id INT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
);

-- Insertion des données initiales

-- Statuts de réservation
INSERT INTO reservation_status (status_name, description) VALUES
('Confirmée', 'La réservation est confirmée'),
('En attente', 'La réservation est en attente de confirmation'),
('Annulée', 'La réservation a été annulée'),
('Terminée', 'Le séjour est terminé'),
('No-show', 'Le client ne s\'est pas présenté');

-- Catégories de chambres
INSERT INTO room_categories (category_name, description) VALUES
('Standard', 'Chambre standard avec les commodités de base'),
('Supérieure', 'Chambre avec plus d\'espace et des commodités améliorées'),
('Deluxe', 'Chambre spacieuse avec des équipements haut de gamme'),
('Suite Junior', 'Suite avec salon séparé'),
('Suite Executive', 'Grande suite avec salon séparé et vues premium'),
('Familiale', 'Chambre spacieuse adaptée aux familles'),
('Accessible', 'Chambre adaptée aux personnes à mobilité réduite');

-- Commodités
INSERT INTO amenities (amenity_name, description, icon) VALUES
('Wi-Fi gratuit', 'Connexion Wi-Fi gratuite dans tout l\'hôtel', 'fa-wifi'),
('Piscine', 'Accès à une piscine', 'fa-swimming-pool'),
('Parking', 'Parking gratuit sur place', 'fa-parking'),
('Restaurant', 'Restaurant dans l\'hôtel', 'fa-utensils'),
('Bar', 'Bar dans l\'hôtel', 'fa-glass-martini-alt'),
('Salle de sport', 'Salle de fitness équipée', 'fa-dumbbell'),
('Spa', 'Services de spa et bien-être', 'fa-spa'),
('Climatisation', 'Climatisation dans les espaces communs', 'fa-snowflake'),
('Petit-déjeuner', 'Petit-déjeuner inclus ou disponible', 'fa-coffee'),
('Animaux acceptés', 'Les animaux de compagnie sont acceptés', 'fa-paw'),
('Navette aéroport', 'Service de navette vers/depuis l\'aéroport', 'fa-shuttle-van');

-- Exemple d'un compte administrateur
INSERT INTO users (username, password, email, first_name, last_name, role) VALUES
('admin', '$2y$10$YourHashedPasswordHere', 'admin@bookmystay.com', 'Admin', 'User', 'admin');

-- Création d'index pour optimiser les performances

-- Index sur les recherches de réservation
CREATE INDEX idx_reservations_dates ON reservations(check_in_date, check_out_date);
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_room ON reservations(room_id);
CREATE INDEX idx_reservations_status ON reservations(status_id);

-- Index sur les recherches d'hôtels
CREATE INDEX idx_hotels_location ON hotels(city, country);
CREATE INDEX idx_hotels_rating ON hotels(star_rating);

-- Index sur les prix des chambres
CREATE INDEX idx_rooms_price ON rooms(price_per_night);
CREATE INDEX idx_rooms_hotel ON rooms(hotel_id);
CREATE INDEX idx_rooms_availability ON rooms(is_available);

-- Index sur les avis
CREATE INDEX idx_reviews_hotel ON reviews(hotel_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
