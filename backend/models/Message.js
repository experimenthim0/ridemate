const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  ride_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ride",
    required: true,
    index: true,
  },
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "sender_model",
  },
  sender_model: {
    type: String,
    required: true,
    enum: ["Student", "Driver"],
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500, // Limit message length
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "3h", // TTL index: documents expire 3 hours after creation
  },
});

module.exports = mongoose.model("Message", messageSchema);
