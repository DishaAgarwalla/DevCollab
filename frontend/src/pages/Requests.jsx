import { useEffect, useState } from "react";
import { getJoinRequests, handleJoinRequest } from "../api/projects";
import { FiCheck, FiX, FiUser, FiClock } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function Requests({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getJoinRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId, action) => {
    setProcessing(prev => ({ ...prev, [requestId]: true }));
    try {
      await handleJoinRequest(requestId, action);
      toast.success(`Request ${action} successfully!`);
      fetchRequests();
    } catch (error) {
      console.error('Error handling request:', error);
      toast.error(error.response?.data?.message || "Failed to handle request");
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-gray-800 dark:to-gray-900 px-6 py-8">
            <h1 className="text-3xl font-bold text-white">Join Requests</h1>
            <p className="text-primary-100 dark:text-gray-300 mt-2">
              Manage requests from developers who want to join your projects
            </p>
          </div>

          <div className="p-6">
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <FiUser className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No pending requests</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  When developers request to join your projects, they'll appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div 
                    key={request._id}
                    className="border rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary-100 dark:bg-primary-900/30 rounded-full p-3">
                          <FiUser className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {request.userName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            wants to join <span className="font-medium">{request.projectTitle}</span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1">
                            <FiClock className="text-xs" />
                            Requested {formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAction(request._id, 'accepted')}
                          disabled={processing[request._id]}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50 flex items-center gap-2"
                        >
                          <FiCheck />
                          Accept
                        </button>
                        <button
                          onClick={() => handleAction(request._id, 'rejected')}
                          disabled={processing[request._id]}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-50 flex items-center gap-2"
                        >
                          <FiX />
                          Reject
                        </button>
                      </div>
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