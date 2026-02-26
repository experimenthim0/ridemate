const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  addDriver,
  getDrivers,
  toggleDriverStatus,
  updateDriver,
  getStudents,
  unblockStudent,
  getAllRides,
  getComplaints,
  resolveComplaint,
  getDashboardStats,
  getFakeRideReports,
} = require("../controllers/adminController");

// All routes are protected + admin only
router.use(protect, authorize("admin"));

router.get("/stats", getDashboardStats);
router.post("/drivers", addDriver);
router.get("/drivers", getDrivers);
router.put("/drivers/:id/toggle", toggleDriverStatus);
router.put("/drivers/:id", updateDriver);
router.get("/students", getStudents);
router.put("/students/:id/unblock", unblockStudent);
router.get("/rides", getAllRides);
router.get("/fake-ride-reports", getFakeRideReports);
router.get("/complaints", getComplaints);
router.put("/complaints/:id", resolveComplaint);

module.exports = router;
