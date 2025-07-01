
const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  planName: String,
  price: Number,
  durationInMinutes: Number,
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
});

subscriptionSchema.pre("save", function (next) {
  this.endDate = new Date(this.startDate.getTime() + this.durationInMinutes * 60000);
  next();
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
