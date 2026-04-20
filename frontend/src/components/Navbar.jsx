import { Link, useNavigate } from "react-router-dom";
import { FiLogOut, FiUser, FiPlusCircle, FiHome, FiActivity, FiBell, FiShield, FiSettings } from 'react-icons/fi';
import toast from 'react-hot-toast';
import NotificationBell from './NotificationBell';

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <nav className="bg-gradient-to-r from-primary-700 to-primary-900 dark:from-gray-900 dark:to-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-400 px-3 py-1 rounded-lg">
              DC
            </span>
            <span className="font-semibold text-xl hidden sm:block">DevCollab</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1 md:space-x-4">
            <Link 
              to="/" 
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600 dark:hover:bg-gray-700 transition flex items-center gap-1"
            >
              <FiHome className="text-lg" />
              <span className="hidden md:inline">Home</span>
            </Link>

            <Link 
              to="/projects" 
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600 dark:hover:bg-gray-700 transition"
            >
              Projects
            </Link>

            {user && (
              <>
                <Link 
                  to="/activity" 
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600 dark:hover:bg-gray-700 transition flex items-center gap-1"
                >
                  <FiActivity className="text-lg" />
                  <span className="hidden md:inline">Activity</span>
                </Link>

                <Link 
                  to="/requests" 
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600 dark:hover:bg-gray-700 transition flex items-center gap-1"
                >
                  <FiBell className="text-lg" />
                  <span className="hidden md:inline">Requests</span>
                </Link>

                <NotificationBell />

                <Link 
                  to="/settings" 
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600 dark:hover:bg-gray-700 transition flex items-center gap-1"
                >
                  <FiSettings className="text-lg" />
                  <span className="hidden md:inline">Settings</span>
                </Link>

                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="px-3 py-2 rounded-md text-sm font-medium bg-purple-600 hover:bg-purple-500 dark:bg-purple-800 dark:hover:bg-purple-700 transition flex items-center gap-1"
                  >
                    <FiShield className="text-lg" />
                    <span className="hidden md:inline">Admin</span>
                  </Link>
                )}

                <Link 
                  to="/create-project" 
                  className="px-3 py-2 rounded-md text-sm font-medium bg-primary-500 hover:bg-primary-400 dark:bg-primary-700 dark:hover:bg-primary-600 transition flex items-center gap-1"
                >
                  <FiPlusCircle />
                  <span className="hidden md:inline">Post</span>
                </Link>

                <Link 
                  to="/profile" 
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600 dark:hover:bg-gray-700 transition flex items-center gap-1"
                >
                  <FiUser />
                  <span className="hidden md:inline">{user.name?.split(' ')[0]}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600 dark:hover:bg-red-700 transition flex items-center gap-1"
                >
                  <FiLogOut />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            )}

            {!user && (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="px-4 py-2 rounded-md text-sm font-medium bg-primary-500 hover:bg-primary-400 dark:bg-primary-700 dark:hover:bg-primary-600 transition"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 rounded-md text-sm font-medium bg-white text-primary-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}