const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  techStack: {
    type: String,
    default: ""
  },
  rolesNeeded: {
    type: String,
    default: ""
  },
  githubRepo: {
    type: String,
    default: ""
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: []
  }],
  joinRequests: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    userName: {
      type: String
    },
    userEmail: {
      type: String
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// COMMENTED OUT - Remove the pre-save middleware for now
// projectSchema.pre('save', function(next) {
//   try {
//     if (this.isNew && this.createdBy && !this.members.includes(this.createdBy)) {
//       this.members.push(this.createdBy);
//     }
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

module.exports = mongoose.model("Project", projectSchema);
