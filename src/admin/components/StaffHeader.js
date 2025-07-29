import React, { useState, useEffect } from 'react';
import { Layout, Avatar, Space } from 'antd';
import { 
  MailOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;

const StaffHeader = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Initialize user authentication
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));

        if (token && userInfo) {
          setUser(userInfo);
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("userInfo");
          setUser(null);
          navigate("/login");
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        navigate("/login");
      }
    };

    initializeAuth();
  }, [navigate]);

  // Listen for localStorage changes to update user info
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'userInfo') {
        try {
          const newUserInfo = e.newValue ? JSON.parse(e.newValue) : null;
          setUser(newUserInfo);
        } catch (error) {
          console.error("Error parsing updated user info:", error);
        }
      }
    };

    // Listen for storage events (works for changes from other tabs)
    window.addEventListener('storage', handleStorageChange);

    // Custom event for same-tab localStorage changes
    const handleCustomStorageChange = (e) => {
      if (e.detail.key === 'userInfo') {
        try {
          const newUserInfo = e.detail.newValue ? JSON.parse(e.detail.newValue) : null;
          setUser(newUserInfo);
        } catch (error) {
          console.error("Error parsing updated user info:", error);
        }
      }
    };

    window.addEventListener('localStorageChange', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange);
    };
  }, []);

  return (
    <Header className="staff-header">
      <div className="staff-header-right">
        <div className="staff-header-actions">
          <Space size="middle">
            <div className="header-icon">
              <MailOutlined />
            </div>

            <div className="staff-user-profile">
              <Avatar
                size={32}
                
                className="user-avatar"
              />
              <span className="user-name">
                {user ? `Xin chào ${user.FullName || user.fullName || "Bệnh Viện"}` : 'Staff'}
              </span>
            </div>
          </Space>
        </div>
      </div>
    </Header>
  );
};

export default StaffHeader; 