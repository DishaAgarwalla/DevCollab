const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  console.log('Testing MongoDB connection...');
  console.log('Using connection string:', process.env.MONGO_URI.replace(/:[^:]*@/, ':****@'));
  
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      autoSelectFamily: false,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test writing to database
    const db = mongoose.connection.db;
    const testCollection = db.collection('connection_test');
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    console.log('✅ Successfully wrote to database');
    
    // Clean up
    await testCollection.drop();
    console.log('✅ Test collection removed');
    
    await mongoose.disconnect();
    console.log('👋 Disconnected');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('Authentication failed')) {
      console.log('\n🔧 Fix: Check your username and password in MONGO_URI');
      console.log('Current username: devcollab');
      console.log('Make sure the password matches what you set in Database Access');
    } else if (error.message.includes('whitelist')) {
      console.log('\n🔧 Fix: Add your current IP to the whitelist');
      console.log('Go to Network Access in MongoDB Atlas and add your IP');
    } else if (error.message.includes('getaddrinfo')) {
      console.log('\n🔧 Fix: Check your cluster name in the connection string');
      console.log('Should be: cluster0.xuohhhh.mongodb.net');
    }
  }
};

testConnection();