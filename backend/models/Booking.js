const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ticketId: {
    type: String,
    required: true,
    unique: true,
  },
  qrCode: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['valid', 'scanned'],
    default: 'valid',
  },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
