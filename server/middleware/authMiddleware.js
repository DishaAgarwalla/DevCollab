const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  console.log("========== AUTH MIDDLEWARE ==========");

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token received");

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token verified for user ID:", decoded.id);

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password");
      
      if (!req.user) {
        console.log("User not found");
        return res.status(401).json({ message: "User not found" });
      }

      console.log("✅ User authenticated:", req.user.email);
      console.log("====================================\n");
      next();
    } catch (error) {
      console.error("❌ Token verification error:", error.message);
      console.log("====================================\n");
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    console.log("❌ No authorization header");
    console.log("====================================\n");
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };