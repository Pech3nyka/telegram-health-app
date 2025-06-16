const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  steps: Number,
  distanceKm: Number,
  calories: Number,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);
