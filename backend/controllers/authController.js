const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Driver = require("../models/Driver");
const Student = require("../models/Student");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Student Register
const studentRegister = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingStudent = await Student.findOne({ phone });
    if (existingStudent) {
      return res
        .status(400)
        .json({ message: "Phone number already registered" });
    }

    const student = await Student.create({ name, phone, email, password });

    res.status(201).json({
      _id: student._id,
      name: student.name,
      phone: student.phone,
      email: student.email,
      role: student.role,
      token: generateToken(student._id, "student"),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Student Login
const studentLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res
        .status(400)
        .json({ message: "Phone and password are required" });
    }

    const student = await Student.findOne({ phone });
    if (!student || !(await student.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid phone or password" });
    }

    if (student.is_globally_blocked) {
      return res
        .status(403)
        .json({
          message:
            "Your account has been blocked due to multiple no-shows. Contact admin.",
        });
    }

    res.json({
      _id: student._id,
      name: student.name,
      phone: student.phone,
      email: student.email,
      role: student.role,
      is_globally_blocked: student.is_globally_blocked,
      no_show_count: student.no_show_count,
      token: generateToken(student._id, "student"),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Driver Login
const driverLogin = async (req, res) => {
  try {
    const { auto_number, password } = req.body;

    if (!auto_number || !password) {
      return res
        .status(400)
        .json({ message: "Auto number and password are required" });
    }

    const driver = await Driver.findOne({
      auto_number: auto_number.toUpperCase(),
    });
    if (!driver || !(await driver.matchPassword(password))) {
      return res
        .status(401)
        .json({ message: "Invalid auto number or password" });
    }

    if (!driver.is_active) {
      return res
        .status(403)
        .json({ message: "Your account has been deactivated. Contact admin." });
    }

    res.json({
      _id: driver._id,
      name: driver.name,
      auto_number: driver.auto_number,
      role: driver.role,
      is_active: driver.is_active,
      token: generateToken(driver._id, "driver"),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const admin = await Admin.findOne({ username });
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: admin._id,
      username: admin.username,
      role: admin.role,
      token: generateToken(admin._id, "admin"),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user
const getMe = async (req, res) => {
  res.json({ user: req.user, role: req.userRole });
};

module.exports = {
  studentRegister,
  studentLogin,
  driverLogin,
  adminLogin,
  getMe,
};
