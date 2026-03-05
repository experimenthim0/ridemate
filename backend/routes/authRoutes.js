const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  studentRegister,
  studentLogin,
  driverLogin,
  adminLogin,
  getMe,
  changePassword,
} = require("../controllers/authController");

// Public routes
router.post("/student/register", studentRegister);
router.post("/student/login", studentLogin);
router.post("/driver/login", driverLogin);
router.post("/admin/login", adminLogin);

// Protected routes
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);

module.exports = router;
