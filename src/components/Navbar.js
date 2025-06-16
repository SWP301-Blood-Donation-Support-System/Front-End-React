import React, { useEffect, useState } from 'react';
import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  
  // Initialize user authentication
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));

        if (token && userInfo) {
          setUser(userInfo);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      }
    };

    initializeAuth();
  }, []);

  // Check if user is staff (role 1 or 2)
  const isStaff = user && (
    user.RoleID === 1 || user.RoleID === 2 || 
    user.RoleID === "1" || user.RoleID === "2"   
  );
  
  // Map paths to menu keys
  const getSelectedKey = () => {
    const path = location.pathname;
    switch (path) {
      case '/':
        return ['home'];
      case '/booking':
        return ['schedule'];
      case '/search':
        return ['search'];
      case '/news':
        return ['news'];
      case '/faq':
        return ['faq'];
      case '/staff':
        return ['dashboard'];
      default:
        return [];
    }
  };

  const baseMenuItems = [
    {
      key: 'home',
      label: 'Trang Chủ',
      onClick: () => navigate('/')
    },
    {
      key: 'schedule',
      label: 'Đặt Lịch Hiến Máu',
      onClick: () => navigate('/booking')
    },
    {
      key: 'search',
      label: 'Tra Cứu',
      onClick: () => navigate('/search')
    },
    {
      key: 'news',
      label: 'Tin Tức',
      onClick: () => navigate('/news')
    },
    {
      key: 'faq',
      label: 'Hỏi Đáp',
      onClick: () => navigate('/faq')
    }
  ];

  // Add Dashboard option for staff
  const menuItems = isStaff ? [
    ...baseMenuItems,
    {
      key: 'dashboard',
      label: 'Dashboard',
      onClick: () => navigate('/staff/schedule-management')
    }
  ] : baseMenuItems;

  return (
    <div className="navbar-container">
      <Menu
        mode="horizontal"
        items={menuItems}
        className="navbar-menu"
        selectedKeys={getSelectedKey()}
      />
    </div>
  );
};

export default Navbar;
