const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  driverId: { type: String, required: true },
  driverName: { type: String, required: true },
  concertName: { type: String, required: true },
  departureCity: { type: String, required: true },
  meetingPoint: { type: String, default: '' }, // Campo punto di ritrovo
  departureTime: { type: String, required: true },
  availableSeats: { type: Number, required: true },
  pricePerSeat: { type: Number, required: true },
  passengers: [
    {
      userId: String,
      userName: String,
      bookedAt: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);