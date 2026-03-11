const express = require('express');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

const router = express.Router();

// @route   POST /api/bookings
// @desc    Book a ticket for an event
// @access  Private/Attendee
router.post('/', [protect, authorize('attendee')], async (req, res) => {
  try {
    const { eventId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.availableTickets <= 0) {
      return res.status(400).json({ message: 'Tickets are sold out' });
    }

    // Check if user already booked this event
    const existingBooking = await Booking.findOne({ event: eventId, user: req.user.id });
    if (existingBooking) {
      return res.status(400).json({ message: 'You have already booked a ticket for this event' });
    }

    // Generate unique ticket ID and QR code
    const ticketId = uuidv4();
    const qrData = JSON.stringify({ ticketId, eventId, userId: req.user.id });
    const qrCode = await QRCode.toDataURL(qrData);

    const booking = new Booking({
      event: eventId,
      user: req.user.id,
      ticketId,
      qrCode
    });

    await booking.save();

    event.availableTickets -= 1;
    await event.save();

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings/my-tickets
// @desc    Get logged in user's tickets
// @access  Private/Attendee
router.get('/my-tickets', [protect, authorize('attendee')], async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate('event');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/bookings/scan
// @desc    Validate a ticket via QR code data
// @access  Private/Organizer
router.post('/scan', [protect, authorize('organizer')], async (req, res) => {
  try {
    const { ticketId, eventId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Validate organizer owns this event
    if (event.organizer.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to scan tickets for this event' });
    }

    const booking = await Booking.findOne({ ticketId, event: eventId }).populate('user', 'name email');
    if (!booking) {
      return res.status(404).json({ message: 'Invalid ticket' });
    }

    if (booking.status === 'scanned') {
      return res.status(400).json({ message: 'Ticket has already been used!' });
    }

    booking.status = 'scanned';
    await booking.save();

    res.json({ message: 'Ticket validated successfully', attendee: booking.user, status: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
