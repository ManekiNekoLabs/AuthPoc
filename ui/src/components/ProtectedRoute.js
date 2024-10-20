// src/components/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const ProtectedRoute = ({ children, requireValidation }) => {
  const { isAuthenticated, isValidated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requireValidation && !isValidated) {
    return <Navigate to="/validate" replace />;
  }

  return children;
};

export default ProtectedRoute;
