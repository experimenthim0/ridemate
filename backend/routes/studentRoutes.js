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
  createRideShare,
  reportFakeRide,
  getRideMessages,
  postRideMessage,
  getCreatedRides,
  updateCreatedRide,
} = require("../controllers/studentController");

// All routes are protected + student only
router.use(protect, authorize("student"));

router.get("/rides", getActiveRides);
router.get("/ride/:id", getRideDetails);
router.post("/book/:rideId", bookSeat);
router.put("/book/:bookingId/pay", markAsPaid);
router.put("/book/:bookingId/cancel", cancelBooking);
router.get("/bookings", getMyBookings);
router.post("/ride", createRideShare);
router.post("/ride/:id/report", reportFakeRide);
router.get("/ride/:rideId/messages", getRideMessages);
router.post("/ride/:rideId/messages", postRideMessage);
router.get("/rides/created", getCreatedRides);
router.put("/ride/:id", updateCreatedRide);
router.put("/ride/:id/deactivate", deactivateRideShare);

module.exports = router;
