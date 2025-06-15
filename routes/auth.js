
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const User = require('./../models/user');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ name, email, password: hashed });
    res.status(201).json({ message: "User registered", userId: user._id });
  } catch (err) {
    res.status(400).json({ error: "Email already exists" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: "Invalid password" });

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "600m" }); // 600 minutes = 10 hours

  res.json({ message: "Login successful", token });
});

module.exports = router;
