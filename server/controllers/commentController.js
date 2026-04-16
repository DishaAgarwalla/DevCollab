const Comment = require("../models/Comment");
const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Helper function to create notification
const createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error("❌ Error creating notification:", error.message);
    return null;
  }
};

// Get all comments for a task
exports.getComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    console.log(`📋 Getting comments for task: ${taskId}`);
    
    const comments = await Comment.find({ taskId })
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${comments.length} comments`);
    res.json(comments);
  } catch (error) {
    console.error("❌ Error in getComments:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// Create a new comment
exports.createComment = async (req, res) => {
  try {
    const { taskId, content } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Comment content is required" });
    }
    
    // Verify user has access to the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    const project = await Project.findById(task.projectId);
    if (!project.members.includes(req.user._id)) {
      return res.status(403).json({ message: "You must be a project member to comment" });
    }
    
    // Check for @mentions
    const mentionRegex = /@(\w+)/g;
    const mentions = content.match(mentionRegex);
    const mentionedUsers = mentions ? mentions.map(m => m.substring(1)) : [];
    
    const comment = new Comment({
      taskId,
      projectId: task.projectId,
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      content: content.trim(),
      mentions: mentionedUsers
    });
    
    await comment.save();
    console.log(`✅ Comment added to task: ${taskId}`);
    
    // 🔔 Send notifications for mentions
    if (mentionedUsers.length > 0) {
      const projectMembers = await User.find({ 
        _id: { $in: project.members },
        name: { $in: mentionedUsers }
      });
      
      for (const mentionedUser of projectMembers) {
        if (mentionedUser._id.toString() !== req.user._id.toString()) {
          await createNotification({
            userId: mentionedUser._id,
            type: 'mention',
            title: 'You were mentioned in a comment',
            message: `${req.user.name} mentioned you in a comment on task "${task.title}"`,
            relatedId: taskId,
            relatedModel: 'Task',
            actionUrl: `/team/${task.projectId}?tab=tasks`,
            metadata: {
              taskId: taskId,
              taskTitle: task.title,
              projectId: task.projectId,
              projectName: project.title,
              commentId: comment._id,
              commentPreview: content.substring(0, 100),
              mentionedBy: req.user.name
            }
          });
        }
      }
    }
    
    res.status(201).json(comment);
  } catch (error) {
    console.error("❌ Error in createComment:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// Update a comment
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    // Only comment author can edit
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own comments" });
    }
    
    comment.content = content.trim();
    comment.edited = true;
    comment.editedAt = new Date();
    
    await comment.save();
    console.log(`✅ Comment updated: ${commentId}`);
    
    res.json(comment);
  } catch (error) {
    console.error("❌ Error in updateComment:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    // Only comment author or project owner can delete
    const task = await Task.findById(comment.taskId);
    const project = await Project.findById(task.projectId);
    const isOwner = project.createdBy.toString() === req.user._id.toString();
    const isAuthor = comment.userId.toString() === req.user._id.toString();
    
    if (!isOwner && !isAuthor) {
      return res.status(403).json({ message: "You don't have permission to delete this comment" });
    }
    
    await comment.deleteOne();
    console.log(`✅ Comment deleted: ${commentId}`);
    
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("❌ Error in deleteComment:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};