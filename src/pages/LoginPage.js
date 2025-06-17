import React, { useState, useEffect } from 'react';
import { Layout, Card, Form, Input, Button, Typography, Divider, Alert, message } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { UserAPI } from '../api/User';

const clientId = ''; // Thay bằng client ID bạn lấy từ Google Cloud

const LoginPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState('');
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Function to check if user profile is complete
  const isProfileComplete = (userInfo) => {
    // Check if essential profile fields are filled
    const requiredFields = ['FullName', 'PhoneNumber', 'Address', 'DateOfBirth', 'GenderID', 'BloodTypeID'];
    
    return requiredFields.every(field => {
      const value = userInfo[field];
      return value !== null && value !== undefined && value !== '';
    });
  };
  const handleSuccessfulLogin = async (decoded) => {
    try {
      // Store token and user info
      localStorage.setItem("userInfo", JSON.stringify(decoded));
      
      // Use the decoded token data directly without API call
      let userProfile = decoded;      // Role-based redirection
      const userRoleId = decoded.RoleID;
      console.log("User Role ID:", userRoleId);
      
      if (userRoleId === 1 || userRoleId === 2 || userRoleId === "1" || userRoleId === "2") {
        // Redirect to schedule management page for roles 1 and 2
        navigate("/staff/schedule-management");
      } else {
        // Check if profile is complete for regular users
        if (!isProfileComplete(userProfile)) {
          // Redirect to profile page with update required flag
          navigate("/profile?updateRequired=true");
        } else {
          // Redirect to homepage if profile is complete
          navigate("/");
        }
      }    } catch (error) {
      console.error("Error checking user profile:", error);
      // If there's an error, still redirect but assume profile needs update
      navigate("/profile?updateRequired=true");
    }
  };  const onFinish = async (values) => {
    setLoading(true);
    setLoginError(''); // Clear previous errors
    console.log('Login values:', values);
    
    try{
      const response = await UserAPI.login(values.email, values.password);
      console.log("response", response.data.result);
      const decoded = jwtDecode(response.data.result);
      console.log("Decode item", decoded);
      
      // Store token
      localStorage.setItem("token", response.data.result);
      localStorage.setItem("user", JSON.stringify(decoded));
      
      // Handle successful login with profile check
      await handleSuccessfulLogin(decoded);
    }catch(error){
      console.log("error", error);
      
      // Display error message to user
      setLoginError('Tài khoản hoặc mật khẩu sai. Vui lòng thử lại.');
      message.error('Đăng nhập thất bại!');
    }finally{
      setLoading(false);
    }
  };

  // Clear error when user starts typing
  const handleInputChange = () => {
    if (loginError) {
      setLoginError('');
    }
  };

  return (
    <Layout className="auth-page">
      <Header />
      <Navbar />      
      <div className="auth-container">
        <Card className="auth-card">          <div className="auth-header">
            <Typography.Title className="auth-title">
              Chào Mừng Trở Lại
            </Typography.Title>
            <Typography.Text className="auth-subtitle">
              Đăng nhập để tiếp tục hành trình hiến máu cứu người
            </Typography.Text>
          </div>

          {/* Display error message if login fails */}
          {loginError && (
            <Alert
              message={loginError}
              type="error"
              closable
              onClose={() => setLoginError('')}
              style={{ marginBottom: 16 }}
            />
          )}

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
                onChange={handleInputChange} // Clear error on input change
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
                onChange={handleInputChange} // Clear error on input change
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
                  </Typography.Text>                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      const decoded = jwtDecode(credentialResponse.credential);
                      setUser(decoded);
                      
                      // Store Google login info in localStorage
                      localStorage.setItem("token", credentialResponse.credential);
                      localStorage.setItem("user", JSON.stringify(decoded));
                      
                      // Handle successful login with profile check
                      await handleSuccessfulLogin(decoded);
                    }}                    onError={() => {
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
