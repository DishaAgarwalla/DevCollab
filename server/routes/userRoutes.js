const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getUserPreferences, updateUserPreferences } = require("../controllers/userController");

// Protected routes - all require authentication
router.get("/preferences", protect, getUserPreferences);
router.put("/preferences", protect, updateUserPreferences);

console.log("✅ User routes loaded");

module.exports = router;