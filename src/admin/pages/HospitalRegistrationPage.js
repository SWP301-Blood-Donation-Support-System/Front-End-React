import React, { useState } from 'react';
import { 
  Layout, 
  Card, 
  Typography, 
  Space, 
  Button, 
  Form,
  Input,
  notification,
  Row,
  Col
} from 'antd';
import { 
  BankOutlined,
  ArrowLeftOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import StaffSidebar from '../components/StaffSidebar';
import StaffHeader from '../components/StaffHeader';
import { HospitalAPI } from '../api/hospital';

const { Content } = Layout;
const { Title, Text } = Typography;

const HospitalRegistrationPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const hospitalData = {
        hospitalName: values.hospitalName.trim(),
        hospitalAddress: values.hospitalAddress.trim()
      };

      await HospitalAPI.createHospital(hospitalData);
      
      api.success({
        message: 'Thành công!',
        description: 'Đăng ký bệnh viện thành công!',
        placement: 'topRight',
        duration: 3,
      });
      
      form.resetFields();
      
    } catch (error) {
      console.error('Error creating hospital:', error);
      
      let errorMessage = 'Không thể đăng ký bệnh viện. Vui lòng thử lại!';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      api.error({
        message: 'Lỗi!',
        description: errorMessage,
        placement: 'topRight',
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {contextHolder}
      <StaffSidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout>
        <StaffHeader collapsed={collapsed} onCollapse={setCollapsed} />
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            {/* Page Header */}
            <div style={{ marginBottom: '24px' }}>
              <Space direction="vertical" size={0}>
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                  <BankOutlined /> Đăng ký bệnh viện
                </Title>
                <Text type="secondary">
                  Đăng ký bệnh viện mới vào hệ thống quản lý hiến máu
                </Text>
              </Space>
            </div>

            {/* Registration Form */}
            <Card title="Thông tin bệnh viện" style={{ maxWidth: 800, margin: '0 auto' }}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                size="large"
              >
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Form.Item
                      label="Tên bệnh viện"
                      name="hospitalName"
                      rules={[
                        {
                          required: true,
                          message: 'Vui lòng nhập tên bệnh viện!',
                        },
                        {
                          min: 3,
                          message: 'Tên bệnh viện phải có ít nhất 3 ký tự!',
                        },
                        {
                          max: 200,
                          message: 'Tên bệnh viện không được vượt quá 200 ký tự!',
                        }
                      ]}
                    >
                      <Input 
                        placeholder="Nhập tên bệnh viện..."
                        disabled={loading}
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col span={24}>
                    <Form.Item
                      label="Địa chỉ bệnh viện"
                      name="hospitalAddress"
                      rules={[
                        {
                          required: true,
                          message: 'Vui lòng nhập địa chỉ bệnh viện!',
                        },
                        {
                          min: 10,
                          message: 'Địa chỉ phải có ít nhất 10 ký tự!',
                        },
                        {
                          max: 500,
                          message: 'Địa chỉ không được vượt quá 500 ký tự!',
                        }
                      ]}
                    >
                      <Input.TextArea 
                        placeholder="Nhập địa chỉ đầy đủ của bệnh viện..."
                        rows={3}
                        disabled={loading}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item style={{ marginTop: '32px', textAlign: 'center' }}>
                  <Space size="middle">
                    <Button
                      type="default"
                      icon={<ArrowLeftOutlined />}
                      onClick={() => navigate('/staff/hospital-list')}
                      disabled={loading}
                    >
                      Quay lại
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={loading}
                      size="large"
                    >
                      Đăng ký bệnh viện
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default HospitalRegistrationPage; 