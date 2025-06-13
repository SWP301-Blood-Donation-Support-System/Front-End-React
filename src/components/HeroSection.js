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
    <div className="hero-section-wrapper">
      <div className="hero-section-compact">
        <div className="hero-section-container">
          <Row align="middle" gutter={[60, 32]} className="hero-section-row">
            <Col xs={24} md={12}>
              <div className="hero-section-content">
                <Title level={1} className="hero-section-title">
                  Chúng tôi cần người hiến máu
                </Title>
                
                <Paragraph className="hero-section-description">
                  Cứ mỗi 2 giây lại có một người cần máu. Một lần hiến máu của bạn có 
                  thể cứu sống nhiều người và mang lại hy vọng cho gia đình của họ. Hãy 
                  là lý do để ai đó được trở về nhà.
                </Paragraph>
                
                <Button 
                  size="large"
                  className="hero-button"
                  icon={<HeartOutlined />}
                  onClick={handleBookingClick}
                >
                  ĐẶT LỊCH HIẾN MÁU NGAY
                </Button>
                
                
              </div>
            </Col>
            
            <Col xs={24} md={12}>
              <div className="hero-section-image-container">
                <img 
                  src="/images/hero_banner_3.jpg" 
                  alt="Blood donation"
                  className="hero-section-image-main"
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
