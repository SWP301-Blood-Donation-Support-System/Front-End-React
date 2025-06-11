import React, { useState } from 'react';
import { Layout, Card, Form, Input, Button, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';


const clientId = ''; // Thay bằng client ID bạn lấy từ Google Cloud

const LoginPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const onFinish = async (values) => {
    setLoading(true);
    console.log('Login values:', values);
    
    // Simulate login API call
    setTimeout(() => {
      setLoading(false);
      // Navigate to homepage after successful login
      navigate('/');
    }, 1000);
  };  return (
    <Layout className="auth-page">
      <Header />
      <Navbar />
      
      <div className="auth-container">
        <Card className="auth-card">
          <div className="auth-header">
            <Typography.Title className="auth-title">
              Chào Mừng Trở Lại
            </Typography.Title>
            <Typography.Text className="auth-subtitle">
              Đăng nhập để tiếp tục hành trình hiến máu cứu người
            </Typography.Text>
          </div>

          <Form
            form={form}
            name="login"
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
                prefix={<UserOutlined />}
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
                }
              ]}
            >
              <Input.Password
                className="auth-password-input"
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu"
                size="large"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                marginBottom: '16px'
              }}>
                <Link to="/forgot-password" className="auth-forgot-link">
                  Quên Mật Khẩu?
                </Link>
              </div>

              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
                className="auth-submit-btn"
              >
                Đăng Nhập
              </Button>
            </Form.Item>
          </Form>

          <Divider className="auth-divider">
            Hoặc
          </Divider>

          <GoogleOAuthProvider clientId={clientId}>
            <div className="auth-google-section">
              {!user ? (
                <>
                  <Typography.Text className="auth-google-text">
                    Đăng nhập bằng Google
                  </Typography.Text>
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      const decoded = jwtDecode(credentialResponse.credential);
                      setUser(decoded);
                    }}
                    onError={() => {
                      console.log('Login Failed');
                    }}
                    size="large"
                    width="100%"
                  />
                </>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <Typography.Title level={4}>Thông tin người dùng</Typography.Title>
                  <img 
                    src={user.picture} 
                    alt="avatar" 
                    style={{ 
                      borderRadius: '50%', 
                      width: '60px', 
                      height: '60px',
                      marginBottom: '16px'
                    }} 
                  />
                  <p><strong>Họ tên:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <Button 
                    onClick={() => {
                      googleLogout();
                      setUser(null);
                    }}
                    className="auth-submit-btn"
                    style={{ width: 'auto', padding: '0 24px' }}
                  >
                    Đăng xuất
                  </Button>
                </div>
              )}
            </div>
          </GoogleOAuthProvider>

          <div className="auth-footer">
            <Typography.Text className="auth-footer-text">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="auth-footer-link">
                Đăng Ký
              </Link>
            </Typography.Text>
          </div>
        </Card>
      </div>
      
      <Footer />
    </Layout>
  );
};

export default LoginPage;
