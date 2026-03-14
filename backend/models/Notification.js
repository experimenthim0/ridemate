const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["broadcast", "individual", "system"],
      default: "broadcast",
    },
    targetRole: {
      type: String,
      enum: ["all", "student", "driver"],
      default: "all",
    },
    // Optional: if type is 'individual'
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "recipientModel",
    },
    recipientModel: {
      type: String,
      enum: ["Student", "Driver"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // For broadcast/targetRole: track who has read it
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    // If it was sent by admin
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
