const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema({
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
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  uploadedByName: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Index for faster queries
attachmentSchema.index({ taskId: 1, createdAt: -1 });
attachmentSchema.index({ projectId: 1 });

module.exports = mongoose.model("Attachment", attachmentSchema);