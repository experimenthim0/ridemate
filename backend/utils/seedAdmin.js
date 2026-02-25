const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const Admin = require("../models/Admin");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding...");

    const existingAdmin = await Admin.findOne({ username: "himanshu0148" });
    if (existingAdmin) {
      console.log("Admin user already exists. Skipping seed.");
      process.exit(0);
    }

    await Admin.create({
      username: "himanshu0148",
      password: "nikhil12345678",
      role: "admin",
    });

    console.log("Admin user created successfully!");
    console.log("Username: himanshu0148");
    console.log("Password: nikhil12345678");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();
