const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    no_show_count: {
      type: Number,
      default: 0,
    },
    is_globally_blocked: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: "student",
      immutable: true,
    },
    createdRidesCount: {
      type: Number,
      default: 0,
    },
    lastRideCreatedAt: {
      type: Date,
      default: null,
    },
    rideCreationBanUntil: {
      type: Date,
      default: null,
    },
    banCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

studentSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

studentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Student", studentSchema);
