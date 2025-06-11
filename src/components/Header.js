import React from 'react';
import { Layout, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();

  return (
    <AntHeader className="header-container">
      {/* Logo using logo.svg - clickable to go home */}
      <div 
        onClick={() => navigate('/')}
        className="header-logo"
      >
        <img 
          src="/images/logo.svg" 
          alt="Blood Services Logo" 
        />
      </div>
      <Button
        type="primary"
        icon={<UserOutlined />}
        onClick={() => navigate('/login')}
        size="large"
        className="header-login-btn"
      >
        Đăng Nhập
      </Button>
    </AntHeader>
  );
};

export default Header;
