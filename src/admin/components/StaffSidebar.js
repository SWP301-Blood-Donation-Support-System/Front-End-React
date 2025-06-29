import React, { useState, useEffect, useRef } from 'react';
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
  DatabaseOutlined,
  PlusCircleOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

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
  const location = useLocation();
  const autoOpenedRef = useRef(new Set()); // Track which submenus were auto-opened
  const previousCollapsedRef = useRef(collapsed); // Track previous collapsed state
  const savedOpenKeysRef = useRef([]); // Store openKeys before collapsing
  
  const [openKeys, setOpenKeys] = useState(() => {
    // Try to load from localStorage first
    const savedOpenKeys = localStorage.getItem('staffSidebar_openKeys');
    if (savedOpenKeys) {
      try {
        const parsed = JSON.parse(savedOpenKeys);
        return parsed;
      } catch (error) {
        console.warn('Failed to parse saved openKeys:', error);
      }
    }
    
    // Initialize openKeys based on current path
    const pathname = location.pathname;
    const initialOpenKeys = [];
    
    if (pathname.includes('/staff/blood-bag-management')) {
      initialOpenKeys.push('3');
      autoOpenedRef.current.add('3'); // Mark as auto-opened
    } else if (pathname.includes('/staff/donation-records')) {
      initialOpenKeys.push('4');
      autoOpenedRef.current.add('4'); // Mark as auto-opened
    }
    
    return initialOpenKeys;
  });

  // Handle sidebar collapse/expand state change
  useEffect(() => {
    // If sidebar is being collapsed
    if (collapsed && !previousCollapsedRef.current) {
      // Save current openKeys before collapsing
      savedOpenKeysRef.current = [...openKeys];
      // Close all dropdowns when collapsing
      setOpenKeys([]);
    }
    // If sidebar is being expanded
    else if (!collapsed && previousCollapsedRef.current) {
      // Restore previously saved openKeys when expanding
      if (savedOpenKeysRef.current.length > 0) {
        setOpenKeys(savedOpenKeysRef.current);
      }
    }
    
    // Update previous state
    previousCollapsedRef.current = collapsed;
  }, [collapsed, openKeys]);

  // Save openKeys to localStorage whenever it changes (but only when sidebar is expanded)
  useEffect(() => {
    if (!collapsed) {
      localStorage.setItem('staffSidebar_openKeys', JSON.stringify(openKeys));
    }
  }, [openKeys, collapsed]);

  // Function to get selected key based on current path
  const getSelectedKey = () => {
    const pathname = location.pathname;
    const search = location.search;
    
    if (pathname.includes('/staff/schedule-management')) {
      return ['1'];
    } else if (pathname.includes('/staff/user-management')) {
      return ['2'];
    } else if (pathname.includes('/staff/blood-bag-management')) {
      if (search.includes('status=all')) return ['3-1'];
      if (search.includes('status=qualified')) return ['3-2'];
      if (search.includes('status=disqualified')) return ['3-3'];
      if (search.includes('status=pending')) return ['3-4'];
      return ['3-1']; // default to all
    } else if (pathname.includes('/staff/donation-records')) {
      if (pathname.includes('/create')) return ['4-2'];
      return ['4-1'];
    } else if (pathname.includes('/staff/reports')) {
      return ['5'];
    }
    
    return ['1']; // default to schedule management
  };

  // Simple handler - just update openKeys when sidebar is expanded
  const onOpenChange = (keys) => {
    // Only allow opening/closing dropdowns when sidebar is expanded
    if (!collapsed) {
      setOpenKeys(keys);
    }
  };

  // Auto-open relevant submenu when navigating to child pages (only when sidebar is expanded)
  useEffect(() => {
    if (collapsed) return; // Don't auto-open when sidebar is collapsed
    
    const pathname = location.pathname;
    
    // Auto-open submenu for blood bag management pages
    if (pathname.includes('/staff/blood-bag-management')) {
      setOpenKeys(prev => {
        if (!prev.includes('3')) {
          autoOpenedRef.current.add('3');
          return [...prev, '3'];
        }
        return prev;
      });
    }
    // Auto-open submenu for donation records pages  
    else if (pathname.includes('/staff/donation-records')) {
      setOpenKeys(prev => {
        if (!prev.includes('4')) {
          autoOpenedRef.current.add('4');
          return [...prev, '4'];
        }
        return prev;
      });
    }
    // For other pages, do nothing - preserve current open state
  }, [location.pathname, collapsed]);

  // Handle menu item clicks
  const handleMenuClick = ({ key }) => {
    switch (key) {
      case '1': // Lịch đặt hiến - prioritize upcoming schedules
        navigate('/staff/schedule-management?type=all');
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
        break;
      default:
        break;
    }
  };

  // Sidebar items
  const sidebarItems = [
    getItem('Lịch đặt hiến', '1', <PieChartOutlined />),
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
        theme="light"
        selectedKeys={getSelectedKey()}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        mode="inline" 
        items={sidebarItems}
        className="staff-menu"
        onClick={handleMenuClick}
      />
    </Sider>
  );
};

export default StaffSidebar; 