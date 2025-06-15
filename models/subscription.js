
const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  planName: String,
  durationInDays: Number,
  startDate: Date,
  endDate: Date,
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
