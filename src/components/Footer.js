import React from 'react';
import { Layout, Row, Col, Typography, Input, Button, Space } from 'antd';
import { FacebookOutlined, TwitterOutlined, InstagramOutlined, YoutubeOutlined } from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Title, Text, Link } = Typography;

const Footer = () => {
  return (
    <AntFooter className="footer-container">
      <Row gutter={[48, 48]}>
        <Col xs={24} sm={12} md={6}>
          <Title level={4} className="footer-section-title">
            Về Chúng Tôi
          </Title>
          <div className="footer-section">
            <div><Link className="footer-link">Sứ Mệnh</Link></div>
            <div><Link className="footer-link">Lịch Sử</Link></div>
            <div><Link className="footer-link">Ban Lãnh Đạo</Link></div>
            <div><Link className="footer-link">Tài Chính</Link></div>
          </div>
        </Col>        <Col xs={24} sm={12} md={6}>
          <Title level={4} className="footer-section-title">
            Hiến Máu
          </Title>
          <div className="footer-section">
            <div><Link className="footer-link">Yêu Cầu Về Điều Kiện</Link></div>
            <div><Link className="footer-link">Các Loại Hiến Tặng</Link></div>
            <div><Link className="footer-link">Những Điều Cần Biết</Link></div>
            <div><Link className="footer-link">Tìm Điểm Hiến Máu</Link></div>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Title level={4} className="footer-section-title">
            Dịch Vụ Máu
          </Title>
          <div className="footer-section">
            <div><Link className="footer-link">Xét Nghiệm Máu</Link></div>
            <div><Link className="footer-link">Dịch Vụ Huyết Tương</Link></div>
            <div><Link className="footer-link">Máu Khẩn Cấp</Link></div>
            <div><Link className="footer-link">Hỗ Trợ Y Tế</Link></div>
          </div>
        </Col>        <Col xs={24} sm={12} md={6}>
          <Title level={4} className="footer-section-title">
            Kết Nối Với Chúng Tôi
          </Title>          <Text className="footer-text footer-newsletter-text">
            Đăng ký nhận bản tin của chúng tôi để cập nhật thông tin về hiến máu và các cơ hội tham gia.
          </Text>
          <Space.Compact className="footer-newsletter">
            <Input 
              placeholder="Email của bạn"
            />
            <Button type="primary">
              Đăng Ký
            </Button>
          </Space.Compact>
          <Space size="large" className="footer-social-icons">
            <FacebookOutlined />
            <TwitterOutlined />
            <InstagramOutlined />
            <YoutubeOutlined />
          </Space>
        </Col>
      </Row>      <div className="footer-bottom">
        <Text className="footer-text">
          © 2025 Hệ Thống Hỗ Trợ Hiến Máu. Đã đăng ký bản quyền.
        </Text>
        <Space>
          <Link className="footer-link">Chính Sách Bảo Mật</Link>
          <Link className="footer-link">Điều Khoản Dịch Vụ</Link>
          <Link className="footer-link">Liên Hệ</Link>
        </Space>
      </div>
    </AntFooter>
  );
};

export default Footer;
