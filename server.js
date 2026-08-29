const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


const concertsPath = path.join(__dirname, 'data', 'concerts.json');
const tripsPath = path.join(__dirname, 'data', 'trips.json');
const usersPath = path.join(__dirname, 'data', 'users.json');

const readData = (filePath) => {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, 'utf8');
  return data ? JSON.parse(data) : [];
};

const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};


app.get('/api/concerts', (req, res) => {
  res.json(readData(concertsPath));
});

app.get('/api/concerts/:id', (req, res) => {
  const concerts = readData(concertsPath);
  const concert = concerts.find(c => String(c.id) === String(req.params.id));
  if (!concert) return res.status(404).json({ error: 'Concerto non trovato' });
  res.json(concert);
});


app.post('/api/register', (req, res) => {
  const users = readData(usersPath);
  const { name, email, password } = req.body;
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email già usata' });
  }

  const newUser = { id: Date.now().toString(), name, email, password };
  users.push(newUser);
  writeData(usersPath, users);
  res.json({ success: true, user: newUser });
});

app.post('/api/login', (req, res) => {
  const users = readData(usersPath);
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Credenziali errate' });
  }
  res.json({ success: true, user });
});


app.get('/api/trips', (req, res) => {
  res.json(readData(tripsPath));
});

app.post('/api/trips', (req, res) => {
  const trips = readData(tripsPath);
  const newTrip = { id: Date.now().toString(), ...req.body };
  trips.push(newTrip);
  writeData(tripsPath, trips);
  res.json({ success: true, trip: newTrip });
});


io.on('connection', (socket) => {
  socket.on('join_trip', (tripId) => {
    socket.join(tripId);
  });

  socket.on('send_message', (data) => {
    io.to(data.tripId).emit('receive_message', data);
  });
});

server.listen(PORT, () => {
  console.log(`Server attivo sulla porta ${PORT}`);
});
