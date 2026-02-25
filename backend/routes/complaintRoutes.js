const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  submitComplaint,
  getMyComplaints,
} = require("../controllers/complaintController");

// Protected - any authenticated user can submit complaints
router.post("/", protect, submitComplaint);
router.get("/my", protect, getMyComplaints);

module.exports = router;
