import API from '../services/api';

export const getActivities = async () => {
  try {
    const response = await API.get('/activities');
    return response.data;
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
};

export const createActivity = async (activityData) => {
  try {
    const response = await API.post('/activities', activityData);
    return response.data;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
};

export const getUserActivities = async (userId) => {
  try {
    const response = await API.get(`/activities/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user activities:', error);
    throw error;
  }
};

export const getProjectActivities = async (projectId) => {
  try {
    const response = await API.get(`/activities/project/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project activities:', error);
    throw error;
  }
};