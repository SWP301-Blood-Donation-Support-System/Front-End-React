import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import { checkIfDefaultPassword, hasAdminAccess, isStaffUser } from '../utils/passwordUtils';

const AdminProtectedRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(null); // null = checking, true = authorized, false = unauthorized
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuthorization = () => {
      const token = localStorage.getItem("token");
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      if (!token || !userInfo) {
        setIsAuthorized(false);
        return;
      }

      // Check if user has admin or staff privileges
      if (hasAdminAccess()) {
        // Check if staff user still has default password
        const hasDefaultPassword = checkIfDefaultPassword();
        
        // If they have default password and are not already on settings page, redirect them
        if (hasDefaultPassword && !location.pathname.includes('/staff/settings')) {
          setNeedsPasswordChange(true);
          setIsAuthorized(false); // Don't authorize other pages
          return;
        }
        
        setIsAuthorized(true);
        setNeedsPasswordChange(false);
      } else {
        setIsAuthorized(false);
        message.error('Bạn không có quyền truy cập vào trang này');
      }
    };

    checkAuthorization();
  }, [location.pathname]);

  // Show loading while checking authorization
  if (isAuthorized === null && !needsPasswordChange) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px'
      }}>
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  // Redirect to settings page if staff needs to change default password
  if (needsPasswordChange) {
    return <Navigate to="/staff/settings" replace state={{ forcePasswordChange: true }} />;
  }

  // Redirect to homepage if not authorized
  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  // Render the protected component if authorized
  return children;
};

export default AdminProtectedRoute; 