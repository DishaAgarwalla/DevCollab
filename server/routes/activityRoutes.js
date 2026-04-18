const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getActivities,
  createActivity,
  getUserActivities,
  getProjectActivities
} = require("../controllers/activityController");

// ALL routes require authentication
router.get("/", protect, getActivities);
router.post("/", protect, createActivity);
router.get("/user/:userId", protect, getUserActivities);
router.get("/project/:projectId", protect, getProjectActivities);

console.log("✅ Activity routes loaded");

module.exports = router;