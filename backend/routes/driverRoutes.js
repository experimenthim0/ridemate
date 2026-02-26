const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createRide,
  fillSeat,
  unfillSeat,
  endRide,
  getMyRides,
  getRideBookings,
  confirmBooking,
  markNoShow,
  blockStudent,
  unblockStudent,
  getBlockedStudents,
  getProfile,
  updateProfile,
  updateRideTime,
  getRideMessages,
  postRideMessage,
} = require("../controllers/driverController");

// All routes are protected + driver only
router.use(protect, authorize("driver"));

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/rides", createRide);
router.put("/rides/:id/time", updateRideTime);
router.get("/rides", getMyRides);
router.put("/rides/:id/end", endRide);
router.put("/rides/:id/fill-seat", fillSeat);
router.put("/rides/:id/unfill-seat", unfillSeat);
router.get("/rides/:id/bookings", getRideBookings);
router.put("/bookings/:id/confirm", confirmBooking);
router.put("/bookings/:id/noshow", markNoShow);
router.post("/block/:studentId", blockStudent);
router.delete("/block/:studentId", unblockStudent);
router.get("/blocked", getBlockedStudents);
router.get("/rides/:rideId/messages", getRideMessages);
router.post("/rides/:rideId/messages", postRideMessage);

module.exports = router;
