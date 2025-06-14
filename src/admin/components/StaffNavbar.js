import React, { useState } from 'react';
import { Dropdown, Menu } from 'antd';
import { DownOutlined, MenuOutlined } from '@ant-design/icons';

const StaffNavbar = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="staff-navbar">
      <div className="staff-navbar-content">
        <nav className="staff-nav-tabs">
          <button 
            className={`staff-nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`staff-nav-tab ${activeTab === 'audiences' ? 'active' : ''}`}
            onClick={() => setActiveTab('audiences')}
          >
            Audiences
          </button>
          <button 
            className={`staff-nav-tab ${activeTab === 'demographics' ? 'active' : ''}`}
            onClick={() => setActiveTab('demographics')}
          >
            Demographics
          </button>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="reports" onClick={() => setActiveTab('reports')}>
                  Reports
                </Menu.Item>
                <Menu.Item key="settings" onClick={() => setActiveTab('settings')}>
                  Settings
                </Menu.Item>
                <Menu.Item key="analytics" onClick={() => setActiveTab('analytics')}>
                  Analytics
                </Menu.Item>
              </Menu>
            }
            trigger={['click']}
          >
            <button className={`staff-nav-tab dropdown ${activeTab === 'more' ? 'active' : ''}`}>
              More <DownOutlined />
            </button>
          </Dropdown>
        </nav>
      </div>
    </div>
  );
};

export default StaffNavbar; 