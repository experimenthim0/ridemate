const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getActiveRides,
  bookSeat,
  markAsPaid,
  cancelBooking,
  getMyBookings,
  getRideDetails,
} = require("../controllers/studentController");

// All routes are protected + student only
router.use(protect, authorize("student"));

router.get("/rides", getActiveRides);
router.get("/ride/:id", getRideDetails);
router.post("/book/:rideId", bookSeat);
router.put("/book/:bookingId/pay", markAsPaid);
router.put("/book/:bookingId/cancel", cancelBooking);
router.get("/bookings", getMyBookings);

module.exports = router;
