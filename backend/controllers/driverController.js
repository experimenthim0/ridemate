const Ride = require("../models/Ride");
const Booking = require("../models/Booking");
const Student = require("../models/Student");
const Message = require("../models/Message");
const DriverBlockedStudent = require("../models/DriverBlockedStudent");
const SystemStat = require("../models/SystemStat");
const { generateUPIQR } = require("../utils/qrGenerator");

// Create ride
const createRide = async (req, res) => {
  try {
    const { from, to, total_seats, departure_time, departure_date } = req.body;

    if (!from || !to || !total_seats) {
      return res
        .status(400)
        .json({ message: "From, to, and total seats are required" });
    }

    if (from === to) {
      return res
        .status(400)
        .json({ message: "From and To locations cannot be the same" });
    }

    // Check if driver already has an active ride
    const activeRide = await Ride.findOne({
      driver_id: req.user._id,
      status: "active",
    });
    if (activeRide) {
      return res.status(400).json({
        message:
          "You already have an active ride. End it before creating a new one.",
      });
    }

    const ride = await Ride.create({
      driver_id: req.user._id,
      from,
      to,
      total_seats,
      departure_time: departure_time || "",
      departure_date: departure_date || "",
    });

    // Increment global system stat
    await SystemStat.findOneAndUpdate(
      {},
      { $inc: { totalRidesCreated: 1 } },
      { upsert: true, new: true },
    );

    res.status(201).json(ride);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fill seat manually (for offline passengers)
const fillSeat = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.driver_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (ride.status !== "active") {
      return res.status(400).json({ message: "Ride is not active" });
    }

    if (ride.filled_seats >= ride.total_seats) {
      return res.status(400).json({ message: "All seats are already filled" });
    }

    ride.filled_seats += 1;
    await ride.save();

    res.json({
      message: `Seat filled. ${ride.filled_seats}/${ride.total_seats} seats now occupied.`,
      ride,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unfill seat (remove offline passenger)
const unfillSeat = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.driver_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (ride.filled_seats <= 0) {
      return res.status(400).json({ message: "No seats to unfill" });
    }

    // Count booked seats (those from actual bookings)
    const bookedCount = await Booking.countDocuments({
      ride_id: ride._id,
      status: { $in: ["pending", "pending_confirmation", "confirmed"] },
    });

    if (ride.filled_seats <= bookedCount) {
      return res
        .status(400)
        .json({ message: "Cannot unfill below booked seat count" });
    }

    ride.filled_seats -= 1;
    await ride.save();

    res.json({
      message: `Seat removed. ${ride.filled_seats}/${ride.total_seats} seats now occupied.`,
      ride,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// End ride
const endRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.driver_id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to end this ride" });
    }

    if (ride.status === "completed") {
      return res.status(400).json({ message: "Ride is already completed" });
    }

    ride.status = "completed";
    await ride.save();

    // Cancel all pending bookings for this ride
    await Booking.updateMany(
      {
        ride_id: ride._id,
        status: { $in: ["pending", "pending_confirmation"] },
      },
      { status: "cancelled" },
    );

    res.json({ message: "Ride ended successfully", ride });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update ride time
const updateRideTime = async (req, res) => {
  try {
    const { departure_time } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.driver_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (ride.status !== "active") {
      return res.status(400).json({ message: "Cannot edit an inactive ride" });
    }

    ride.departure_time = departure_time || "";
    await ride.save();

    res.json({ message: "Ride time updated successfully", ride });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get driver's rides
const getMyRides = async (req, res) => {
  try {
    const rides = await Ride.find({ driver_id: req.user._id }).sort(
      "-createdAt",
    );
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get bookings for a ride
const getRideBookings = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.driver_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const bookings = await Booking.find({ ride_id: ride._id })
      .populate("student_id", "name phone no_show_count")
      .sort("-booking_time");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Confirm booking payment
const confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("ride_id");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.ride_id.driver_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.status !== "pending_confirmation") {
      return res
        .status(400)
        .json({ message: "Booking is not in pending confirmation state" });
    }

    booking.status = "confirmed";
    await booking.save();

    res.json({ message: "Booking confirmed", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark no show
const markNoShow = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("ride_id");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.ride_id.driver_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.status = "no_show";
    await booking.save();

    // Increment no_show_count and check for auto-block
    const student = await Student.findById(booking.student_id);
    student.no_show_count += 1;

    if (student.no_show_count >= 3) {
      student.is_globally_blocked = true;
    }

    await student.save();

    // Decrement filled seats
    const ride = await Ride.findById(booking.ride_id._id);
    if (ride.filled_seats > 0) {
      ride.filled_seats -= 1;
      await ride.save();
    }

    res.json({
      message: `Student marked as no-show. No-show count: ${student.no_show_count}${student.is_globally_blocked ? " — Student has been globally blocked." : ""}`,
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Block student
const blockStudent = async (req, res) => {
  try {
    const { reason } = req.body;
    const studentId = req.params.studentId;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const existing = await DriverBlockedStudent.findOne({
      driver_id: req.user._id,
      student_id: studentId,
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Student is already blocked by you" });
    }

    await DriverBlockedStudent.create({
      driver_id: req.user._id,
      student_id: studentId,
      reason: reason || "",
    });

    res.json({ message: "Student blocked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unblock student
const unblockStudent = async (req, res) => {
  try {
    const result = await DriverBlockedStudent.findOneAndDelete({
      driver_id: req.user._id,
      student_id: req.params.studentId,
    });

    if (!result) {
      return res.status(404).json({ message: "Block record not found" });
    }

    res.json({ message: "Student unblocked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get blocked students
const getBlockedStudents = async (req, res) => {
  try {
    const blocked = await DriverBlockedStudent.find({ driver_id: req.user._id })
      .populate("student_id", "name phone")
      .sort("-blocked_at");

    res.json(blocked);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get driver profile with QR
const getProfile = async (req, res) => {
  try {
    const driver = req.user;
    let qrData = null;

    if (driver.upi_id) {
      qrData = await generateUPIQR(driver.upi_id, driver.name, 0);
    }

    res.json({
      _id: driver._id,
      name: driver.name,
      phone: driver.phone,
      auto_number: driver.auto_number,
      upi_id: driver.upi_id,
      is_active: driver.is_active,
      qr: qrData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update driver profile (UPI ID)
const updateProfile = async (req, res) => {
  try {
    const { upi_id } = req.body;
    const driver = await require("../models/Driver").findById(req.user._id);

    if (upi_id !== undefined) {
      driver.upi_id = upi_id;
    }

    await driver.save();

    res.json({ message: "Profile updated", upi_id: driver.upi_id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get messages for a ride (Driver)
const getRideMessages = async (req, res) => {
  try {
    const { rideId } = req.params;
    const driverId = req.user._id;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    // Validate if the current driver is the creator
    if (ride.driver_id?.toString() !== driverId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized for this ride's messages" });
    }

    const messages = await Message.find({ ride_id: rideId })
      .populate("sender_id", "name")
      .sort("createdAt");

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Post a message to a ride (Driver)
const postRideMessage = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { text } = req.body;
    const driverId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    if (ride.driver_id?.toString() !== driverId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to send messages here" });
    }

    const message = await Message.create({
      ride_id: rideId,
      sender_id: driverId,
      sender_model: "Driver",
      text: text.trim(),
    });

    await message.populate("sender_id", "name");

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRide,
  fillSeat,
  unfillSeat,
  endRide,
  getMyRides,
  getRideBookings,
  confirmBooking,
  markNoShow,
  blockStudent,
  unblockStudent,
  getBlockedStudents,
  getProfile,
  updateProfile,
  updateRideTime,
  getRideMessages,
  postRideMessage,
};
