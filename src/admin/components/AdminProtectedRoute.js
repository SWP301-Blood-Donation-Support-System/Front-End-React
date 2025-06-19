import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { message } from 'antd';

const AdminProtectedRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(null); // null = checking, true = authorized, false = unauthorized

  useEffect(() => {
    const checkAuthorization = () => {
      const token = localStorage.getItem("token");
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      if (!token || !userInfo) {
        setIsAuthorized(false);
        return;
      }

      // Check if user has roleId 1 or 2 (admin/staff)
      const userRoleId = userInfo.RoleID || userInfo.roleId;
      const isAdmin = userRoleId === 1 || userRoleId === 2 || userRoleId === "1" || userRoleId === "2";

      if (isAdmin) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        message.error('Bạn không có quyền truy cập vào trang này');
      }
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
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  // Redirect to homepage if not authorized
  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  // Render the protected component if authorized
  return children;
};

export default AdminProtectedRoute; 