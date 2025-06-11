import React from 'react';
import { Layout, Typography, Card, Row, Col, Button, Tag } from 'antd';
import { CalendarOutlined, ArrowRightOutlined, FileTextOutlined } from '@ant-design/icons';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

const NewsPage = () => {
  const newsData = [
    {
      id: 1,
      title: 'KHỞI ĐỘNG THÁNG NHÂN ĐẠO NĂM 2025: HÀNH TRÌNH "TRAO GIỌT HỒNG - LƯU GIỮ YÊU THƯƠNG"',
      excerpt: 'Ngày 8-5, tại TP.HCM, Trung ương Hội Chữ thập đỏ Việt Nam và UBND TP.HCM phối hợp tổ chức lễ phát động Tháng Nhân đạo các cấp gia năm 2025...',
      date: '8 tháng 1, 2025',
      image: '/images/vn_blog_1.png',
      featured: true
    },
    {
      id: 2,
      title: 'NGÀY TOÀN DÂN HIẾN MÁU TÌNH NGUYỆN 7/4',
      excerpt: 'Ngày 7/4, chúng ta cùng nhau hướng về một ngày ý nghĩa - Ngày hiến máu tình nguyện Việt Nam. Đây là dịp để mỗi người - Mỗi nghĩa cử cao đẹp...',
      date: '7 tháng 4, 2025',
      image: '/images/vn_blog_2.png'
    },
    {
      id: 3,
      title: 'ÁP DỤNG CÔNG NGHỆ SỐ TRONG HOẠT ĐỘNG HIẾN MÁU',
      excerpt: 'Ngày 04/3, tại Trung tâm triển màn hiến đạo, Hội Chữ thập đỏ Thành phố Hồ Chí Minh đã tổ chức Hội thảo "Ứng dụng công nghệ số trong hoạt động hiến máu...',
      date: '4 tháng 3, 2025',
      image: '/images/vn_blog_3.jpg'
    },
    {
      id: 4,
      title: 'HƠN 1.000 ĐƠN VỊ MÁU ĐƯỢC TIẾP NHẬN TẠI LỄ HỘI XUÂN TÌNH NGUYỆN',
      excerpt: 'Chương trình "Lễ hội Xuân tình nguyện" đã thu hút sự tham gia của hàng nghìn người dân và tình nguyện viên...',
      date: '15 tháng 2, 2025',
      image: '/images/vn_blog_4.jpg'
    },
    {
      id: 5,
      title: 'HỘI NGHỊ TỔNG KẾT CÔNG TÁC VẬN ĐỘNG HIẾN MÁU NĂM 2024',
      excerpt: 'Nhìn lại một năm hoạt động, ngành y tế đã đạt được nhiều kết quả tích cực trong công tác vận động hiến máu tình nguyện...',
      date: '10 tháng 1, 2025',
      image: '/images/vn_blog_5.png'
    },
    {
      id: 6,
      title: 'KỶ NIỆM 25 NĂM THÀNH LẬP VÀ PHÁT TRIỂN TRUNG TÂM HIẾN MÁU',
      excerpt: 'Trung tâm Hiến máu Nhân đạo kỷ niệm 25 năm thành lập và phát triển (1999 - 2024) với nhiều hoạt động ý nghĩa...',
      date: '25 tháng 12, 2024',
      image: '/images/vn_blog_6.jpg'
    }
  ];
  return (
    <Layout className="news-page">
      <Header />
      <Navbar />
      
      {/* Hero Section */}
      <div className="news-hero">
        <div className="news-hero-container">
          <Row align="middle" gutter={[40, 20]}>
            <Col xs={24} md={16}>
              <Title level={1} className="news-hero-title">
                Tin Tức
              </Title>
              <Paragraph className="news-hero-description">
                Cập nhật những tin tức mới nhất về hoạt động hiến máu, các chương trình tình nguyện và những câu chuyện cảm động từ cộng đồng hiến máu.
              </Paragraph>
            </Col>            <Col xs={24} md={8} className="news-hero-icon-container">
              <FileTextOutlined className="news-hero-icon" />
            </Col>
          </Row>
        </div>
      </div>      <Content className="news-content">
        <div className="news-content-container">
          
          {/* Featured Article */}
          <Card
            className="featured-article"
            cover={
              <div className="featured-article-cover" style={{ 
                backgroundImage: `url(${newsData[0].image})`
              }}>
                <div className="featured-article-badge">
                  TIN NỔI BẬT
                </div>
              </div>
            }
          >
            <div className="featured-article-content">
              <div className="featured-article-date">
                <Tag icon={<CalendarOutlined />} color="blue">
                  {newsData[0].date}
                </Tag>
              </div>
              <Title level={2} className="featured-article-title">
                {newsData[0].title}
              </Title>
              <Paragraph className="featured-article-excerpt">
                {newsData[0].excerpt}
              </Paragraph>
              <Button 
                type="primary" 
                size="large"
                icon={<ArrowRightOutlined />}
                className="featured-article-button"
              >
                Đọc Thêm
              </Button>
            </div>
          </Card>          {/* News Grid */}
          <Row gutter={[24, 32]} className="news-grid">
            {newsData.slice(1).map((article) => (
              <Col xs={24} sm={12} lg={8} key={article.id}>
                <Card
                  hoverable
                  className="news-card"
                  cover={
                    <div className="news-card-cover" style={{ 
                      backgroundImage: `url(${article.image})`
                    }} />
                  }
                  actions={[
                    <Button 
                      type="link" 
                      icon={<ArrowRightOutlined />}
                      className="news-card-action"
                    >
                      Đọc thêm
                    </Button>
                  ]}
                >
                  <Meta
                    title={
                      <div>
                        <div className="news-card-date">
                          <Tag icon={<CalendarOutlined />} color="blue" size="small">
                            {article.date}
                          </Tag>
                        </div>
                        <Title level={4} className="news-card-title">
                          {article.title}
                        </Title>
                      </div>
                    }
                    description={
                      <Text className="news-card-excerpt">
                        {article.excerpt}
                      </Text>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>          {/* Load More Section */}
          <div className="load-more-section">
            <Title level={4} className="load-more-section-title">
              Khám phá thêm nhiều tin tức hấp dẫn
            </Title>
            <Button 
              size="large"
              className="load-more-section-button"
            >
              Xem Thêm Tin Tức
            </Button>
          </div>
        </div>
      </Content>
      
      <Footer />
    </Layout>
  );
};

export default NewsPage;
