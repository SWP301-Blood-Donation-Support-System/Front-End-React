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
const { Content } = Layout;
const { Title, Text } = Typography;

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
  };
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Navbar />      <Content style={{ 
        padding: '50px',
        background: '#f0f2f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 64px - 46px - 200px)' // Subtract header (64px) + navbar (46px) + footer (~200px)
      }}>
        <Card
          style={{
            width: '100%',
            maxWidth: '400px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
          }}
          bodyStyle={{ padding: '40px' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Title level={2} style={{ color: '#333', marginBottom: '8px' }}>
              Chào Mừng Trở Lại
            </Title>
          </div>

          <Form
            form={form}
            name="login"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
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
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Nhập email"
                size="large"
                style={{ borderRadius: '6px' }}
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
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Mật khẩu"
                size="large"
                style={{ borderRadius: '6px' }}
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                marginBottom: '16px'
              }}>
                <Link 
                  to="/forgot-password"
                  style={{ color: '#dc2626' }}
                >
                  Quên Mật Khẩu?
                </Link>
              </div>

              <Button 
                type="primary" 
                htmlType="submit"
                size="large"
                loading={loading}
                style={{
                  width: '100%',
                  height: '48px',
                  background: '#dc2626',
                  borderColor: '#dc2626',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                Đăng Nhập
              </Button>
            </Form.Item>
          <Form.Item>
             <GoogleOAuthProvider clientId={clientId}>
      <div style={{ padding: '2rem' }}>
        {!user ? (
          <>
            <h2>Đăng nhập bằng Google</h2>
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                const decoded = jwtDecode(credentialResponse.credential);
                setUser(decoded);
              }}
              onError={() => {
                console.log('Login Failed');
              }}
            />
          </>
        ) : (
          <>
            <h2>Thông tin người dùng</h2>
            <img src={user.picture} alt="avatar" style={{ borderRadius: '50%' }} />
            <p><strong>Họ tên:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <button onClick={() => {
              googleLogout();
              setUser(null);
            }}>
              Đăng xuất
            </button>
          </>
        )}
      </div>
    </GoogleOAuthProvider>
          </Form.Item>
          
          </Form>

          <Divider style={{ margin: '24px 0' }}>
            <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
              Ghi nhớ đăng nhập
            </Text>
          </Divider>

          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: '#8c8c8c' }}>
              Chưa có tài khoản?{' '}
              <Link 
                to="/register" 
                style={{ 
                  color: '#dc2626',
                  fontWeight: '500'
                }}
              >
                Đăng Ký
              </Link>
            </Text>
          </div>
        </Card>
      </Content>
      <Footer />
    </Layout>
  );
};

export default LoginPage;
