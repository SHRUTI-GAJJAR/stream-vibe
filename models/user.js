const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { type: String, required: true },
  resetOTP: { type: String },   // OTP code
  resetOTPExpiry: { type: Date } // OTP expiry time
});

module.exports = mongoose.model("User", userSchema);
