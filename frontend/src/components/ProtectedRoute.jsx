import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');

  // If there is no token, send them back to the login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If there is a token, let them see the page
  return children;
};

export default ProtectedRoute;