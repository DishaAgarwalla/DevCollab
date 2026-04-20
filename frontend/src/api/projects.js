import API from '../services/api';

export const createProject = async (projectData) => {
  try {
    console.log('[API] Creating project with data:', projectData);
    const response = await API.post('/projects/create', projectData);
    console.log('[API] Create project response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] Create project error:', error.response || error);
    throw error;
  }
};

// Get my projects (projects user is a member of)
export const getAllProjects = async () => {
  try {
    console.log('[API] Fetching my projects...');
    const response = await API.get('/projects');
    console.log('[API] My projects fetched:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('[API] Error fetching my projects:', error);
    throw error;
  }
};

// Browse all public projects (for requesting to join)
export const browseProjects = async () => {
  try {
    console.log('[API] Browsing all projects...');
    const response = await API.get('/projects/browse');
    console.log('[API] Browse projects fetched:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('[API] Error browsing projects:', error);
    throw error;
  }
};

export const getProjectById = async (id) => {
  try {
    const response = await API.get(`/projects/${id}`);
    return response.data;
  } catch (error) {
    console.error('[API] Error fetching project:', error);
    throw error;
  }
};

export const joinProject = async (projectId) => {
  try {
    const response = await API.post('/projects/join', { projectId });
    return response.data;
  } catch (error) {
    console.error('[API] Error joining project:', error);
    throw error;
  }
};

export const getJoinRequests = async () => {
  try {
    const response = await API.get('/projects/requests');
    return response.data;
  } catch (error) {
    console.error('[API] Error fetching join requests:', error);
    throw error;
  }
};

export const handleJoinRequest = async (requestId, action) => {
  try {
    const response = await API.post('/projects/approve', { requestId, action });
    return response.data;
  } catch (error) {
    console.error('[API] Error handling join request:', error);
    throw error;
  }
};