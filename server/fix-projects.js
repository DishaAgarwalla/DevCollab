const mongoose = require("mongoose");
const Project = require("./models/Project");
require("dotenv").config();

const fixProjects = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      autoSelectFamily: false,
    });
    
    console.log("Connected to MongoDB");
    
    // Get all projects
    const projects = await Project.find();
    console.log(`Found ${projects.length} projects`);
    
    let fixedCount = 0;
    
    for (const project of projects) {
      let needsUpdate = false;
      
      // Fix members array - ensure it's an array of ObjectIds
      if (!project.members || project.members.length === 0) {
        if (project.createdBy) {
          project.members = [project.createdBy];
          needsUpdate = true;
          console.log(`✅ Fixed members for project: ${project.title}`);
        }
      } else {
        // Convert string members to ObjectId if needed
        const fixedMembers = project.members.map(m => {
          if (typeof m === 'string') {
            return new mongoose.Types.ObjectId(m);
          }
          return m;
        });
        project.members = fixedMembers;
        needsUpdate = true;
      }
      
      // Ensure createdBy is an ObjectId
      if (project.createdBy && typeof project.createdBy === 'string') {
        project.createdBy = new mongoose.Types.ObjectId(project.createdBy);
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await project.save();
        fixedCount++;
        console.log(`✅ Updated project: ${project.title}`);
      }
    }
    
    console.log(`\n✅ Migration complete! Fixed ${fixedCount} projects`);
    await mongoose.disconnect();
    
  } catch (error) {
    console.error("Migration error:", error);
  }
};

fixProjects();