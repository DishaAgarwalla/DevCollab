import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children, user }) {
  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }
  
  // If user is logged in, show the protected component
  return children;
}