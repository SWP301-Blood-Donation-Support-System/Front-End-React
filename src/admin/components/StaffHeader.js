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
                src="/images/huy1.png"
                className="user-avatar"
              />
              <span className="user-name">
                {user ? `Xin chào ${user.FullName}` : 'Staff'}
              </span>
            </div>
          </Space>
        </div>
      </div>
    </Header>
  );
};

export default StaffHeader; 