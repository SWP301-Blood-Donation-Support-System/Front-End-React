import React from 'react';
import { Row, Col, Button, Typography } from 'antd';
import { HeartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const HeroSection = () => {
  const navigate = useNavigate();
  const handleBookingClick = () => {
    navigate('/booking#booking-form');
  };  return (<div className="hero-section-compact" style={{
      background: '#761611',
      minHeight: '400px',
      padding: '40px 80px',
      color: 'white'
    }}>
      <Row align="middle" gutter={[32, 32]}>
        <Col xs={24} md={12}>
          <div style={{ maxWidth: '500px' }}>            <Title level={1} style={{ 
              color: 'white', 
              fontSize: '40px', 
              fontWeight: 'bold',
              marginBottom: '20px',
              lineHeight: '1.2'
            }}>
              Chúng tôi cần người hiến máu
            </Title>
              <Paragraph style={{ 
              color: 'white', 
              fontSize: '16px', 
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              Cứ mỗi 2 giây lại có một người cần máu. Một lần hiến máu của bạn có 
              thể cứu sống nhiều người và mang lại hy vọng cho gia đình của họ. Hãy 
              là lý do để ai đó được trở về nhà.
            </Paragraph>
            
            <Button 
              size="large"
              style={{
                background: 'white',
                color: '#761611',
                border: '2px solid #761611',
                fontWeight: 'bold',
                fontSize: '16px',
                height: '48px',
                padding: '0 28px',
                borderRadius: '8px'
              }}
              icon={<HeartOutlined />}
              onClick={handleBookingClick}
            >
              ĐẶT LỊCH HIẾN MÁU NGAY
            </Button>                       
          </div>
        </Col>        <Col xs={24} md={12}>
          <div style={{ textAlign: 'center' }}>
            <img 
              src="/images/hero_banner_3.jpg" 
              alt="Blood donation"
              style={{
                width: '100%',
                maxWidth: '480px',
                borderRadius: '12px',
                boxShadow: '0 15px 40px rgba(0,0,0,0.3)',
                transform: 'scale(1.02)'
              }}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default HeroSection;
