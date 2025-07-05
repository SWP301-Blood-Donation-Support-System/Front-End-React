import React, { useEffect } from 'react';
import { Layout, Card, Button, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const { Text } = Typography;

const ErrorResetPasswordPage = () => {
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
            maxWidth: 600, 
            margin: '60px auto',
            textAlign: 'center',
            padding: '40px 20px'
          }}
        >
          <div style={{ marginBottom: '30px' }}>
            <ExclamationCircleOutlined 
              style={{ 
                fontSize: '64px', 
                color: '#ff4d4f',
                marginBottom: '20px'
              }} 
            />
          </div>
          
          <div 
            style={{
              backgroundColor: '#ffebee',
              border: '1px solid #ffcdd2',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '30px'
            }}
          >
            <Text 
              style={{ 
                fontSize: '16px', 
                color: '#c62828',
                display: 'block',
                lineHeight: '1.6'
              }}
            >
              Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.
            </Text>
          </div>
          
          <Button 
            type="primary" 
            size="large"
            onClick={() => navigate('/')}
            style={{
              minWidth: '150px',
              height: '45px',
              fontSize: '16px'
            }}
          >
            Về Trang Chủ
          </Button>
        </Card>
      </div>
      
      <Footer />
    </Layout>
  );
};

export default ErrorResetPasswordPage;
