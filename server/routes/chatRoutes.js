const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getMessages, createMessage } = require("../controllers/chatController");

// Protected routes
router.get("/:projectId", protect, getMessages);
router.post("/", protect, createMessage);

console.log("✅ Chat routes loaded");

module.exports = router;