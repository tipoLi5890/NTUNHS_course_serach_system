import { useAuth } from '../hook/AuthProvider.jsx';
import { Navigate } from 'react-router-dom';
import React from 'react';

// 保護路由功能(登入檢查)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/Login" replace />;
  }
  return children;
};

export default ProtectedRoute;
