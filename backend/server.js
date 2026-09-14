require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('./models/User');
const Trip = require('./models/Trip');
const Concert = require('./models/Concert');
const verifyToken = require('./middleware/auth'); 

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  /\.onrender\.com$/
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = allowedOrigins.some(pattern => {
      if (pattern instanceof RegExp) return pattern.test(origin);
      return pattern === origin;
    });
    if (allowed) {
      callback(null, true);
    } else {
      callback(new Error('Bloccato dalla policy CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/concert_app')
  .then(() => console.log('Connesso con successo a MongoDB'))
  .catch((err) => console.error('Errore di connessione a MongoDB:', err));

app.use(cors(corsOptions));
app.use(express.json());

// ================= AUTENTICAZIONE =================

app.post('/api/register', async (req, res) => {
  try {
    const { username, name, email, password } = req.body;
    const userVal = username || name;
    if (!userVal || !email || !password) {
      return res.status(400).json({ message: 'Tutti i campi sono obbligatori.' });
    }

    const usernameClean = String(userVal).trim().toLowerCase();
    const emailClean = String(email).trim().toLowerCase();

    // Controllo univocità Username
    const existingUsername = await User.findOne({ username: usernameClean });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username già in uso.' });
    }

    // Controllo univocità Email
    const existingEmail = await User.findOne({ email: emailClean });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email già registrata.' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      username: usernameClean,
      name: userVal,
      email: emailClean,
      password: hashedPassword
    });

    res.status(201).json({ 
      message: 'Registrazione completata con successo', 
      user: { id: newUser._id.toString(), username: newUser.username, name: newUser.name, email: newUser.email } 
    });
  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern && err.keyPattern.username) {
        return res.status(400).json({ message: 'Username già in uso.' });
      }
      if (err.keyPattern && err.keyPattern.email) {
        return res.status(400).json({ message: 'Email già registrata.' });
      }
    }
    res.status(500).json({ message: 'Errore interno del server.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const userEmail = email || username;
    if (!userEmail || !password) {
      return res.status(400).json({ message: 'Email e password sono obbligatorie.' });
    }

    const emailClean = String(userEmail).trim().toLowerCase();
    const user = await User.findOne({ email: emailClean });
    
    if (!user) {
      return res.status(401).json({ message: 'Credenziali non valide.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenziali non valide.' });
    }

    const accessToken = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '20m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      message: 'Accesso eseguito con successo', 
      accessToken, 
      refreshToken, 
      user: { id: user._id.toString(), username: user.username || user.name, name: user.name || user.username, email: user.email } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Errore interno del server.' });
  }
});

// ================= ROTTA PER IL REFRESH TOKEN =================
app.post('/api/refresh-token', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh Token mancante.' });
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Refresh Token non valido o scaduto.' });
    }

    const newAccessToken = jwt.sign(
      { userId: user.userId, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '20m' }
    );

    res.json({ accessToken: newAccessToken });
  });
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

app.post('/api/trips', verifyToken, async (req, res) => {
  try {
    const { 
      driverId, 
      driverName, 
      concertId,
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
      concertId: concertId || null,
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

app.put('/api/trips/:id', verifyToken, async (req, res) => {
  try {
    const tripId = req.params.id;
    const { 
      concertId,
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

    const updateData = { 
      concertName, 
      departureCity, 
      meetingPoint: puntoRitrovoFinale, 
      departureTime, 
      availableSeats, 
      pricePerSeat 
    };
    if (concertId) {
      updateData.concertId = concertId;
    }

    const updatedTrip = await Trip.findByIdAndUpdate(
      tripId,
      updateData,
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

app.delete('/api/trips/:id', verifyToken, async (req, res) => {
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

app.post('/api/trips/:id/book', verifyToken, async (req, res) => {
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

app.post('/api/trips/:id/cancel-booking', verifyToken, async (req, res) => {
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

// ================= GESTIONE CONCERTI (TICKETMASTER) E CHAT =================

app.get('/api/concerts', async (req, res) => {
  try {
    const apiKey = process.env.TICKETMASTER_API_KEY;
    if (apiKey) {
      try {
        const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&classificationName=Music&countryCode=IT&size=20`;
        const response = await fetch(url);
        const data = await response.json();

        if (data._embedded && data._embedded.events) {
          for (const event of data._embedded.events) {
            const venueInfo = event._embedded?.venues?.[0];
            const classification = event.classifications?.[0];

            const concertData = {
              title: event.name,
              city: venueInfo?.city?.name || 'Città non specificata',
              venue: venueInfo?.name || 'Luogo non specificato',
              date: event.dates?.start?.localDate || 'Data da definire',
              genre: classification?.genre?.name || 'Musica',
              imageUrl: event.images?.[0]?.url || ''
            };

            await Concert.findOneAndUpdate(
              { title: concertData.title, date: concertData.date },
              concertData,
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );
          }
        }
      } catch (tmErr) {
        console.error('Errore non bloccante Ticketmaster:', tmErr);
      }
    }

    const concerts = await Concert.find();
    const mappedConcerts = concerts.map((c) => {
      const obj = c.toObject();
      obj.id = obj._id.toString();
      return obj;
    });

    res.json(mappedConcerts);
  } catch (err) {
    console.error('Errore recupero concerti:', err);
    res.status(500).json({ message: 'Errore nel recupero dei concerti.' });
  }
});

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

app.post('/api/concerts/:id/messages', verifyToken, async (req, res) => {
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

    const now = new Date();
    const dataString = now.toLocaleDateString('it-IT', { timeZone: 'Europe/Rome' }); 
    const timeString = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' });

    const nuovoMessaggio = {
      userName,
      text,
      time: `${dataString} - ${timeString}` 
    };

    concert.messages.push(nuovoMessaggio);
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

app.delete('/api/concerts/:id/messages/:msgId', verifyToken, async (req, res) => {
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