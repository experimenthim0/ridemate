const Ride = require("../models/Ride");
const { findMatchingRides } = require("../utils/routes");

// Get active rides (PUBLIC - no auth needed) with route-based midway filtering
const getPublicActiveRides = async (req, res) => {
  try {
    const { from, to } = req.query;

    const query = { status: "active" };
    // Auto-deactivate rides older than 3 hours
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    await Ride.updateMany(
      {
        type: "student_sharing",
        status: "active",
        createdAt: { $lt: threeHoursAgo },
      },
      { $set: { status: "completed" } },
    );

    // Fetch all active rides
    const rides = await Ride.find(query)
      .populate("driver_id", "name auto_number is_active")
      .populate("student_id", "name")
      .sort("-createdAt");

    // Filter out rides from inactive drivers
    const activeRides = rides.filter(
      (ride) =>
        ride.type === "student_sharing" ||
        (ride.driver_id && ride.driver_id.is_active),
    );

    // Apply route-based midway filtering
    const filtered = findMatchingRides(activeRides, from, to);

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get ride details (PUBLIC)
const getPublicRideDetails = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate("driver_id", "name auto_number phone upi_id")
      .populate("student_id", "name phone email");

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    res.json({ ride });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get locations list
const getLocations = async (req, res) => {
  const { LOCATIONS } = require("../utils/locations");
  res.json(LOCATIONS);
};

// Get routes list
const getRoutes = async (req, res) => {
  const { ROUTES } = require("../utils/routes");
  res.json(ROUTES);
};

module.exports = {
  getPublicActiveRides,
  getPublicRideDetails,
  getLocations,
  getRoutes,
};
