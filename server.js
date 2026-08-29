const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Percorsi file JSON
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const TRIPS_FILE = path.join(__dirname, 'data', 'trips.json');
const CONCERTS_FILE = path.join(__dirname, 'data', 'concerts.json');

// Helper per leggere e scrivere JSON
const readData = (filePath) => {
  if (!fs.existsSync(filePath)) return [];
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    return [];
  }
};

const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// AUTENTICAZIONE 

// registrazione
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Tutti i campi sono obbligatori.' });
  }

  const users = readData(USERS_FILE);
  const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    return res.status(400).json({ message: 'Email già registrata.' });
  }

  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password
  };

  users.push(newUser);
  writeData(USERS_FILE, users);

  res.status(201).json({ message: 'Registrazione completata con successo', user: newUser });
});

// elimina un viaggio
app.delete('/api/trips/:id', (req, res) => {
  const tripId = req.params.id;
  let trips = readData(TRIPS_FILE);
  
  const tripIndex = trips.findIndex((t) => String(t.id) === String(tripId));
  if (tripIndex === -1) {
    return res.status(404).json({ message: 'Viaggio non trovato.' });
  }

  trips = trips.filter((t) => String(t.id) !== String(tripId));
  writeData(TRIPS_FILE, trips);

  res.json({ message: 'Viaggio eliminato con successo.' });
});

// modifica viaggio (aggiorna posti e prezzo)
// Modifica un viaggio
app.put('/api/trips/:id', (req, res) => {
  const tripId = req.params.id;
  const { concertName, departureCity, departureTime, availableSeats, pricePerSeat } = req.body;
  const trips = readData(TRIPS_FILE);

  const trip = trips.find((t) => String(t.id) === String(tripId));
  if (!trip) {
    return res.status(404).json({ message: 'Viaggio non trovato.' });
  }

  if (concertName !== undefined) trip.concertName = concertName;
  if (departureCity !== undefined) trip.departureCity = departureCity;
  if (departureTime !== undefined) trip.departureTime = departureTime;
  if (availableSeats !== undefined) trip.availableSeats = Number(availableSeats);
  if (pricePerSeat !== undefined) trip.pricePerSeat = Number(pricePerSeat);

  writeData(TRIPS_FILE, trips);
  res.json({ message: 'Viaggio modificato con successo.', trip });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const users = readData(USERS_FILE);
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Credenziali non valide.' });
  }

  res.json({ message: 'Accesso eseguito con successo', user });
});

// TRIPS

//  tutti i viaggi
app.get('/api/trips', (req, res) => {
  const trips = readData(TRIPS_FILE);
  res.json(trips);
});

// nuovo viaggio
app.post('/api/trips', (req, res) => {
  const { driverId, driverName, concertName, departureCity, departureTime, availableSeats, pricePerSeat } = req.body;

  if (!driverId || !concertName || !departureCity || !departureTime || !availableSeats || !pricePerSeat) {
    return res.status(400).json({ message: 'Compila tutti i campi del viaggio' });
  }

  const trips = readData(TRIPS_FILE);
  const newTrip = {
    id: Date.now().toString(),
    driverId,
    driverName,
    concertName,
    departureCity,
    departureTime,
    availableSeats: Number(availableSeats),
    pricePerSeat: Number(pricePerSeat),
    createdAt: new Date().toISOString()
  };

  trips.push(newTrip);
  writeData(TRIPS_FILE, trips);

  res.status(201).json({ message: 'Viaggio pubblicato con successo', trip: newTrip });
});

// CONCERTI 
app.get('/api/concerts', (req, res) => {
  const concerts = readData(CONCERTS_FILE);
  res.json(concerts);
});

// avvio server
server.listen(PORT, () => {
  console.log(`Server attivo su http://localhost:${PORT}`);
});