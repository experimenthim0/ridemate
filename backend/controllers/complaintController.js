const Complaint = require("../models/Complaint");

// Submit complaint
const submitComplaint = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res
        .status(400)
        .json({ message: "Subject and message are required" });
    }

    const complaint = await Complaint.create({
      user_id: req.user._id,
      user_role: req.userRole,
      user_name: req.user.name || req.user.username,
      subject,
      message,
    });

    res
      .status(201)
      .json({ message: "Complaint submitted successfully", complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my complaints
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user_id: req.user._id }).sort(
      "-createdAt",
    );
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitComplaint, getMyComplaints };
