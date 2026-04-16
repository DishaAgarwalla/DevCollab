const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Middleware - ORDER MATTERS!
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const activityRoutes = require("./routes/activityRoutes");
const chatRoutes = require("./routes/chatRoutes");
const taskRoutes = require("./routes/taskRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const commentRoutes = require("./routes/commentRoutes");
const attachmentRoutes = require("./routes/attachmentRoutes");
const templateRoutes = require("./routes/templateRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes"); // ADDED

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes); // ADDED

// Test route
app.get("/", (req, res) => {
  res.json({ message: "DevCollab API is running" });
});

// Socket.io for real-time chat and notifications
io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);
  
  socket.on("join-project", (projectId) => {
    socket.join(`project_${projectId}`);
    console.log(`📢 Socket ${socket.id} joined project_${projectId}`);
  });
  
  socket.on("join-user", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`📢 Socket ${socket.id} joined user_${userId}`);
  });
  
  socket.on("send-message", async (messageData) => {
    try {
      console.log("📨 Message received:", messageData);
      
      const Message = require("./models/Message");
      const newMessage = new Message({
        projectId: messageData.projectId,
        userId: messageData.userId,
        userName: messageData.userName,
        content: messageData.content
      });
      
      await newMessage.save();
      console.log("✅ Message saved to database");
      
      const mentionRegex = /@(\w+)/g;
      const mentions = messageData.content.match(mentionRegex);
      
      if (mentions) {
        const Project = require("./models/Project");
        const { createNotification } = require("./controllers/notificationController");
        const project = await Project.findById(messageData.projectId).populate('members', 'name email');
        const mentionedNames = mentions.map(m => m.substring(1));
        
        for (const member of project.members) {
          if (mentionedNames.includes(member.name) && member._id.toString() !== messageData.userId) {
            await createNotification({
              userId: member._id,
              type: 'mention',
              title: 'You were mentioned',
              message: `${messageData.userName} mentioned you in project "${project.title}": "${messageData.content.substring(0, 100)}${messageData.content.length > 100 ? '...' : ''}"`,
              relatedId: messageData.projectId,
              relatedModel: 'Project',
              actionUrl: `/chat/${messageData.projectId}`,
              metadata: {
                projectId: messageData.projectId,
                projectName: project.title,
                messageId: newMessage._id,
                messagePreview: messageData.content.substring(0, 100),
                mentionedBy: messageData.userName
              }
            });
            
            io.to(`user_${member._id}`).emit("new-notification", {
              type: 'mention',
              title: 'You were mentioned',
              message: `${messageData.userName} mentioned you in ${project.title}`
            });
          }
        }
      }
      
      io.to(`project_${messageData.projectId}`).emit("new-message", newMessage);
    } catch (error) {
      console.error("❌ Error saving message:", error);
    }
  });
  
  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    console.log("Attempting to connect to MongoDB...");
    const safeUri = process.env.MONGO_URI.replace(/:([^:@]{3})[^@]*@/, ':***@');
    console.log("Connection string:", safeUri);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      autoSelectFamily: false,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`📦 Mongoose version: ${mongoose.version}`);
    
    return conn;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:");
    console.error("Error message:", error.message);
    process.exit(1);
  }
};

// TEMPORARY TEST ROUTE - Remove after debugging
app.get("/api/test-auth", async (req, res) => {
  console.log("Test auth route hit");
  console.log("Headers:", req.headers);
  
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No auth header" });
  }
  
  const token = authHeader.split(' ')[1];
  console.log("Token received:", token);
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    
    const User = require('./models/User');
    const user = await User.findById(decoded.id).select('-password');
    res.json({ message: "Auth working!", user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    console.error("Token verification failed:", error.message);
    res.status(401).json({ message: "Invalid token", error: error.message });
  }
});

// Start server after DB connection
const startServer = async () => {
  await connectDB();
  
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 API available at http://localhost:${PORT}/api`);
    console.log(`🔌 Socket.io ready for real-time chat`);
    console.log(`📋 Task routes loaded`);
    console.log(`🔔 Notification routes loaded`);
    console.log(`💬 Comment routes loaded`);
    console.log(`📎 Attachment routes loaded`);
    console.log(`📊 Export routes loaded`);
    console.log(`📋 Template routes loaded`);
    console.log(`🔍 Search & Filter routes loaded`);
    console.log(`👑 Admin routes loaded`);
    console.log(`👤 User preferences routes loaded`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  });
};

startServer();