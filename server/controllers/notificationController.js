const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendWelcomeEmail, sendJoinRequestEmail, sendRequestAcceptedEmail, sendTaskAssignedEmail, sendMentionEmail } = require("../utils/emailService");

// Get user's notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    const unreadCount = await Notification.countDocuments({ 
      userId: req.user._id, 
      read: false 
    });
    
    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error("❌ Error in getNotifications:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: req.user._id },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    res.json(notification);
  } catch (error) {
    console.error("❌ Error in markAsRead:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );
    
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("❌ Error in markAllAsRead:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId: req.user._id
    });
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("❌ Error in deleteNotification:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Create notification helper
exports.createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    console.log(`✅ Notification created for user: ${notificationData.userId}`);
    
    // Get user's email preferences (if you have a preferences system)
    const user = await User.findById(notificationData.userId);
    
    // Send email based on notification type (if user has email notifications enabled)
    if (user && user.emailNotifications !== false) {
      switch (notificationData.type) {
        case 'task_assigned':
          // Email is already sent from taskController
          break;
        case 'mention':
          // Email is already sent from chatController
          break;
        case 'request_accepted':
          // Email is already sent from projectController
          break;
        case 'request_rejected':
          // Optional: send rejection email
          break;
        default:
          break;
      }
    }
    
    return notification;
  } catch (error) {
    console.error("❌ Error creating notification:", error);
    return null;
  }
};