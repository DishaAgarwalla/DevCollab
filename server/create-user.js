const { MongoClient } = require('mongodb');

// Connection URI with TLS options
const uri = "mongodb+srv://cluster0.xuohhhh.mongodb.net/?retryWrites=true&w=majority&tls=true&tlsAllowInvalidCertificates=true";

const client = new MongoClient(uri, {
  auth: {
    username: "admin", // Try common usernames: admin, root, mongodb
    password: "your-password-here"
  }
});

async function createUser() {
  try {
    console.log("Connecting to MongoDB Atlas with TLS...");
    await client.connect();
    console.log("✅ Connected successfully!");
    
    const admin = client.db("admin");
    
    await admin.command({
      createUser: "devcollab",
      pwd: "DevCollab123",
      roles: [
        { role: "readWriteAnyDatabase", db: "admin" },
        { role: "dbAdminAnyDatabase", db: "admin" }
      ]
    });
    
    console.log("✅ User 'devcollab' created successfully!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    
    if (error.message.includes("Authentication failed")) {
      console.log("\n🔧 The admin credentials are incorrect.");
      console.log("Try these steps:");
      console.log("1. Check your email for initial MongoDB Atlas credentials");
      console.log("2. Or reset password in Atlas: Database Access → Edit user");
    } else if (error.message.includes("SSL")) {
      console.log("\n🔧 SSL/TLS issue detected. Try:");
      console.log("1. Update Node.js to v20+");
      console.log("2. Check if your network blocks SSL (corporate firewall?)");
      console.log("3. Try connecting from a different network");
    }
  } finally {
    await client.close();
  }
}

createUser();