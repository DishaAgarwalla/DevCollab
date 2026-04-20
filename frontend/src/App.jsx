import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { NotificationProvider } from "./context/NotificationContext";

import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import LandingPage from "./pages/LandingPage";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Projects from "./pages/Projects";
import CreateProject from "./pages/CreateProject";
import Profile from "./pages/Profile";
import TeamView from "./pages/TeamView";
import Requests from "./pages/Requests";
import Dashboard from "./pages/Dashboard";
import Activity from "./pages/Activity";
import TeamChat from "./pages/TeamChat";
import AdminPanel from "./pages/AdminPanel";
import Settings from "./pages/Settings";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for dark mode on app load
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log("App - Loading stored user:", storedUser);
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("App - Parsed user:", parsedUser);
        console.log("App - User has token:", !!parsedUser.token);
        console.log("App - User role:", parsedUser.role);
        setUser(parsedUser);
      } catch (error) {
        console.error("App - Error parsing user:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        if (e.newValue) {
          setUser(JSON.parse(e.newValue));
        } else {
          setUser(null);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <NotificationProvider user={user}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Routes>
          {/* Landing Page - No Navbar wrapper */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth Pages */}
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Pages - With Navbar */}
          <Route path="/projects" element={
            <>
              <Navbar user={user} setUser={setUser} />
              <Projects user={user} />
            </>
          } />
          
          <Route path="/settings" element={
            <PrivateRoute user={user}>
              <>
                <Navbar user={user} setUser={setUser} />
                <Settings user={user} setUser={setUser} />
              </>
            </PrivateRoute>
          } />
          
          <Route path="/admin" element={
            <PrivateRoute user={user}>
              <>
                <Navbar user={user} setUser={setUser} />
                <AdminPanel user={user} />
              </>
            </PrivateRoute>
          } />
          
          <Route path="/dashboard" element={
            <PrivateRoute user={user}>
              <>
                <Navbar user={user} setUser={setUser} />
                <Dashboard user={user} />
              </>
            </PrivateRoute>
          } />
          
          <Route path="/create-project" element={
            <PrivateRoute user={user}>
              <>
                <Navbar user={user} setUser={setUser} />
                <CreateProject user={user} setUser={setUser} />
              </>
            </PrivateRoute>
          } />
          
          <Route path="/profile" element={
            <PrivateRoute user={user}>
              <>
                <Navbar user={user} setUser={setUser} />
                <Profile user={user} setUser={setUser} />
              </>
            </PrivateRoute>
          } />
          
          <Route path="/team/:id" element={
            <PrivateRoute user={user}>
              <>
                <Navbar user={user} setUser={setUser} />
                <TeamView user={user} />
              </>
            </PrivateRoute>
          } />
          
          <Route path="/requests" element={
            <PrivateRoute user={user}>
              <>
                <Navbar user={user} setUser={setUser} />
                <Requests user={user} />
              </>
            </PrivateRoute>
          } />
          
          <Route path="/activity" element={
            <PrivateRoute user={user}>
              <>
                <Navbar user={user} setUser={setUser} />
                <Activity user={user} />
              </>
            </PrivateRoute>
          } />
          
          <Route path="/chat/:projectId" element={
            <PrivateRoute user={user}>
              <>
                <Navbar user={user} setUser={setUser} />
                <TeamChat user={user} />
              </>
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </NotificationProvider>
  );
}

export default App;