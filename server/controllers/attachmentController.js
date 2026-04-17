const Attachment = require("../models/Attachment");
const Task = require("../models/Task");
const Project = require("../models/Project");
const fs = require("fs");
const path = require("path");

// Upload attachment
exports.uploadAttachment = async (req, res) => {
  try {
    const { taskId } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    // Verify task exists and user has access
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    const project = await Project.findById(task.projectId);
    if (!project.members.includes(req.user._id)) {
      return res.status(403).json({ message: "You must be a project member to upload files" });
    }
    
    const attachment = new Attachment({
      taskId,
      projectId: task.projectId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      filePath: req.file.path,
      uploadedBy: req.user._id,
      uploadedByName: req.user.name
    });
    
    await attachment.save();
    console.log(`✅ Attachment uploaded: ${attachment.originalName} for task ${taskId}`);
    
    res.status(201).json(attachment);
  } catch (error) {
    console.error("❌ Error in uploadAttachment:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// Get attachments for a task
exports.getAttachments = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const attachments = await Attachment.find({ taskId })
      .sort({ createdAt: -1 });
    
    res.json(attachments);
  } catch (error) {
    console.error("❌ Error in getAttachments:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// Download attachment
exports.downloadAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    
    const attachment = await Attachment.findById(attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" });
    }
    
    // Check if user has access to the project
    const project = await Project.findById(attachment.projectId);
    if (!project.members.includes(req.user._id)) {
      return res.status(403).json({ message: "You don't have access to this file" });
    }
    
    if (!fs.existsSync(attachment.filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }
    
    res.download(attachment.filePath, attachment.originalName);
  } catch (error) {
    console.error("❌ Error in downloadAttachment:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// Delete attachment
exports.deleteAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    
    const attachment = await Attachment.findById(attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" });
    }
    
    // Check if user has permission
    const project = await Project.findById(attachment.projectId);
    const isOwner = project.createdBy.toString() === req.user._id.toString();
    const isUploader = attachment.uploadedBy.toString() === req.user._id.toString();
    
    if (!isOwner && !isUploader) {
      return res.status(403).json({ message: "You don't have permission to delete this file" });
    }
    
    // Delete file from disk
    if (fs.existsSync(attachment.filePath)) {
      fs.unlinkSync(attachment.filePath);
    }
    
    await attachment.deleteOne();
    console.log(`✅ Attachment deleted: ${attachment.originalName}`);
    
    res.json({ message: "Attachment deleted successfully" });
  } catch (error) {
    console.error("❌ Error in deleteAttachment:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};