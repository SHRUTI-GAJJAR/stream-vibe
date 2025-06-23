
const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  planName: { type: String, required: true },
  price: { type: Number, required: true },
  durationInMinutes: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date }
});

subscriptionSchema.pre("save", function (next) {
  if (!this.endDate && this.durationInMinutes) {
    const ms = this.durationInMinutes * 60 * 1000;
    this.endDate = new Date(this.startDate.getTime() + ms);
  }
  next();
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
