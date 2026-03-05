const mongoose = require("mongoose");

const recurringRideSchema = new mongoose.Schema(
  {
    driver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    from_location: {
      type: String,
      required: [true, "Pickup location is required"],
      trim: true,
    },
    to_location: {
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
    departure_time: {
      type: String,
      required: [true, "Departure time is required"],
    },
    days: {
      type: [Number],
      required: true,
      validate: {
        validator: (v) => v.length > 0 && v.every((d) => d >= 0 && d <= 6),
        message: "Days must be an array of weekday numbers (0=Sun, 6=Sat)",
      },
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("RecurringRide", recurringRideSchema);
