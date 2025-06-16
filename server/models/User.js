const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  name: String
});

module.exports = mongoose.model('User', userSchema);
