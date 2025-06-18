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
  CalendarOutlined,
  HistoryOutlined,
  UnorderedListOutlined,
  DatabaseOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Sider } = Layout;

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const StaffSidebar = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();

  // Handle menu item clicks
  const handleMenuClick = ({ key }) => {
    console.log('Menu item clicked:', key);
    
    switch (key) {
      case '1-1': // Lịch sắp tới
        navigate('/staff/schedule-management?type=upcoming');
        break;
      case '1-2': // Lịch đã qua
        navigate('/staff/schedule-management?type=past');
        break;
      case '1-3': // Tất cả lịch
        navigate('/staff/schedule-management?type=all');
        break;
      case '2': // Quản lý người hiến
        // TODO: Navigate to donor management page
        console.log('Navigate to donor management');
        break;
      case '3-1': // Máu đạt
        // TODO: Navigate to qualified blood management
        console.log('Navigate to qualified blood management');
        break;
      case '3-2': // Máu không đạt
        // TODO: Navigate to disqualified blood management
        console.log('Navigate to disqualified blood management');
        break;
      case '3-3': // Máu chờ duyệt
        // TODO: Navigate to pending blood management
        console.log('Navigate to pending blood management');
        break;
      case '4-1': // Danh sách hồ sơ hiến máu
        navigate('/staff/donation-records');
        break;
      case '4-2': // Tạo hồ sơ hiến máu
        navigate('/staff/donation-records/create');
        break;
      case '5': // Báo cáo thống kê
        // TODO: Navigate to reports
        console.log('Navigate to reports');
        break;
      default:
        console.log('Unknown menu item:', key);
    }
  };

  // Sidebar items
  const sidebarItems = [
    getItem('Lịch đặt hiến', '1', <PieChartOutlined />, [
      getItem('Lịch sắp tới', '1-1', <CalendarOutlined />),
      getItem('Lịch đã qua', '1-2', <HistoryOutlined />),
      getItem('Tất cả lịch', '1-3', <UnorderedListOutlined />),
    ]),
    getItem('Quản lý người hiến', '2', <UserOutlined />),
    getItem('Quản lý túi máu hậu hiến', '3', <DesktopOutlined />, [
      getItem('Máu đạt', '3-1', <CheckCircleOutlined />),
      getItem('Máu không đạt', '3-2', <CloseCircleOutlined />),
      getItem('Máu chờ duyệt', '3-3', <ClockCircleOutlined />),
    ]),
    getItem('Hồ sơ hiến máu', '4', <FileOutlined />, [
      getItem('Danh sách hồ sơ', '4-1', <DatabaseOutlined />),
      getItem('Tạo hồ sơ mới', '4-2', <PlusCircleOutlined />),
    ]),
    getItem('Báo cáo thống kê', '5', <TeamOutlined />),
  ];

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
        onClick={handleMenuClick}
      />
    </Sider>
  );
};

export default StaffSidebar; 