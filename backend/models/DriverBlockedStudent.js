const mongoose = require("mongoose");

const driverBlockedStudentSchema = new mongoose.Schema({
  driver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  reason: {
    type: String,
    default: "",
    trim: true,
  },
  blocked_at: {
    type: Date,
    default: Date.now,
  },
});

driverBlockedStudentSchema.index(
  { driver_id: 1, student_id: 1 },
  { unique: true },
);

module.exports = mongoose.model(
  "DriverBlockedStudent",
  driverBlockedStudentSchema,
);
