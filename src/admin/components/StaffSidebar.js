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
  MedicineBoxOutlined,
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
        navigate('/staff/schedule-management?type=all');
        break;
      case '1-2': // Lịch đã qua
        navigate('/staff/schedule-management?type=upcoming');
        break;
      case '1-3': // Tất cả lịch
        navigate('/staff/schedule-management?type=past');
        break;
      case '2': // Quản lý người hiến
        navigate('/staff/user-management');
        break;
      case '3-1': // Tất cả túi máu
        navigate('/staff/blood-bag-management?status=all');
        break;
      case '3-2': // Túi máu đạt
        navigate('/staff/blood-bag-management?status=qualified');
        break;
      case '3-3': // Túi máu không đạt
        navigate('/staff/blood-bag-management?status=disqualified');
        break;
      case '3-4': // Túi máu chờ duyệt
        navigate('/staff/blood-bag-management?status=pending');
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
      getItem('Tất cả lịch', '1-1', <UnorderedListOutlined />),
      getItem('Lịch sắp tới', '1-2', <CalendarOutlined />),
      getItem('Lịch đã qua', '1-3', <HistoryOutlined />),
    ]),
    getItem('Quản lý người hiến', '2', <UserOutlined />),
    getItem('Quản lý túi máu hậu hiến', '3', <DesktopOutlined />, [
      getItem('Tất cả túi máu', '3-1', <MedicineBoxOutlined />),
      getItem('Túi máu đạt', '3-2', <CheckCircleOutlined />),
      getItem('Túi máu không đạt', '3-3', <CloseCircleOutlined />),
      getItem('Túi máu chờ duyệt', '3-4', <ClockCircleOutlined />),
    ]),
    getItem('Hồ sơ người hiến', '4', <FileOutlined />, [
      getItem('Toàn bộ hồ sơ', '4-1', <DatabaseOutlined />),
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