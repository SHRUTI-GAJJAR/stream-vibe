
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require('./routes/auth');
const subscriptionRoutes = require('./routes/subscription_r ');
const authMiddleware = require('./middlewares/authMiddleware');
const subscriptionMiddleware = require('./middlewares/subscriptionMiddleware');

const app = express();
app.use(express.json());

// CORS setup
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB error:", err);
  }
}
connectDB();

// Routes
app.use("/api", authRoutes);
app.use("/api", subscriptionRoutes);

// Watch movie route
app.get("/watch", authMiddleware, subscriptionMiddleware, (req, res) => {
  res.send("🎬 You can watch movies now.");
});

// Subscription required
app.get("/subscribe", (req, res) => {
  res.send("⛔ Trial expired. Please subscribe to continue.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
