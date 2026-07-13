const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const donationRoutes = require("./routes/donationRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const ngoRoutes = require("./routes/ngoRoutes");
const adminRoutes = require("./routes/adminRoutes");
const path = require("path");

dotenv.config();

connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/ngo", ngoRoutes);
app.use("/api/admin", adminRoutes);
// Default Route
app.get("/", (req, res) => {
    res.send("🍽️ Welcome to ShareMeal MERN Backend!");
});

// Health Check Route
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "ShareMeal Backend is running successfully 🚀"
    });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});