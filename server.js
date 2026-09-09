require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const User = require('./models/User');
const Trip = require('./models/Trip');
const Concert = require('./models/Concert');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

// Connessione a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/concert_app')
  .then(() => console.log('Connesso con successo a MongoDB'))
  .catch((err) => console.error('Errore di connessione a MongoDB:', err));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ================= AUTENTICAZIONE =================

// Registrazione
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Tutti i campi sono obbligatori.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email già registrata.' });
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password
    });

    res.status(201).json({ 
      message: 'Registrazione completata con successo', 
      user: { id: newUser._id.toString(), name: newUser.name, email: newUser.email } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Errore interno del server.' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase(), password });

    if (!user) {
      return res.status(401).json({ message: 'Credenziali non valide.' });
    }

    res.json({ 
      message: 'Accesso eseguito con successo', 
      user: { id: user._id.toString(), name: user.name, email: user.email } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Errore interno del server.' });
  }
});

// ================= VIAGGI =================

// Elenco viaggi
app.get('/api/trips', async (req, res) => {
  try {
    const trips = await Trip.find();
    const mappedTrips = trips.map((t) => {
      const obj = t.toObject();
      obj.id = obj._id.toString();
      return obj;
    });
    res.json(mappedTrips);
  } catch (err) {
    res.status(500).json({ message: 'Errore nel recupero dei viaggi.' });
  }
});

// Creazione viaggio
app.post('/api/trips', async (req, res) => {
  try {
    const { driverId, driverName, concertName, departureCity, meetingPoint, departureTime, availableSeats, pricePerSeat } = req.body;

    if (!driverId || !concertName || !departureCity || !departureTime || !availableSeats || !pricePerSeat) {
      return res.status(400).json({ message: 'Compila tutti i campi del viaggio' });
    }

    const newTrip = await Trip.create({
      driverId,
      driverName,
      concertName,
      departureCity,
      meetingPoint: meetingPoint || '',
      departureTime,
      availableSeats: Number(availableSeats),
      pricePerSeat: Number(pricePerSeat),
      passengers: []
    });

    const tripObj = newTrip.toObject();
    tripObj.id = tripObj._id.toString();

    res.status(201).json({ message: 'Viaggio pubblicato con successo', trip: tripObj });
  } catch (err) {
    res.status(500).json({ message: 'Errore nel salvataggio del viaggio.' });
  }
});

// Modifica viaggio
app.put('/api/trips/:id', async (req, res) => {
  try {
    const tripId = req.params.id;
    const { concertName, departureCity, meetingPoint, departureTime, availableSeats, pricePerSeat } = req.body;

    const updateFields = {};
    if (concertName !== undefined) updateFields.concertName = concertName;
    if (departureCity !== undefined) updateFields.departureCity = departureCity;
    if (meetingPoint !== undefined) updateFields.meetingPoint = meetingPoint;
    if (departureTime !== undefined) updateFields.departureTime = departureTime;
    if (availableSeats !== undefined) updateFields.availableSeats = Number(availableSeats);
    if (pricePerSeat !== undefined) updateFields.pricePerSeat = Number(pricePerSeat);

    const trip = await Trip.findByIdAndUpdate(tripId, updateFields, { new: true });
    if (!trip) {
      return res.status(404).json({ message: 'Viaggio non trovato.' });
    }

    const tripObj = trip.toObject();
    tripObj.id = tripObj._id.toString();

    res.json({ message: 'Viaggio modificato con successo.', trip: tripObj });
  } catch (err) {
    res.status(500).json({ message: 'Errore durante la modifica del viaggio.' });
  }
});

// Eliminazione viaggio
app.delete('/api/trips/:id', async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Viaggio non trovato.' });
    }

    res.json({ message: 'Viaggio eliminato' });
  } catch (err) {
    res.status(500).json({ message: 'Errore durante l\'eliminazione del viaggio.' });
  }
});

