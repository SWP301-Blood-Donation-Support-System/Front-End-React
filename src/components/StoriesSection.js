import React from 'react';
import { Typography, Row, Col, Card } from 'antd';

const { Title, Paragraph } = Typography;

const StoriesSection = () => {
  const stories = [
    {
      title: "102 Lần Hiến Máu",
      description: "Câu chuyện về người đàn ông đã hiến máu 102 lần, góp phần cứu sống hàng trăm người.",
      image: "/images/vn_blog_8.jpg"
    },
    {
      title: "Vượt 700km Để Hiến Máu",
      description: "Hành trình dài của một gia đình từ miền núi xuống thành phố để tham gia hiến máu cứu người.",
      image: "/images/vn_blog_9.jpg"
    },
    {
      title: "Tham Gia Hiến Máu Để Cảm Ơn Cuộc Đời",
      description: "Những con người biết ơn cuộc sống, sẵn sàng chia sẻ giọt máu hồng để báo đáp xã hội.",
      image: "/images/vn_blog_10.png"
    }
  ];

  return (
    <div style={{ 
      padding: '80px 50px',
      background: '#f8f9fa'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <Title level={2} style={{ 
          color: '#333',
          fontSize: '36px',
          marginBottom: '16px'
        }}>
          Những Câu Chuyện Trên Hành Trình "Trao Giọt Hồng"
        </Title>
      </div>

      <Row gutter={[32, 32]}>
        {stories.map((story, index) => (
          <Col xs={24} md={8} key={index}>
            <Card
              hoverable
              style={{
                height: '100%',
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}
              bodyStyle={{ padding: '0' }}
              cover={
                <div style={{ 
                  height: '220px', 
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <img
                    alt={story.title}
                    src={story.image}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  />
                </div>
              }
            >
              <div style={{ padding: '24px' }}>
                <Title level={4} style={{ 
                  color: '#333',
                  marginBottom: '12px',
                  fontSize: '18px',
                  lineHeight: '1.4'
                }}>
                  {story.title}
                </Title>
                <Paragraph style={{ 
                  color: '#666',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  margin: '0'
                }}>
                  {story.description}
                </Paragraph>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default StoriesSection;
