require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

const User = require('./models/User');
const Trip = require('./models/Trip');
const Concert = require('./models/Concert');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/concert_app')
  .then(() => console.log('Connesso con successo a MongoDB'))
  .catch((err) => console.error('Errore di connessione a MongoDB:', err));

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// ================= AUTENTICAZIONE =================

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Tutti i campi sono obbligatori.' });
    }

    const emailClean = String(email).toLowerCase();
    const existingUser = await User.findOne({ email: emailClean });
    if (existingUser) {
      return res.status(400).json({ message: 'Email già registrata.' });
    }

    const newUser = await User.create({
      name,
      email: emailClean,
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

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e password sono obbligatorie.' });
    }

    const emailClean = String(email).toLowerCase();
    const user = await User.findOne({ email: emailClean, password });
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

// ================= GESTIONE VIAGGI =================

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

app.post('/api/trips', async (req, res) => {
  try {
    const { 
      driverId, 
      driverName, 
      concertName, 
      departureCity, 
      meetingPoint, 
      luogoRitrovo, 
      ritrovo, 
      departureTime, 
      availableSeats, 
      pricePerSeat 
    } = req.body;

    if (!driverId || !concertName || !departureCity || !departureTime || availableSeats === undefined || pricePerSeat === undefined) {
      return res.status(400).json({ message: 'Compila tutti i campi obbligatori del viaggio.' });
    }

    const puntoRitrovoFinale = meetingPoint || luogoRitrovo || ritrovo || '';

    const newTrip = await Trip.create({
      driverId,
      driverName,
      concertName,
      departureCity,
      meetingPoint: puntoRitrovoFinale,
      departureTime,
      availableSeats,
      pricePerSeat,
      passengers: []
    });

    const obj = newTrip.toObject();
    obj.id = obj._id.toString();
    res.status(201).json({ success: true, trip: obj });
  } catch (err) {
    res.status(500).json({ message: 'Errore durante la creazione del viaggio.' });
  }
});

app.put('/api/trips/:id', async (req, res) => {
  try {
    const tripId = req.params.id;
    const { 
      concertName, 
      departureCity, 
      meetingPoint, 
      luogoRitrovo, 
      ritrovo, 
      departureTime, 
      availableSeats, 
      pricePerSeat 
    } = req.body;

    const puntoRitrovoFinale = meetingPoint || luogoRitrovo || ritrovo || '';

    const updatedTrip = await Trip.findByIdAndUpdate(
      tripId,
      { 
        concertName, 
        departureCity, 
        meetingPoint: puntoRitrovoFinale, 
        departureTime, 
        availableSeats, 
        pricePerSeat 
      },
      { new: true }
    );

    if (!updatedTrip) {
      return res.status(404).json({ message: 'Viaggio non trovato.' });
    }

    const obj = updatedTrip.toObject();
    obj.id = obj._id.toString();
    res.json({ success: true, trip: obj });
  } catch (err) {
    res.status(500).json({ message: 'Errore durante l\'aggiornamento del viaggio.' });
  }
});

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

app.post('/api/trips/:id/book', async (req, res) => {
  try {
    const tripId = req.params.id;
    const { userId, userName } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Viaggio non trovato.' });
    }

    if (String(trip.driverId) === String(userId)) {
      return res.status(400).json({ message: 'Non puoi prenotare il tuo stesso passaggio.' });
    }

    const giaPrenotato = trip.passengers.some((p) => String(p.userId) === String(userId));
    if (giaPrenotato) {
      return res.status(400).json({ message: 'Hai già prenotato questo passaggio.' });
    }

    if (trip.availableSeats <= 0) {
      return res.status(400).json({ message: 'Posti esauriti.' });
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

app.post('/api/trips/:id/cancel-booking', async (req, res) => {
  try {
    const tripId = req.params.id;
    const { userId } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip || !trip.passengers) {
      return res.status(404).json({ message: 'Prenotazione non trovata.' });
    }

    const index = trip.passengers.findIndex((p) => String(p.userId) === String(userId));
    if (index === -1) {
      return res.status(400).json({ message: 'Non risulti tra i passeggeri.' });
    }

    trip.passengers.splice(index, 1);
    trip.availableSeats += 1;
    await trip.save();

    res.json({ message: 'Prenotazione annullata.' });
  } catch (err) {
    res.status(500).json({ message: 'Errore durante l\'annullamento.' });
  }
});

// ================= GESTIONE CONCERTI E CHAT =================

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

// Rotta fondamentale per caricare i dettagli del singolo concerto
app.get('/api/concerts/:id', async (req, res) => {
  try {
    const concert = await Concert.findById(req.params.id);
    if (!concert) {
      return res.status(404).json({ message: 'Concerto non trovato.' });
    }
    const obj = concert.toObject();
    obj.id = obj._id.toString();
    if (obj.messages) {
      obj.messages = obj.messages.map((m) => {
        const mObj = m.toObject ? m.toObject() : m;
        mObj.id = mObj._id ? mObj._id.toString() : mObj.id;
        return mObj;
      });
    }
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: 'Errore nel recupero del concerto.' });
  }
});

app.post('/api/concerts/:id/messages', async (req, res) => {
  try {
    const concertId = req.params.id;
    const { userName, text } = req.body;

    const concert = await Concert.findById(concertId);
    if (!concert) {
      return res.status(404).json({ message: 'Concerto non trovato.' });
    }

    if (!concert.messages) {
      concert.messages = [];
    }

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    concert.messages.push({
      userName,
      text,
      time: timeString
    });

    await concert.save();

    const messagesFormatted = concert.messages.map((m) => {
      const mObj = m.toObject ? m.toObject() : m;
      return {
        id: mObj._id ? mObj._id.toString() : mObj.id,
        userName: mObj.userName,
        text: mObj.text,
        time: mObj.time
      };
    });

    res.json({ success: true, messages: messagesFormatted });
  } catch (err) {
    res.status(500).json({ message: 'Errore nell\'invio del messaggio.' });
  }
});

app.delete('/api/concerts/:id/messages/:msgId', async (req, res) => {
  try {
    const { id: concertId, msgId } = req.params;

    const concert = await Concert.findById(concertId);
    if (!concert) {
      return res.status(404).json({ message: 'Concerto non trovato.' });
    }

    concert.messages = concert.messages.filter((m) => {
      const currentId = m._id ? m._id.toString() : m.id;
      return currentId !== msgId;
    });

    await concert.save();
    res.json({ success: true, message: 'Messaggio eliminato.' });
  } catch (err) {
    res.status(500).json({ message: 'Errore durante l\'eliminazione.' });
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