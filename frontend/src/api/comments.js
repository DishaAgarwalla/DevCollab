import API from '../services/api';

export const getComments = async (taskId) => {
  try {
    const response = await API.get(`/comments/task/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('[API] Error fetching comments:', error);
    throw error;
  }
};

export const createComment = async (commentData) => {
  try {
    const response = await API.post('/comments', commentData);
    return response.data;
  } catch (error) {
    console.error('[API] Error creating comment:', error);
    throw error;
  }
};

export const updateComment = async (commentId, commentData) => {
  try {
    const response = await API.put(`/comments/${commentId}`, commentData);
    return response.data;
  } catch (error) {
    console.error('[API] Error updating comment:', error);
    throw error;
  }
};

export const deleteComment = async (commentId) => {
  try {
    const response = await API.delete(`/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error('[API] Error deleting comment:', error);
    throw error;
  }
};