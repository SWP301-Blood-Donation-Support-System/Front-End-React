import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, notification, Layout, Menu } from 'antd';
import { LockOutlined, SettingOutlined } from '@ant-design/icons';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { UserAPI } from '../api/User';

const { Title, Text } = Typography;
const { Sider, Content } = Layout;

const SettingsPage = () => {
  const [api, contextHolder] = notification.useNotification();
  const [selectedKey, setSelectedKey] = useState('change-password');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const menuItems = [
    {
      key: 'change-password',
      icon: <LockOutlined />,
      label: 'Đổi mật khẩu',
    },
  ];

  const handleChangePassword = async (values) => {
    try {
      setLoading(true);
      await UserAPI.changePassword(values.currentPassword, values.newPassword);
      
      // Notification thành công
      api.success({
        message: 'Đổi mật khẩu thành công!',
        description: 'Mật khẩu đã được thay đổi thành công.',
        placement: 'topRight',
        duration: 3,
      });
      
      form.resetFields();
    } catch (error) {
      console.error('Error changing password:', error);
      
      // Lấy message từ backend
      let errorMessage = 'Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại!';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Mật khẩu hiện tại không đúng!';
      } else if (error.response?.status === 401) {
        errorMessage = 'Bạn cần đăng nhập lại!';
      }
      
      api.error({
        message: 'Đổi mật khẩu thất bại!',
        description: errorMessage,
        placement: 'topRight',
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (selectedKey) {
      case 'change-password':
        return (
          <Card title="Đổi mật khẩu" className="settings-form-card">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleChangePassword}
              autoComplete="off"
            >
              <Form.Item
                label="Mật khẩu hiện tại"
                name="currentPassword"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập mật khẩu hiện tại!',
                  },
                ]}
              >
                <Input.Password 
                  placeholder="Nhập mật khẩu hiện tại"
                  prefix={<LockOutlined />}
                />
              </Form.Item>

              <Form.Item
                label="Mật khẩu mới"
                name="newPassword"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập mật khẩu mới!',
                  },
                  {
                    min: 6,
                    message: 'Mật khẩu phải có ít nhất 6 ký tự!',
                  },
                ]}
              >
                <Input.Password 
                  placeholder="Nhập mật khẩu mới"
                  prefix={<LockOutlined />}
                />
              </Form.Item>

              <Form.Item
                label="Xác nhận mật khẩu mới"
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng xác nhận mật khẩu mới!',
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password 
                  placeholder="Xác nhận mật khẩu mới"
                  prefix={<LockOutlined />}
                />
              </Form.Item>

              <Form.Item>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Đổi mật khẩu
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Card>
        );
      default:
        return (
          <Card>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <Text type="secondary">Chọn một tùy chọn từ menu bên trái</Text>
            </div>
          </Card>
        );
    }
  };

  return (
    <div className="settings-page">
      {contextHolder}
      <Header />
      <Navbar />
      <div className="settings-content">
        <div className="container">
          <div className="settings-header">
            <Title level={2}>
              <SettingOutlined /> Cài đặt
            </Title>
            <Text type="secondary">
              Quản lý cài đặt tài khoản của bạn
            </Text>
          </div>

          <Layout className="settings-layout">
            <Sider
              width={250}
              theme="light"
              className="settings-sidebar"
            >
              <Menu
                mode="inline"
                selectedKeys={[selectedKey]}
                items={menuItems}
                onClick={({ key }) => setSelectedKey(key)}
                className="settings-menu"
              />
            </Sider>
            <Content className="settings-main-content">
              {renderContent()}
            </Content>
          </Layout>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SettingsPage;
