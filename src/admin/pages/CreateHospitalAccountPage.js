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
  SafetyOutlined,
  ArrowLeftOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import StaffSidebar from '../components/StaffSidebar';
import StaffHeader from '../components/StaffHeader';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const CreateHospitalAccountPage = () => {
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <StaffSidebar />
      <Layout>
        <StaffHeader />
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            <div style={{ marginBottom: '24px' }}>
              <Space direction="vertical" size={0}>
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                  <SafetyOutlined /> Tạo tài khoản bệnh viện
                </Title>
                <Paragraph type="secondary">
                  Tạo tài khoản quản trị cho bệnh viện trong hệ thống
                </Paragraph>
              </Space>
            </div>

            <Card>
              <Result
                icon={<UserAddOutlined style={{ color: '#1890ff' }} />}
                title="Tính năng đang phát triển"
                subTitle="Chức năng tạo tài khoản bệnh viện đang được phát triển và sẽ sớm được cập nhật."
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
                    <li>Form tạo tài khoản quản trị bệnh viện</li>
                    <li>Phân quyền và vai trò người dùng</li>
                    <li>Thiết lập thông tin bảo mật</li>
                    <li>Gửi thông tin đăng nhập cho bệnh viện</li>
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

export default CreateHospitalAccountPage; 
