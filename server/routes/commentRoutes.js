const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getComments,
  createComment,
  updateComment,
  deleteComment
} = require("../controllers/commentController");

// Protected routes - all require authentication
router.get("/task/:taskId", protect, getComments);
router.post("/", protect, createComment);
router.put("/:commentId", protect, updateComment);
router.delete("/:commentId", protect, deleteComment);

console.log("✅ Comment routes loaded");

module.exports = router;