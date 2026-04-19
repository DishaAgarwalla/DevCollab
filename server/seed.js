const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Project = require('./models/Project');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      autoSelectFamily: false
    });
    
    console.log('Connected to MongoDB');
    
    // Clear existing data (optional)
    await User.deleteMany({});
    await Project.deleteMany({});
    
    // Create users
    const users = [];
    const userNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
    
    for (const name of userNames) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      const user = await User.create({
        name,
        email: `${name.toLowerCase()}@example.com`,
        password: hashedPassword
      });
      users.push(user);
      console.log(`Created user: ${name}`);
    }
    
    // Create projects with various tech stacks
    const projects = [
      {
        title: 'AI-Powered Resume Builder',
        description: 'Build an intelligent resume builder using AI',
        techStack: 'React, Node.js, OpenAI, MongoDB',
        rolesNeeded: 'Frontend Developer, Backend Developer, AI Engineer',
        createdBy: users[0]._id
      },
      {
        title: 'DevCollab Platform',
        description: 'The platform you are building',
        techStack: 'React, Node.js, MongoDB, Socket.io',
        rolesNeeded: 'Full Stack Developer, UI Designer',
        createdBy: users[1]._id
      },
      {
        title: 'Task Management App',
        description: 'Collaborative task management tool',
        techStack: 'Vue.js, Express, PostgreSQL',
        rolesNeeded: 'Vue Developer, Backend Developer',
        createdBy: users[2]._id
      },
      {
        title: 'E-Learning Platform',
        description: 'Online learning platform with video courses',
        techStack: 'Next.js, TypeScript, Prisma, PostgreSQL',
        rolesNeeded: 'Frontend Developer, DevOps',
        createdBy: users[3]._id
      },
      {
        title: 'Mobile Weather App',
        description: 'Weather application with real-time updates',
        techStack: 'React Native, Node.js, GraphQL',
        rolesNeeded: 'Mobile Developer, API Developer',
        createdBy: users[4]._id
      }
    ];
    
    for (const projectData of projects) {
      await Project.create(projectData);
      console.log(`Created project: ${projectData.title}`);
    }
    
    console.log('\n✅ Seed data created successfully!');
    console.log(`📊 Created ${users.length} users`);
    console.log(`📊 Created ${projects.length} projects`);
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedData();