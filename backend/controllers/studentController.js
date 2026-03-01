const Ride = require("../models/Ride");
const Booking = require("../models/Booking");
const Message = require("../models/Message");
const Student = require("../models/Student");
const Driver = require("../models/Driver");
const DriverBlockedStudent = require("../models/DriverBlockedStudent");
const SystemStat = require("../models/SystemStat");
const { generateUPIQR } = require("../utils/qrGenerator");
const { findMatchingRides } = require("../utils/routes");

// Get active rides (with route-based midway search)
const getActiveRides = async (req, res) => {
  try {
    const { from, to } = req.query;

    const query = { status: "active" };
    // Auto-deactivate rides older than 3 hours
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    await Ride.updateMany(
      {
        type: "student_sharing",
        status: "active",
        createdAt: { $lt: threeHoursAgo },
      },
      { $set: { status: "completed" } },
    );

    const rides = await Ride.find(query)
      .populate("driver_id", "name auto_number phone is_active")
      .populate("student_id", "name phone")
      .sort("-createdAt");

    // Filter out rides from inactive drivers (but allow student rides)
    const activeRides = rides.filter(
      (ride) =>
        ride.type === "student_sharing" ||
        (ride.driver_id && ride.driver_id.is_active),
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
    const ride = await Ride.findById(req.params.id)
      .populate("driver_id", "name auto_number phone upi_id")
      .populate("student_id", "name phone email");

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

    // Check if the current user has booked this ride to allow chat access
    const hasBooking = req.user
      ? await Booking.findOne({
          ride_id: ride._id,
          student_id: req.user._id,
          status: { $in: ["pending", "pending_confirmation", "confirmed"] },
        })
      : false;

    res.json({ ride, qr: qrData, hasBooking: !!hasBooking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a ride share (Student)
const createRideShare = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);

    // Check ban status
    if (student.banCount >= 3) {
      return res
        .status(403)
        .json({ message: "You are permanently banned from creating rides." });
    }
    if (
      student.rideCreationBanUntil &&
      new Date() < student.rideCreationBanUntil
    ) {
      return res.status(403).json({
        message:
          "You are temporarily banned from creating rides until " +
          student.rideCreationBanUntil.toLocaleDateString(),
      });
    }

    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastRideDate = student.lastRideCreatedAt
      ? new Date(student.lastRideCreatedAt)
      : null;
    if (lastRideDate) lastRideDate.setHours(0, 0, 0, 0);

    if (lastRideDate && lastRideDate.getTime() === today.getTime()) {
      if (student.createdRidesCount >= 2) {
        return res
          .status(400)
          .json({ message: "You can only create 2 rides per day." });
      }
      student.createdRidesCount += 1;
    } else {
      student.createdRidesCount = 1;
    }
    student.lastRideCreatedAt = new Date();
    await student.save();

    const { from, to, total_seats, departure_time, departure_date } = req.body;

    if (!from || !to || !total_seats) {
      return res
        .status(400)
        .json({ message: "From, to, and total seats are required" });
    }

    const ride = await Ride.create({
      student_id: student._id,
      type: "student_sharing",
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

    res.status(201).json({ message: "Ride share created successfully", ride });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Report a fake student ride
const reportFakeRide = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;

    const ride = await Ride.findById(id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (ride.type !== "student_sharing")
      return res
        .status(400)
        .json({ message: "Only student shared rides can be reported" });

    // Prevent duplicate reports
    if (ride.reports.includes(studentId)) {
      return res
        .status(400)
        .json({ message: "You have already reported this ride" });
    }

    ride.reports.push(studentId);

    // If reports reach 3
    if (ride.reports.length >= 3) {
      ride.status = "completed"; // Mark inactive or hide

      const creator = await Student.findById(ride.student_id);
      if (creator) {
        creator.banCount += 1;
        if (creator.banCount < 3) {
          // 7 days ban
          const banDate = new Date();
          banDate.setDate(banDate.getDate() + 7);
          creator.rideCreationBanUntil = banDate;
        }
        await creator.save();
      }
    }

    await ride.save();
    res.json({ message: "Ride reported. Thank you for your feedback!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get created rides (Student)
const getCreatedRides = async (req, res) => {
  try {
    const rides = await Ride.find({
      student_id: req.user._id,
      type: "student_sharing",
    })
      .sort("-createdAt")
      .limit(7); // Last 7 rides
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update created ride (Student)
const updateCreatedRide = async (req, res) => {
  try {
    const { departure_time, departure_date } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.student_id?.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this ride" });
    }

    if (ride.status !== "active") {
      return res.status(400).json({ message: "Cannot edit an inactive ride" });
    }

    if (departure_time !== undefined) ride.departure_time = departure_time;
    if (departure_date !== undefined) ride.departure_date = departure_date;

    await ride.save();

    res.json({ message: "Ride updated successfully", ride });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Deactivate created ride (Student)
const deactivateRideShare = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.student_id?.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to deactivate this ride" });
    }

    if (ride.status !== "active") {
      return res.status(400).json({ message: "Ride is already inactive" });
    }

    ride.status = "completed"; // Deactivated
    await ride.save();

    res.json({ message: "Ride deactivated successfully", ride });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get messages for a ride (only if booked or creator)
const getRideMessages = async (req, res) => {
  try {
    const { rideId } = req.params;
    const studentId = req.user._id;

    // Check if ride exists
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    // Verify access: must be creator or have an active/pending booking
    const isCreator = ride.student_id?.toString() === studentId.toString();
    const hasBooking = await Booking.findOne({
      ride_id: rideId,
      student_id: studentId,
      status: { $in: ["pending", "pending_confirmation", "confirmed"] },
    });

    if (!isCreator && !hasBooking) {
      return res
        .status(403)
        .json({ message: "You must book this ride to view messages" });
    }

    const messages = await Message.find({ ride_id: rideId })
      .populate("sender_id", "name")
      .sort("createdAt");

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Post a message to a ride (only text and emojis)
const postRideMessage = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { text } = req.body;
    const studentId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    // Check if ride exists
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    // Verify access
    const isCreator = ride.student_id?.toString() === studentId.toString();
    const hasBooking = await Booking.findOne({
      ride_id: rideId,
      student_id: studentId,
      status: { $in: ["pending", "pending_confirmation", "confirmed"] },
    });

    if (!isCreator && !hasBooking) {
      return res
        .status(403)
        .json({ message: "You must book this ride to send messages" });
    }

    const message = await Message.create({
      ride_id: rideId,
      sender_id: studentId,
      sender_model: "Student",
      text: text.trim(),
    });

    // Populate sender details for the response
    await message.populate("sender_id", "name");

    res.status(201).json(message);
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
  createRideShare,
  reportFakeRide,
  getRideMessages,
  postRideMessage,
  getCreatedRides,
  updateCreatedRide,
  deactivateRideShare,
};
