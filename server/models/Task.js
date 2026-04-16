const mongoose = require("mongoose");

// Pre-defined label options
const labelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: "#6B7280"
  }
}, { _id: true });

const taskSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'blocked'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  dueDate: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  // NEW: Labels/Tags field
  labels: [{
    type: String,
    enum: ['bug', 'feature', 'enhancement', 'documentation', 'question', 'good-first-issue', 'help-wanted', 'duplicate', 'invalid', 'wontfix'],
    default: []
  }]
}, { timestamps: true });

// Pre-defined label configurations
const labelConfig = {
  bug: { name: 'Bug', color: '#EF4444', icon: '🐛' },
  feature: { name: 'Feature', color: '#10B981', icon: '✨' },
  enhancement: { name: 'Enhancement', color: '#3B82F6', icon: '📈' },
  documentation: { name: 'Documentation', color: '#8B5CF6', icon: '📝' },
  question: { name: 'Question', color: '#F59E0B', icon: '❓' },
  'good-first-issue': { name: 'Good First Issue', color: '#22C55E', icon: '🌟' },
  'help-wanted': { name: 'Help Wanted', color: '#EC4899', icon: '🆘' },
  duplicate: { name: 'Duplicate', color: '#6B7280', icon: '📋' },
  invalid: { name: 'Invalid', color: '#9CA3AF', icon: '❌' },
  wontfix: { name: "Won't Fix", color: '#4B5563', icon: '🚫' }
};

// Helper function to get label config
taskSchema.statics.getLabelConfig = function(label) {
  return labelConfig[label] || { name: label, color: '#6B7280', icon: '🏷️' };
};

// ADDED: Create text index for search functionality
taskSchema.index({ title: 'text', description: 'text' });

// ADDED: Create compound index for common queries
taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ projectId: 1, priority: 1 });
taskSchema.index({ projectId: 1, assignedTo: 1 });
taskSchema.index({ projectId: 1, dueDate: 1 });

module.exports = mongoose.model("Task", taskSchema);