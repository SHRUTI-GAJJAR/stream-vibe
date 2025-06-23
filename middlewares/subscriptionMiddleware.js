
const Subscription = require('./../models/subscription');

const subscriptionMiddleware = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.userId });

    if (!subscription) {
      return res.status(403).json({ error: "No subscription found. Please subscribe." });
    }

    const now = new Date();
    if (subscription.endDate < now) {
      return res.status(403).json({ error: "Subscription expired. Please subscribe." });
    }

    next();
  } catch (err) {
    console.error("Subscription check error:", err);
    res.status(500).json({ error: "Subscription check failed" });
  }
};

module.exports = subscriptionMiddleware;
