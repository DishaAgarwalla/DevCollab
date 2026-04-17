const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require("../controllers/notificationController");

// All routes require authentication
router.get("/", protect, getNotifications);
router.put("/:notificationId/read", protect, markAsRead);
router.put("/read-all", protect, markAllAsRead);
router.delete("/:notificationId", protect, deleteNotification);

console.log("✅ Notification routes loaded");

module.exports = router;