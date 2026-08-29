const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

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

// ================= AUTENTICAZIONE =================

// Registrazione
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

// ================= TRIPS (VIAGGI) =================

// Elenco viaggi
app.get('/api/trips', (req, res) => {
  const trips = readData(TRIPS_FILE);
  res.json(trips);
});

// Crea nuovo viaggio
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
    passengers: [],
    createdAt: new Date().toISOString()
  };

  trips.push(newTrip);
  writeData(TRIPS_FILE, trips);

  res.status(201).json({ message: 'Viaggio pubblicato con successo', trip: newTrip });
});

// Modifica viaggio
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

// Elimina viaggio
app.delete('/api/trips/:id', (req, res) => {
  const tripId = req.params.id;
  let trips = readData(TRIPS_FILE);

  const tripIndex = trips.findIndex((t) => String(t.id) === String(tripId));
  if (tripIndex === -1) {
    return res.status(404).json({ message: 'Viaggio non trovato.' });
  }

  trips = trips.filter((t) => String(t.id) !== String(tripId));
  writeData(TRIPS_FILE, trips);

  res.json({ message: 'Viaggio eliminato' });
});

// Prenota un posto
app.post('/api/trips/:id/book', (req, res) => {
  const tripId = req.params.id;
  const { userId, userName } = req.body;

  if (!userId || !userName) {
    return res.status(400).json({ message: 'Dati utente mancanti' });
  }

  let trips = readData(TRIPS_FILE);
  const trip = trips.find((t) => String(t.id) === String(tripId));

  if (!trip) {
    return res.status(404).json({ message: 'Viaggio non trovato' });
  }

  if (String(trip.driverId) === String(userId)) {
    return res.status(400).json({ message: 'Non puoi prenotare il tuo stesso passaggio.' });
  }

  if (!trip.passengers) trip.passengers = [];

  const giaPrenotato = trip.passengers.some((p) => String(p.userId) === String(userId));
  if (giaPrenotato) {
    return res.status(400).json({ message: 'Hai già prenotato questo passaggio' });
  }

  if (trip.availableSeats <= 0) {
    return res.status(400).json({ message: 'Posti esauriti' });
  }

  trip.passengers.push({ userId, userName, bookedAt: new Date().toISOString() });
  trip.availableSeats -= 1;

  writeData(TRIPS_FILE, trips);
  res.json({ message: 'Prenotazione confermata!', trip });
});

// Annulla prenotazione
app.post('/api/trips/:id/cancel-booking', (req, res) => {
  const tripId = req.params.id;
  const { userId } = req.body;

  let trips = readData(TRIPS_FILE);
  const trip = trips.find((t) => String(t.id) === String(tripId));

  if (!trip || !trip.passengers) {
    return res.status(404).json({ message: 'Prenotazione non trovata' });
  }

  const index = trip.passengers.findIndex((p) => String(p.userId) === String(userId));
  if (index === -1) {
    return res.status(400).json({ message: 'Non risulti tra i passeggeri' });
  }

  trip.passengers.splice(index, 1);
  trip.availableSeats += 1;

  writeData(TRIPS_FILE, trips);
  res.json({ message: 'Prenotazione annullata' });
});

// ================= CONCERTI =================

// Elenco tutti i concerti
app.get('/api/concerts', (req, res) => {
  const concerts = readData(CONCERTS_FILE);
  res.json(concerts);
});

// Singolo concerto per ID
app.get('/api/concerts/:id', (req, res) => {
  const concerts = readData(CONCERTS_FILE);
  const concert = concerts.find((c) => String(c.id) === String(req.params.id));
  if (!concert) return res.status(404).json({ error: 'Concerto non trovato' });
  res.json(concert);
});

// ================= REAL-TIME SOCKET.IO =================
io.on('connection', (socket) => {
  socket.on('join_trip', (tripId) => {
    socket.join(tripId);
  });

  socket.on('send_message', (data) => {
    io.to(data.tripId).emit('receive_message', data);
  });
});

// ================= AVVIO SERVER =================
server.listen(PORT, () => {
  console.log(`Server attivo su http://localhost:${PORT}`);
});