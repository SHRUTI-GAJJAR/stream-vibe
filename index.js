
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

// // CORS setup
const allowedOrigins = [
  'http://localhost:5173',
  'https://stream-vibe-app.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); 
    if (allowedOrigins.includes(origin)) {
      return callback(null, true); 
    } else {
      return callback(new Error('Not allowed by CORS')); 
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
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
