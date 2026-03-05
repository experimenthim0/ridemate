const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Bug 1.12: Rate limiting
const rateLimit = require("express-rate-limit");

// General rate limit — 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limit for auth routes — 10 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message:
      "Too many login/register attempts, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(
  cors({
    origin: [
      "https://ridemate.nikhim.me",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", generalLimiter);

// Routes
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/driver", require("./routes/driverRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/complaints", require("./routes/complaintRoutes"));
app.use("/api/rides", require("./routes/rideRoutes"));
app.use("/api/ride-requests", require("./routes/rideRequestRoutes"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "RideMate API is running" });
});

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "https://ridemate.nikhim.me",
      "http://localhost:5173",
      "http://localhost:5174",
    ], // allow all or restrict to your frontend domain in production
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

// Make io accessible to controllers via req.app.get('io')
app.set("io", io);

io.on("connection", (socket) => {
  totalConnectedStudents++;
  broadcastStats();

  // Chat rooms: join a ride's chat room
  socket.on("joinRide", (rideId) => {
    socket.join(`ride:${rideId}`);
  });

  // Leave a ride's chat room
  socket.on("leaveRide", (rideId) => {
    socket.leave(`ride:${rideId}`);
  });

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
    const SystemStat = require("./models/SystemStat");

    const [totalDrivers, totalStudents, stat] = await Promise.all([
      Driver.countDocuments(),
      Student.countDocuments(),
      SystemStat.findOne(),
    ]);

    const totalRidesCreated = stat ? stat.totalRidesCreated : 0;

    res.json({
      totalUsers: totalDrivers + totalStudents,
      activeStudents: totalConnectedStudents, // using real-time socket count
      totalRidesCreated, // persistent stats counter
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats" });
  }
});

// Suggestions endpoint
app.post("/api/suggestions", async (req, res) => {
  try {
    const Suggestion = require("./models/Suggestion");
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Suggestion text is required" });
    }

    const suggestion = new Suggestion({ text });
    await suggestion.save();

    res.status(201).json({ message: "Suggestion submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving suggestion" });
  }
});

const PORT = process.env.PORT || 5000;

// Auto-delete completed rides older than 12 hours
const Ride = require("./models/Ride");
const Booking = require("./models/Booking");

const cleanupOldRides = async () => {
  try {
    // Activate scheduled rides whose date has arrived
    const now = new Date();
    const activatedScheduled = await Ride.updateMany(
      {
        status: "scheduled",
        is_scheduled: true,
        scheduled_date: { $lte: now },
      },
      { $set: { status: "active" } },
    );
    if (activatedScheduled.modifiedCount > 0) {
      console.log(
        `Activated ${activatedScheduled.modifiedCount} scheduled ride(s)`,
      );
    }

    // Auto-create rides from recurring ride templates
    try {
      const RecurringRide = require("./models/RecurringRide");
      const todayDay = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
      const templates = await RecurringRide.find({
        is_active: true,
        days: todayDay,
      });

      for (const tpl of templates) {
        // Check if a ride was already created today from this template
        const todayStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        const existingRide = await Ride.findOne({
          driver_id: tpl.driver_id,
          from: tpl.from_location,
          to: tpl.to_location,
          createdAt: { $gte: todayStart },
          type: "driver",
        });

        if (!existingRide) {
          await Ride.create({
            driver_id: tpl.driver_id,
            from: tpl.from_location,
            to: tpl.to_location,
            total_seats: tpl.total_seats,
            departure_time: tpl.departure_time,
            departure_date: now.toISOString().split("T")[0],
            type: "driver",
            status: "active",
          });
          console.log(
            `Auto-created ride from recurring template for driver ${tpl.driver_id}`,
          );
        }
      }
    } catch (recurringErr) {
      // Silently skip if RecurringRide model doesn't exist yet
      if (recurringErr.code !== "MODULE_NOT_FOUND") {
        console.error("Recurring ride error:", recurringErr.message);
      }
    }

    // 3-hour auto-deactivation of student sharing rides
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const deactivated = await Ride.updateMany(
      {
        type: "student_sharing",
        status: "active",
        createdAt: { $lt: threeHoursAgo },
      },
      { $set: { status: "completed" } },
    );
    if (deactivated.modifiedCount > 0) {
      console.log(
        `Auto-deactivated ${deactivated.modifiedCount} student ride(s) older than 3 hours`,
      );
    }

    // Regular driver rides - delete completed after 12 hours
    const driverCutoff = new Date(Date.now() - 12 * 60 * 60 * 1000);
    // Student sharing rides - delete completed after 7 days
    const studentCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const oldRides = await Ride.find({
      status: "completed",
      $or: [
        { type: { $ne: "student_sharing" }, updatedAt: { $lt: driverCutoff } },
        { type: "student_sharing", updatedAt: { $lt: studentCutoff } },
      ],
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
