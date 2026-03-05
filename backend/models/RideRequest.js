const mongoose = require("mongoose");

const rideRequestSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
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
    requested_date: {
      type: String,
      required: [true, "Date is required"],
    },
    requested_time: {
      type: String,
      required: [true, "Time is required"],
    },
    seats_needed: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    status: {
      type: String,
      enum: ["open", "fulfilled", "expired"],
      default: "open",
    },
    responses: [
      {
        responder_id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "responses.responder_model",
        },
        responder_model: {
          type: String,
          enum: ["Student", "Driver"],
          required: true,
        },
        message: {
          type: String,
          trim: true,
          maxlength: 200,
        },
        ride_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ride",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

// Auto-expire after 24 hours
rideRequestSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model("RideRequest", rideRequestSchema);
