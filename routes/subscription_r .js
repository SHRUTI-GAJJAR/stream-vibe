
const express = require("express");
const router = express.Router();
const Subscription = require('./../models/subscription');
const User = require("./../models/user");
const bcrypt = require("bcryptjs");
const authMiddleware = require("./../middlewares/authMiddleware");
const WatchLog = require('./../models/watchlog');
  


// Subscribe using token
router.post("/subscribe", authMiddleware, async (req, res) => {
  const { planName, price, durationInMinutes } = req.body;

  try {
    await Subscription.deleteOne({ userId: req.userId });

    const sub = await Subscription.create({
      userId: req.userId,
      planName,
      price,
      durationInMinutes
    });

    res.json({ message: "Subscribed successfully", subscription: sub });
  } catch (err) {
    res.status(500).json({ error: "Subscription failed" });
  }
});

// Subscribe using email + password
router.post("/subscribe-by-credentials", async (req, res) => {
  const { email, password, planName, price, durationInMinutes } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid password" });

    await Subscription.deleteOne({ userId: user._id });

    const sub = await Subscription.create({
      userId: user._id,
      planName,
      price,
      durationInMinutes
    });

    res.json({ message: "Subscribed successfully", subscription: sub });
  } catch (err) {
    res.status(500).json({ error: "Subscription failed" });
  }
});

// ✅ GET current user’s subscription plan
router.get("/plan", authMiddleware, async (req, res) => {
  try {
    const plan = await Subscription.findOne({ userId: req.userId });
    if (!plan) return res.status(404).json({ error: "No active plan" });

    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch plan" });
  }
});

// ✅ GET /watch-time?email=...&password=...
router.get("/watch-time", async (req, res) => {
  const { email, password } = req.query;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const logs = await WatchLog.find({ userId: user._id });
    const totalMinutes = logs.reduce((sum, log) => sum + log.minutesWatched, 0);

    res.json({
      email: user.email,
      name: user.name,
      totalMinutesWatched: totalMinutes,
    });
  } catch (err) {
    console.error("Watch-time error:", err);
    res.status(500).json({ error: "Server error" });
  }
});



// ✅ UPDATE current plan
router.put("/plan", authMiddleware, async (req, res) => {
  const { planName, price, durationInMinutes } = req.body;
  try {
    const update = {};
    if (planName) update.planName = planName;
    if (price !== undefined) update.price = price;
    if (durationInMinutes !== undefined) update.durationInMinutes = durationInMinutes;

    const updated = await Subscription.findOneAndUpdate(
      { userId: req.userId },
      update,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Plan not found" });

    res.json({ message: "Plan updated", subscription: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update plan" });
  }
});

// ✅ DELETE current plan
router.delete("/plan", authMiddleware, async (req, res) => {
  try {
    const deleted = await Subscription.findOneAndDelete({ userId: req.userId });
    if (!deleted) return res.status(404).json({ error: "No plan to delete" });

    res.json({ message: "Plan deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete plan" });
  }
});

module.exports = router;



