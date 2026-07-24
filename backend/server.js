import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import ngoRoutes from "./routes/ngoRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

// Notification routes
import { protect } from "./middleware/auth.js";
import Notification from "./models/Notification.js";

// Admin seed
import User from "./models/User.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── Security & Logging ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ── File Uploads (Multer) ─────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, process.env.UPLOAD_FOLDER || "uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 16 * 1024 * 1024 } });

import fs from "fs";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image provided" });
  const base = req.protocol + "://" + req.get("host");
  res.json({ message: "File uploaded successfully", url: `${base}/api/uploads/${req.file.filename}` });
});
app.use("/api/uploads", express.static(uploadDir));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/restaurant", restaurantRoutes);
app.use("/api/ngo", ngoRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);

// ── Notifications ─────────────────────────────────────────────────────────────
app.get("/api/notifications", protect, async (req, res) => {
  const notifs = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(
    notifs.map((n) => ({
      id: n._id,
      user_id: n.userId,
      message: n.message,
      type: n.type,
      is_read: n.isRead,
      created_at: n.createdAt,
    }))
  );
});

app.post("/api/notifications/:id/read", protect, async (req, res) => {
  const notif = await Notification.findOne({ _id: req.params.id, userId: req.user._id });
  if (!notif) return res.status(404).json({ message: "Notification not found" });
  notif.isRead = true;
  await notif.save();
  res.json({ message: "Notification marked as read" });
});

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ status: "healthy" }));

// ── 404 & Error Handlers ──────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Seed default admin
  const adminEmail = process.env.ADMIN_EMAIL || "sharemeal@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "ShareMeal@123";
  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    await User.create({
      email: adminEmail,
      passwordHash: adminPassword, // pre-save hook hashes this
      role: "admin",
      name: "Administrator",
      phone: "0000000000",
      address: "System Admin",
      status: "verified",
    });
    console.log(`✅ Admin account seeded: ${adminEmail}`);
  }

  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();