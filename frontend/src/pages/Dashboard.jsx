import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserProjects } from "../api/user";
import { getJoinRequests } from "../api/projects";
import { FiFolder, FiUsers, FiMessageCircle, FiActivity } from 'react-icons/fi';
import ProjectCard from "../components/ProjectCard";

export default function Dashboard({ user }) {
  const [userProjects, setUserProjects] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [projects, requests] = await Promise.all([
        getUserProjects(user._id),
        getJoinRequests()
      ]);
      setUserProjects(projects);
      setPendingRequests(requests.length);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Your Projects",
      value: userProjects.length,
      icon: <FiFolder className="w-6 h-6" />,
      color: "bg-blue-500",
      link: "/profile"
    },
    {
      title: "Pending Requests",
      value: pendingRequests,
      icon: <FiUsers className="w-6 h-6" />,
      color: "bg-green-500",
      link: "/requests"
    },
    {
      title: "Active Chats",
      value: "3",
      icon: <FiMessageCircle className="w-6 h-6" />,
      color: "bg-purple-500",
      link: "#"
    },
    {
      title: "Activity Feed",
      value: "12",
      icon: <FiActivity className="w-6 h-6" />,
      color: "bg-orange-500",
      link: "/activity"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Here's what's happening with your projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Link
              key={index}
              to={stat.link}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} text-white p-3 rounded-lg`}>
                  {stat.icon}
                </div>
                <span className="text-3xl font-bold text-gray-800 dark:text-white">{stat.value}</span>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 font-medium">{stat.title}</h3>
            </Link>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Your Recent Projects</h2>
            <Link to="/create-project" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
              Create New Project
            </Link>
          </div>

          {userProjects.length === 0 ? (
            <div className="text-center py-12">
              <FiFolder className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Create your first project to start collaborating
              </p>
              <Link to="/create-project" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
                Create Project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProjects.slice(0, 3).map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          )}

          {userProjects.length > 3 && (
            <div className="text-center mt-6">
              <Link to="/profile" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium">
                View all projects →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}