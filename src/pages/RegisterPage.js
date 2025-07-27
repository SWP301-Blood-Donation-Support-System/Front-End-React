import React, { useState, useEffect } from 'react';
import { Layout, Card, Form, Input, Button, Typography, Divider, message } from 'antd';
import { LockOutlined, EyeInvisibleOutlined, EyeTwoTone, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { UserAPI } from '../api/User';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    console.log('Register values:', values);
    
    try {
      // Call the actual registration API (without username)
      const response = await UserAPI.register(null, values.email, values.password);
      console.log("response", response.data.result);
      if (response.status === 200 || response.status === 201) {
        message.success('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');
        // Navigate to login page after successful registration
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle different types of errors
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else if (error.response && error.response.status === 400) {
        message.error('Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại.');
      } else if (error.response && error.response.status === 409) {
        message.error('Email đã tồn tại. Vui lòng chọn email khác.');
      } else {
        message.error('Đăng ký thất bại. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="auth-page">
      <Header />
      <Navbar />
      
      <div className="auth-container">
        <Card className="auth-card">
          <div className="auth-header">
            <Typography.Title className="auth-title">
              Tạo Tài Khoản Của Bạn
            </Typography.Title>
            <Typography.Text className="auth-subtitle">
              Tham gia cộng đồng của chúng tôi và tạo sự khác biệt bằng cách hiến máu.
            </Typography.Text>
          </div>

          <Form
            form={form}
            name="register"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            className="auth-form"
          >
            <Form.Item
              label="Địa Chỉ Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập email của bạn!'
                },
                {
                  type: 'email',
                  message: 'Email không hợp lệ!'
                }
              ]}
            >
              <Input
                className="auth-input-affix-wrapper"
                prefix={<MailOutlined />}
                placeholder="Nhập địa chỉ email"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Mật Khẩu"
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập mật khẩu!'
                },
                {
                  min: 8,
                  message: 'Mật khẩu phải có ít nhất 8 ký tự!'
                }
              ]}
              help="Mật khẩu phải có ít nhất 8 ký tự."
            >
              <Input.Password
                className="auth-password-input"
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu"
                size="large"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item
              label="Xác Nhận Mật Khẩu"
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
                  }
                }),
              ]}
            >
              <Input.Password
                className="auth-password-input"
                prefix={<LockOutlined />}
                placeholder="Nhập lại mật khẩu"
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
              >
                Tạo Tài Khoản
              </Button>
            </Form.Item>
          </Form>

          <Divider className="auth-divider" />

          <div className="auth-footer">
            <Typography.Text className="auth-footer-text">
              Đã có tài khoản?{' '}
              <Link to="/login" className="auth-footer-link">
                Đăng Nhập
              </Link>
            </Typography.Text>
          </div>
        </Card>
      </div>
      
      <Footer />
    </Layout>
  );
};

export default RegisterPage;
