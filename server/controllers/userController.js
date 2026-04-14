const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendWelcomeEmail } = require("../utils/emailService");

// Token expiry - 90 days
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "90d" });
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, adminSecretKey } = req.body;

    console.log("Registration attempt:", email);

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check if admin secret key matches
    const isAdmin = adminSecretKey && adminSecretKey === process.env.ADMIN_SECRET_KEY;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: isAdmin ? 'admin' : 'user'
    });

    console.log(`User created: ${user.email} with role: ${user.role}`);

    // Send welcome email
    await sendWelcomeEmail(user);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt:", email);

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log(`Login successful: ${user.email} (Role: ${user.role})`);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user preferences
// @route   GET /api/user/preferences
exports.getUserPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      emailNotifications: user.emailNotifications !== false,
      taskAssigned: user.taskAssigned !== false,
      joinRequests: user.joinRequests !== false,
      mentions: user.mentions !== false,
      projectUpdates: user.projectUpdates !== false,
      marketingEmails: user.marketingEmails || false
    });
  } catch (error) {
    console.error("Get preferences error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user preferences
// @route   PUT /api/user/preferences
exports.updateUserPreferences = async (req, res) => {
  try {
    const { emailNotifications, taskAssigned, joinRequests, mentions, projectUpdates, marketingEmails } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (emailNotifications !== undefined) user.emailNotifications = emailNotifications;
    if (taskAssigned !== undefined) user.taskAssigned = taskAssigned;
    if (joinRequests !== undefined) user.joinRequests = joinRequests;
    if (mentions !== undefined) user.mentions = mentions;
    if (projectUpdates !== undefined) user.projectUpdates = projectUpdates;
    if (marketingEmails !== undefined) user.marketingEmails = marketingEmails;
    
    await user.save();
    
    res.json({
      emailNotifications: user.emailNotifications !== false,
      taskAssigned: user.taskAssigned !== false,
      joinRequests: user.joinRequests !== false,
      mentions: user.mentions !== false,
      projectUpdates: user.projectUpdates !== false,
      marketingEmails: user.marketingEmails || false
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({ message: "Server error" });
  }
};