const Message = require("../models/Message");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Project = require("../models/Project");
const { createNotification } = require("./notificationController");
const { sendMentionEmail } = require("../utils/emailService");

// Get all messages for a project
exports.getMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log(`📋 Getting messages for project: ${projectId}`);
    
    const messages = await Message.find({ projectId })
      .sort({ createdAt: 1 })
      .limit(100);
    
    console.log(`✅ Found ${messages.length} messages`);
    res.json(messages);
  } catch (error) {
    console.error("❌ Error in getMessages:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// Create a new message - WITH MENTION NOTIFICATIONS AND EMAILS
exports.createMessage = async (req, res) => {
  try {
    const { projectId, content } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Message content is required" });
    }
    
    const message = new Message({
      projectId,
      userId: req.user._id,
      userName: req.user.name,
      content: content.trim()
    });
    
    await message.save();
    console.log(`✅ Message saved for project: ${projectId}`);
    
    // 🔔 NOTIFICATION & EMAIL: Check for @mentions
    const mentionRegex = /@(\w+)/g;
    const mentions = content.match(mentionRegex);
    
    if (mentions) {
      const project = await Project.findById(projectId).populate('members', 'name email');
      const mentionedNames = mentions.map(m => m.substring(1)); // Remove @ symbol
      
      for (const member of project.members) {
        if (mentionedNames.includes(member.name) && member._id.toString() !== req.user._id.toString()) {
          // Create in-app notification
          await createNotification({
            userId: member._id,
            type: 'mention',
            title: 'You were mentioned 🔔',
            message: `${req.user.name} mentioned you in project "${project.title}": "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`,
            relatedId: projectId,
            relatedModel: 'Project',
            actionUrl: `/chat/${projectId}`,
            metadata: {
              projectId: projectId,
              projectName: project.title,
              messageId: message._id,
              messagePreview: content.substring(0, 100),
              mentionedBy: req.user.name,
              fullContent: content
            }
          });
          
          // Send email notification for mention
          const mentionedUser = await User.findById(member._id);
          if (mentionedUser && mentionedUser.email) {
            await sendMentionEmail(mentionedUser, project, content, req.user.name);
          }
        }
      }
    }
    
    res.status(201).json(message);
  } catch (error) {
    console.error("❌ Error in createMessage:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};