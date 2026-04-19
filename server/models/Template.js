const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  labels: [{
    type: String,
    enum: ['bug', 'feature', 'enhancement', 'documentation', 'question', 'good-first-issue', 'help-wanted', 'duplicate', 'invalid', 'wontfix'],
    default: []
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdByName: {
    type: String,
    required: true
  },
  isGlobal: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Index for faster queries
templateSchema.index({ projectId: 1, createdAt: -1 });
templateSchema.index({ name: 'text', title: 'text', description: 'text' });

module.exports = mongoose.model("Template", templateSchema);