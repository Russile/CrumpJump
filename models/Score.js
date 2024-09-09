const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  playerName: String,
  score: Number,
  mode: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Score', ScoreSchema);