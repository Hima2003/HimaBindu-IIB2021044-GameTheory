const mongoose = require('mongoose');

const courtSchema = new mongoose.Schema({
  name: String,
  center: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Center'
  },
  sport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sport'
  },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }]
});

module.exports = mongoose.model('Court', courtSchema);
