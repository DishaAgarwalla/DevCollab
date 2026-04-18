const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['project_created', 'user_joined', 'request_accepted', 'request_rejected', 'project_updated'],
    required: true
  },
  message: {
    type: String,
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
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project"
  },
  projectName: {
    type: String
  }
}, { timestamps: true });

// Index for faster queries
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ projectId: 1, createdAt: -1 });
activitySchema.index({ createdAt: -1 });

module.exports = mongoose.model("Activity", activitySchema);