import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProjectById, joinProject } from "../api/projects";
import { FiUsers, FiCode, FiGithub, FiMessageCircle, FiUser, FiCalendar, FiArrowLeft, FiCheck, FiCheckSquare } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Tasks from "./Tasks";

export default function TeamView({ user }) {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching project with ID:", id);
      const data = await getProjectById(id);
      console.log("Project data:", data);
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      if (error.response?.status === 404) {
        setError("Project not found. It may have been deleted.");
      } else if (error.response?.status === 400) {
        setError("Invalid project ID format.");
      } else {
        setError(error.response?.data?.message || "Failed to load project details");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinProject = async () => {
    if (!user) {
      toast.error('Please login to join this project');
      return;
    }

    setJoining(true);
    try {
      await joinProject(id);
      toast.success('Join request sent successfully! The project owner will review your request.');
      fetchProject();
    } catch (error) {
      console.error('Error joining project:', error);
      toast.error(error.response?.data?.message || "Failed to send join request");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Project Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <Link 
              to="/projects"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              <FiArrowLeft />
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const techStack = Array.isArray(project.techStack) 
    ? project.techStack 
    : project.techStack?.split(',').map(t => t.trim()) || [];

  const isOwner = user && project.createdBy?._id === user._id;
  const hasJoined = user && project.members?.some(member => member._id === user._id);
  const hasRequested = user && project.joinRequests?.some(req => req.userId?._id === user._id || req.userId === user._id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          to="/projects" 
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-6"
        >
          <FiArrowLeft />
          Back to Projects
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-gray-800 dark:to-gray-900 px-6 py-8">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
                <div className="flex items-center text-primary-100 dark:text-gray-300 space-x-4">
                  <span className="flex items-center gap-1">
                    <FiCalendar />
                    {format(new Date(project.createdAt), 'MMM dd, yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiUser />
                    {project.createdBy?.name || 'Unknown'}
                  </span>
                </div>
              </div>
              
              {!isOwner && !hasJoined && !hasRequested && (
                <button
                  onClick={handleJoinProject}
                  disabled={joining}
                  className="bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-400 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-600 transition disabled:opacity-50"
                >
                  {joining ? 'Sending Request...' : 'Request to Join'}
                </button>
              )}
              
              {hasRequested && !hasJoined && (
                <span className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
                  <FiCheck />
                  Request Pending
                </span>
              )}
              
              {hasJoined && (
                <span className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
                  <FiCheck />
                  Team Member
                </span>
              )}
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 px-6">
            <nav className="flex gap-6">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-3 px-1 font-medium text-sm transition ${
                  activeTab === 'details'
                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('team')}
                className={`py-3 px-1 font-medium text-sm transition flex items-center gap-1 ${
                  activeTab === 'team'
                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <FiUsers size={14} />
                Team Members
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-3 px-1 font-medium text-sm transition flex items-center gap-1 ${
                  activeTab === 'tasks'
                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <FiCheckSquare size={14} />
                Tasks
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'details' && (
              <>
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
                  {project.description}
                </p>

                {techStack.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                      <FiCode className="text-primary-600 dark:text-primary-400" />
                      Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {techStack.map((tech, index) => (
                        <span 
                          key={index}
                          className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {project.githubRepo && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                      <FiGithub className="text-primary-600 dark:text-primary-400" />
                      Repository
                    </h3>
                    <a 
                      href={project.githubRepo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 underline break-all"
                    >
                      {project.githubRepo}
                    </a>
                  </div>
                )}

                {project.rolesNeeded && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                      <FiUsers className="text-primary-600 dark:text-primary-400" />
                      Looking For
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">{project.rolesNeeded}</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'team' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <FiUsers className="text-primary-600 dark:text-primary-400" />
                  Team Members ({project.members?.length || 0})
                </h2>

                {project.members && project.members.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.members.map((member) => (
                      <div key={member._id} className="border rounded-lg p-4 flex items-center space-x-3">
                        <div className="bg-primary-100 dark:bg-primary-900/30 rounded-full p-3">
                          <FiUser className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white">{member.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                          {project.createdBy?._id === member._id && (
                            <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">Project Owner</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">No team members yet</p>
                )}

                {hasJoined && (
                  <div className="mt-6 pt-6 border-t">
                    <Link
                      to={`/chat/${project._id}`}
                      className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
                    >
                      <FiMessageCircle />
                      Team Chat
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tasks' && (
              <Tasks 
                projectId={project._id} 
                projectMembers={project.members || []}
                user={user}
                projectTitle={project.title}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}