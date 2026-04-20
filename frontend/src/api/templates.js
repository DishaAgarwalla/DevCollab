import API from '../services/api';

// Get all templates for a project
export const getTemplates = async (projectId) => {
  try {
    const response = await API.get(`/templates/project/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('[API] Error fetching templates:', error);
    throw error;
  }
};

// Get global templates
export const getGlobalTemplates = async () => {
  try {
    const response = await API.get('/templates/global');
    return response.data;
  } catch (error) {
    console.error('[API] Error fetching global templates:', error);
    throw error;
  }
};

// Create a template from a task
export const createTemplate = async (templateData) => {
  try {
    const response = await API.post('/templates', templateData);
    return response.data;
  } catch (error) {
    console.error('[API] Error creating template:', error);
    throw error;
  }
};

// Update a template
export const updateTemplate = async (templateId, templateData) => {
  try {
    const response = await API.put(`/templates/${templateId}`, templateData);
    return response.data;
  } catch (error) {
    console.error('[API] Error updating template:', error);
    throw error;
  }
};

// Delete a template
export const deleteTemplate = async (templateId) => {
  try {
    const response = await API.delete(`/templates/${templateId}`);
    return response.data;
  } catch (error) {
    console.error('[API] Error deleting template:', error);
    throw error;
  }
};

// Create a task from a template
export const createTaskFromTemplate = async (templateId, projectId) => {
  try {
    const response = await API.post(`/templates/${templateId}/use`, { projectId });
    return response.data;
  } catch (error) {
    console.error('[API] Error creating task from template:', error);
    throw error;
  }
};

// Increment template usage count
export const incrementTemplateUsage = async (templateId) => {
  try {
    const response = await API.post(`/templates/${templateId}/use`);
    return response.data;
  } catch (error) {
    console.error('[API] Error incrementing template usage:', error);
    throw error;
  }
};