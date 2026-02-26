const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/driver", require("./routes/driverRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/complaints", require("./routes/complaintRoutes"));
app.use("/api/rides", require("./routes/rideRoutes"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "RideMate API is running" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

// Auto-delete completed rides older than 12 hours
const Ride = require("./models/Ride");
const Booking = require("./models/Booking");

const cleanupOldRides = async () => {
  try {
    const cutoff = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const oldRides = await Ride.find({
      status: "completed",
      updatedAt: { $lt: cutoff },
    });
    for (const ride of oldRides) {
      await Booking.deleteMany({ ride_id: ride._id });
      await Ride.findByIdAndDelete(ride._id);
    }
    if (oldRides.length > 0) {
      console.log(`Cleaned up ${oldRides.length} old ride(s)`);
    }
  } catch (err) {
    console.error("Cleanup error:", err.message);
  }
};

// Run cleanup every hour
setInterval(cleanupOldRides, 60 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`RideMate server running on port ${PORT}`);
  cleanupOldRides(); // Run once on startup
});
