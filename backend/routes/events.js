const express = require('express');
const { check, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const Event = require('../models/Event');

const router = express.Router();

// @route   GET /api/events
// @access  Public
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().populate('organizer', 'name email');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Event not found' });
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events
// @access  Private/Organizer
router.post('/', [
  protect,
  authorize('organizer'),
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('date', 'Valid date is required').isISO8601(),
    check('location', 'Location is required').not().isEmpty(),
    check('totalTickets', 'Total tickets must be a number').isNumeric()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { title, description, date, location, totalTickets } = req.body;

  try {
    const newEvent = new Event({
      title,
      description,
      date,
      location,
      totalTickets,
      availableTickets: totalTickets,
      organizer: req.user.id
    });

    const event = await newEvent.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/events/:id
// @access  Private/Organizer
router.put('/:id', [protect, authorize('organizer')], async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Make sure user owns event
    if (event.organizer.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/events/:id
// @access  Private/Organizer
router.delete('/:id', [protect, authorize('organizer')], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Make sure user owns event
    if (event.organizer.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await event.deleteOne();
    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
