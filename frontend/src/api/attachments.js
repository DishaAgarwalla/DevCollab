import API from '../services/api';

// Upload attachment
export const uploadAttachment = async (taskId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', taskId);
    
    const response = await API.post('/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('[API] Error uploading attachment:', error);
    throw error;
  }
};

// Get attachments for a task
export const getAttachments = async (taskId) => {
  try {
    const response = await API.get(`/attachments/task/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('[API] Error fetching attachments:', error);
    throw error;
  }
};

// Download attachment
export const downloadAttachment = async (attachmentId) => {
  try {
    const response = await API.get(`/attachments/download/${attachmentId}`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from Content-Disposition header
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'download';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?(.+)"?/);
      if (match) filename = match[1];
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('[API] Error downloading attachment:', error);
    throw error;
  }
};

// Delete attachment
export const deleteAttachment = async (attachmentId) => {
  try {
    const response = await API.delete(`/attachments/${attachmentId}`);
    return response.data;
  } catch (error) {
    console.error('[API] Error deleting attachment:', error);
    throw error;
  }
};