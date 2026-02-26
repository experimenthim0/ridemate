const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    driver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      // Optional now because a student can also create a ride
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    type: {
      type: String,
      enum: ["driver", "student_sharing"],
      default: "driver",
    },
    reports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    from: {
      type: String,
      required: [true, "Pickup location is required"],
      trim: true,
    },
    to: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
    },
    total_seats: {
      type: Number,
      required: [true, "Total seats is required"],
      min: 1,
      max: 10,
    },
    filled_seats: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    departure_time: {
      type: String,
      default: "",
    },
    departure_date: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Ride", rideSchema);