// Prenotazione passaggio
app.post('/api/trips/:id/book', async (req, res) => {
  try {
    const tripId = req.params.id;
    const { userId, userName } = req.body;

    if (!userId || !userName) {
      return res.status(400).json({ message: 'Dati utente mancanti' });
    }

    const trip = await Trip.findById(tripId);
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
    await trip.save();

    const tripObj = trip.toObject();
    tripObj.id = tripObj._id.toString();

    res.json({ message: 'Prenotazione confermata!', trip: tripObj });
  } catch (err) {
    res.status(500).json({ message: 'Errore durante la prenotazione.' });
  }
});

// Annullamento prenotazione
app.post('/api/trips/:id/cancel-booking', async (req, res) => {
  try {
    const tripId = req.params.id;
    const { userId } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip || !trip.passengers) {
      return res.status(404).json({ message: 'Prenotazione non trovata' });
    }

    const index = trip.passengers.findIndex((p) => String(p.userId) === String(userId));
    if (index === -1) {
      return res.status(400).json({ message: 'Non risulti tra i passeggeri' });
    }

    trip.passengers.splice(index, 1);
    trip.availableSeats += 1;
    await trip.save();

    res.json({ message: 'Prenotazione annullata' });
  } catch (err) {
    res.status(500).json({ message: 'Errore durante l\'annullamento.' });
  }
});

// ================= CONCERTI & CHAT =================

// Elenco concerti
app.get('/api/concerts', async (req, res) => {
  try {
    const concerts = await Concert.find();
    const mappedConcerts = concerts.map((c) => {
      const obj = c.toObject();
      obj.id = obj._id.toString();
      return obj;
    });
    res.json(mappedConcerts);
  } catch (err) {
    res.status(500).json({ message: 'Errore nel recupero dei concerti.' });
  }
});

// Singolo concerto per ID
app.get('/api/concerts/:id', async (req, res) => {
  try {
    const concert = await Concert.findById(req.params.id);
    if (!concert) return res.status(404).json({ error: 'Concerto non trovato' });

    const obj = concert.toObject();
    obj.id = obj._id.toString();
    if (obj.messages) {
      obj.messages = obj.messages.map((m) => ({
        id: m._id.toString(),
        userName: m.userName,
        text: m.text,
        time: m.time
      }));
    }

    res.json(obj);
  } catch (err) {
    res.status(500).json({ error: 'Concerto non trovato' });
  }
});

// Salva e restituisce i messaggi della chat per un concerto
app.post('/api/concerts/:id/messages', async (req, res) => {
  try {
    const concertId = req.params.id;
    const { userName, text } = req.body;

    const concert = await Concert.findById(concertId);
    if (!concert) {
      return res.status(404).json({ message: 'Concerto non trovato' });
    }

    if (!concert.messages) {
      concert.messages = [];
    }

    const newMessage = {
      userName: userName || 'Utente',
      text,
      time: new Date().toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    concert.messages.push(newMessage);
    await concert.save();

    const messagesFormatted = concert.messages.map((m) => ({
      id: m._id.toString(),
      userName: m.userName,
      text: m.text,
      time: m.time
    }));

    res.json({ success: true, messages: messagesFormatted });
  } catch (err) {
    res.status(500).json({ message: 'Errore nell\'invio del messaggio' });
  }
});

// Endpoint per eliminare un messaggio
app.delete('/api/concerts/:id/messages/:msgId', async (req, res) => {
  try {
    const concertId = req.params.id;
    const msgId = req.params.msgId;

    const concert = await Concert.findById(concertId);
    if (!concert) {
      return res.status(404).json({ message: 'Concerto non trovato' });
    }

    if (!concert.messages) {
      concert.messages = [];
    }

    concert.messages = concert.messages.filter((msg) => msg._id.toString() !== msgId);
    await concert.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Errore nell\'eliminazione del messaggio' });
  }
});

// ================= SOCKET.IO =================

io.on('connection', (socket) => {
  socket.on('join_trip', (tripId) => {
    socket.join(tripId);
  });

  socket.on('send_message', (data) => {
    io.to(data.tripId).emit('receive_message', data);
  });

  socket.on('delete_message', (data) => {
    io.to(data.tripId).emit('message_deleted', data.msgId);
  });
});

server.listen(PORT, () => {
  console.log(`Server attivo su http://localhost:${PORT}`);
});