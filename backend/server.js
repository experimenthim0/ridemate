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

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow all or restrict to your frontend domain in production
    methods: ["GET", "POST"],
  },
});

// Track connected users
const connectedStudents = new Set();
let totalConnectedStudents = 0;

// Helper to broadcast stats
const broadcastStats = async () => {
  try {
    const Driver = require("./models/Driver");
    const Student = require("./models/Student");
    const totalDrivers = await Driver.countDocuments();
    const totalStudents = await Student.countDocuments();

    io.emit("stats_update", {
      totalUsers: totalDrivers + totalStudents,
      activeStudents: totalConnectedStudents,
    });
  } catch (error) {
    console.error("Error broadcasting stats", error);
  }
};

io.on("connection", (socket) => {
  // We can track total socket connections generically,
  // or listen for a specific event when a user "logs in"
  totalConnectedStudents++;
  broadcastStats();

  socket.on("disconnect", () => {
    totalConnectedStudents = Math.max(0, totalConnectedStudents - 1);
    broadcastStats();
  });
});

// Update the public-stats endpoint to return the live connected students
app.get("/api/public-stats", async (req, res) => {
  try {
    const Driver = require("./models/Driver");
    const Student = require("./models/Student");
    const totalDrivers = await Driver.countDocuments();
    const totalStudents = await Student.countDocuments();

    res.json({
      totalUsers: totalDrivers + totalStudents,
      activeStudents: totalConnectedStudents, // using real-time socket count
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats" });
  }
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

server.listen(PORT, () => {
  console.log(`RideMate server running on port ${PORT}`);
  cleanupOldRides(); // Run once on startup
});
