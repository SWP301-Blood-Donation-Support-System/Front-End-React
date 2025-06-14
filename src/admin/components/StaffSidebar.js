import React from 'react';
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  MenuOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';

const { Sider } = Layout;

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

// Sidebar items
const sidebarItems = [
  getItem('Lịch đặt hiến', '1', <PieChartOutlined />),
  getItem('Quản lý người hiến', '2', <UserOutlined />),
  getItem('Quản lý túi máu hậu hiến', '3', <DesktopOutlined />, [
    getItem('Máu đạt', '3-1', <CheckCircleOutlined />),
    getItem('Máu không đạt', '3-2', <CloseCircleOutlined />),
    getItem('Máu chờ duyệt', '3-3', <ClockCircleOutlined />),
  ]),
  getItem('Hồ sơ hiến máu', '4', <FileOutlined />),
  getItem('Báo cáo thống kê', '5', <TeamOutlined />),
];

const StaffSidebar = ({ collapsed, onCollapse }) => {
  return (
    <Sider 
      collapsible 
      collapsed={collapsed} 
      onCollapse={onCollapse}
      className="staff-sidebar"
      width={280}
      collapsedWidth={80}
      trigger={
        <div className="custom-trigger">
          <MenuOutlined />
        </div>
      }
    >
      <div className="staff-logo">
        <img src="/images/new-logo.png" alt="Healthcare Logo" className="healthcare-logo" />
      </div>
      <Menu 
        theme="dark"
        defaultSelectedKeys={['1']} 
        mode="inline" 
        items={sidebarItems}
        className="staff-menu"
      />
    </Sider>
  );
};

export default StaffSidebar; 