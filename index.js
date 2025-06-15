
const express = require("express");
const mongoose = require("mongoose");
const colors = require('colors');
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middlewares/authMiddleware");
require("dotenv").config();

const app = express();
app.use(express.json());

// DB Connect
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected".green);
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`.green);
    });
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
    console.log(`${PORT}`.bgBlue);
});

