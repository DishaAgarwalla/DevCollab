const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { isAdmin, isProjectMember } = require("../middleware/roleMiddleware");
const {
  createProject,
  getProjects,
  getPublicProjects,
  getProjectById,
  requestToJoin,
  getJoinRequests,
  handleJoinRequest
} = require("../controllers/projectController");

// IMPORTANT: Specific routes MUST come BEFORE dynamic routes with :id

// Public route - Browse all projects (no authentication needed)
router.get("/browse", getPublicProjects);

// Protected routes - Authentication required
router.get("/", protect, getProjects);
router.get("/requests", protect, getJoinRequests);
router.post("/create", protect, createProject);
router.post("/join", protect, requestToJoin);
router.post("/approve", protect, handleJoinRequest);

// Dynamic route with :id - requires project membership
router.get("/:id", protect, isProjectMember, getProjectById);

console.log("✅ Project routes loaded");

module.exports = router;
