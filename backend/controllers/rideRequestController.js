const RideRequest = require("../models/RideRequest");

// Create a ride request (Student)
const createRequest = async (req, res) => {
  try {
    const {
      from_location,
      to_location,
      requested_date,
      requested_time,
      seats_needed,
      note,
    } = req.body;

    if (!from_location || !to_location || !requested_date || !requested_time) {
      return res
        .status(400)
        .json({ message: "From, to, date, and time are required" });
    }

    if (from_location === to_location) {
      return res
        .status(400)
        .json({ message: "Pickup and destination cannot be the same" });
    }

    // Check if student already has 3 open requests
    const openCount = await RideRequest.countDocuments({
      student_id: req.user._id,
      status: "open",
    });
    if (openCount >= 3) {
      return res
        .status(400)
        .json({ message: "You can have at most 3 open ride requests" });
    }

    const request = await RideRequest.create({
      student_id: req.user._id,
      from_location,
      to_location,
      requested_date,
      requested_time,
      seats_needed: seats_needed || 1,
      note: note || "",
    });

    res.status(201).json({ message: "Ride request created", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all open ride requests (Public)
const getRequests = async (req, res) => {
  try {
    const requests = await RideRequest.find({ status: "open" })
      .populate("student_id", "name")
      .populate("responses.responder_id", "name")
      .sort("-createdAt");

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my ride requests (Student)
const getMyRequests = async (req, res) => {
  try {
    const requests = await RideRequest.find({ student_id: req.user._id })
      .populate("responses.responder_id", "name")
      .sort("-createdAt");

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Respond to a ride request (Driver or Student)
const respondToRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, ride_id } = req.body;

    const request = await RideRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Ride request not found" });
    }
    if (request.status !== "open") {
      return res
        .status(400)
        .json({ message: "This request is no longer open" });
    }

    // Prevent self-response
    if (request.student_id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot respond to your own request" });
    }

    const responderModel = req.userRole === "driver" ? "Driver" : "Student";

    request.responses.push({
      responder_id: req.user._id,
      responder_model: responderModel,
      message: message || "",
      ride_id: ride_id || null,
    });

    await request.save();

    res.json({ message: "Response submitted", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark request as fulfilled (Student owner)
const fulfillRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await RideRequest.findById(id);

    if (!request) {
      return res.status(404).json({ message: "Ride request not found" });
    }
    if (request.student_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your request" });
    }

    request.status = "fulfilled";
    await request.save();

    res.json({ message: "Request marked as fulfilled" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a ride request (Student owner)
const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await RideRequest.findById(id);

    if (!request) {
      return res.status(404).json({ message: "Ride request not found" });
    }
    if (request.student_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your request" });
    }

    await RideRequest.findByIdAndDelete(id);
    res.json({ message: "Ride request deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRequest,
  getRequests,
  getMyRequests,
  respondToRequest,
  fulfillRequest,
  deleteRequest,
};
