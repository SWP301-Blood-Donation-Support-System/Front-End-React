import React from 'react';
import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
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
      default:
        return [];
    }
  };
  const menuItems = [
    {
      key: 'home',
      label: 'Trang Chủ',
      onClick: () => navigate('/')
    },
    {
      key: 'schedule',
      label: 'Đặt Lịch Hiến Máu',
      onClick: () => navigate('/booking')
    },    {
      key: 'search',
      label: 'Tra Cứu',
      onClick: () => navigate('/search')
    },    {
      key: 'news',
      label: 'Tin Tức',
      onClick: () => navigate('/news')
    },{
      key: 'faq',
      label: 'Hỏi Đáp',
      onClick: () => navigate('/faq')
    }
  ];  return (
    <div style={{
      background: 'white',
      borderBottom: '1px solid #f0f0f0',
      padding: '0 50px',
      display: 'flex',
      justifyContent: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <Menu
        mode="horizontal"
        items={menuItems}
        style={{
          background: 'transparent',
          border: 'none',
          fontSize: '16px',
          fontWeight: '500',
          color: '#333',
          borderBottom: 'none',
          minHeight: '60px',
          lineHeight: '60px'
        }}
        selectedKeys={getSelectedKey()}
      />
    </div>
  );
};

export default Navbar;
