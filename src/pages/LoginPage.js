import React, { useState, useEffect } from 'react';
import { Layout, Card, Form, Input, Button, Typography, Divider, Alert, message, notification, Modal } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { UserAPI } from '../api/User';

const clientId = '1038271412034-f887nt2v6kln6nb09e20pvjgfo1o7jn0.apps.googleusercontent.com'; // Thay bằng client ID bạn lấy từ Google Cloud

const LoginPage = () => {
  const [api, contextHolder] = notification.useNotification();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [forgotPasswordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordModalVisible, setForgotPasswordModalVisible] = useState(false);
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

  // Handle forgot password form submission
  const handleForgotPassword = async (values) => {
    try {
      setForgotPasswordLoading(true);
      
      await UserAPI.forgotPassword(values.email);
      
      // Show success message
      api.success({
        message: 'Email đã được gửi!',
        description: 'Vui lòng kiểm tra email và làm theo hướng dẫn để đặt lại mật khẩu.',
        duration: 4.5,
      });
      
      // Close modal and reset form
      setForgotPasswordModalVisible(false);
      forgotPasswordForm.resetFields();
      
    } catch (error) {
      console.error('Forgot password error:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi gửi email đặt lại mật khẩu.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = 'Email không tồn tại trong hệ thống.';
      }
      
      api.error({
        message: 'Gửi email thất bại!',
        description: errorMessage,
        duration: 4.5,
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleSuccessfulLogin = async (decoded) => {
    try {
      // Store token and user info
      localStorage.setItem("userInfo", JSON.stringify(decoded));
      
      // Use the decoded token data directly without API call
      let userProfile = decoded;
      
      // Role-based redirection - check multiple possible property names
      const userRoleId = decoded.RoleID || decoded.roleId || decoded.role_id || decoded.RoleId;
      console.log("User Role ID:", userRoleId);
      console.log("Full decoded token:", decoded);
      
      // Prepare login success notification data
      const loginNotification = {
        message: 'Đăng nhập thành công!',
        description: `Chào mừng ${decoded.FullName || decoded.name} trở lại!`,
      };
      
      // Convert to number for safer comparison
      const roleId = parseInt(userRoleId);
      console.log("Parsed Role ID:", roleId);
      
      if (roleId === 1 || roleId === 2) {
        // For admin and staff users, redirect to schedule management
        console.log("Redirecting admin/staff user to schedule management");
        navigate("/staff/schedule-management", { state: { loginNotification } });
      } else if (roleId === 4) {
        // For hospital users, redirect to emergency request page
        console.log("Redirecting hospital user to emergency request");
        navigate("/staff/emergency-request", { state: { loginNotification } });
      } else {
        // Check if profile is complete for regular users (roleId = 3 or donors)
        console.log("Redirecting regular user, checking profile completion");
        if (!isProfileComplete(userProfile)) {
          // Redirect to profile page with update required flag
          navigate("/profile?updateRequired=true", { state: { loginNotification } });
        } else {
          // Redirect to homepage if profile is complete
          navigate("/", { state: { loginNotification } });
        }
      }    } catch (error) {
      console.error("Error checking user profile:", error);
      // If there's an error, still redirect but assume profile needs update
      navigate("/profile?updateRequired=true");
    }
  };  // Handle opening forgot password modal
  const handleOpenForgotPasswordModal = (e) => {
    e.preventDefault();
    setForgotPasswordModalVisible(true);
  };

  const onFinish = async (values) => {
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
      
      // Check if this is a staff user logging in with default password
      const userRoleId = decoded.RoleID;
      
      // Import utility functions to check roles
      const { isStaffUser: checkIsStaff, markAsDefaultPassword, cleanupOldPasswordFlags } = await import('../admin/utils/passwordUtils');
      
      // Store user info first for role checking
      localStorage.setItem("userInfo", JSON.stringify(decoded));
      
      const isStaff = checkIsStaff();
      
      if (isStaff && values.password === 'staff123') {
        // This staff member is logging in with the default password
        // Clean up any old localStorage entries that might interfere
        cleanupOldPasswordFlags();
        // Then mark as having default password
        markAsDefaultPassword();
      } else if (isStaff) {
        // This is a staff user but NOT logging in with default password
        // Clean up old flags, but don't mark as having default password
        cleanupOldPasswordFlags();
      }
      
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
      {contextHolder}
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
                <Button 
                  type="link" 
                  onClick={handleOpenForgotPasswordModal} 
                  className="auth-forgot-link"
                  style={{ padding: 0, height: 'auto' }}
                >
                  Quên Mật Khẩu?
                </Button>
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
                      
                      // Clear localStorage and dispatch logout event
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      localStorage.removeItem("userInfo");
                      window.dispatchEvent(new CustomEvent('userLogout'));
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
      
      {/* Forgot Password Modal */}
      <Modal
        title="Quên Mật Khẩu"
        open={forgotPasswordModalVisible}
        onCancel={() => {
          setForgotPasswordModalVisible(false);
          forgotPasswordForm.resetFields();
        }}
        footer={null}
        width={400}
      >
        <Form
          form={forgotPasswordForm}
          layout="vertical"
          onFinish={handleForgotPassword}
        >
          <Typography.Paragraph style={{ marginBottom: '20px', color: '#666' }}>
            Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
          </Typography.Paragraph>
          
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
              placeholder="Nhập địa chỉ email"
              size="large"
            />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={forgotPasswordLoading}
              block
              size="large"
            >
              Gửi Yêu Cầu
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      
      <Footer />
    </Layout>
  );
};

export default LoginPage;
