import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiSave, FiUser, FiShield, FiMoon, FiSun, FiLogOut } from 'react-icons/fi';
import { getUserPreferences, updateUserPreferences } from '../api/user';
import toast from 'react-hot-toast';

export default function Settings({ user, setUser }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('appearance');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    taskAssigned: true,
    joinRequests: true,
    mentions: true,
    projectUpdates: true,
    marketingEmails: false
  });

  useEffect(() => {
    // Check for dark mode preference from localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    
    // Apply dark mode class to html element
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Fetch user preferences
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const data = await getUserPreferences();
      setPreferences(data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const handleToggle = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      toast.success('Dark mode activated 🌙');
    } else {
      document.documentElement.classList.remove('dark');
      toast.success('Light mode activated ☀️');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUserPreferences(preferences);
      toast.success('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully");
    navigate("/");
  };

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: <FiSun className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell className="w-4 h-4" /> },
    { id: 'account', label: 'Account', icon: <FiUser className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <FiShield className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences and notifications</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors duration-300">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="md:w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
              <div className="p-4 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                      activeTab === tab.id
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
                
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Appearance</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Customize how DevCollab looks</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <h3 className="font-medium text-gray-800 dark:text-white">Dark Mode</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark theme</p>
                        </div>
                        <button
                          onClick={handleDarkModeToggle}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                            darkMode 
                              ? 'bg-gray-800 text-white dark:bg-gray-700' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white'
                          }`}
                        >
                          {darkMode ? <FiMoon className="w-4 h-4" /> : <FiSun className="w-4 h-4" />}
                          {darkMode ? 'Dark Mode' : 'Light Mode'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Email Notifications</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Choose which emails you'd like to receive</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <h3 className="font-medium text-gray-800 dark:text-white">Email Notifications</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receive email notifications for important events</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.emailNotifications}
                            onChange={() => handleToggle('emailNotifications')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>

                      {preferences.emailNotifications && (
                        <>
                          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 pl-4">
                            <div>
                              <h3 className="font-medium text-gray-800 dark:text-white">Task Assignment</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">When someone assigns you a task</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={preferences.taskAssigned}
                                onChange={() => handleToggle('taskAssigned')}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 pl-4">
                            <div>
                              <h3 className="font-medium text-gray-800 dark:text-white">Join Requests</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">When someone requests to join your project</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={preferences.joinRequests}
                                onChange={() => handleToggle('joinRequests')}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 pl-4">
                            <div>
                              <h3 className="font-medium text-gray-800 dark:text-white">Mentions</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">When someone mentions you in chat</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={preferences.mentions}
                                onChange={() => handleToggle('mentions')}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 pl-4">
                            <div>
                              <h3 className="font-medium text-gray-800 dark:text-white">Project Updates</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Weekly project summaries and updates</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={preferences.projectUpdates}
                                onChange={() => handleToggle('projectUpdates')}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </label>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                    >
                      <FiSave className="w-4 h-4" />
                      {loading ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Account Information</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Your personal information</p>
                    
                    <div className="space-y-4">
                      <div className="py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                        <p className="font-medium text-gray-800 dark:text-white">{user?.name}</p>
                      </div>
                      
                      <div className="py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                        <p className="font-medium text-gray-800 dark:text-white">{user?.email}</p>
                      </div>
                      
                      <div className="py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Account Role</p>
                        <p className="font-medium text-gray-800 dark:text-white capitalize">{user?.role || 'User'}</p>
                      </div>
                      
                      <div className="py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Security</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Manage your security settings</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <h3 className="font-medium text-gray-800 dark:text-white">Change Password</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Update your password regularly</p>
                        </div>
                        <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 text-sm font-medium">
                          Change →
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <h3 className="font-medium text-gray-800 dark:text-white">Two-Factor Authentication</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
                        </div>
                        <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 text-sm font-medium">
                          Enable →
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <h3 className="font-medium text-gray-800 dark:text-white">Session Management</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Manage active sessions and devices</p>
                        </div>
                        <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 text-sm font-medium">
                          Manage →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}