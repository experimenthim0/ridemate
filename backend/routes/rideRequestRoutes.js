const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createRequest,
  getRequests,
  getMyRequests,
  respondToRequest,
  fulfillRequest,
  deleteRequest,
} = require("../controllers/rideRequestController");

// Public
router.get("/", getRequests);

// Protected - Student only
router.post("/", protect, authorize("student"), createRequest);
router.get("/my", protect, authorize("student"), getMyRequests);
router.put("/:id/fulfill", protect, authorize("student"), fulfillRequest);
router.delete("/:id", protect, authorize("student"), deleteRequest);

// Protected - Any authenticated user (student or driver)
router.post("/:id/respond", protect, respondToRequest);

module.exports = router;
