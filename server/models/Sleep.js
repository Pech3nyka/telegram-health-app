const mongoose = require('mongoose');

const sleepSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hours: Number,
  quality: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sleep', sleepSchema);
