import React, { useState } from 'react';
import { Layout, Card, Form, Input, Button, Typography, DatePicker, Divider } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const { Content } = Layout;
const { Title, Text } = Typography;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    console.log('Register values:', values);
    
    // Simulate registration API call
    setTimeout(() => {
      setLoading(false);
      // Navigate to login page after successful registration
      navigate('/login');
    }, 1000);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Navbar />
      <Content style={{ 
        padding: '50px',
        background: '#f0f2f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 64px - 46px - 200px)'
      }}>
        <Card
          style={{
            width: '100%',
            maxWidth: '480px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
          }}
          bodyStyle={{ padding: '40px' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Title level={2} style={{ color: '#333', marginBottom: '8px' }}>
              Tạo Tài Khoản Của Bạn
            </Title>
            <Text style={{ color: '#666', fontSize: '14px' }}>
              Tham gia cộng đồng của chúng tôi và tạo sự khác biệt bằng cách hiến máu.
            </Text>
          </div>

          <Form
            form={form}
            name="register"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label="Họ và Tên"
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
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Nhập họ và tên đầy đủ"
                size="large"
                style={{ borderRadius: '6px' }}
              />
            </Form.Item>

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
                prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Nhập địa chỉ email"
                size="large"
                style={{ borderRadius: '6px' }}
              />
            </Form.Item>

            <Form.Item
              label="Số Điện Thoại"
              name="phone"
              rules={[
                {
                  required: false
                },
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: 'Số điện thoại không hợp lệ!'
                }
              ]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Nhập số điện thoại (tùy chọn)"
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
                },
                {
                  min: 8,
                  message: 'Mật khẩu phải có ít nhất 8 ký tự!'
                }
              ]}
              help="Mật khẩu phải có ít nhất 8 ký tự và bao gồm một số và ký tự đặc biệt."
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Nhập mật khẩu"
                size="large"
                style={{ borderRadius: '6px' }}
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
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Nhập lại mật khẩu"
                size="large"
                style={{ borderRadius: '6px' }}
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item
              label="Ngày Sinh"
              name="birthDate"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng chọn ngày sinh!'
                }
              ]}
            >
              <DatePicker
                placeholder="dd/mm/yyyy"
                size="large"
                style={{ 
                  width: '100%', 
                  borderRadius: '6px' 
                }}
                format="DD/MM/YYYY"
              />
            </Form.Item>            <Form.Item>
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
                Tạo Tài Khoản
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ margin: '24px 0' }} />

          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: '#8c8c8c' }}>
              Đã có tài khoản?{' '}
              <Link 
                to="/login" 
                style={{ 
                  color: '#dc2626',
                  fontWeight: '500'
                }}
              >
                Đăng Nhập
              </Link>
            </Text>
          </div>
        </Card>
      </Content>
      <Footer />
    </Layout>
  );
};

export default RegisterPage;
