
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const authMiddleware = require('./../middlewares/authMiddleware');
const User = require('./../models/user');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Dummy predefined plans (normally you store this in DB or admin config)
const availablePlans = [
  {
    planName: "trial",
    price: 0,
    durationInMinutes: 600,
    description: "One-time free trial for 600 minutes"
  },
  {
    planName: "basic",
    price: 99,
    durationInMinutes: 1440,
    description: "Basic plan for 1 day access"
  },  
  {
    planName: "premium",
    price: 299,
    durationInMinutes: 10080,
    description: "Premium access for 7 days"
  },
  {
    planName: "vip",
    price: 999,
    durationInMinutes: 43200,
    description: "Full access for 30 days"
  }
];

// ✅ GET /plans — Return available plans
router.get("/plans", (req, res) => {
  res.json(availablePlans);
});

  
// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed
    });

    // Assign trial plan
    await Subscription.create({
      userId: user._id,
      planName: "trial",
      price: 0,     
      durationInMinutes: 600
    });

    return res.status(201).json({ message: "User registered with trial", userId: user._id });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: "Invalid password" });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "600m" });
  res.json({ token });
});

// GET USER
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
  } catch {
    res.status(500).json({ error: "Failed to get user" });
  }
});


// UPDATE USER
router.put("/update", authMiddleware, async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email.toLowerCase();
    if (password) updates.password = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
    }).select("-password");

    res.json({ message: "User updated", user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });   
  }
});

// DELETE USER
router.delete("/delete", authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.userId);
    res.json({ message: "User deleted successfully" });
  } catch (err) { 
    res.status(500).json({ error: "Delete failed" });
  }
});


module.exports = router;
  