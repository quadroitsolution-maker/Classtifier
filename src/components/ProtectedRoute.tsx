import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore, UserRole } from '../store/useAppStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { isAuthenticated, user } = useAppStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    const redirectPath = user?.role === 'student' ? '/student-dashboard' : '/teacher-dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
