import React from 'react';
import { Layout, Row, Col, Typography, Input, Button, Space } from 'antd';
import { FacebookOutlined, TwitterOutlined, InstagramOutlined, YoutubeOutlined } from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Title, Text, Link } = Typography;

const Footer = () => {
  return (
    <AntFooter style={{ 
      background: '#212529', 
      color: 'white', 
      padding: '60px 50px 20px' 
    }}>
      <Row gutter={[48, 48]}>
        <Col xs={24} sm={12} md={6}>
          <Title level={4} style={{ color: 'white', marginBottom: '24px' }}>
            Về Chúng Tôi
          </Title>
          <div style={{ lineHeight: '2' }}>
            <div><Link style={{ color: '#bdc3c7' }}>Sứ Mệnh</Link></div>
            <div><Link style={{ color: '#bdc3c7' }}>Lịch Sử</Link></div>
            <div><Link style={{ color: '#bdc3c7' }}>Ban Lãnh Đạo</Link></div>
            <div><Link style={{ color: '#bdc3c7' }}>Tài Chính</Link></div>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Title level={4} style={{ color: 'white', marginBottom: '24px' }}>
            Hiến Máu
          </Title>
          <div style={{ lineHeight: '2' }}>
            <div><Link style={{ color: '#bdc3c7' }}>Yêu Cầu Về Điều Kiện</Link></div>
            <div><Link style={{ color: '#bdc3c7' }}>Các Loại Hiến Tặng</Link></div>
            <div><Link style={{ color: '#bdc3c7' }}>Những Điều Cần Biết</Link></div>
            <div><Link style={{ color: '#bdc3c7' }}>Tìm Điểm Hiến Máu</Link></div>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Title level={4} style={{ color: 'white', marginBottom: '24px' }}>
            Dịch Vụ Máu
          </Title>
          <div style={{ lineHeight: '2' }}>
            <div><Link style={{ color: '#bdc3c7' }}>Xét Nghiệm Máu</Link></div>
            <div><Link style={{ color: '#bdc3c7' }}>Dịch Vụ Huyết Tương</Link></div>
            <div><Link style={{ color: '#bdc3c7' }}>Máu Khẩn Cấp</Link></div>
            <div><Link style={{ color: '#bdc3c7' }}>Hỗ Trợ Y Tế</Link></div>
          </div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Title level={4} style={{ color: 'white', marginBottom: '24px' }}>
            Kết Nối Với Chúng Tôi
          </Title>
          <Text style={{ color: '#bdc3c7', display: 'block', marginBottom: '16px' }}>
            Đăng ký nhận bản tin của chúng tôi để cập nhật thông tin về hiến máu và các cơ hội tham gia.
          </Text>
          <Space.Compact style={{ width: '100%', marginBottom: '24px' }}>
            <Input 
              placeholder="Email của bạn"
              style={{ 
                borderRadius: '4px 0 0 4px'
              }}
            />
            <Button 
              type="primary" 
              style={{ 
                background: '#dc2626',
                borderColor: '#dc2626',
                borderRadius: '0 4px 4px 0'
              }}
            >
              Đăng Ký
            </Button>
          </Space.Compact>
          <Space size="large">
            <FacebookOutlined style={{ fontSize: '20px', color: '#bdc3c7', cursor: 'pointer' }} />
            <TwitterOutlined style={{ fontSize: '20px', color: '#bdc3c7', cursor: 'pointer' }} />
            <InstagramOutlined style={{ fontSize: '20px', color: '#bdc3c7', cursor: 'pointer' }} />
            <YoutubeOutlined style={{ fontSize: '20px', color: '#bdc3c7', cursor: 'pointer' }} />
          </Space>
        </Col>
      </Row>

      <div style={{ 
        borderTop: '1px solid #34495e', 
        marginTop: '40px', 
        paddingTop: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <Text style={{ color: '#bdc3c7' }}>
          © 2025 Hệ Thống Hỗ Trợ Hiến Máu. Đã đăng ký bản quyền.
        </Text>
        <Space>
          <Link style={{ color: '#bdc3c7' }}>Chính Sách Bảo Mật</Link>
          <Link style={{ color: '#bdc3c7' }}>Điều Khoản Dịch Vụ</Link>
          <Link style={{ color: '#bdc3c7' }}>Liên Hệ</Link>
        </Space>
      </div>
    </AntFooter>
  );
};

export default Footer;
