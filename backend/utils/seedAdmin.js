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

    const existingAdmin = await Admin.findOne({ username: process.env.ADMIN_UNAME });
    if (existingAdmin) {
      console.log("Admin user already exists. Skipping seed.");
      process.exit(0);
    }

    await Admin.create({
      username: process.env.ADMIN_UNAME,
      password: process.env.ADMIN_PASSWORD,
      role: "admin",
    });

    console.log("Admin user created successfully!");
    console.log("Username: " + process.env.ADMIN_UNAME);
    console.log("Password: " + process.env.ADMIN_PASSWORD);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();
