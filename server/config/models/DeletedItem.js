const mongoose = require('mongoose');

const DeletedItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  deletedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DeletedItem', DeletedItemSchema);
