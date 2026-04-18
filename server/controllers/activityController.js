const Activity = require("../models/Activity");
const Project = require("../models/Project");

// Get all activities based on user role and projects
exports.getActivities = async (req, res) => {
  try {
    let activities;
    
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    if (req.user.role === 'admin') {
      // Admin sees all activities
      activities = await Activity.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('userId', 'name email');
      console.log(`✅ Admin fetched ${activities.length} activities`);
    } else {
      // Get all projects where user is a member
      const userProjects = await Project.find({ members: { $in: [req.user._id] } });
      const projectIds = userProjects.map(p => p._id.toString());
      
      console.log(`User ${req.user.email} is member of ${projectIds.length} projects`);
      
      // Get all activities and filter manually for accurate isolation
      const allActivities = await Activity.find()
        .sort({ createdAt: -1 })
        .limit(100)
        .populate('userId', 'name email');
      
      // Filter activities: user can see their own + activities from their projects
      activities = allActivities.filter(activity => {
        // User can see their own activities
        if (activity.userId && activity.userId._id.toString() === req.user._id.toString()) {
          return true;
        }
        
        // User can see activities from projects they are members of
        if (activity.projectId && projectIds.includes(activity.projectId.toString())) {
          return true;
        }
        
        // If activity has no projectId, only the user who created it can see it
        if (!activity.projectId && activity.userId && activity.userId._id.toString() === req.user._id.toString()) {
          return true;
        }
        
        return false;
      }).slice(0, 50);
      
      console.log(`✅ User ${req.user.email} fetched ${activities.length} activities`);
    }
    
    res.json(activities);
  } catch (error) {
    console.error("❌ Error in getActivities:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Create a new activity
exports.createActivity = async (req, res) => {
  try {
    const { type, message, userId, userName, projectId, projectName } = req.body;
    
    const activity = new Activity({
      type,
      message,
      userId,
      userName,
      projectId: projectId || null,
      projectName: projectName || null
    });
    
    await activity.save();
    console.log(`✅ Activity created: ${type} - ${message} - Project: ${projectName || 'No Project'}`);
    res.status(201).json(activity);
  } catch (error) {
    console.error("❌ Error in createActivity:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get activities for a specific user
exports.getUserActivities = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user is requesting their own activities or is admin
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const activities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('userId', 'name email');
    
    console.log(`✅ Fetched ${activities.length} activities for user ${userId}`);
    res.json(activities);
  } catch (error) {
    console.error("❌ Error in getUserActivities:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get activities for a specific project
exports.getProjectActivities = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check if user is a member of the project or admin
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. You must be a project member." });
    }
    
    const activities = await Activity.find({ projectId })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('userId', 'name email');
    
    console.log(`✅ Fetched ${activities.length} activities for project ${project.title}`);
    res.json(activities);
  } catch (error) {
    console.error("❌ Error in getProjectActivities:", error);
    res.status(500).json({ message: "Server Error" });
  }
};