import React, { useState, useEffect } from 'react';
import { Layout, Card, Form, Input, Button, Typography, Alert, notification } from 'antd';
import { LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { UserAPI } from '../api/User';

const { Title, Text } = Typography;

const ResetPasswordPage = () => {
  const [api, contextHolder] = notification.useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [isValidToken, setIsValidToken] = useState(true);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Get token from URL parameters
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      // If no token, redirect to login
      setIsValidToken(false);
    }
  }, [searchParams]);

  const onFinish = async (values) => {
    if (!token) {
      api.error({
        message: 'Lỗi!',
        description: 'Token không hợp lệ. Vui lòng thử lại.',
        duration: 4.5,
      });
      return;
    }

    setLoading(true);
    
    try {
      await UserAPI.resetPassword(token, values.password);
      
      // Show success message
      api.success({
        message: 'Đặt lại mật khẩu thành công!',
        description: 'Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập với mật khẩu mới.',
        duration: 4.5,
      });
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Reset password error:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi đặt lại mật khẩu.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Token đã hết hạn hoặc không hợp lệ.';
      }
      
      api.error({
        message: 'Đặt lại mật khẩu thất bại!',
        description: errorMessage,
        duration: 4.5,
      });
      
      // If token is invalid, redirect to login after showing error
      if (error.response?.status === 400) {
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Header />
        <Navbar />
        
        <div className="auth-container">
          <Card className="auth-card" style={{ maxWidth: 500, margin: '60px auto' }}>
            <Alert
              message="Liên kết không hợp lệ"
              description="Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng thử lại."
              type="error"
              showIcon
              style={{ marginBottom: '20px' }}
            />
            <Button 
              type="primary" 
              onClick={() => navigate('/login')}
              block
              size="large"
            >
              Quay lại đăng nhập
            </Button>
          </Card>
        </div>
        
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {contextHolder}
      <Header />
      <Navbar />
      
      <div className="auth-container">
        <Card className="auth-card" style={{ maxWidth: 500, margin: '60px auto' }}>
          <div className="auth-header">
            <Title level={2} className="auth-title">
              Đặt Lại Mật Khẩu
            </Title>
            <Text className="auth-subtitle">
              Nhập mật khẩu mới cho tài khoản của bạn
            </Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="auth-form"
          >
            <Form.Item
              label="Mật khẩu mới"
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập mật khẩu mới!'
                },
                {
                  min: 6,
                  message: 'Mật khẩu phải có ít nhất 6 ký tự!'
                }
              ]}
            >
              <Input.Password
                className="auth-password-input"
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu mới"
                size="large"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                {
                  required: true,
                  message: 'Vui lòng xác nhận mật khẩu!'
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password
                className="auth-password-input"
                prefix={<LockOutlined />}
                placeholder="Xác nhận mật khẩu mới"
                size="large"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
                className="auth-submit-btn"
                size="large"
                block
              >
                Đặt Lại Mật Khẩu
              </Button>
            </Form.Item>
          </Form>

          <div className="auth-footer" style={{ textAlign: 'center', marginTop: '20px' }}>
            <Text className="auth-footer-text">
              Nhớ mật khẩu?{' '}
              <Button type="link" onClick={() => navigate('/login')} style={{ padding: 0 }}>
                Đăng nhập
              </Button>
            </Text>
          </div>
        </Card>
      </div>
      
      <Footer />
    </Layout>
  );
};

export default ResetPasswordPage;
