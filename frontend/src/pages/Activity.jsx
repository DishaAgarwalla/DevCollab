import { useEffect, useState } from "react";
import { FiUser, FiFolder, FiCheck, FiX, FiClock } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { getActivities } from '../api/activities';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function Activity({ user }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchActivities();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching activities for user:", user?.email);
      const data = await getActivities();
      setActivities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to load activities');
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'project_created': return <FiFolder className="text-blue-500" />;
      case 'user_joined': return <FiUser className="text-green-500" />;
      case 'request_accepted': return <FiCheck className="text-green-500" />;
      case 'request_rejected': return <FiX className="text-red-500" />;
      default: return <FiClock className="text-gray-500" />;
    }
  };

  const getActivityColor = (type) => {
    switch(type) {
      case 'project_created': return 'bg-blue-100 dark:bg-blue-900/30';
      case 'user_joined': return 'bg-green-100 dark:bg-green-900/30';
      case 'request_accepted': return 'bg-green-100 dark:bg-green-900/30';
      case 'request_rejected': return 'bg-red-100 dark:bg-red-900/30';
      default: return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-gray-800 dark:to-gray-900 px-6 py-8">
            <h1 className="text-3xl font-bold text-white">Activity Feed</h1>
            <p className="text-primary-100 dark:text-gray-300 mt-2">
              Stay updated with what's happening in your network
            </p>
          </div>

          <div className="p-6">
            {error ? (
              <div className="text-center py-12">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                  <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                  <button
                    onClick={fetchActivities}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12">
                <FiClock className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No activities yet</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  When you and others create projects and collaborate, they'll appear here
                </p>
                <Link
                  to="/projects"
                  className="inline-block mt-6 text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium"
                >
                  Explore Projects →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div 
                    key={activity._id}
                    className={`flex items-start space-x-4 p-4 rounded-lg border hover:shadow-md transition ${getActivityColor(activity.type)}`}
                  >
                    <div className="bg-white dark:bg-gray-700 rounded-full p-3 shadow-sm">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 dark:text-gray-200">
                        <span className="font-semibold">{activity.userName}</span> {activity.message}
                      </p>
                      {activity.projectName && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Project: {activity.projectName}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}