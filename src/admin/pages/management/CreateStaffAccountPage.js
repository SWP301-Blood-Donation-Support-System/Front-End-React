import React, { useState } from 'react';
import { 
  Layout,
  Form,
  Input,
  Button,
  Typography,
  Card,
  Space,
  notification
} from 'antd';
import { UserOutlined, MailOutlined } from '@ant-design/icons';
import { AdminAPI } from '../../api/admin';
import StaffSidebar from '../../components/StaffSidebar';
import StaffHeader from '../../components/StaffHeader';
import '../../styles/staff.scss';

const { Content } = Layout;
const { Title, Text } = Typography;

const CreateStaffAccountPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const { email, fullName } = values;
      console.log('Attempting to create staff account with:', { email, fullName });
      
      const response = await AdminAPI.registerStaff(email, fullName);
      console.log('API response:', response);
      
      // Simple notification like login
      api.success({
        message: 'Tạo tài khoản thành công!',
        description: 'Tài khoản nhân viên đã được tạo thành công!',
        placement: 'topRight',
        duration: 3,
      });
      
      form.resetFields();
      
    } catch (error) {
      console.error('Error creating staff account:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = 'Có lỗi xảy ra khi tạo tài khoản nhân viên!';
      
      if (error.response?.status === 400) {
        errorMessage = 'Email đã tồn tại hoặc thông tin không hợp lệ!';
      } else if (error.response?.status === 401) {
        errorMessage = 'Bạn không có quyền thực hiện thao tác này!';
      }
      
      // Simple error notification
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
    <Layout className="staff-layout">
      {contextHolder}
      <StaffSidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout>
        <StaffHeader collapsed={collapsed} onCollapse={setCollapsed} />
        <Content className="staff-content">
          <div className="staff-content-inner">
            <Card className="staff-form-card">
              <div className="staff-page-header">
                <Title level={2}>Tạo Tài Khoản Nhân Viên</Title>
                <Text type="secondary">
                  Tạo tài khoản mới cho nhân viên trong hệ thống
                </Text>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
                autoComplete="off"
              >
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập email!'
                    },
                    {
                      type: 'email',
                      message: 'Email không hợp lệ!'
                    }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Nhập email nhân viên"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="Họ và tên"
                  name="fullName"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập họ và tên!'
                    },
                    {
                      min: 2,
                      message: 'Họ và tên phải có ít nhất 2 ký tự!'
                    }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Nhập họ và tên nhân viên"
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      size="large"
                    >
                      Tạo Tài Khoản
                    </Button>
                    <Button
                      htmlType="button"
                      onClick={() => form.resetFields()}
                      size="large"
                    >
                      Đặt Lại
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

export default CreateStaffAccountPage; 
