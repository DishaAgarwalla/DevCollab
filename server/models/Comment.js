const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  mentions: [{
    type: String
  }]
}, { timestamps: true });

// Index for faster queries
commentSchema.index({ taskId: 1, createdAt: -1 });
commentSchema.index({ projectId: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);