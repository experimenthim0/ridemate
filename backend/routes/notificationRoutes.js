const express = require("express");
const router = express.Router();
const {
  getNotifications,
  createNotification,
  markAsRead,
  deleteNotification,
} = require("../controllers/notificationController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router
  .route("/")
  .get(getNotifications)
  .post(authorize("admin"), createNotification);

router
  .route("/:id")
  .delete(authorize("admin"), deleteNotification);

router.put("/:id/read", markAsRead);

module.exports = router;
