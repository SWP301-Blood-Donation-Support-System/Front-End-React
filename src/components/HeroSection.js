import React from 'react';
import { Row, Col, Button, Typography } from 'antd';
import { HeartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const HeroSection = () => {
  const navigate = useNavigate();
  const handleBookingClick = () => {
    navigate('/booking#booking-form');
  };

  return (
    <div style={{ 
      background: '#f5f5f5', 
      padding: '0 60px' 
    }}>
      <div className="hero-section-compact" style={{
        background: '#761611',
        minHeight: '500px',
        padding: '60px 40px',
        color: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto' 
        }}>
          <Row align="middle" gutter={[60, 32]} style={{ minHeight: '400px' }}>
            <Col xs={24} md={12}>
              <div style={{ maxWidth: '500px' }}>
                <Title level={1} style={{ 
                  color: 'white', 
                  fontSize: '48px', 
                  fontWeight: 'bold',
                  marginBottom: '24px',
                  lineHeight: '1.2'
                }}>
                  Chúng tôi cần người hiến máu
                </Title>
                
                <Paragraph style={{ 
                  color: 'white', 
                  fontSize: '18px', 
                  marginBottom: '32px',
                  lineHeight: '1.6'
                }}>
                  Cứ mỗi 2 giây lại có một người cần máu. Một lần hiến máu của bạn có 
                  thể cứu sống nhiều người và mang lại hy vọng cho gia đình của họ. Hãy 
                  là lý do để ai đó được trở về nhà.
                </Paragraph>
                
                <Button 
                  size="large"
                  className="hero-button"
                  style={{
                    background: 'white',
                    color: '#761611',
                    border: '2px solid #761611',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    height: '56px',
                    padding: '0 36px',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}
                  icon={<HeartOutlined />}
                  onClick={handleBookingClick}
                >
                  ĐẶT LỊCH HIẾN MÁU NGAY
                </Button>
                
                <div style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '14px',
                  fontStyle: 'italic'
                }}>
                  *Điều khoản áp dụng, tìm hiểu thêm
                </div>
              </div>
            </Col>
            
            <Col xs={24} md={12}>
              <div style={{ textAlign: 'center' }}>
                <img 
                  src="/images/hero_banner_3.jpg" 
                  alt="Blood donation"
                  style={{
                    width: '100%',
                    maxWidth: '540px',
                    borderRadius: '12px',
                    boxShadow: '0 15px 40px rgba(0,0,0,0.3)',
                    transform: 'scale(1.05)'
                  }}
                />
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
