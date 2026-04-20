import API from '../services/api';

export const getUserProfile = async (userId) => {
  try {
    const response = await API.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const response = await API.put('/users/profile', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserProjects = async (userId) => {
  try {
    const response = await API.get(`/users/${userId}/projects`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user notification preferences
export const getUserPreferences = async () => {
  try {
    const response = await API.get('/user/preferences');
    return response.data;
  } catch (error) {
    console.error('[API] Error fetching user preferences:', error);
    throw error;
  }
};

// Update user notification preferences
export const updateUserPreferences = async (preferences) => {
  try {
    const response = await API.put('/user/preferences', preferences);
    return response.data;
  } catch (error) {
    console.error('[API] Error updating user preferences:', error);
    throw error;
  }
};