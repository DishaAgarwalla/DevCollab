const Task = require("../models/Task");

// Helper function to format date
const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US");
};

// Helper function to escape CSV field
const escapeCSV = (value) => {
  if (value === undefined || value === null) return "";
  const stringValue = String(value);
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

// Get status label
const getStatusLabel = (status) => {
  const statusMap = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    blocked: "Blocked"
  };
  return statusMap[status] || status;
};

// Get priority label
const getPriorityLabel = (priority) => {
  const priorityMap = {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical"
  };
  return priorityMap[priority] || priority;
};

// Export tasks to CSV
exports.exportTasksToCSV = async (projectId) => {
  const tasks = await Task.find({ projectId })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
  
  const headers = [
    "Task ID",
    "Title",
    "Description",
    "Status",
    "Priority",
    "Assigned To",
    "Assigned Email",
    "Created By",
    "Created Date",
    "Due Date",
    "Completed Date",
    "Labels",
    "Created At"
  ];
  
  const rows = tasks.map(task => [
    escapeCSV(task._id.toString()),
    escapeCSV(task.title),
    escapeCSV(task.description || ""),
    escapeCSV(getStatusLabel(task.status)),
    escapeCSV(getPriorityLabel(task.priority)),
    escapeCSV(task.assignedTo?.name || "Unassigned"),
    escapeCSV(task.assignedTo?.email || ""),
    escapeCSV(task.createdBy?.name || "Unknown"),
    escapeCSV(formatDate(task.createdAt)),
    escapeCSV(formatDate(task.dueDate)),
    escapeCSV(formatDate(task.completedAt)),
    escapeCSV((task.labels || []).join(", ")),
    escapeCSV(task.createdAt)
  ]);
  
  return { headers, rows };
};

// Export tasks to JSON
exports.exportTasksToJSON = async (projectId) => {
  const tasks = await Task.find({ projectId })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
  
  return tasks.map(task => ({
    id: task._id,
    title: task.title,
    description: task.description,
    status: task.status,
    statusLabel: getStatusLabel(task.status),
    priority: task.priority,
    priorityLabel: getPriorityLabel(task.priority),
    assignedTo: task.assignedTo ? {
      id: task.assignedTo._id,
      name: task.assignedTo.name,
      email: task.assignedTo.email
    } : null,
    createdBy: {
      id: task.createdBy?._id,
      name: task.createdBy?.name,
      email: task.createdBy?.email
    },
    createdAt: task.createdAt,
    dueDate: task.dueDate,
    completedAt: task.completedAt,
    labels: task.labels || [],
    projectId: task.projectId
  }));
};

// Get summary statistics
exports.getTaskSummary = async (projectId) => {
  const tasks = await Task.find({ projectId });
  
  const summary = {
    total: tasks.length,
    byStatus: {
      pending: 0,
      in_progress: 0,
      completed: 0,
      blocked: 0
    },
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    },
    byLabel: {},
    completionRate: 0,
    overdueTasks: 0
  };
  
  const now = new Date();
  
  tasks.forEach(task => {
    // Count by status
    summary.byStatus[task.status] = (summary.byStatus[task.status] || 0) + 1;
    
    // Count by priority
    summary.byPriority[task.priority] = (summary.byPriority[task.priority] || 0) + 1;
    
    // Count by label
    if (task.labels) {
      task.labels.forEach(label => {
        summary.byLabel[label] = (summary.byLabel[label] || 0) + 1;
      });
    }
    
    // Check overdue
    if (task.dueDate && task.dueDate < now && task.status !== 'completed') {
      summary.overdueTasks++;
    }
  });
  
  summary.completionRate = summary.total > 0 
    ? Math.round((summary.byStatus.completed / summary.total) * 100) 
    : 0;
  
  return summary;
};