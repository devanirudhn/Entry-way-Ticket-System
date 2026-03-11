const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  totalTickets: {
    type: Number,
    required: true,
  },
  availableTickets: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
