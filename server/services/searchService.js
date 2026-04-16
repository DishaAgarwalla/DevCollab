const Task = require("../models/Task");

// Search tasks with advanced filters
exports.searchTasks = async (projectId, filters) => {
  let query = { projectId };
  
  // Full-text search
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } }
    ];
  }
  
  // Filter by status
  if (filters.status && filters.status !== 'all') {
    query.status = filters.status;
  }
  
  // Filter by priority
  if (filters.priority && filters.priority !== 'all') {
    query.priority = filters.priority;
  }
  
  // Filter by labels
  if (filters.labels && filters.labels.length > 0) {
    query.labels = { $in: filters.labels };
  }
  
  // Filter by assignee
  if (filters.assignedTo && filters.assignedTo !== 'all') {
    if (filters.assignedTo === 'unassigned') {
      query.assignedTo = null;
    } else {
      query.assignedTo = filters.assignedTo;
    }
  }
  
  // Filter by due date range
  if (filters.dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekLater = new Date(today);
    weekLater.setDate(today.getDate() + 7);
    
    const monthLater = new Date(today);
    monthLater.setMonth(today.getMonth() + 1);
    
    switch (filters.dueDate) {
      case 'today':
        query.dueDate = {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        };
        break;
      case 'week':
        query.dueDate = {
          $gte: today,
          $lt: weekLater
        };
        break;
      case 'month':
        query.dueDate = {
          $gte: today,
          $lt: monthLater
        };
        break;
      case 'overdue':
        query.dueDate = { $lt: today };
        query.status = { $ne: 'completed' };
        break;
      case 'no-date':
        query.dueDate = null;
        break;
    }
  }
  
  // Sorting
  let sort = {};
  switch (filters.sortBy) {
    case 'dueDate':
      sort = { dueDate: 1 };
      break;
    case 'dueDate-desc':
      sort = { dueDate: -1 };
      break;
    case 'priority':
      const priorityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
      // For priority sorting, we need to use aggregation
      const tasks = await Task.aggregate([
        { $match: query },
        { $addFields: { priorityOrder: { $switch: { branches: [
          { case: { $eq: ["$priority", "critical"] }, then: 1 },
          { case: { $eq: ["$priority", "high"] }, then: 2 },
          { case: { $eq: ["$priority", "medium"] }, then: 3 },
          { case: { $eq: ["$priority", "low"] }, then: 4 }
        ], default: 5 } } } },
        { $sort: { priorityOrder: 1, createdAt: -1 } }
      ]);
      return tasks;
    case 'createdAt-desc':
      sort = { createdAt: -1 };
      break;
    default:
      sort = { createdAt: -1 };
  }
  
  const tasks = await Task.find(query)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort(sort);
  
  return tasks;
};

// Get filter options for a project
exports.getFilterOptions = async (projectId) => {
  const tasks = await Task.find({ projectId });
  
  // Get unique assignees
  const assignees = new Set();
  tasks.forEach(task => {
    if (task.assignedTo) {
      assignees.add(task.assignedTo.toString());
    }
  });
  
  // Get unique labels
  const labels = new Set();
  tasks.forEach(task => {
    if (task.labels) {
      task.labels.forEach(label => labels.add(label));
    }
  });
  
  // Get date range
  const dates = tasks.filter(t => t.dueDate).map(t => t.dueDate);
  const minDueDate = dates.length > 0 ? new Date(Math.min(...dates)) : null;
  const maxDueDate = dates.length > 0 ? new Date(Math.max(...dates)) : null;
  
  return {
    assignees: Array.from(assignees),
    labels: Array.from(labels),
    dateRange: {
      min: minDueDate,
      max: maxDueDate
    }
  };
};