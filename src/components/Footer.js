import React, { useState } from 'react';
import { Layout, Row, Col, Typography, Modal } from 'antd';
import { 
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
  const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);
  const [isMissionModalVisible, setIsMissionModalVisible] = useState(false);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const showAboutModal = () => {
    setIsAboutModalVisible(true);
  };

  const showMissionModal = () => {
    setIsMissionModalVisible(true);
  };

  const handleModalClose = () => {
    setIsAboutModalVisible(false);
    setIsMissionModalVisible(false);
  };

  return (
    <AntFooter className="footer-container">
      <Row gutter={[48, 48]}>
        <Col xs={24} sm={12} md={8}>
          <Title level={4} className="footer-section-title">
            <HeartOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />
            Về Chúng Tôi
          </Title>
          <div className="footer-section">
            <div><Link className="footer-link" onClick={showAboutModal}>Giới Thiệu</Link></div>
            <div><Link className="footer-link" onClick={showMissionModal}>Sứ Mệnh</Link></div>
            <div><Link className="footer-link" onClick={() => handleNavigation('/news')}>Tin Tức</Link></div>
          </div>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Title level={4} className="footer-section-title">
            Hiến Máu
          </Title>
          <div className="footer-section">
            <div><Link className="footer-link" onClick={() => handleNavigation('/booking')}>Đăng Ký Hiến Máu</Link></div>
            <div><Link className="footer-link" onClick={() => handleNavigation('/faq')}>Câu Hỏi Thường Gặp</Link></div>
            <div><Link className="footer-link" onClick={() => handleNavigation('/search')}>Tra Cứu Nhóm Máu</Link></div>
          </div>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Title level={4} className="footer-section-title">
            Thông Tin Liên Hệ
          </Title>          <div className="footer-section">
            <div className="footer-contact-item">
              <EnvironmentOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              <Text className="footer-text">Trung tâm Hiến Máu Nhân Đạo</Text>
            </div>
            <div className="footer-contact-item">
              <PhoneOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
              <Text className="footer-text">Liên hệ giờ hành chính: 1900-1234</Text>
            </div>
            <div className="footer-contact-item">
              <MailOutlined style={{ marginRight: '8px', color: '#fa8c16' }} />
              <Text className="footer-text">giotmaunghiatinh@gmail.com</Text>
            </div>
          </div>
        </Col>
      </Row>

      <div className="footer-bottom">
        <Text className="footer-text">
          © 2025 Hệ Thống Hỗ Trợ Hiến Máu - FPT University. Mọi quyền được bảo lưu.
        </Text>
      </div>

      {/* Modal Giới Thiệu */}
      <Modal
        title="Giới Thiệu Hệ Thống"
        open={isAboutModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={750}
        centered
      >
        <div style={{ padding: '24px 0' }}>
          <Typography.Title level={4} style={{ color: '#ff4d4f', marginBottom: '20px' }}>
            Hệ Thống Hỗ Trợ Hiến Máu
          </Typography.Title>
          <Typography.Paragraph style={{ fontSize: '16px', lineHeight: '1.8', textAlign: 'justify', marginBottom: '24px' }}>
            <strong>Hệ Thống Hỗ Trợ Hiến Máu</strong> là một nền tảng web hiện đại được thiết kế để số hóa và 
            tối ưu hóa việc quản lý hiến máu tại Viện Huyết học và Truyền máu. Hệ thống cung cấp các công cụ 
            toàn diện để đăng ký người hiến máu, theo dõi đơn vị máu hiệu quả, xử lý yêu cầu máu khẩn cấp, 
            và báo cáo hoạt động.
          </Typography.Paragraph>
          
          <Typography.Title level={5} style={{ color: '#52c41a', marginBottom: '16px' }}>
            Tính Năng Chính:
          </Typography.Title>
          <ul style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '12px', fontSize: '15px', lineHeight: '1.6' }}>
              <strong style={{ color: '#1890ff' }}>Quản Lý Người Hiến Máu:</strong> Hỗ trợ đăng ký người hiến máu, quản lý hồ sơ, 
              lên lịch hẹn, và truy cập lịch sử hiến máu cùng chứng nhận.
            </li>
            <li style={{ marginBottom: '12px', fontSize: '15px', lineHeight: '1.6' }}>
              <strong style={{ color: '#1890ff' }}>Theo Dõi Đơn Vị Máu:</strong> Cho phép sàng lọc nghiêm ngặt, quản lý máu, 
              và cập nhật trạng thái cho từng đơn vị máu.
            </li>
            <li style={{ marginBottom: '12px', fontSize: '15px', lineHeight: '1.6' }}>
              <strong style={{ color: '#1890ff' }}>Xử Lý Yêu Cầu Khẩn Cấp:</strong> Hỗ trợ xử lý nhanh chóng các yêu cầu máu từ 
              bệnh viện, bao gồm phê duyệt và phân bổ máu.
            </li>
            <li style={{ marginBottom: '12px', fontSize: '15px', lineHeight: '1.6' }}>
              <strong style={{ color: '#1890ff' }}>Báo Cáo Hoạt Động:</strong> Cung cấp bảng thông tin và báo cáo chi tiết về 
              lượng máu nhận, tồn kho và hoạt động tổng thể.
            </li>
            <li style={{ marginBottom: '12px', fontSize: '15px', lineHeight: '1.6' }}>
              <strong style={{ color: '#1890ff' }}>Nhắc Nhở Tự Động:</strong> Thông báo cho người hiến máu về các lịch đặt hiến máu và 
              ngày có thể đăng kí hiến máu lại trong tương lai.
            </li>
          </ul>
        </div>
      </Modal>

      {/* Modal Sứ Mệnh */}
      <Modal
        title="Sứ Mệnh"
        open={isMissionModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={700}
        centered
      >
        <div style={{ padding: '24px 0' }}>
          <Typography.Title level={4} style={{ color: '#1890ff', marginBottom: '20px' }}>
            Điều chúng tôi hướng tới
          </Typography.Title>
          <Typography.Paragraph style={{ fontSize: '16px', lineHeight: '1.8', textAlign: 'justify' }}>
            Hệ thống nhằm mục đích tạo ra một nền tảng hiệu quả, minh bạch và dễ sử dụng để quản lý 
            toàn bộ quy trình hiến máu, từ đăng ký người hiến máu đến phân phối máu cho các bệnh viện. 
            Chúng tôi cam kết đảm bảo an toàn, chất lượng và khả năng truy cập cho tất cả các bên liên quan.
          </Typography.Paragraph>
          
          <Typography.Paragraph style={{ fontSize: '16px', lineHeight: '1.8', textAlign: 'justify', marginTop: '16px' }}>
            Với sứ mệnh này, chúng tôi mong muốn góp phần vào việc cứu sống nhiều sinh mệnh hơn thông qua 
            việc tối ưu hóa quy trình hiến máu và nâng cao hiệu quả trong công tác quản lý máu.
          </Typography.Paragraph>
        </div>
      </Modal>
    </AntFooter>
  );
};

export default Footer;
