const express = require('express');
const app = express();
const path = require('path');

// Middleware pour les fichiers statiques (doit être avant les routes)
app.use(express.static(path.join(__dirname, 'hotel-booking-website')));

// Middleware pour parser les données des formulaires
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route principale pour servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'hotel-booking-website', 'Index.html'));
});

// Route pour les requêtes POST
app.post('/submit', (req, res) => {
  res.send('Form submitted successfully!');
});

// Route par défaut pour les requêtes non définies
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Lancement du serveur sur le port 3000
app.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000');
});
