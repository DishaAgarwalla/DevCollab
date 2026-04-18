// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin privileges required." });
  }
};

// Check if user is project owner
const isProjectOwner = (req, res, next) => {
  // This will be used with project routes
  // The project is already fetched and available in req.project
  if (req.project && req.project.createdBy.toString() === req.user._id.toString()) {
    next();
  } else if (req.user && req.user.role === 'admin') {
    // Admin can also bypass
    next();
  } else {
    res.status(403).json({ message: "Access denied. Only project owner can perform this action." });
  }
};

// Check if user is a member of the project
const isProjectMember = async (req, res, next) => {
  try {
    const Project = require("../models/Project");
    const project = await Project.findById(req.params.id || req.body.projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());
    
    if (isMember || req.user.role === 'admin') {
      req.project = project;
      next();
    } else {
      res.status(403).json({ message: "Access denied. You must be a project member." });
    }
  } catch (error) {
    console.error("Error in isProjectMember:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  isAdmin,
  isProjectOwner,
  isProjectMember
};