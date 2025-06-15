
const express = require("express");
const Subscription = require("./../models/Subscription");
const auth = require("./../middlewares/authMiddleware");
const router = express.Router();

// Example Plans
const plans = [
  { name: "Basic", durationInDays: 7 },
  { name: "Premium", durationInDays: 30 },
  { name: "Ultimate", durationInDays: 90 },
];

// GET: All available plans
router.get("/plans", (req, res) => {
  res.json(plans);
});

// POST: Subscribe to a plan
router.post("/subscribe", auth, async (req, res) => {
  const { planName } = req.body;
  const plan = plans.find((p) => p.name === planName);
  if (!plan) return res.status(400).json({ error: "Invalid plan" });

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + plan.durationInDays);

  const newSub = new Subscription({
    userId: req.user.userId,
    planName: plan.name,
    durationInDays: plan.durationInDays,
    startDate,
    endDate,
  });

  await newSub.save();
  res.json({ message: `Subscribed to ${plan.name} plan until ${endDate.toDateString()}` });
});

// GET: Check if user has active subscription
router.get("/check", auth, async (req, res) => {
  const sub = await Subscription.findOne({ userId: req.user.userId }).sort({ endDate: -1 });

  if (!sub || new Date(sub.endDate) < new Date()) {
    return res.json({ subscribed: false, message: "No active subscription." });
  }

  res.json({ subscribed: true, plan: sub.planName, validUntil: sub.endDate });
});

module.exports = router;
