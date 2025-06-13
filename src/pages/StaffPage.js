import React, { useState } from 'react';
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu } from 'antd';
import Header from '../components/Header';
import Footer from '../components/Footer';

const { Content, Sider } = Layout;

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const items = [
  getItem('Dashboards', '1', <PieChartOutlined />),
  getItem('Analytics', '2', <DesktopOutlined />),
  getItem('Management', 'sub1', <UserOutlined />, [
    getItem('Active Donors', '3'),
    getItem('New Registrations', '4'),
    getItem('Donor History', '5'),
  ]),
  getItem('Advertisement', '6', <FileOutlined />),
  getItem('Helpdesk', '7', <TeamOutlined />),
  getItem('Monitoring', '8', <DesktopOutlined />),
  getItem('Cryptocurrency', '9', <PieChartOutlined />),
  getItem('Project Management', '10', <FileOutlined />),
  getItem('Product', '11', <UserOutlined />),
  getItem('Statistics', '12', <TeamOutlined />),
  getItem('Pages', 'sub2', <FileOutlined />, [
    getItem('Applications', '13')
  ]),
  getItem('Elements', '14', <DesktopOutlined />),
  getItem('Components', '15', <UserOutlined />),
  getItem('Tables', '16', <TeamOutlined />),
];

const StaffPage = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="staff-layout">
      <Header />
      
      <Layout className="staff-main-layout">
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={value => setCollapsed(value)}
          className="staff-sidebar"
        >
          <div className="staff-logo" />
          <Menu 
            theme="dark" 
            defaultSelectedKeys={['1']} 
            mode="inline" 
            items={items}
            className="staff-menu"
          />
        </Sider>
        
        <Layout className="staff-content-layout">
          <div className="staff-header" />
          
          <Content className="staff-content">
            <div className="staff-header-section">
              <div className="staff-page-header">
                <h1 className="staff-page-title">Analytics</h1>
                <p className="staff-page-subtitle">This is an example dashboard created using built-in elements and components.</p>
              </div>
              <div className="staff-tabs">
                <span className="staff-tab active">Overview</span>
                <span className="staff-tab">Audiences</span>
                <span className="staff-tab">Demographics</span>
                <span className="staff-tab">More</span>
              </div>
            </div>
            
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
          
          <Footer />
        </Layout>
      </Layout>
    </Layout>
  );
};

export default StaffPage; 