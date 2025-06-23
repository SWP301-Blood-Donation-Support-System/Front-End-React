import React from 'react';
import { Layout, Row, Col, Typography, Space } from 'antd';
import { 
  FacebookOutlined, 
  TwitterOutlined, 
  InstagramOutlined, 
  YoutubeOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Footer: AntFooter } = Layout;
const { Title, Text, Link } = Typography;

const Footer = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <AntFooter className="footer-container">
      <Row gutter={[48, 48]}>
        <Col xs={24} sm={12} md={6}>
          <Title level={4} className="footer-section-title">
            <HeartOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />
            Về Chúng Tôi
          </Title>
          <div className="footer-section">
            <div><Link className="footer-link" onClick={() => handleNavigation('/about')}>Giới Thiệu</Link></div>
            <div><Link className="footer-link" onClick={() => handleNavigation('/mission')}>Sứ Mệnh</Link></div>
            <div><Link className="footer-link" onClick={() => handleNavigation('/team')}>Đội Ngũ</Link></div>
            <div><Link className="footer-link" onClick={() => handleNavigation('/news')}>Tin Tức</Link></div>
          </div>
        </Col>        <Col xs={24} sm={12} md={6}>
          <Title level={4} className="footer-section-title">
            Hiến Máu
          </Title>
          <div className="footer-section">
            <div><Link className="footer-link" onClick={() => handleNavigation('/booking')}>Đăng Ký Hiến Máu</Link></div>
            <div><Link className="footer-link" onClick={() => handleNavigation('/faq')}>Câu Hỏi Thường Gặp</Link></div>
            <div><Link className="footer-link" onClick={() => handleNavigation('/search')}>Tra Cứu Nhóm Máu</Link></div>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Title level={4} className="footer-section-title">
            Thông Tin Liên Hệ
          </Title>          <div className="footer-section">
            <div className="footer-contact-item">
              <EnvironmentOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              <Text className="footer-text">Đại học FPT, Hồ Chí Minh</Text>
            </div>
            <div className="footer-contact-item">
              <PhoneOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
              <Text className="footer-text">Hotline: 1900-1234</Text>
            </div>
            <div className="footer-contact-item">
              <MailOutlined style={{ marginRight: '8px', color: '#fa8c16' }} />
              <Text className="footer-text">blooddonation@fpt.edu.vn</Text>
            </div>
          </div>
        </Col>        <Col xs={24} sm={12} md={6}>
          <Title level={4} className="footer-section-title">
            Theo Dõi Chúng Tôi
          </Title>          
          <Space size="large" className="footer-social-icons">
            <FacebookOutlined style={{ fontSize: '20px', color: '#1877f2', cursor: 'pointer' }} />
            <TwitterOutlined style={{ fontSize: '20px', color: '#1da1f2', cursor: 'pointer' }} />
            <InstagramOutlined style={{ fontSize: '20px', color: '#e4405f', cursor: 'pointer' }} />
            <YoutubeOutlined style={{ fontSize: '20px', color: '#ff0000', cursor: 'pointer' }} />
          </Space>
        </Col>
      </Row>

      <div className="footer-bottom">
        <Text className="footer-text">
          © 2025 Hệ Thống Quản Lý Hiến Máu - FPT University. Mọi quyền được bảo lưu.
        </Text>
        <Space>
          <Link className="footer-link" onClick={() => handleNavigation('/privacy')}>Chính Sách Bảo Mật</Link>
          <Link className="footer-link" onClick={() => handleNavigation('/terms')}>Điều Khoản Sử Dụng</Link>
          <Link className="footer-link" onClick={() => handleNavigation('/contact')}>Liên Hệ Hỗ Trợ</Link>
        </Space>
      </div>
    </AntFooter>
  );
};

export default Footer;
