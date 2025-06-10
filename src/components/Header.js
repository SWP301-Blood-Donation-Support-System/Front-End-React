import React from 'react';
import { Layout, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();  return (    <AntHeader style={{ 
      background: '#dc2626', 
      padding: '0 80px', // Reduced padding to bring elements closer to center
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>      {/* Logo using logo.svg - clickable to go home */}
      <div 
        onClick={() => navigate('/')}
        style={{
          background: 'white',
          borderRadius: '25px',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
      >
        <img 
          src="/images/logo.svg" 
          alt="Blood Services Logo" 
          style={{ 
            height: '40px',
            width: 'auto',
            pointerEvents: 'none' // Prevent img from being the target
          }} 
        />
      </div>
      <Button
        type="primary"
        icon={<UserOutlined />}
        onClick={() => navigate('/login')}
        size="large"
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: '1px solid white',
          color: 'white',
          padding: '0 20px',
          height: '40px',
          fontSize: '15px',
          fontWeight: '500'
        }}
      >
        Đăng Nhập
      </Button>
    </AntHeader>
  );
};

export default Header;
