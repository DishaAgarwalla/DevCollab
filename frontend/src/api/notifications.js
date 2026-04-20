import API from '../services/api';

export const getNotifications = async () => {
  try {
    const response = await API.get('/notifications');
    return response.data;
  } catch (error) {
    console.error('[API] Error fetching notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await API.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('[API] Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await API.put('/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('[API] Error marking all as read:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const response = await API.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('[API] Error deleting notification:', error);
    throw error;
  }
};