require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const User = require('./models/User');
const Concert = require('./models/Concert');
const Trip = require('./models/Trip');

async function importData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connesso a MongoDB Atlas...');

    const rawConcerts = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'concerts.json'), 'utf8') || '[]');
    const rawUsers = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'users.json'), 'utf8') || '[]');
    const rawTrips = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'trips.json'), 'utf8') || '[]');

    // Rimuove gli id statici
    const sanitize = (arr) => arr.map(({ id, ...rest }) => rest);

    // Mappa per associare driverId -> nome utente
    const userMap = {};
    for (const u of rawUsers) {
      if (u.id) userMap[String(u.id)] = u.name;
    }

    // Pulisce gli utenti dai duplicati di email
    const seenEmails = new Set();
    const uniqueUsers = [];
    for (const u of rawUsers) {
      const emailLower = (u.email || '').toLowerCase().trim();
      if (emailLower && !seenEmails.has(emailLower)) {
        seenEmails.add(emailLower);
        uniqueUsers.push(u);
      }
    }

    // Assicura che ogni viaggio abbia un driverName valido
    const sanitizedTrips = rawTrips.map((t) => {
      const { id, ...tripData } = t;
      if (!tripData.driverName) {
        tripData.driverName = userMap[String(tripData.driverId)] || 'Autista';
      }
      return tripData;
    });

    // Pulisce le collezioni prima di reinserire
    await Concert.deleteMany({});
    await User.deleteMany({});
    await Trip.deleteMany({});

    // Inserisce i dati puliti
    if (rawConcerts.length) await Concert.insertMany(sanitize(rawConcerts));
    if (uniqueUsers.length) await User.insertMany(sanitize(uniqueUsers));
    if (sanitizedTrips.length) await Trip.insertMany(sanitizedTrips);

    console.log('Dati migrati con successo su Atlas!');
    process.exit(0);
  } catch (err) {
    console.error('Errore durante la migrazione:', err);
    process.exit(1);
  }
}

importData();