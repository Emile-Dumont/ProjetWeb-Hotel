const express = require('express');
const app = express();
const path = require('path');
const mysql = require('mysql');
const bcrypt = require('bcrypt'); // Pour hacher les mots de passe

// Configuration de la connexion à la base de données
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'hotel', // Nom de la base de données selon votre SQL
  port: 3306 // Port MySQL de MAMP
});

// Connexion à la base de données
db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données : ', err);
    return;
  }
  console.log('Connexion à la base de données établie avec succès');
});

// Configuration des middlewares
app.use(express.static(path.join(__dirname, 'hotel-booking-website')));
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

// Nouvelle route pour l'inscription utilisateur
app.post('/api/register', async (req, res) => {
  try {
    // Récupérer les données du formulaire
    const { 
      username, 
      password, 
      email, 
      first_name, 
      last_name, 
      phone, 
      address, 
      city, 
      country, 
      postal_code 
    } = req.body;

    // Validation des champs obligatoires
    if (!username || !password || !email || !first_name || !last_name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tous les champs obligatoires doivent être remplis' 
      });
    }

    // Vérifier si l'utilisateur existe déjà
    db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?', 
      [username, email], 
      async (err, results) => {
        if (err) {
          console.error('Erreur de base de données:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la vérification utilisateur' 
          });
        }

        if (results.length > 0) {
          return res.status(409).json({ 
            success: false, 
            message: 'Nom d\'utilisateur ou email déjà utilisé' 
          });
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer le nouvel utilisateur
        const newUser = {
          username,
          password: hashedPassword,
          email,
          first_name,
          last_name,
          phone: phone || null,
          address: address || null,
          city: city || null,
          country: country || null,
          postal_code: postal_code || null,
          role: 'client' // Par défaut
        };

        // Insérer dans la base de données
        db.query(
          'INSERT INTO users SET ?', 
          newUser, 
          (err, result) => {
            if (err) {
              console.error('Erreur d\'insertion:', err);
              return res.status(500).json({ 
                success: false, 
                message: 'Erreur lors de l\'inscription' 
              });
            }

            // Inscription réussie
            res.status(201).json({ 
              success: true, 
              message: 'Inscription réussie!',
              userId: result.insertId
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

// Route pour les requêtes POST du formulaire
app.post('/submit', (req, res) => {
  res.send('Form submitted successfully!');
});

// Route par défaut pour les requêtes non définies
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Lancement du serveur
app.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000. Accédez à http://localhost:3000/');
});
