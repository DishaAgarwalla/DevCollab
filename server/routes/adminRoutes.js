const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
const User = require("../models/User");
const Project = require("../models/Project");

// Get all users (admin only)
router.get("/users", protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    console.log(`✅ Admin fetched ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get all projects (admin only)
router.get("/projects", protect, isAdmin, async (req, res) => {
  try {
    const projects = await Project.find({})
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    console.log(`✅ Admin fetched ${projects.length} projects`);
    res.json(projects);
  } catch (error) {
    console.error("❌ Error fetching projects:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Update user role (admin only)
router.put("/users/:userId/role", protect, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    
    const user = await User.findByIdAndUpdate(
      userId, 
      { role }, 
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log(`✅ User ${user.email} role updated to ${role}`);
    res.json(user);
  } catch (error) {
    console.error("❌ Error updating user role:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Delete user (admin only)
router.delete("/users/:userId", protect, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }
    
    await User.findByIdAndDelete(userId);
    console.log(`✅ User ${user.email} deleted by admin`);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Delete project (admin only)
router.delete("/projects/:projectId", protect, isAdmin, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    await Project.findByIdAndDelete(projectId);
    console.log(`✅ Project "${project.title}" deleted by admin`);
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting project:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

console.log("✅ Admin routes loaded");

module.exports = router;