import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const UserProtectedRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(null); // null = checking, true = authorized, false = unauthorized

  useEffect(() => {
    const checkAuthorization = () => {
      const token = localStorage.getItem("token");
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      if (!token || !userInfo) {
        setIsAuthorized(false);
        return;
      }

      // If user has valid token and userInfo, they are authorized
      setIsAuthorized(true);
    };

    checkAuthorization();
  }, []);

  // Show loading while checking authorization
  if (isAuthorized === null) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px'
      }}>
        Đang kiểm tra đăng nhập...
      </div>
    );
  }

  // Redirect to login page if not authorized
  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  // Render the protected component if authorized
  return children;
};

export default UserProtectedRoute;
