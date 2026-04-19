const mongoose = require("mongoose");
const Project = require("./models/Project");
require("dotenv").config();

const migrateProjects = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      autoSelectFamily: false
    });
    
    console.log("Connected to MongoDB");
    
    // Get all projects directly from MongoDB to bypass Mongoose validation
    const db = mongoose.connection.db;
    const projectsCollection = db.collection('projects');
    const projects = await projectsCollection.find({}).toArray();
    console.log(`Found ${projects.length} projects`);
    
    let updatedCount = 0;
    
    for (const project of projects) {
      let updateFields = {};
      let needsUpdate = false;
      
      // Fix techStack: convert array to string if needed
      if (Array.isArray(project.techStack)) {
        updateFields.techStack = project.techStack.join(', ');
        needsUpdate = true;
        console.log(`  - Converting techStack array to string for: ${project.title}`);
      }
      
      // Fix rolesNeeded: convert array to string if needed
      if (Array.isArray(project.rolesNeeded)) {
        updateFields.rolesNeeded = project.rolesNeeded.join(', ');
        needsUpdate = true;
        console.log(`  - Converting rolesNeeded array to string for: ${project.title}`);
      }
      
      // Add members array if missing
      if (!project.members) {
        updateFields.members = [project.createdBy];
        needsUpdate = true;
        console.log(`  - Adding members array for: ${project.title}`);
      } else if (project.createdBy && !project.members.includes(project.createdBy.toString())) {
        updateFields.members = [...project.members, project.createdBy];
        needsUpdate = true;
        console.log(`  - Adding creator to members for: ${project.title}`);
      }
      
      // Migrate old joinRequests format
      if (project.joinRequests && project.joinRequests.length > 0) {
        // Check if it's old format (array of ObjectIds)
        const firstRequest = project.joinRequests[0];
        if (firstRequest && typeof firstRequest === 'object' && !firstRequest.userId) {
          // Old format - just IDs
          const convertedRequests = project.joinRequests.map(req => ({
            userId: req,
            userName: 'Unknown',
            userEmail: '',
            status: 'pending',
            requestedAt: new Date()
          }));
          updateFields.joinRequests = convertedRequests;
          needsUpdate = true;
          console.log(`  - Migrating joinRequests for: ${project.title}`);
        } else if (firstRequest && firstRequest.userId) {
          // New format already, but ensure status field exists
          const needsStatusFix = project.joinRequests.some(req => !req.status);
          if (needsStatusFix) {
            const fixedRequests = project.joinRequests.map(req => ({
              ...req,
              status: req.status || 'pending',
              userName: req.userName || 'Unknown'
            }));
            updateFields.joinRequests = fixedRequests;
            needsUpdate = true;
            console.log(`  - Fixing joinRequests status for: ${project.title}`);
          }
        }
      } else if (!project.joinRequests) {
        updateFields.joinRequests = [];
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await projectsCollection.updateOne(
          { _id: project._id },
          { $set: updateFields }
        );
        updatedCount++;
        console.log(`✅ Updated: ${project.title}`);
      }
    }
    
    console.log(`\n✅ Migration complete! Updated ${updatedCount} projects`);
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
};

migrateProjects();