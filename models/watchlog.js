
const mongoose = require("mongoose");

const watchLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  movieId: String, // optional, if you track movie
  minutesWatched: Number,
  watchedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("WatchLog", watchLogSchema);
    