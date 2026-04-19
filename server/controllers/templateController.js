const Template = require("../models/Template");
const Project = require("../models/Project");

// Get all templates for a project
exports.getTemplates = async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log(`📋 Getting templates for project: ${projectId}`);
    
    const templates = await Template.find({ projectId })
      .sort({ usageCount: -1, createdAt: -1 });
    
    console.log(`✅ Found ${templates.length} templates`);
    res.json(templates);
  } catch (error) {
    console.error("❌ Error in getTemplates:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// Get global templates (across all projects)
exports.getGlobalTemplates = async (req, res) => {
  try {
    console.log(`📋 Getting global templates`);
    
    const templates = await Template.find({ isGlobal: true })
      .sort({ usageCount: -1, createdAt: -1 })
      .limit(20);
    
    console.log(`✅ Found ${templates.length} global templates`);
    res.json(templates);
  } catch (error) {
    console.error("❌ Error in getGlobalTemplates:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// Create a template from a task
exports.createTemplate = async (req, res) => {
  try {
    const { projectId, name, title, description, priority, labels, isGlobal } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    if (!name || !title) {
      return res.status(400).json({ message: "Template name and task title are required" });
    }
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    if (!project.members.includes(req.user._id)) {
      return res.status(403).json({ message: "You must be a project member to create templates" });
    }
    
    const template = new Template({
      projectId,
      name,
      title,
      description: description || "",
      priority: priority || "medium",
      labels: labels || [],
      createdBy: req.user._id,
      createdByName: req.user.name,
      isGlobal: isGlobal || false,
      usageCount: 0
    });
    
    await template.save();
    console.log(`✅ Template created: ${name}`);
    
    res.status(201).json(template);
  } catch (error) {
    console.error("❌ Error in createTemplate:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// Update a template
exports.updateTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { name, title, description, priority, labels, isGlobal } = req.body;
    
    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    const project = await Project.findById(template.projectId);
    const isOwner = project.createdBy.toString() === req.user._id.toString();
    const isCreator = template.createdBy.toString() === req.user._id.toString();
    
    if (!isOwner && !isCreator) {
      return res.status(403).json({ message: "You don't have permission to update this template" });
    }
    
    if (name) template.name = name;
    if (title) template.title = title;
    if (description !== undefined) template.description = description;
    if (priority) template.priority = priority;
    if (labels) template.labels = labels;
    if (isGlobal !== undefined && isOwner) template.isGlobal = isGlobal;
    
    await template.save();
    console.log(`✅ Template updated: ${template.name}`);
    
    res.json(template);
  } catch (error) {
    console.error("❌ Error in updateTemplate:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// Delete a template
exports.deleteTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    
    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    const project = await Project.findById(template.projectId);
    const isOwner = project.createdBy.toString() === req.user._id.toString();
    const isCreator = template.createdBy.toString() === req.user._id.toString();
    
    if (!isOwner && !isCreator) {
      return res.status(403).json({ message: "You don't have permission to delete this template" });
    }
    
    await template.deleteOne();
    console.log(`✅ Template deleted: ${template.name}`);
    
    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("❌ Error in deleteTemplate:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// Increment template usage count
exports.incrementUsage = async (req, res) => {
  try {
    const { templateId } = req.params;
    
    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    template.usageCount += 1;
    await template.save();
    
    res.json({ message: "Usage count updated" });
  } catch (error) {
    console.error("❌ Error in incrementUsage:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};