import React, { useEffect, useState } from "react";
import { Layout, Button, Avatar, Dropdown, Menu, notification, Badge, List, Typography, Spin, Empty } from "antd";
import {
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { UserAPI } from "../api/User";

const { Header: AntHeader } = Layout;

const Header = () => {
  const [api, contextHolder] = notification.useNotification();
  const navigate = useNavigate();
  const [user, setUser] = useState();
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));

        if (token && userInfo) {
          // Khởi tạo user state với thông tin cơ bản từ localStorage
          setUser(userInfo);
          // Fetch notifications cho user đã đăng nhập
          fetchNotifications();
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("fullname");
          setUser(null);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      }
    };

    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      setNotificationsLoading(true);
      try {
        const response = await UserAPI.getUserNotifications();
        if (response.status === 200) {
          const notificationsData = Array.isArray(response.data) ? response.data : 
                                    Array.isArray(response.data?.data) ? response.data.data : [];
          setNotifications(notificationsData);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
      } finally {
        setNotificationsLoading(false);
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
      <Menu.Divider />{" "}
      <Menu.Item
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
          window.dispatchEvent(new CustomEvent("userLogout"));

          // Show logout notification
          api.success({
            message: "Đăng xuất thành công!",
            description: `Tạm biệt ${userName}! Hẹn gặp lại bạn sau.`,
            placement: "topRight",
            duration: 3,
          });

          navigate("/");
        }}
      >
        Đăng Xuất
      </Menu.Item>
    </Menu>
  );

  // Format date cho notification
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Notifications dropdown
  const notificationsMenu = (
    <div style={{ 
      width: '350px', 
      maxHeight: '400px', 
      overflow: 'auto',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      border: '1px solid #d9d9d9'
    }}>
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #f0f0f0', 
        fontWeight: 'bold',
        backgroundColor: '#fafafa',
        borderRadius: '8px 8px 0 0',
        color: '#262626'
      }}>
        Thông báo ({notifications.length})
      </div>
      {notificationsLoading ? (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          backgroundColor: '#ffffff' 
        }}>
          <Spin />
        </div>
      ) : notifications.length > 0 ? (
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item style={{ 
              padding: '12px 16px', 
              borderBottom: '1px solid #f5f5f5',
              backgroundColor: '#ffffff',
              margin: 0
            }}>
              <div style={{ width: '100%' }}>
                <Typography.Title level={5} style={{ 
                  margin: 0, 
                  fontSize: '14px',
                  color: '#262626',
                  fontWeight: '600'
                }}>
                  {item.subject}
                </Typography.Title>
                <Typography.Paragraph 
                  style={{ 
                    margin: '4px 0', 
                    fontSize: '12px', 
                    color: '#595959',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {item.message}
                </Typography.Paragraph>
                <Typography.Text style={{ 
                  fontSize: '11px', 
                  color: '#8c8c8c' 
                }}>
                  {formatDate(item.createdAt)}
                </Typography.Text>
              </div>
            </List.Item>
          )}
        />
      ) : (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          backgroundColor: '#ffffff'
        }}>
          <Empty 
            description="Không có thông báo nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      )}
    </div>
  );

  return (
    <AntHeader className="header-container">
      {contextHolder}
      {/* Logo using new-logo.png - clickable to go home */}
      <div onClick={() => navigate("/")} className="header-logo">
        <img src="/images/BloodLogo.jpg" alt="Blood Services Logo" />
      </div>

      {user ? (
        <div className="header-user-section" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Notification Bell */}
          <Dropdown
            overlay={notificationsMenu}
            trigger={["click"]}
            placement="bottomRight"
            visible={notificationVisible}
            onVisibleChange={setNotificationVisible}
            overlayClassName="notification-dropdown"
            overlayStyle={{
              backgroundColor: 'transparent',
              boxShadow: 'none'
            }}
          >
            <div style={{ cursor: 'pointer', position: 'relative' }}>
              <Badge count={notifications.length} size="small" style={{ backgroundColor: '#ff4d4f' }}>
                <BellOutlined 
                  style={{ 
                    fontSize: '18px', 
                    color: notificationVisible ? '#1890ff' : '#ffffff',
                    padding: '8px',
                    borderRadius: '50%',
                    backgroundColor: notificationVisible ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                />
              </Badge>
            </div>
          </Dropdown>

          {/* User Profile Dropdown */}
          <Dropdown
            overlay={userMenu}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div className="header-user-profile">
              <Avatar
                size={32}
                src={user.picture} // Use Google profile picture if available
                icon={<UserOutlined />}
                className="header-user-avatar"
              />
              <span className="header-user-name">
                Xin chào {user.FullName || user.name || "Người hiến máu"}
              </span>
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
