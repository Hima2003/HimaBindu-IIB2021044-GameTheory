const mongoose = require('mongoose');

const sportSchema = new mongoose.Schema({
  name: String,
  courts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Court'
  }]
});

module.exports = mongoose.model('Sport', sportSchema);
