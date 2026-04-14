const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },
    password: { 
      type: String, 
      required: true 
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user'
    },
    // Notification preferences
    emailNotifications: { type: Boolean, default: true },
    taskAssigned: { type: Boolean, default: true },
    joinRequests: { type: Boolean, default: true },
    mentions: { type: Boolean, default: true },
    projectUpdates: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false },
    // Profile fields
    skills: { 
      type: String, 
      default: "" 
    },
    github: { 
      type: String, 
      default: "" 
    },
    linkedin: { 
      type: String, 
      default: "" 
    },
    bio: { 
      type: String, 
      default: "" 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
