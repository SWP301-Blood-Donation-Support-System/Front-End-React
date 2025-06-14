import React, { useState, useEffect } from 'react';
import {
  UserOutlined,
  BellOutlined,
  MailOutlined,
  PoweroffOutlined,
  MenuOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme, Avatar, Dropdown, Badge, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import StaffNavbar from '../components/StaffNavbar';
import StaffSidebar from '../components/StaffSidebar';
import { UserAPI } from '../../api/User';

const { Header, Content } = Layout;

// Horizontal header navigation items
const headerItems = [
  { key: '1', label: 'Dashboard' },
  { key: '2', label: 'Analytics' },
  { key: '3', label: 'Donors' },
  { key: '4', label: 'Appointments' },
  { key: '5', label: 'Reports' },
  { key: '6', label: 'Settings' },
  { key: '7', label: 'Support' },
];

const StaffPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

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
          navigate("/login"); // Redirect to login if no valid session
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
    UserAPI.logout(); // Clear token and userInfo from localStorage
    setUser(null);
    navigate('/'); // Redirect to homepage
  };

  // Handle menu item clicks
  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      handleLogout();
    }
  };

  // User dropdown menu
  const userMenu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profile
      </Menu.Item>
      <Menu.Item key="settings" icon={<MenuOutlined />}>
        Settings
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<PoweroffOutlined />}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="staff-layout">
      <Header className="staff-header">
        <div className="staff-header-logo">
          <img src="/images/huy1.png" alt="Logo" className="logo-image" />
        </div>

        <div className="staff-header-right">
          <div className="staff-header-actions">
            <Space size="middle">
              <div className="header-icon">
                <MailOutlined />
              </div>

              <Badge count={3} size="small">
                <div className="header-icon">
                  <BellOutlined />
                </div>
              </Badge>

              <div className="header-icon">
                <PoweroffOutlined />
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
                    おはいよう {user ? user.FullName : 'Hehe'}
                  </span>
                  <DownOutlined className="dropdown-icon" />
                </div>
              </Dropdown>
            </Space>
          </div>
        </div>
      </Header>

      <Layout className="staff-main-layout">
        <StaffSidebar
          collapsed={collapsed}
          onCollapse={value => setCollapsed(value)}
        />

        <Layout className="staff-content-layout">
          <StaffNavbar />
          <Content className="staff-content" style={{ padding: '0 48px' }}>


            <div className="staff-content-container">
              <div className="staff-section">
                <div className="staff-section-header">
                  <h2>Portfolio Performance</h2>
                  <button className="staff-view-all-btn">View All</button>
                </div>

                <div className="staff-stats-grid">
                  <div className="staff-stat-card">
                    <div className="stat-icon yellow">💰</div>
                    <div className="stat-content">
                      <h3>Cash Deposits</h3>
                      <div className="stat-number">1,234</div>
                      <div className="stat-change negative">↓ 54.1% less earnings</div>
                    </div>
                  </div>
                  <div className="staff-stat-card">
                    <div className="stat-icon red">📈</div>
                    <div className="stat-content">
                      <h3>Today's Donations</h3>
                      <div className="stat-number">23</div>
                      <div className="stat-change positive">↑ 14.1% Grow Rate</div>
                    </div>
                  </div>
                  <div className="staff-stat-card">
                    <div className="stat-icon green">💵</div>
                    <div className="stat-content">
                      <h3>Blood Units Available</h3>
                      <div className="stat-number">456</div>
                      <div className="stat-change positive">↑ 7.35% Increased by</div>
                    </div>
                  </div>
                </div>

                <div className="staff-report-section">
                  <button className="staff-complete-report-btn">View Complete Report</button>
                </div>
              </div>

              <div className="staff-bottom-grid">
                <div className="staff-chart-section">
                  <div className="staff-chart-card">
                    <div className="chart-header">
                      <h3>📊 Technical Support</h3>
                    </div>
                    <div className="chart-content">
                      <div className="chart-stats">
                        <span className="chart-subtitle">NEW ACCOUNTS SINCE 2018</span>
                        <div className="chart-number">
                          <span className="big-number">78</span>
                          <span className="percentage">%</span>
                          <span className="change-indicator">+14</span>
                        </div>
                      </div>
                      <div className="chart-placeholder">
                        📈 [Chart visualization would go here]
                      </div>
                    </div>
                  </div>
                </div>

                <div className="staff-timeline-section">
                  <div className="staff-timeline-card">
                    <div className="timeline-header">
                      <h3>📅 Timeline Example</h3>
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-item">
                        <div className="timeline-dot red"></div>
                        <span>All Hands Meeting</span>
                      </div>
                      <div className="timeline-item">
                        <div className="timeline-dot yellow"></div>
                        <span>Yet another one, at 15:00 PM</span>
                      </div>
                      <div className="timeline-item">
                        <div className="timeline-dot green"></div>
                        <span>Build the production release <span class="new-badge">NEW</span></span>
                      </div>
                      <div className="timeline-item">
                        <div className="timeline-dot red"></div>
                        <span>Something not important</span>
                      </div>
                      <div className="staff-view-messages">
                        <button className="view-messages-btn">View All Messages</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="staff-metrics-section">
                <div className="staff-section-header">
                  <span className="metrics-subtitle">SALES PROGRESS</span>
                  <h3>Total Orders</h3>
                  <p>Last year expenses</p>
                </div>

                <div className="staff-metrics-grid">
                  <div className="metric-card green">
                    <div className="metric-value">$1234</div>
                    <div className="metric-label">Total Donors</div>
                    <div className="metric-chart">📈</div>
                  </div>
                  <div className="metric-card blue">
                    <div className="metric-value">$456</div>
                    <div className="metric-label">Blood Units Available</div>
                    <div className="metric-chart">📊</div>
                  </div>
                  <div className="metric-card yellow">
                    <div className="metric-value">$789</div>
                    <div className="metric-label">Pending Appointments</div>
                    <div className="metric-chart">📉</div>
                  </div>
                  <div className="metric-card red">
                    <div className="metric-value">$012</div>
                    <div className="metric-label">Total Revenue</div>
                    <div className="metric-chart">📈</div>
                  </div>
                </div>
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default StaffPage; 