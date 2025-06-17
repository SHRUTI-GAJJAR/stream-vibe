
const express = require("express");
const cors = require('cors');
const mongoose = require("mongoose");
const colors = require('colors');
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middlewares/authMiddleware");
require("dotenv").config();

const app = express();
app.use(express.json());

// CORS configuration
const allowedOrigins = [
    'http://localhost:5173',
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
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], 
  credentials: true // if you're using cookies/session
}));

  
// DB Connect
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected".green);
  } catch (err) {
    console.error("DB connection failed:".red, err);
  }
}

startServer();


// Routes
app.use("/api", authRoutes);

// Protected route (watching movies)
app.get("/watch", authMiddleware, (req, res) => {
  res.send("Enjoy watching movies! Your token is still valid.");
});

// Subscribe route (after token expires)
app.get("/subscribe", (req, res) => {
  res.send("Your time is up! Subscribe to continue watching.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`port is runnig on ${PORT}`.green);
});

