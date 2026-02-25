const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    ride_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "pending_confirmation",
        "confirmed",
        "cancelled",
        "no_show",
      ],
      default: "pending",
    },
    booking_time: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Booking", bookingSchema);
