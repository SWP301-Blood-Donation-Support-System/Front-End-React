import React, { useEffect, useState } from "react";
import { Layout, Button, Avatar, Dropdown, Menu, notification } from "antd";
import { UserOutlined, DownOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { UserAPI } from "../api/User";

const { Header: AntHeader } = Layout;

const Header = () => {
  const [api, contextHolder] = notification.useNotification();
  const navigate = useNavigate();
  const [user, setUser] = useState();
  
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));

        if (token && userInfo) {
          // Khởi tạo user state với thông tin cơ bản từ localStorage
          setUser(userInfo);
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("fullname");
          setUser(null);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      }
    };

    initializeAuth();
  }, []);

  // User dropdown menu
  const userMenu = (
    <Menu>
      <Menu.Item 
        key="profile" 
        icon={<UserOutlined />}
        onClick={() => navigate("/profile")}
      >
        Hồ Sơ Cá Nhân
      </Menu.Item>
      <Menu.Item 
        key="settings" 
        icon={<SettingOutlined />}
        onClick={() => navigate("/settings")}
      >
        Cài Đặt
      </Menu.Item>
      <Menu.Divider />      <Menu.Item 
        key="logout" 
        icon={<LogoutOutlined />}
        onClick={() => {
          const userName = user.FullName || user.name;
          
          UserAPI.logout();
          setUser(null);
          
          // Clear all stored data to prevent unwanted redirects
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("userInfo");
          sessionStorage.removeItem("pendingBookingData");
          
          // Dispatch custom event to notify other components about logout
          window.dispatchEvent(new CustomEvent('userLogout'));
          
          // Show logout notification
          api.success({
            message: 'Đăng xuất thành công!',
            description: `Tạm biệt ${userName}! Hẹn gặp lại bạn sau.`,
            placement: 'topRight',
            duration: 3,
          });
          
          navigate("/");
        }}
      >
        Đăng Xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <AntHeader className="header-container">
      {contextHolder}
      {/* Logo using new-logo.png - clickable to go home */}
      <div onClick={() => navigate("/")} className="header-logo">
        <img src="/images/new-logo.png" alt="Blood Services Logo" />
      </div>
      
      {user ? (
        <div className="header-user-section">
          <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
            <div className="header-user-profile">              <Avatar 
                size={32} 
                src={user.picture} // Use Google profile picture if available
                icon={<UserOutlined />}
                className="header-user-avatar"
              />
              <span className="header-user-name">Xin chào {user.FullName || user.name}</span>
              <DownOutlined className="header-dropdown-icon" />
            </div>
          </Dropdown>
        </div>
      ) : (
        <Button
          type="primary"
          icon={<UserOutlined />}
          onClick={() => navigate("/login")}
          size="large"
          className="header-login-btn"
        >
          Đăng Nhập
        </Button>
      )}
    </AntHeader>
  );
};

export default Header;
