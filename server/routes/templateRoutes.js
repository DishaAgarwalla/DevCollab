const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getTemplates,
  getGlobalTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  incrementUsage
} = require("../controllers/templateController");

// Protected routes - all require authentication
router.get("/project/:projectId", protect, getTemplates);
router.get("/global", protect, getGlobalTemplates);
router.post("/", protect, createTemplate);
router.put("/:templateId", protect, updateTemplate);
router.delete("/:templateId", protect, deleteTemplate);
router.post("/:templateId/use", protect, incrementUsage);

console.log("✅ Template routes loaded");

module.exports = router;