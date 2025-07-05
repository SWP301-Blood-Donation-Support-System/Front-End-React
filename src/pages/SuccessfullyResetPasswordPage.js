import React, { useEffect } from 'react';
import { Layout, Card, Button, Typography } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const { Title, Text } = Typography;

const SuccessfullyResetPasswordPage = () => {
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header />
      <Navbar />
      
      <div className="auth-container">
        <Card 
          className="auth-card" 
          style={{ 
            maxWidth: 500, 
            margin: '60px auto',
            textAlign: 'center',
            padding: '40px 20px'
          }}
        >
          <div style={{ marginBottom: '30px' }}>
            <CheckCircleOutlined 
              style={{ 
                fontSize: '64px', 
                color: '#52c41a',
                marginBottom: '20px'
              }} 
            />
          </div>
          
          <Title level={2} style={{ color: '#52c41a', marginBottom: '20px' }}>
            Thiết lập mật khẩu mới thành công.
          </Title>
          
          <Text 
            style={{ 
              fontSize: '16px', 
              color: '#666',
              display: 'block',
              marginBottom: '30px',
              lineHeight: '1.6'
            }}
          >
            Bạn có thể đăng nhập để tiếp tục.
          </Text>
          
          <Button 
            type="primary" 
            size="large"
            onClick={() => navigate('/login')}
            style={{
              minWidth: '150px',
              height: '45px',
              fontSize: '16px'
            }}
          >
            Đăng Nhập
          </Button>
        </Card>
      </div>
      
      <Footer />
    </Layout>
  );
};

export default SuccessfullyResetPasswordPage;
