const mongoose = require('mongoose');

const PassengerSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  bookedAt: { type: String, default: () => new Date().toISOString() }
});

const TripSchema = new mongoose.Schema({
  concertId: { type: String },
  concertName: { type: String, required: true },
  driverId: { type: String, required: true },
  driverName: { type: String, required: true },
  departureCity: { type: String, required: true },
  meetingPoint: { type: String, default: '' },
  departureTime: { type: String, required: true },
  availableSeats: { type: Number, required: true },
  pricePerSeat: { type: Number, required: true },
  passengers: [PassengerSchema]
}, { timestamps: true });

module.exports = mongoose.model('Trip', TripSchema);