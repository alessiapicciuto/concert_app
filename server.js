const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rotta di test iniziale
app.get('/api/status', (req, res) => {
  res.json({ status: 'Server attivo e funzionante' });
});

// Setup Socket.IO per la chat
io.on('connection', (socket) => {
  socket.on('join_trip', (tripId) => {
    socket.join(tripId);
  });

  socket.on('send_message', (data) => {
    io.to(data.tripId).emit('receive_message', data);
  });
});

server.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});