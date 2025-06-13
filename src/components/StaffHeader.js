import React from 'react';
import { Input, Avatar, Badge, Dropdown, Menu } from 'antd';
import { 
  SearchOutlined, 
  BellOutlined, 
  AppstoreOutlined, 
  SettingOutlined,
  UserOutlined,
  LogoutOutlined 
} from '@ant-design/icons';

const { Search } = Input;

const StaffHeader = ({ title = "Analytics", subtitle = "This is an example dashboard created using build-in elements and components." }) => {
  const handleSearch = (value) => {
    console.log('Search:', value);
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profile
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Settings
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />}>
        Logout
      </Menu.Item>
    </Menu>
  );

  const notificationMenu = (
    <Menu>
      <Menu.Item key="1">
        <div className="notification-item">
          <strong>New blood donation request</strong>
          <p>5 minutes ago</p>
        </div>
      </Menu.Item>
      <Menu.Item key="2">
        <div className="notification-item">
          <strong>Schedule updated</strong>
          <p>1 hour ago</p>
        </div>
      </Menu.Item>
      <Menu.Item key="3">
        <div className="notification-item">
          <strong>New staff member added</strong>
          <p>2 hours ago</p>
        </div>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="staff-header">
      <div className="staff-header__content">
        <div className="staff-header__left">
          <div className="staff-header__title-section">
            <h1 className="staff-header__title">{title}</h1>
            <p className="staff-header__subtitle">{subtitle}</p>
          </div>
        </div>
        
        <div className="staff-header__right">
          <div className="staff-header__search">
            <Search
              placeholder="Search..."
              allowClear
              onSearch={handleSearch}
              className="staff-header__search-input"
            />
          </div>
          
          <div className="staff-header__actions">
            <div className="staff-header__action-item">
              <AppstoreOutlined className="staff-header__action-icon" />
            </div>
            
            <Dropdown overlay={notificationMenu} trigger={['click']} placement="bottomRight">
              <div className="staff-header__action-item">
                <Badge count={3} size="small">
                  <BellOutlined className="staff-header__action-icon" />
                </Badge>
              </div>
            </Dropdown>
            
            <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
              <div className="staff-header__user">
                <Avatar 
                  size={32} 
                  icon={<UserOutlined />}
                  className="staff-header__avatar"
                />
                <span className="staff-header__username">Staff User</span>
              </div>
            </Dropdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffHeader; 