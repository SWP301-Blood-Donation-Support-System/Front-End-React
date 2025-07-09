import React from 'react';
import { 
  Layout, 
  Card, 
  Typography, 
  Space, 
  Button, 
  Result
} from 'antd';
import { 
  HomeOutlined,
  ArrowLeftOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import StaffSidebar from '../components/StaffSidebar';
import StaffHeader from '../components/StaffHeader';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const HospitalRegistrationPage = () => {
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <StaffSidebar />
      <Layout>
        <StaffHeader />
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            {/* Page Header */}
            <div style={{ marginBottom: '24px' }}>
              <Space direction="vertical" size={0}>
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                  <HomeOutlined /> Đăng ký bệnh viện
                </Title>
                <Paragraph type="secondary">
                  Đăng ký bệnh viện mới vào hệ thống quản lý hiến máu
                </Paragraph>
              </Space>
            </div>

            {/* Main Content */}
            <Card>
              <Result
                icon={<PlusOutlined style={{ color: '#1890ff' }} />}
                title="Tính năng đang phát triển"
                subTitle="Chức năng đăng ký bệnh viện đang được phát triển và sẽ sớm được cập nhật."
                extra={[
                  <Button 
                    key="back" 
                    type="primary"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/staff/hospital-list')}
                  >
                    Quay lại danh sách bệnh viện
                  </Button>,
                  <Button 
                    key="list" 
                    onClick={() => navigate('/staff/hospital-list')}
                  >
                    Xem danh sách bệnh viện
                  </Button>
                ]}
              >
                <div style={{ marginTop: '24px' }}>
                  <Paragraph>
                    Tính năng này sẽ bao gồm:
                  </Paragraph>
                  <ul style={{ textAlign: 'left', display: 'inline-block' }}>
                    <li>Form đăng ký thông tin bệnh viện</li>
                    <li>Xác thực thông tin và tài liệu</li>
                    <li>Phê duyệt đăng ký</li>
                    <li>Thông báo kết quả đăng ký</li>
                  </ul>
                </div>
              </Result>
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default HospitalRegistrationPage; 