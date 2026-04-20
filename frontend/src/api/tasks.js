import API from '../services/api';

export const getTasks = async (projectId, query = '') => {
  try {
    const response = await API.get(`/tasks/${projectId}${query ? `?${query}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('[API] Error fetching tasks:', error);
    throw error;
  }
};

export const getTaskStats = async (projectId) => {
  try {
    const response = await API.get(`/tasks/${projectId}/stats`);
    return response.data;
  } catch (error) {
    console.error('[API] Error fetching task stats:', error);
    throw error;
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await API.post('/tasks', taskData);
    return response.data;
  } catch (error) {
    console.error('[API] Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (taskId, taskData) => {
  try {
    const response = await API.put(`/tasks/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    console.error('[API] Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (taskId) => {
  try {
    const response = await API.delete(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('[API] Error deleting task:', error);
    throw error;
  }
};

// ========== EXPORT FUNCTIONS ==========

// Export tasks as CSV
export const exportTasksCSV = async (projectId) => {
  try {
    const response = await API.get(`/tasks/${projectId}/export/csv`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    return url;
  } catch (error) {
    console.error('[API] Error exporting tasks as CSV:', error);
    throw error;
  }
};

// Export tasks as JSON
export const exportTasksJSON = async (projectId) => {
  try {
    const response = await API.get(`/tasks/${projectId}/export/json`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    return url;
  } catch (error) {
    console.error('[API] Error exporting tasks as JSON:', error);
    throw error;
  }
};

// ========== FILTER OPTIONS ==========

// Get filter options for a project (assignees, labels, date range)
export const getFilterOptions = async (projectId) => {
  try {
    const response = await API.get(`/tasks/${projectId}/filters`);
    return response.data;
  } catch (error) {
    console.error('[API] Error fetching filter options:', error);
    throw error;
  }
};