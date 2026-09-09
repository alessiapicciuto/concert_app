const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  text: { type: String, required: true },
  time: { type: String, required: true }
}, { timestamps: true });

const ConcertSchema = new mongoose.Schema({
  title: { type: String },
  artist: { type: String },
  city: { type: String, required: true },
  venue: { type: String, required: true },
  date: { type: String, required: true },
  genre: { type: String },
  messages: [MessageSchema]
});

module.exports = mongoose.model('Concert', ConcertSchema);