import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiCheckAll, FiTrash2 } from 'react-icons/fi';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

export default function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'request_accepted': return '🎉';
      case 'request_rejected': return '❌';
      case 'task_assigned': return '📋';
      case 'task_updated': return '✏️';
      case 'mention': return '🔔';
      case 'new_message': return '💬';
      default: return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'request_accepted': return 'border-green-200 bg-green-50';
      case 'request_rejected': return 'border-red-200 bg-red-50';
      case 'task_assigned': return 'border-blue-200 bg-blue-50';
      case 'task_updated': return 'border-purple-200 bg-purple-50';
      case 'mention': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">Notifications</h1>
                <p className="text-primary-100 text-sm mt-1">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="bg-white text-primary-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-100 transition flex items-center gap-1"
                  >
                    <FiCheckAll size={16} />
                    Mark all read
                  </button>
                )}
                <Link
                  to="/projects"
                  className="bg-white text-primary-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-100 transition flex items-center gap-1"
                >
                  <FiArrowLeft size={16} />
                  Back
                </Link>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="divide-y">
            {notifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🔔</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
                <p className="text-gray-500">
                  When you receive notifications, they'll appear here
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification._id}
                  to={notification.actionUrl || '#'}
                  onClick={() => !notification.read && markAsRead(notification._id)}
                  className={`block p-4 hover:shadow-md transition ${getNotificationColor(notification.type)} ${!notification.read ? 'border-l-4 border-l-primary-500' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}