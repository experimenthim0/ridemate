const express = require("express");
const router = express.Router();
const {
  getPublicActiveRides,
  getPublicRideDetails,
  getLocations,
} = require("../controllers/rideController");

// Public routes - no auth needed
router.get("/active", getPublicActiveRides);
router.get("/locations", getLocations);
router.get("/:id", getPublicRideDetails);

module.exports = router;
