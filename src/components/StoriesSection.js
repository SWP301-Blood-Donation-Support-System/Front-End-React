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
    <div className="stories-section">
      <div className="stories-section-header">
        <Title level={2} className="stories-section-header-title">
          Những Câu Chuyện Trên Hành Trình "Trao Giọt Hồng"
        </Title>
      </div>

      <Row gutter={[32, 32]}>
        {stories.map((story, index) => (
          <Col xs={24} md={8} key={index}>
            <Card
              hoverable
              className="stories-section-card"
              cover={
                <div className="stories-section-card-cover">
                  <img
                    alt={story.title}
                    src={story.image}
                  />
                </div>
              }
            >
              <div className="stories-section-card-content">
                <Title level={4} className="stories-section-card-title">
                  {story.title}
                </Title>
                <Paragraph className="stories-section-card-description">
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
