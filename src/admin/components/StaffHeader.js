import React, { useState, useEffect } from 'react';
import { Layout, Avatar, Dropdown, Menu, Space } from 'antd';
import { 
  MailOutlined,
  PoweroffOutlined,
  MenuOutlined,
  DownOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { UserAPI } from '../../api/User';

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

  // Handle logout functionality
  const handleLogout = () => {
    UserAPI.logout();
    setUser(null);
    navigate('/');
  };

  // Handle menu item clicks
  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      handleLogout();
    } else if (key === 'profile') {
      navigate('/profile');
    }
  };

  // User dropdown menu
  const userMenu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Hồ Sơ
      </Menu.Item>
      <Menu.Item key="settings" icon={<MenuOutlined />}>
        Cài Đặt
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<PoweroffOutlined />}>
        Đăng Xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className="staff-header">
      <div className="staff-header-right">
        <div className="staff-header-actions">
          <Space size="middle">
            <div className="header-icon">
              <MailOutlined />
            </div>

            <div className="header-icon">
              <MenuOutlined />
            </div>

            <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
              <div className="staff-user-profile">
                <Avatar
                  size={32}
                  src="/images/huy1.png"
                  className="user-avatar"
                />
                <span className="user-name">
                  {user ? `Xin chào ${user.FullName}` : 'Staff'}
                </span>
                <DownOutlined className="dropdown-icon" />
              </div>
            </Dropdown>
          </Space>
        </div>
      </div>
    </Header>
  );
};

export default StaffHeader; 