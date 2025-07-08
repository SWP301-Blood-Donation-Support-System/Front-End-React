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
  SettingOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, notification } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserAPI } from '../../api/User';

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
  const [api, contextHolder] = notification.useNotification();
  const autoOpenedRef = useRef(new Set()); // Track which submenus were auto-opened
  const previousCollapsedRef = useRef(collapsed); // Track previous collapsed state
  const savedOpenKeysRef = useRef([]); // Store openKeys before collapsing
  
  // Check if user is admin (roleId = 1)
  const isAdmin = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      
      // Check the correct field name and handle both string and number values
      const roleValue = userInfo?.RoleID;
      const adminCheck = roleValue === "1";
      
      console.log("Debug - Role value:", roleValue, "isAdmin:", adminCheck); // Debug log
      
      return adminCheck;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  };
  
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
    } else if (pathname.includes('/staff/staff-management')) {
      return ['9'];
    } else if (pathname.includes('/staff/create-staff-account')) {
      return ['10'];
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
    } else if (pathname.includes('/staff/profile')) {
      return ['6'];
    }
    
    return ['1']; // default to schedule management
  };

  // Handle logout functionality
  const handleLogout = () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const userName = userInfo?.FullName || userInfo?.name || 'Staff';
    
    UserAPI.logout();
    
    // Show logout notification
    api.success({
      message: 'Đăng xuất thành công!',
      description: `Tạm biệt ${userName}! Hẹn gặp lại bạn sau.`,
      placement: 'topRight',
      duration: 3,
    });
    
    navigate('/');
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
      case '6': // Hồ sơ
        navigate('/staff/profile');
        break;
      case '7': // Cài đặt 
        navigate('/staff/settings');
        break;
      case '8': // Trợ giúp
        // TODO: Navigate to help page
        break;
      case '9': // Quản lý nhân viên (admin only)
        navigate('/staff/staff-management');
        break;
      case '10': // Tạo tài khoản nhân viên (admin only)
        navigate('/staff/create-staff-account');
        break;
      default:
        break;
    }
  };

  // Sidebar items with sections
  const sidebarItems = [
    {
      type: 'group',
      label: 'QUẢN LÝ',
      children: [
        getItem('Lịch đặt hiến', '1', <PieChartOutlined />),
        getItem('Quản lý người hiến', '2', <UserOutlined />),
        // Only show staff management for admin users
        ...(isAdmin() ? [
          getItem('Quản lý nhân viên', '9', <UsergroupAddOutlined />),
          getItem('Tạo tài khoản nhân viên', '10', <PlusCircleOutlined />),
        ] : []),
        getItem('Quản lý túi máu', '3', <DesktopOutlined />, [
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
      ]
    },
    {
      type: 'group',
      label: 'HỒ SƠ CÁ NHÂN',
      children: [
        getItem('Hồ sơ', '6', <UserOutlined />),
        getItem('Cài đặt', '7', <SettingOutlined />),
        getItem('Trợ giúp', '8', <QuestionCircleOutlined />),
      ]
    }
  ];

  return (
    <Sider 
      collapsible 
      collapsed={collapsed} 
      onCollapse={onCollapse}
      className="staff-sidebar"
      width={280}
      collapsedWidth={64}
      trigger={null}
    >
      {contextHolder}
      <div className="staff-header">
        {!collapsed && (
          <div className="staff-logo">
            <img src="/images/new-logo.png" alt="Healthcare Logo" className="healthcare-logo" />
          </div>
        )}
        <div 
          className="hamburger-trigger" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onCollapse(!collapsed);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onCollapse(!collapsed);
            }
          }}
        >
          <MenuOutlined />
        </div>
      </div>
      
      <Menu 
        theme="light"
        selectedKeys={getSelectedKey()}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        mode="inline" 
        inlineCollapsed={collapsed}
        items={sidebarItems}
        className="staff-menu"
        onClick={handleMenuClick}
      />

      <div className="sidebar-logout">
        <Button 
          type="text" 
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          className="logout-button"
          block
        >
          {!collapsed && 'Đăng xuất'}
        </Button>
      </div>
    </Sider>
  );
};

export default StaffSidebar; 