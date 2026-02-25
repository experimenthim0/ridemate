const Ride = require("../models/Ride");
const Booking = require("../models/Booking");
const Student = require("../models/Student");
const Driver = require("../models/Driver");
const DriverBlockedStudent = require("../models/DriverBlockedStudent");
const { generateUPIQR } = require("../utils/qrGenerator");
const { findMatchingRides } = require("../utils/routes");

// Get active rides (with route-based midway search)
const getActiveRides = async (req, res) => {
  try {
    const { from, to } = req.query;

    const rides = await Ride.find({ status: "active" })
      .populate("driver_id", "name auto_number phone is_active")
      .sort("-createdAt");

    // Filter out rides from inactive drivers
    const activeRides = rides.filter(
      (ride) => ride.driver_id && ride.driver_id.is_active,
    );

    // Apply route-based midway filtering
    const filtered = findMatchingRides(activeRides, from, to);

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Book a seat
const bookSeat = async (req, res) => {
  try {
    const studentId = req.user._id;
    const rideId = req.params.rideId;

    // Check if student is globally blocked
    const student = await Student.findById(studentId);
    if (student.is_globally_blocked) {
      return res.status(403).json({
        message:
          "You are globally blocked due to multiple no-shows. Contact admin.",
      });
    }

    // Get the ride
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.status !== "active") {
      return res.status(400).json({ message: "This ride is no longer active" });
    }

    // Check if blocked by this driver
    const isBlocked = await DriverBlockedStudent.findOne({
      driver_id: ride.driver_id,
      student_id: studentId,
    });

    if (isBlocked) {
      return res.status(403).json({
        message:
          "You have been blocked by this driver and cannot book their rides.",
      });
    }

    // Check if student already has an active booking
    const activeBooking = await Booking.findOne({
      student_id: studentId,
      status: { $in: ["pending", "pending_confirmation"] },
    }).populate("ride_id");

    if (
      activeBooking &&
      activeBooking.ride_id &&
      activeBooking.ride_id.status === "active"
    ) {
      return res.status(400).json({
        message:
          "You already have an active booking. Cancel it first before booking a new ride.",
      });
    }

    // Check seat availability
    if (ride.filled_seats >= ride.total_seats) {
      return res
        .status(400)
        .json({ message: "No seats available on this ride" });
    }

    // Create booking
    const booking = await Booking.create({
      ride_id: rideId,
      student_id: studentId,
      status: "pending",
    });

    // Increment filled seats
    ride.filled_seats += 1;

    // Auto-complete ride when seats filled
    if (ride.filled_seats >= ride.total_seats) {
      // Don't auto-complete, just mark as full — driver can still manage
    }

    await ride.save();

    res.status(201).json({ message: "Seat booked successfully", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark as paid ("I Have Paid")
const markAsPaid = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.student_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Booking is not in pending state" });
    }

    booking.status = "pending_confirmation";
    await booking.save();

    res.json({
      message: "Payment marked. Waiting for driver confirmation.",
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.student_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!["pending", "pending_confirmation"].includes(booking.status)) {
      return res.status(400).json({ message: "Cannot cancel this booking" });
    }

    booking.status = "cancelled";
    await booking.save();

    // Decrement filled seats
    const ride = await Ride.findById(booking.ride_id);
    if (ride && ride.filled_seats > 0) {
      ride.filled_seats -= 1;
      await ride.save();
    }

    res.json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ student_id: req.user._id })
      .populate({
        path: "ride_id",
        populate: {
          path: "driver_id",
          select: "name auto_number phone upi_id",
        },
      })
      .sort("-booking_time");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get ride details with QR
const getRideDetails = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate(
      "driver_id",
      "name auto_number phone upi_id",
    );

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    let qrData = null;
    if (ride.driver_id && ride.driver_id.upi_id) {
      qrData = await generateUPIQR(
        ride.driver_id.upi_id,
        ride.driver_id.name,
        0,
      );
    }

    res.json({ ride, qr: qrData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getActiveRides,
  bookSeat,
  markAsPaid,
  cancelBooking,
  getMyBookings,
  getRideDetails,
};
