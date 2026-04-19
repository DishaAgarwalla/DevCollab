const Project = require("../models/Project");
const User = require("../models/User");

exports.getStats = async (req, res) => {
  try {
    // Get total projects
    const projects = await Project.find();
    const totalProjects = projects.length;
    
    // Get unique developers (users who created projects)
    const uniqueDevelopers = new Set();
    const allTechnologies = new Set();
    
    projects.forEach(project => {
      if (project.createdBy) {
        uniqueDevelopers.add(project.createdBy.toString());
      }
      
      // Process tech stack
      if (project.techStack) {
        const techs = Array.isArray(project.techStack) 
          ? project.techStack 
          : project.techStack.split(',').map(t => t.trim());
        
        techs.forEach(tech => {
          if (tech) allTechnologies.add(tech);
        });
      }
    });
    
    // Get total registered users
    const totalUsers = await User.countDocuments();
    
    res.json({
      projects: totalProjects,
      developers: uniqueDevelopers.size || totalUsers,
      technologies: allTechnologies.size,
      totalUsers
    });
    
  } catch (error) {
    console.error("Error in getStats:", error);
    res.status(500).json({ message: "Server Error" });
  }
};