const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
  getLabelOptions,
  exportTasksCSV,
  exportTasksJSON,
  getFilterOptions
} = require("../controllers/taskController");

// Protected routes - all require authentication
router.get("/labels", protect, getLabelOptions);
router.get("/:projectId/filters", protect, getFilterOptions);
router.get("/:projectId", protect, getTasks);
router.get("/:projectId/stats", protect, getTaskStats);
router.get("/:projectId/export/csv", protect, exportTasksCSV);
router.get("/:projectId/export/json", protect, exportTasksJSON);
router.post("/", protect, createTask);
router.put("/:taskId", protect, updateTask);
router.delete("/:taskId", protect, deleteTask);

console.log("✅ Task routes loaded");

module.exports = router;