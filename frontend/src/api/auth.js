import API from '../services/api';

export const loginUser = async (data) => {
  try {
    const response = await API.post('/auth/login', data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (data) => {
  try {
    const response = await API.post('/auth/register', data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await API.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};