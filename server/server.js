require("dotenv").config(); // MUST be first

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// 🔍 DEBUG (VERY IMPORTANT)
console.log("ENV CHECK MONGO_URI:", process.env.MONGO_URI);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/activities", require("./routes/activityRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/attachments", require("./routes/attachmentRoutes"));
app.use("/api/templates", require("./routes/templateRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/user", require("./routes/userRoutes"));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "DevCollab API is running 🚀" });
});

// Socket.io
io.on("connection", (socket) => {
  console.log("🔌 New client:", socket.id);

  socket.on("join-project", (projectId) => {
    socket.join(`project_${projectId}`);
  });

  socket.on("join-user", (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Disconnected:", socket.id);
  });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is missing!");
      process.exit(1);
    }

    console.log("🔗 Connecting to MongoDB...");

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected:", conn.connection.host);
  } catch (error) {
    console.error("❌ MongoDB Error:", error.message);
    process.exit(1);
  }
};

// Start Server
const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  });
};

startServer();