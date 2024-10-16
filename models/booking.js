const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerName: String,
  timeSlot: String,
  date: Date,
  court: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Court'
  },
  status: {
    type: String,
    enum: ['booked', 'blocked', 'coaching', 'pending', 'completed'],
    default: 'booked'
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
