const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static('public'));

const getConcerts = () => JSON.parse(fs.readFileSync('./data/concerts.json', 'utf-8'));

// API Rotte Concerti
app.get('/api/concerts', (req, res) => {
  res.json(getConcerts());
});

app.get('/api/concerts/:id', (req, res) => {
  const concerts = getConcerts();
  const concert = concerts.find(c => c.id === req.params.id);
  if (!concert) return res.status(404).json({ error: 'Concerto non trovato' });
  res.json(concert);
});

// Real-Time Socket.IO
io.on('connection', (socket) => {
  socket.on('join_trip', (tripId) => {
    socket.join(tripId);
  });

  socket.on('send_message', (data) => {
    io.to(data.tripId).emit('receive_message', data);
  });
});

server.listen(3000, () => console.log('Server attivo sulla porta 3000'));