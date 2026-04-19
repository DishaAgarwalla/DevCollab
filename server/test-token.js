const jwt = require('jsonwebtoken');
require('dotenv').config();

// Get a token from localStorage (you'll need to copy it from browser)
const token = "PASTE_YOUR_TOKEN_HERE"; // Copy from browser after login

console.log("Testing token verification...");
console.log("JWT_SECRET:", process.env.JWT_SECRET);

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log("✅ Token is valid!");
  console.log("Decoded:", decoded);
} catch (error) {
  console.error("❌ Token invalid:", error.message);
}