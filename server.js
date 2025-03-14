const express = require('express');
const app = express();
const path = require('path');
const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'hotel', // Assurez-vous que c'est le bon nom de base de données
  port: 3306 
});

// Pour Windows, vous devriez plutôt utiliser :
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'root',
//   database: 'hotel_booking_db',
//   port: 8889  // Port MySQL standard pour MAMP sur Windows
// });

// Première connexion à la base de données
db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données : ', err);
    return;
  }
  console.log('Connexion à la base de données établie avec succès');

  // Exécutez vos requêtes ici
  db.query('SHOW TABLES', (err, results) => {
    if (err) {
      console.error('Erreur d\'exécution de la requête : ', err);
    } else {
      console.log('Tables disponibles : ', results);
    }
    // Ne fermez pas la connexion ici si vous voulez l'utiliser plus tard
    // db.end();
  });
});

// Middleware pour les fichiers statiques (doit être avant les routes)
app.use(express.static(path.join(__dirname, 'hotel-booking-website')));

// Middleware pour parser les données des formulaires
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route principale pour servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'hotel-booking-website', 'index.html')); // Assurez-vous que le nom du fichier est correct (majuscule/minuscule)
});

// API pour récupérer les hôtels
app.get('/api/hotels', (req, res) => {
  db.query('SELECT * FROM hotels', (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des hôtels : ', err);
      res.status(500).json({ error: 'Erreur lors de la récupération des hôtels' });
      return;
    }
    res.json(results);
  });
});

// API pour les réservations
app.post('/api/reservations', (req, res) => {
  const reservation = req.body;
  // Insérer la réservation dans la base de données
  // Ceci est un exemple simplifié
  db.query('INSERT INTO reservations SET ?', reservation, (err, result) => {
    if (err) {
      console.error('Erreur lors de la création de la réservation : ', err);
      res.status(500).json({ error: 'Erreur lors de la création de la réservation' });
      return;
    }
    res.status(201).json({ success: true, id: result.insertId });
  });
});

// Route pour les requêtes POST du formulaire
app.post('/submit', (req, res) => {
  res.send('Form submitted successfully!');
});

// Route par défaut pour les requêtes non définies
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Lancement du serveur sur le port 3000
app.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000. Accédez à http://localhost:3000/');
});
