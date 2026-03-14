const Notification = require("../models/Notification");

// @desc    Get all notifications for user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const role = req.userRole;
    let query = {};

    if (role === "admin") {
      query = {}; // Admin sees all
    } else {
      // Students and Drivers see broadcast for all OR specific for their role OR individual for them
      query = {
        $or: [
          { type: "broadcast", targetRole: { $in: ["all", role] } },
          { type: "individual", recipient: req.user._id, recipientModel: role.charAt(0).toUpperCase() + role.slice(1) },
        ],
      };
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

// @desc    Create a notification (Admin only)
// @route   POST /api/notifications
// @access  Private/Admin
exports.createNotification = async (req, res) => {
  try {
    const { title, message, type, targetRole, recipient, recipientModel } = req.body;

    const notification = await Notification.create({
      title,
      message,
      type: type || "broadcast",
      targetRole: targetRole || "all",
      recipient,
      recipientModel,
      admin_id: req.user._id,
    });

    const io = req.app.get("io");
    if (io) {
      if (notification.type === "broadcast") {
        io.emit("new_notification", notification);
      } else if (notification.type === "individual" && notification.recipient) {
        // We could use rooms for individual users if implemented
        io.emit(`new_notification_${notification.recipient}`, notification);
      }
    }

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Error creating notification" });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.type === "individual") {
      notification.isRead = true;
    } else {
      // Broadcast: add user to readBy if not already there
      if (!notification.readBy.includes(req.user._id)) {
        notification.readBy.push(req.user._id);
      }
    }

    await notification.save();
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error updating notification" });
  }
};

// @desc    Delete notification (Admin only)
// @route   DELETE /api/notifications/:id
// @access  Private/Admin
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notification.deleteOne();
    res.json({ message: "Notification removed" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting notification" });
  }
};
