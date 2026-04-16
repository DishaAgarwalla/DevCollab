const mongoose = require("mongoose");
const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { exportTasksToCSV, exportTasksToJSON } = require("../services/exportService");
const { searchTasks, getFilterOptions } = require("../services/searchService");
const { sendTaskAssignedEmail } = require("../utils/emailService");

// Helper function to create notification
const createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    console.log(`✅ Notification created for user: ${notificationData.userId}`);
    return notification;
  } catch (error) {
    console.error("❌ Error creating notification:", error.message);
    return null;
  }
};

// Get all tasks for a project (with optional filters and search)
exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const filters = req.query;
    console.log(`📋 Getting tasks for project: ${projectId} with filters:`, filters);
    
    const tasks = await searchTasks(projectId, filters);
    
    console.log(`✅ Found ${tasks.length} tasks`);
    res.json(tasks);
  } catch (error) {
    console.error("❌ Error in getTasks:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// Get filter options for a project
exports.getFilterOptions = async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log(`📋 Getting filter options for project: ${projectId}`);
    
    const options = await getFilterOptions(projectId);
    
    res.json(options);
  } catch (error) {
    console.error("❌ Error in getFilterOptions:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// Create a new task - WITH LABELS AND EMAIL NOTIFICATIONS
exports.createTask = async (req, res) => {
  try {
    const { projectId, title, description, priority, assignedTo, dueDate, labels } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    if (!project.members.includes(req.user._id)) {
      return res.status(403).json({ message: "You must be a project member to create tasks" });
    }
    
    const task = new Task({
      projectId,
      title,
      description: description || "",
      priority: priority || "medium",
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      dueDate: dueDate || null,
      labels: labels || []
    });
    
    await task.save();
    console.log(`✅ Task created: ${title} with labels: ${labels || 'none'}`);
    
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    
    // 🔔 NOTIFICATION & EMAIL: Notify assigned user
    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      const assignedUser = await User.findById(assignedTo);
      if (assignedUser) {
        await createNotification({
          userId: assignedTo,
          type: 'task_assigned',
          title: 'New Task Assigned 📋',
          message: `${req.user.name} assigned you a task: "${title}" in project "${project.title}"`,
          relatedId: task._id,
          relatedModel: 'Task',
          actionUrl: `/team/${projectId}?tab=tasks`,
          metadata: {
            taskId: task._id,
            taskTitle: title,
            projectId: project._id,
            projectName: project.title,
            priority: priority,
            dueDate: dueDate,
            assignedBy: req.user.name,
            labels: labels
          }
        });
        
        // Send email notification
        await sendTaskAssignedEmail(assignedUser, task, project, req.user.name);
      }
    }
    
    res.status(201).json(populatedTask);
  } catch (error) {
    console.error("❌ Error in createTask:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// Update a task - WITH LABELS
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, assignedTo, dueDate, labels } = req.body;
    
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    const project = await Project.findById(task.projectId);
    if (!project.members.includes(req.user._id)) {
      return res.status(403).json({ message: "You must be a project member to update tasks" });
    }
    
    const oldAssignedTo = task.assignedTo;
    const oldStatus = task.status;
    
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (labels !== undefined) task.labels = labels;
    
    if (status === 'completed' && task.status !== 'completed') {
      task.completedAt = new Date();
    } else if (status !== 'completed') {
      task.completedAt = null;
    }
    
    await task.save();
    console.log(`✅ Task updated: ${task.title} | Labels: ${task.labels.join(', ') || 'none'}`);
    
    // 🔔 NOTIFICATION & EMAIL: Notify when assigned to someone new
    if (assignedTo && assignedTo.toString() !== oldAssignedTo?.toString() && assignedTo.toString() !== req.user._id.toString()) {
      const assignedUser = await User.findById(assignedTo);
      if (assignedUser) {
        await createNotification({
          userId: assignedTo,
          type: 'task_assigned',
          title: 'Task Assigned to You 📋',
          message: `${req.user.name} assigned you a task: "${task.title}" in project "${project.title}"`,
          relatedId: task._id,
          relatedModel: 'Task',
          actionUrl: `/team/${project._id}?tab=tasks`,
          metadata: {
            taskId: task._id,
            taskTitle: task.title,
            projectId: project._id,
            projectName: project.title,
            priority: priority,
            dueDate: dueDate,
            assignedBy: req.user.name,
            labels: labels
          }
        });
        
        // Send email notification for new assignment
        await sendTaskAssignedEmail(assignedUser, task, project, req.user.name);
      }
    }
    
    // 🔔 NOTIFICATION: Notify task creator about status change (if not self)
    if (status && status !== oldStatus && task.createdBy.toString() !== req.user._id.toString()) {
      const statusMessages = {
        in_progress: `started working on task: "${task.title}"`,
        completed: `completed task: "${task.title}" 🎉`,
        blocked: `marked task: "${task.title}" as blocked`
      };
      
      if (statusMessages[status]) {
        await createNotification({
          userId: task.createdBy,
          type: 'task_updated',
          title: 'Task Status Updated',
          message: `${req.user.name} ${statusMessages[status]} in project "${project.title}"`,
          relatedId: task._id,
          relatedModel: 'Task',
          actionUrl: `/team/${project._id}?tab=tasks`,
          metadata: {
            taskId: task._id,
            taskTitle: task.title,
            projectId: project._id,
            projectName: project.title,
            newStatus: status,
            oldStatus: oldStatus,
            updatedBy: req.user.name,
            labels: labels
          }
        });
      }
    }
    
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    
    res.json(populatedTask);
  } catch (error) {
    console.error("❌ Error in updateTask:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    const project = await Project.findById(task.projectId);
    const isOwner = project.createdBy.toString() === req.user._id.toString();
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    
    if (!isOwner && !isCreator) {
      return res.status(403).json({ message: "Only task creator or project owner can delete tasks" });
    }
    
    await task.deleteOne();
    console.log(`✅ Task deleted: ${task.title}`);
    
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("❌ Error in deleteTask:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// Get task statistics for a project
exports.getTaskStats = async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log(`📋 Getting task stats for project: ${projectId}`);
    
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID format" });
    }
    
    const stats = await Task.aggregate([
      { 
        $match: { 
          projectId: new mongoose.Types.ObjectId(projectId) 
        } 
      },
      { 
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    const result = {
      total: 0,
      pending: 0,
      in_progress: 0,
      completed: 0,
      blocked: 0
    };
    
    stats.forEach(stat => {
      if (stat._id === 'pending') result.pending = stat.count;
      else if (stat._id === 'in_progress') result.in_progress = stat.count;
      else if (stat._id === 'completed') result.completed = stat.count;
      else if (stat._id === 'blocked') result.blocked = stat.count;
      result.total += stat.count;
    });
    
    console.log(`✅ Task stats: ${JSON.stringify(result)}`);
    res.json(result);
  } catch (error) {
    console.error("❌ Error in getTaskStats:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// Get all available label options
exports.getLabelOptions = async (req, res) => {
  try {
    const TaskModel = require("../models/Task");
    const labels = Object.keys(TaskModel.getLabelConfig || {}).map(key => ({
      value: key,
      name: key,
      color: '#6B7280'
    }));
    res.json(labels);
  } catch (error) {
    console.error("❌ Error in getLabelOptions:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// Export tasks as CSV
exports.exportTasksCSV = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    if (!project.members.includes(req.user._id)) {
      return res.status(403).json({ message: "You must be a project member to export tasks" });
    }
    
    const { headers, rows } = await exportTasksToCSV(projectId);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=tasks-${project.title.replace(/[^a-z0-9]/gi, '_')}-${Date.now()}.csv`);
    res.send(csvContent);
  } catch (error) {
    console.error("❌ Error in exportTasksCSV:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// Export tasks as JSON
exports.exportTasksJSON = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    if (!project.members.includes(req.user._id)) {
      return res.status(403).json({ message: "You must be a project member to export tasks" });
    }
    
    const data = await exportTasksToJSON(projectId);
    
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename=tasks-${project.title.replace(/[^a-z0-9]/gi, '_')}-${Date.now()}.json`);
    res.json(data);
  } catch (error) {
    console.error("❌ Error in exportTasksJSON:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};