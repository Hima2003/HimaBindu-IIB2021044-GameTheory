const mongoose = require('mongoose');

const centerSchema = new mongoose.Schema({
  name: String,
  location: String,
  sports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sport'
  }]
});

module.exports = mongoose.model('Center', centerSchema);
