import { useEffect, useState } from "react";
import ProjectList from "../components/ProjectList";
import { getAllProjects, browseProjects, joinProject } from "../api/projects";
import SkeletonLoader from "../components/SkeletonLoader";
import toast from 'react-hot-toast';

export default function Projects({ user }) {
  const [myProjects, setMyProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my');

  useEffect(() => {
    if (user) {
      fetchMyProjects();
    }
    fetchAllProjects();
  }, [user]);

  const fetchMyProjects = async () => {
    try {
      const data = await getAllProjects();
      setMyProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching my projects:', error);
      toast.error(error.response?.data?.message || "Failed to load your projects");
    }
  };

  const fetchAllProjects = async () => {
    try {
      const data = await browseProjects();
      setAllProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error browsing projects:', error);
      toast.error(error.response?.data?.message || "Failed to browse projects");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinProject = async (projectId) => {
    if (!user) {
      toast.error('Please login to join projects');
      return;
    }

    try {
      await joinProject(projectId);
      toast.success('Join request sent successfully!');
      fetchAllProjects();
    } catch (error) {
      console.error('Error joining project:', error);
      toast.error(error.response?.data?.message || "Failed to send join request");
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'my') {
      fetchMyProjects();
    } else {
      fetchAllProjects();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <SkeletonLoader type="project" count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage your projects or discover new ones to join
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('my')}
              className={`py-3 px-1 font-medium text-sm transition-all duration-200 ${
                activeTab === 'my'
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-b-2 hover:border-gray-300'
              }`}
            >
              My Projects ({myProjects.length})
            </button>
            <button
              onClick={() => setActiveTab('browse')}
              className={`py-3 px-1 font-medium text-sm transition-all duration-200 ${
                activeTab === 'browse'
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-b-2 hover:border-gray-300'
              }`}
            >
              Browse Projects ({allProjects.length})
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'my' && (
        <ProjectList 
          projects={myProjects} 
          user={user}
          showJoinButton={false}
        />
      )}

      {activeTab === 'browse' && (
        <ProjectList 
          projects={allProjects} 
          user={user}
          showJoinButton={true}
          onJoin={handleJoinProject}
        />
      )}
    </div>
  );
}