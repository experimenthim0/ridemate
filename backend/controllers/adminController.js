const Driver = require("../models/Driver");
const Student = require("../models/Student");
const Ride = require("../models/Ride");
const Booking = require("../models/Booking");
const Complaint = require("../models/Complaint");
const DriverBlockedStudent = require("../models/DriverBlockedStudent");
const Suggestion = require("../models/Suggestion");
const SystemStat = require("../models/SystemStat");

// Add driver (admin only)
const addDriver = async (req, res) => {
  try {
    const { name, phone, auto_number, password, upi_id } = req.body;

    if (!name || !phone || !auto_number || !password) {
      return res.status(400).json({
        message: "Name, phone, auto number and password are required",
      });
    }

    const existingDriver = await Driver.findOne({
      auto_number: auto_number.toUpperCase(),
    });
    if (existingDriver) {
      return res
        .status(400)
        .json({ message: "Auto number already registered" });
    }

    const driver = await Driver.create({
      name,
      phone,
      auto_number: auto_number.toUpperCase(),
      password,
      upi_id: upi_id || "",
    });

    res.status(201).json({
      _id: driver._id,
      name: driver.name,
      phone: driver.phone,
      auto_number: driver.auto_number,
      upi_id: driver.upi_id,
      is_active: driver.is_active,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all drivers
const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().select("-password").sort("-createdAt");
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle driver active status
const toggleDriverStatus = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    driver.is_active = !driver.is_active;
    await driver.save();

    res.json({
      _id: driver._id,
      name: driver.name,
      auto_number: driver.auto_number,
      is_active: driver.is_active,
      message: `Driver ${driver.is_active ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update driver info (admin can change name, phone, auto_number, upi_id, password)
const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const { name, phone, auto_number, upi_id, password } = req.body;

    if (name) driver.name = name;
    if (phone) driver.phone = phone;
    if (auto_number) driver.auto_number = auto_number.toUpperCase();
    if (upi_id !== undefined) driver.upi_id = upi_id;
    if (password && password.length >= 6) {
      driver.password = password; // pre-save hook will hash it
    }

    await driver.save();

    res.json({
      message: "Driver updated successfully",
      driver: {
        _id: driver._id,
        name: driver.name,
        phone: driver.phone,
        auto_number: driver.auto_number,
        upi_id: driver.upi_id,
        is_active: driver.is_active,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all students
const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .select("-password")
      .sort("-createdAt");
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unblock student (remove global block)
const unblockStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.is_globally_blocked = false;
    student.no_show_count = 0;
    await student.save();

    res.json({
      message: "Student unblocked successfully",
      student: { _id: student._id, name: student.name },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all rides
const getAllRides = async (req, res) => {
  try {
    // Check for rides to auto-deactivate (e.g. 1 hour after departure time)
    const ridesToCheck = await Ride.find({ status: "active" });
    const now = new Date();

    let updatedCount = 0;
    for (const ride of ridesToCheck) {
      if (ride.departure_date && ride.departure_time) {
        // Parse the departure date and time
        // Note: Assuming departure_date is "YYYY-MM-DD" and time is "HH:MM"
        // Also assuming the server timezone matches the local time being entered
        const departureDateTimeString = `${ride.departure_date}T${ride.departure_time}`;
        const departureDateTime = new Date(departureDateTimeString);

        // If valid date and it's 1 hour past departure time
        if (!isNaN(departureDateTime.getTime())) {
          const oneHourAfter = new Date(
            departureDateTime.getTime() + 60 * 60 * 1000,
          );
          if (now > oneHourAfter) {
            ride.status = "completed";
            await ride.save();
            updatedCount++;
          }
        }
      }
    }

    const rides = await Ride.find()
      .populate("driver_id", "name auto_number phone")
      .populate("student_id", "name phone")
      .sort("-createdAt");
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all complaints
const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort("-createdAt");
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Resolve complaint
const resolveComplaint = async (req, res) => {
  try {
    const { admin_response } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = "resolved";
    complaint.admin_response = admin_response || "Resolved by admin";
    await complaint.save();

    res.json({ message: "Complaint resolved", complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Fake Ride Reports
const getFakeRideReports = async (req, res) => {
  try {
    // Find rides that have at least one report
    const ridesWithReports = await Ride.find({ "reports.0": { $exists: true } })
      .populate("student_id", "name phone email banCount rideCreationBanUntil")
      .populate("reports", "name phone email")
      .sort("-createdAt");

    res.json(ridesWithReports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Deactivate a ride (Admin)
const deactivateRideAdmin = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.status === "completed") {
      return res
        .status(400)
        .json({ message: "Ride is already deactivated/completed" });
    }

    ride.status = "completed";
    await ride.save();

    res.json({ message: "Ride deactivated successfully by Admin", ride });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete all cancelled bookings (Admin)
const deleteCancelledBookings = async (req, res) => {
  try {
    const result = await Booking.deleteMany({ status: "cancelled" });
    res.json({
      message: `Successfully deleted ${result.deletedCount} cancelled bookings.`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalDrivers = await Driver.countDocuments();
    const activeDrivers = await Driver.countDocuments({ is_active: true });
    const totalStudents = await Student.countDocuments();
    const blockedStudents = await Student.countDocuments({
      is_globally_blocked: true,
    });
    // Fetch totalRidesCreated from SystemStat, fallback to 0
    const stat = await SystemStat.findOne();
    const totalRides = stat ? stat.totalRidesCreated : 0;
    const activeRides = await Ride.countDocuments({ status: "active" });
    const totalBookings = await Booking.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({
      status: "pending",
    });

    res.json({
      totalDrivers,
      activeDrivers,
      totalStudents,
      blockedStudents,
      totalRides,
      activeRides,
      totalBookings,
      pendingComplaints,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get suggestions
const getSuggestions = async (req, res) => {
  try {
    const suggestions = await Suggestion.find().sort("-createdAt");
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addDriver,
  getDrivers,
  toggleDriverStatus,
  updateDriver,
  getStudents,
  unblockStudent,
  getAllRides,
  getComplaints,
  resolveComplaint,
  getDashboardStats,
  getFakeRideReports,
  deactivateRideAdmin,
  deleteCancelledBookings,
  getSuggestions,
};
