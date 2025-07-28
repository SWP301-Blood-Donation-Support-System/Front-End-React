import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  message,
} from "antd";
import {
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  MailOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  GoogleOAuthProvider,
  GoogleLogin,
} from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { UserAPI } from "../api/User";

const clientId =
  "1038271412034-f887nt2v6kln6nb09e20pvjgfo1o7jn0.apps.googleusercontent.com"; // Thay bằng client ID bạn lấy từ Google Cloud

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [user, setUser] = useState(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Function to check if user profile is complete
  const isProfileComplete = (userInfo) => {
    // Check if essential profile fields are filled
    const requiredFields = [
      "FullName",
      "PhoneNumber",
      "Address",
      "DateOfBirth",
      "GenderID",
      "BloodTypeID",
    ];

    return requiredFields.every((field) => {
      const value = userInfo[field];
      return value !== null && value !== undefined && value !== "";
    });
  };

  // Handle successful login/registration
  const handleSuccessfulLogin = async (userData) => {
    try {
      // Check if profile is complete
      if (!isProfileComplete(userData)) {
        // Navigate to profile completion page
        navigate("/profile", {
          state: { showIncompleteProfileWarning: true },
        });
      } else {
        // Profile is complete, navigate to homepage
        navigate("/");
      }
    } catch (error) {
      console.error("Error in handleSuccessfulLogin:", error);
      message.error("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    setEmailError(""); // Clear any previous errors
    console.log("Register values:", values);

    try {
      // Call the actual registration API (without username)
      const response = await UserAPI.register(
        null,
        values.email,
        values.password
      );
      console.log("Registration response:", response.data);

      // Check if the response has a failed status (backend returns successful HTTP status but failed application status)
      if (response.data && response.data.status === "failed") {
        // Handle email already exists error specifically
        if (
          response.data.msg &&
          response.data.msg.toLowerCase().includes("email already exists")
        ) {
          const errorMsg =
            "Email này đã được đăng ký, vui lòng sử dụng email khác";
          setEmailError(errorMsg);
        } else {
          // Handle other application-level errors
          const errorMsg =
            response.data.msg || "Đăng ký thất bại. Vui lòng thử lại sau.";
          setEmailError(errorMsg);
        }
        setLoading(false);
        return;
      }

      // Success case
      if (response.status === 200 || response.status === 201) {
        message.success("Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.");
        // Navigate to login page after successful registration
        navigate("/login");
      }
    } catch (error) {
      console.error("Registration error:", error);

      // Handle HTTP-level errors (network errors, 4xx, 5xx status codes)
      if (error.response && error.response.data) {
        // Check for the msg field first (our backend format)
        if (error.response.data.msg) {
          if (
            error.response.data.msg
              .toLowerCase()
              .includes("email already exists")
          ) {
            const errorMsg =
              "Email này đã được đăng ký, vui lòng sử dụng email khác";
            setEmailError(errorMsg);
          } else {
            setEmailError(error.response.data.msg);
          }
        }
        // Fallback to message field (standard format)
        else if (error.response.data.message) {
          setEmailError(error.response.data.message);
        }
        // Handle specific status codes
        else if (error.response.status === 400) {
          setEmailError(
            "Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại."
          );
        } else if (error.response.status === 409) {
          setEmailError(
            "Email này đã được đăng ký, vui lòng sử dụng email khác"
          );
        } else {
          setEmailError("Đăng ký thất bại. Vui lòng thử lại sau.");
        }
      } else {
        setEmailError("Đăng ký thất bại. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Simple handler to show validation errors under email field
  const onFinishFailed = (errorInfo) => {
    if (errorInfo.errorFields && errorInfo.errorFields.length > 0) {
      // Check if the error is for the email field
      const emailError = errorInfo.errorFields.find(
        (field) => field.name[0] === "email"
      );
      if (emailError && emailError.errors.length > 0) {
        setEmailError(emailError.errors[0]);
      }
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
              Tham gia cộng đồng của chúng tôi và tạo sự khác biệt bằng cách
              hiến máu.
            </Typography.Text>
          </div>

          <Form
            form={form}
            name="register"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            className="auth-form"
          >
            <Form.Item
              label="Địa Chỉ Email"
              name="email"
              validateStatus={emailError ? "error" : ""}
              help={emailError}
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập email của bạn!",
                },
                {
                  type: "email",
                  message: "Email không hợp lệ!",
                },
              ]}
            >
              <Input
                className="auth-input-affix-wrapper"
                prefix={<MailOutlined />}
                placeholder="Nhập địa chỉ email"
                size="large"
                onChange={() => setEmailError("")} // Clear error when user types
              />
            </Form.Item>

            <Form.Item
              label="Mật Khẩu"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mật khẩu!",
                },
                {
                  min: 8,
                  message: "Mật khẩu phải có ít nhất 8 ký tự!",
                },
              ]}
              help="Mật khẩu phải có ít nhất 8 ký tự."
            >
              <Input.Password
                className="auth-password-input"
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu"
                size="large"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item
              label="Xác Nhận Mật Khẩu"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                {
                  required: true,
                  message: "Vui lòng xác nhận mật khẩu!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                className="auth-password-input"
                prefix={<LockOutlined />}
                placeholder="Nhập lại mật khẩu"
                size="large"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
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

          <Divider className="auth-divider">Hoặc</Divider>
          <GoogleOAuthProvider clientId={clientId}>
            <div className="auth-google-section">
              {!user ? (
                <>
                  <Typography.Text className="auth-google-text">
                    Đăng ký với Google
                  </Typography.Text>
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      try {
                        console.log(
                          "🔵 Google credential received:",
                          credentialResponse.credential
                        );

                        // Call backend API with Google credential
                        const response = await UserAPI.googleLogin(
                          credentialResponse.credential
                        );

                        console.log("🔵 Backend response:", response);

                        if (response && response.status === 200) {
                          console.log("🔵 Success! Processing response...");

                          let token = null;
                          let userData = null;

                          // Parse different response formats from backend
                          if (typeof response.data === 'string' && response.data.includes('.')) {
                            // Response is a JWT token directly
                            console.log("🔵 Response is JWT token directly");
                            token = response.data;
                            try {
                              const decoded = jwtDecode(token);
                              console.log("🔵 Decoded JWT:", decoded);
                              userData = decoded;
                            } catch (decodeError) {
                              console.error("❌ Failed to decode JWT:", decodeError);
                              message.error('Token không hợp lệ.');
                              return;
                            }
                          } 
                          // Check if response has result property
                          else if (response.data.result) {
                            console.log("🔵 Response has result property");
                            if (typeof response.data.result === 'string' && response.data.result.includes('.')) {
                              // result is a JWT token
                              token = response.data.result;
                              try {
                                const decoded = jwtDecode(token);
                                console.log("🔵 Decoded JWT from result:", decoded);
                                userData = decoded;
                              } catch (decodeError) {
                                console.error("❌ Failed to decode JWT from result:", decodeError);
                                message.error('Token không hợp lệ.');
                                return;
                              }
                            } else if (typeof response.data.result === 'object') {
                              // result is an object containing token and/or user data
                              token = response.data.result.token || response.data.result.accessToken;
                              userData = response.data.result.user || response.data.result;
                              
                              if (token && typeof token === 'string' && token.includes('.')) {
                                try {
                                  const decoded = jwtDecode(token);
                                  console.log("🔵 Decoded JWT from result object:", decoded);
                                  userData = { ...userData, ...decoded };
                                } catch (decodeError) {
                                  console.error("❌ Failed to decode JWT from result object:", decodeError);
                                }
                              }
                            }
                          }
                          // Check if response has token property directly
                          else if (response.data.token) {
                            console.log("🔵 Response has token property");
                            token = response.data.token;
                            userData = response.data.user || response.data;
                            
                            if (token && typeof token === 'string' && token.includes('.')) {
                              try {
                                const decoded = jwtDecode(token);
                                console.log("🔵 Decoded JWT from token property:", decoded);
                                userData = { ...userData, ...decoded };
                              } catch (decodeError) {
                                console.error("❌ Failed to decode JWT from token property:", decodeError);
                              }
                            }
                          }
                          // Fallback: treat response.data as user data and use Google credential as token
                          else {
                            console.log("🔵 Using fallback approach");
                            userData = response.data;
                            token = credentialResponse.credential;
                          }
                          
                          console.log("🔵 Final parsed data:");
                          console.log("🔵 Token:", token ? token.substring(0, 50) + "..." : "null");
                          console.log("🔵 UserData:", userData);
                          
                          if (!userData) {
                            console.error("❌ No user data found in response");
                            message.error('Dữ liệu người dùng không hợp lệ.');
                            return;
                          }
                          
                          if (!token) {
                            console.error("❌ No token found in response");
                            message.error('Token không hợp lệ.');
                            return;
                          }

                          // Store token and user info in localStorage
                          localStorage.setItem("token", token);
                          localStorage.setItem("userInfo", JSON.stringify(userData));
                          localStorage.setItem("user", JSON.stringify(userData));
                          
                          console.log("🔵 Successfully stored in localStorage:");
                          console.log("🔵 Token stored:", !!localStorage.getItem("token"));
                          console.log("🔵 UserInfo stored:", !!localStorage.getItem("userInfo"));

                          // Update local user state
                          setUser(userData);

                          // Handle successful login/registration
                          await handleSuccessfulLogin(userData);
                        } else {
                          console.error("❌ Invalid response status or no data");
                          message.error(
                            "Đăng ký Google thất bại. Vui lòng thử lại."
                          );
                        }
                      } catch (error) {
                        console.error("❌ Google register error:", error);
                        console.error("❌ Error response:", error.response);

                        // Handle specific error cases
                        if (
                          error.response &&
                          error.response.data &&
                          error.response.data.message
                        ) {
                          message.error(error.response.data.message);
                        } else if (
                          error.response &&
                          error.response.status === 400
                        ) {
                          message.error(
                            "Thông tin đăng ký Google không hợp lệ."
                          );
                        } else {
                          message.error(
                            "Đăng ký Google thất bại. Vui lòng thử lại."
                          );
                        }
                      }
                    }}
                    onError={() => {
                      console.log("Register Failed");
                    }}
                    size="large"
                    width="100%"
                  />
                </>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <Typography.Title level={4}>
                    Thông tin người dùng
                  </Typography.Title>
                  <img
                    src={user.picture}
                    alt="avatar"
                    style={{
                      borderRadius: "50%",
                      width: "60px",
                      height: "60px",
                      marginBottom: "16px",
                    }}
                  />
                  <p>
                    <strong>Họ tên:</strong> {user.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                </div>
              )}
            </div>
          </GoogleOAuthProvider>

          <Divider className="auth-divider" />

          <div className="auth-footer">
            <Typography.Text className="auth-footer-text">
              Đã có tài khoản?{" "}
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
