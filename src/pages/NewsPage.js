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
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Navbar />
      
      {/* Hero Section */}
      <div style={{
        background: '#761611',
        padding: '60px 0',
        color: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <Row align="middle" gutter={[40, 20]}>
            <Col xs={24} md={16}>
              <Title 
                level={1} 
                style={{ 
                  color: 'white', 
                  marginBottom: '16px',
                  fontSize: '48px',
                  fontWeight: 'bold'
                }}
              >
                Tin Tức
              </Title>
              <Paragraph style={{ 
                color: 'white', 
                fontSize: '18px',
                opacity: 0.9,
                marginBottom: 0
              }}>
                Cập nhật những tin tức mới nhất về hoạt động hiến máu, các chương trình tình nguyện và những câu chuyện cảm động từ cộng đồng hiến máu.
              </Paragraph>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'center' }}>
              <FileTextOutlined style={{ fontSize: '80px', color: 'white', opacity: 0.8 }} />
            </Col>
          </Row>
        </div>
      </div>

      <Content style={{ 
        padding: '80px 20px',
        background: '#f8f9fa',
        minHeight: 'calc(100vh - 300px)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Featured Article */}
          <Card
            style={{
              marginBottom: '40px',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              border: 'none'
            }}
            cover={
              <div style={{ 
                height: '400px', 
                backgroundImage: `url(${newsData[0].image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  background: '#dc2626',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  TIN NỔI BẬT
                </div>
              </div>
            }
          >
            <div style={{ padding: '30px' }}>
              <div style={{ marginBottom: '16px' }}>
                <Tag icon={<CalendarOutlined />} color="blue">
                  {newsData[0].date}
                </Tag>
              </div>
              <Title level={2} style={{ 
                marginBottom: '16px',
                color: '#333',
                fontSize: '28px',
                lineHeight: '1.3'
              }}>
                {newsData[0].title}
              </Title>
              <Paragraph style={{ 
                fontSize: '16px',
                color: '#666',
                lineHeight: '1.6',
                marginBottom: '24px'
              }}>
                {newsData[0].excerpt}
              </Paragraph>
              <Button 
                type="primary" 
                size="large"
                icon={<ArrowRightOutlined />}
                style={{
                  background: '#dc2626',
                  borderColor: '#dc2626',
                  borderRadius: '8px',
                  height: '48px',
                  padding: '0 32px',
                  fontSize: '16px'
                }}
              >
                Đọc Thêm
              </Button>
            </div>
          </Card>

          {/* News Grid */}
          <Row gutter={[24, 32]}>
            {newsData.slice(1).map((article) => (
              <Col xs={24} sm={12} lg={8} key={article.id}>
                <Card
                  hoverable
                  style={{
                    height: '100%',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    border: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  cover={
                    <div style={{ 
                      height: '220px', 
                      backgroundImage: `url(${article.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }} />
                  }
                  actions={[
                    <Button 
                      type="link" 
                      icon={<ArrowRightOutlined />}
                      style={{ 
                        color: '#dc2626',
                        fontWeight: '500'
                      }}
                    >
                      Đọc thêm
                    </Button>
                  ]}
                >
                  <Meta
                    title={
                      <div>
                        <div style={{ marginBottom: '12px' }}>
                          <Tag icon={<CalendarOutlined />} color="blue" size="small">
                            {article.date}
                          </Tag>
                        </div>
                        <Title level={4} style={{ 
                          marginBottom: '12px',
                          color: '#333',
                          fontSize: '18px',
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {article.title}
                        </Title>
                      </div>
                    }
                    description={
                      <Text style={{ 
                        color: '#666',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {article.excerpt}
                      </Text>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>

          {/* Load More Section */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '60px',
            padding: '40px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <Title level={4} style={{ color: '#333', marginBottom: '20px' }}>
              Khám phá thêm nhiều tin tức hấp dẫn
            </Title>
            <Button 
              size="large"
              style={{
                background: '#dc2626',
                borderColor: '#dc2626',
                color: 'white',
                borderRadius: '8px',
                height: '48px',
                padding: '0 32px',
                fontSize: '16px'
              }}
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
