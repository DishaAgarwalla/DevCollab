const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
  uploadAttachment,
  getAttachments,
  downloadAttachment,
  deleteAttachment
} = require("../controllers/attachmentController");

// Protected routes - all require authentication
router.post("/upload", protect, upload.single("file"), uploadAttachment);
router.get("/task/:taskId", protect, getAttachments);
router.get("/download/:attachmentId", protect, downloadAttachment);
router.delete("/:attachmentId", protect, deleteAttachment);

console.log("✅ Attachment routes loaded");

module.exports = router;