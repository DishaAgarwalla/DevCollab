const mongoose = require("mongoose");
const Project = require("../models/Project");
const Activity = require("../models/Activity");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { createNotification } = require("./notificationController");
const { sendJoinRequestEmail, sendRequestAcceptedEmail } = require("../utils/emailService");

// Get all projects - ONLY SHOW PROJECTS USER IS MEMBER OF
exports.getProjects = async (req, res) => {
  try {
    console.log("📋 Getting projects for user:", req.user?.email || "Not logged in");
    console.log("User ID:", req.user?._id);
    
    let projects;
    
    if (req.user && req.user._id) {
      const userId = req.user._id;
      
      projects = await Project.find({
        members: { $in: [userId] }
      })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .populate('members', 'name email');
      
      console.log(`✅ Found ${projects.length} projects for user ${req.user.email}`);
    } else {
      projects = [];
      console.log(`✅ No user logged in, returning 0 projects`);
    }
    
    res.json(projects);
  } catch (error) {
    console.error("❌ Error in getProjects:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all public projects for browsing (for users to request joining)
exports.getPublicProjects = async (req, res) => {
  try {
    console.log("📋 Getting all public projects for browsing");
    
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .populate('members', 'name email');
    
    console.log(`✅ Found ${projects.length} public projects`);
    res.json(projects);
  } catch (error) {
    console.error("❌ Error in getPublicProjects:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Create project
exports.createProject = async (req, res) => {
  try {
    console.log("📝 Create project request received");
    console.log("Request body:", req.body);
    console.log("User from auth:", req.user);
    
    if (!req.user) {
      console.log("❌ No user found in request - authentication failed");
      return res.status(401).json({ message: "Not authenticated" });
    }

    console.log(`👤 Authenticated as: ${req.user.email} (ID: ${req.user._id})`);

    const { title, description, techStack, rolesNeeded, githubRepo } = req.body;

    if (!title || !description) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ message: "Title and description are required" });
    }

    const userId = req.user._id;
    
    const project = new Project({
      title,
      description,
      techStack: techStack || "",
      rolesNeeded: rolesNeeded || "",
      githubRepo: githubRepo || "",
      createdBy: userId,
      members: [userId],
      joinRequests: []
    });

    await project.save();
    console.log(`✅ Project saved successfully with ID: ${project._id}`);

    // Create activity for project creation
    try {
      const activity = new Activity({
        type: 'project_created',
        message: `created a new project: ${title}`,
        userId: userId,
        userName: req.user.name,
        projectId: project._id,
        projectName: title
      });
      await activity.save();
      console.log("✅ Activity created successfully");
    } catch (activityError) {
      console.error("⚠️ Error creating activity:", activityError.message);
    }

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    res.status(201).json({
      message: "Project created successfully",
      project: populatedProject
    });

  } catch (error) {
    console.error("❌ Error in createProject:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// Get project by ID
exports.getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;
    console.log(`📋 Getting project with ID: ${projectId}`);
    
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      console.log("❌ Invalid project ID format");
      return res.status(400).json({ message: "Invalid project ID format" });
    }
    
    const project = await Project.findById(projectId)
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .populate('joinRequests.userId', 'name email');
    
    if (!project) {
      console.log("❌ Project not found for ID:", projectId);
      return res.status(404).json({ message: "Project not found" });
    }
    
    if (req.user && project.members && !project.members.some(m => {
      if (!m) return false;
      const memberId = m._id ? m._id.toString() : m.toString();
      return memberId === req.user._id.toString();
    })) {
      console.log(`❌ User ${req.user.email} is not a member of project ${project.title}`);
      return res.status(403).json({ message: "You don't have access to this project" });
    }
    
    if (!project.members) {
      project.members = [];
    }
    
    if (project.createdBy) {
      const creatorId = project.createdBy._id ? project.createdBy._id.toString() : project.createdBy.toString();
      if (!project.members.some(m => {
        if (!m) return false;
        const memberId = m._id ? m._id.toString() : m.toString();
        return memberId === creatorId;
      })) {
        project.members.push(project.createdBy._id || project.createdBy);
        await project.save();
        console.log("✅ Migrated old project: added creator to members");
      }
    } else {
      console.log(`⚠️ Project ${project.title} has no createdBy field - needs manual fix`);
    }
    
    if (project.joinRequests && project.joinRequests.length > 0) {
      const firstRequest = project.joinRequests[0];
      if (firstRequest && typeof firstRequest === 'object' && !firstRequest.userId) {
        const convertedRequests = project.joinRequests.map(req => ({
          userId: req,
          userName: 'Unknown',
          userEmail: '',
          status: 'pending',
          requestedAt: new Date()
        }));
        project.joinRequests = convertedRequests;
        await project.save();
        console.log("✅ Migrated old join requests to new format");
      }
    }
    
    console.log(`✅ Found project: ${project.title}`);
    console.log(`   Members: ${project.members?.length || 0}`);
    console.log(`   Pending requests: ${project.joinRequests?.filter(r => r && r.status === 'pending').length || 0}`);
    
    res.json(project);
  } catch (error) {
    console.error("❌ Error in getProjectById:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// Request to join project (User B)
exports.requestToJoin = async (req, res) => {
  try {
    const { projectId } = req.body;
    console.log(`📋 Join request for project: ${projectId}`);
    
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID format" });
    }

    const userId = req.user._id;
    const userName = req.user.name;
    const userEmail = req.user.email;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.createdBy) {
      console.log("❌ Project has no createdBy field - cannot accept join requests");
      return res.status(400).json({ message: "Project is missing owner information" });
    }

    let ownerId;
    try {
      ownerId = project.createdBy._id ? project.createdBy._id.toString() : project.createdBy.toString();
    } catch (err) {
      console.log("❌ Error getting owner ID:", err.message);
      return res.status(400).json({ message: "Invalid project owner information" });
    }

    if (ownerId === userId.toString()) {
      return res.status(400).json({ message: "You cannot request to join your own project" });
    }

    if (!project.members) {
      project.members = [];
    }
    project.members = project.members.filter(m => m !== null);
    
    if (!project.joinRequests) {
      project.joinRequests = [];
    }

    const isMember = project.members.some(member => {
      if (!member) return false;
      try {
        const memberId = member._id ? member._id.toString() : member.toString();
        return memberId === userId.toString();
      } catch {
        return false;
      }
    });
    
    if (isMember) {
      return res.status(400).json({ message: "You are already a member of this project" });
    }

    const hasPendingRequest = project.joinRequests.some(req => {
      if (!req || !req.userId) return false;
      try {
        const reqUserId = req.userId._id ? req.userId._id.toString() : req.userId.toString();
        return reqUserId === userId.toString() && req.status === 'pending';
      } catch {
        return false;
      }
    });
    
    if (hasPendingRequest) {
      return res.status(400).json({ message: "You already have a pending request for this project" });
    }

    project.joinRequests.push({
      userId: userId,
      userName: userName,
      userEmail: userEmail,
      status: 'pending',
      requestedAt: new Date()
    });
    
    await project.save();
    console.log(`✅ Join request sent for project: ${project.title} by ${userName}`);

    // Create activity for join request
    try {
      const activity = new Activity({
        type: 'user_joined',
        message: `requested to join project: ${project.title}`,
        userId: userId,
        userName: userName,
        projectId: project._id,
        projectName: project.title
      });
      await activity.save();
      console.log("✅ Activity created");
    } catch (activityError) {
      console.error("⚠️ Error creating activity:", activityError.message);
    }

    // Send email notification to project owner
    const projectOwner = await User.findById(project.createdBy);
    await sendJoinRequestEmail(projectOwner, req.user, project);

    res.json({ message: "Join request sent successfully" });
    
  } catch (error) {
    console.error("❌ Error in requestToJoin:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// Get join requests for projects owned by User A
exports.getJoinRequests = async (req, res) => {
  try {
    console.log("📋 Getting join requests for user:", req.user?.email);
    
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const projects = await Project.find({ createdBy: req.user._id })
      .select('title joinRequests members');

    const requests = [];
    projects.forEach(project => {
      if (!project.joinRequests || project.joinRequests.length === 0) {
        return;
      }
      
      project.joinRequests.forEach(request => {
        if (!request) return;
        
        let requestUserId, requestUserName, requestUserEmail, requestStatus, requestDate;
        
        if (request.userId) {
          requestUserId = request.userId;
          requestUserName = request.userName || 'Unknown';
          requestUserEmail = request.userEmail || '';
          requestStatus = request.status;
          requestDate = request.requestedAt;
        } else {
          requestUserId = request;
          requestUserName = 'Unknown';
          requestUserEmail = '';
          requestStatus = 'pending';
          requestDate = new Date();
        }
        
        if (requestStatus === 'pending') {
          requests.push({
            _id: `${project._id}_${requestUserId}`,
            projectId: project._id,
            projectTitle: project.title,
            userId: requestUserId,
            userName: requestUserName,
            userEmail: requestUserEmail,
            requestedAt: requestDate
          });
        }
      });
    });

    console.log(`✅ Found ${requests.length} pending join requests`);
    res.json(requests);
  } catch (error) {
    console.error("❌ Error in getJoinRequests:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// Handle join request (User A accepts or rejects) - WITH NOTIFICATIONS
exports.handleJoinRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;
    const [projectId, userId] = requestId.split('_');
    
    console.log(`📋 Handling join request: ${action} for user ${userId} in project ${projectId}`);

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID format" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.createdBy) {
      return res.status(400).json({ message: "Project has no owner information" });
    }

    const ownerId = project.createdBy._id ? project.createdBy._id.toString() : project.createdBy.toString();
    if (ownerId !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the project owner can handle join requests" });
    }

    if (!project.joinRequests) {
      project.joinRequests = [];
    }
    if (!project.members) {
      project.members = [];
    }
    project.members = project.members.filter(m => m !== null);

    let requestIndex = -1;
    let request = null;
    
    for (let i = 0; i < project.joinRequests.length; i++) {
      const reqItem = project.joinRequests[i];
      if (!reqItem) continue;
      
      let reqUserId;
      try {
        reqUserId = reqItem.userId ? (reqItem.userId._id ? reqItem.userId._id.toString() : reqItem.userId.toString()) : reqItem.toString();
      } catch {
        continue;
      }
      const reqStatus = reqItem.status || 'pending';
      
      if (reqUserId === userId && reqStatus === 'pending') {
        requestIndex = i;
        request = reqItem;
        break;
      }
    }

    if (requestIndex === -1) {
      return res.status(404).json({ message: "Join request not found" });
    }

    const requestUserName = request.userName || 'Unknown';

    if (action === 'accepted') {
      if (!project.members.some(m => m && m.toString() === userId)) {
        project.members.push(new mongoose.Types.ObjectId(userId));
      }
      
      if (request.userId) {
        request.status = 'accepted';
      } else {
        project.joinRequests[requestIndex] = {
          userId: new mongoose.Types.ObjectId(userId),
          userName: requestUserName,
          userEmail: '',
          status: 'accepted',
          requestedAt: new Date()
        };
      }
      
      console.log(`✅ User ${userId} added to project team`);
      
      // Create activity for accepted request
      try {
        const activity = new Activity({
          type: 'request_accepted',
          message: `joined project: ${project.title}`,
          userId: new mongoose.Types.ObjectId(userId),
          userName: requestUserName,
          projectId: project._id,
          projectName: project.title
        });
        await activity.save();
      } catch (activityError) {
        console.error("⚠️ Error creating activity:", activityError.message);
      }

      // 🔔 NOTIFICATION: Notify user that their request was accepted
      await createNotification({
        userId: userId,
        type: 'request_accepted',
        title: 'Join Request Accepted 🎉',
        message: `${req.user.name} accepted your request to join "${project.title}"`,
        relatedId: project._id,
        relatedModel: 'Project',
        actionUrl: `/team/${project._id}`,
        metadata: {
          projectName: project.title,
          projectId: project._id,
          acceptedBy: req.user.name
        }
      });

      // Send email notification to requester
      const requester = await User.findById(userId);
      await sendRequestAcceptedEmail(requester, project, req.user.name);

    } else {
      if (request.userId) {
        request.status = 'rejected';
      } else {
        project.joinRequests[requestIndex] = {
          userId: new mongoose.Types.ObjectId(userId),
          userName: requestUserName,
          userEmail: '',
          status: 'rejected',
          requestedAt: new Date()
        };
      }
      
      console.log(`❌ Request rejected for user ${userId}`);
      
      // Create activity for rejected request
      try {
        const activity = new Activity({
          type: 'request_rejected',
          message: `was not approved for project: ${project.title}`,
          userId: new mongoose.Types.ObjectId(userId),
          userName: requestUserName,
          projectId: project._id,
          projectName: project.title
        });
        await activity.save();
      } catch (activityError) {
        console.error("⚠️ Error creating activity:", activityError.message);
      }

      // 🔔 NOTIFICATION: Notify user that their request was rejected
      await createNotification({
        userId: userId,
        type: 'request_rejected',
        title: 'Join Request Rejected',
        message: `${req.user.name} rejected your request to join "${project.title}"`,
        relatedId: project._id,
        relatedModel: 'Project',
        actionUrl: `/projects`,
        metadata: {
          projectName: project.title,
          projectId: project._id,
          rejectedBy: req.user.name
        }
      });
    }

    await project.save();
    res.json({ message: `Request ${action} successfully` });
  } catch (error) {
    console.error("❌ Error in handleJoinRequest:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};