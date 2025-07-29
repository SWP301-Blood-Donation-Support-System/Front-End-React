import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  Typography,
  message,
  Modal,
} from "antd";
import {
  IdcardOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { UserAPI } from "../api/User";

const CheckinPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [alreadyCheckedInModalVisible, setAlreadyCheckedInModalVisible] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    console.log("CCCD entered:", values.cccd);

    try {
      const response = await UserAPI.checkinDonor(values.cccd);

      if (response.status === 200) {
        console.log("Checkin successful:", response.data);
        // Clear the form after successful checkin
        form.resetFields();
        // Show success modal
        setSuccessModalVisible(true);
      }
    } catch (error) {
      console.error("Error during checkin:", error);

      // Handle different error scenarios
      if (error.response?.status === 404) {
        // Check the error message to distinguish between different 404 cases
        const errorMessage = error.response?.data?.message || "";
        console.log("404 Error message:", errorMessage); // Debug log
        
        if (errorMessage.includes("Không tìm thấy đăng ký hợp lệ") || errorMessage.includes("Approved") || errorMessage.includes("lịch hiến máu")) {
          // CCCD not found in today's donation schedule
          setErrorModalVisible(true);
        } else if (errorMessage.includes("điểm danh") || errorMessage.includes("check-in") || errorMessage.includes("hôm nay")) {
          // Already checked in today
          setAlreadyCheckedInModalVisible(true);
        } else {
          // General CCCD not found - default to showing invalid CCCD message
          setErrorModalVisible(true);
        }
      } else if (error.response?.status === 400) {
        message.error("Dữ liệu không hợp lệ hoặc đã check-in rồi!");
      } else if (error.response?.status === 401) {
        message.error("Không có quyền truy cập!");
      } else {
        message.error("Có lỗi xảy ra trong quá trình check-in!");
      }
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    background: "#f8f9fa",
    position: "relative",
    overflow: "hidden",
  };

  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(185, 28, 28, 0.03) 100%)",
  };

  return (
    <Layout className="auth-page">
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 10,
        }}
      >
        <img
          src="/images/new-logo.png"
          alt="Logo"
          style={{
            height: "60px",
            width: "auto",
          }}
        />
      </div>
      <div className="auth-container" style={containerStyle}>
        <div style={overlayStyle}></div>
        <Card className="auth-card" style={{ position: "relative", zIndex: 1 }}>
          <div className="auth-header">
            <Typography.Title className="auth-title">Check-in</Typography.Title>
            <Typography.Text className="auth-subtitle">
              Vui lòng nhập số CCCD để check-in
            </Typography.Text>
          </div>

          <Form
            form={form}
            name="checkin"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            className="auth-form"
          >
            <Form.Item
              label="Nhập CCCD"
              name="cccd"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số CCCD!",
                },
                {
                  pattern: /^[0-9]{12}$/,
                  message: "CCCD phải gồm 12 chữ số!",
                },
              ]}
            >
              <Input
                className="auth-input-affix-wrapper"
                prefix={<IdcardOutlined />}
                placeholder="Nhập số CCCD (12 chữ số)"
                size="large"
                maxLength={12}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="auth-submit-btn"
              >
                Check-in
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>

      {/* Success Modal */}
      <Modal
        open={successModalVisible}
        onCancel={() => setSuccessModalVisible(false)}
        footer={[
          <Button
            key="ok"
            type="primary"
            onClick={() => setSuccessModalVisible(false)}
            style={{
              background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
            }}
          >
            Đóng
          </Button>,
        ]}
        centered
        width={400}
        style={{
          borderRadius: "16px",
        }}
        bodyStyle={{
          textAlign: "center",
          padding: "40px 20px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <CheckCircleOutlined
            style={{
              fontSize: "80px",
              color: "#52c41a",
              marginBottom: "20px",
            }}
          />
          <Typography.Title
            level={3}
            style={{
              color: "#000000",
              marginBottom: "16px",
              fontWeight: "700",
            }}
          >
            Bạn đã check-in thành công
          </Typography.Title>
          <Typography.Text
            style={{
              color: "#666666",
              fontSize: "16px",
            }}
          >
            Cảm ơn bạn đã tham gia hiến máu cứu người!
          </Typography.Text>
        </div>
      </Modal>

      {/* Error Modal for National ID not found */}
      <Modal
        open={errorModalVisible}
        onCancel={() => setErrorModalVisible(false)}
        footer={[
          <Button
            key="ok"
            type="primary"
            onClick={() => setErrorModalVisible(false)}
            style={{
              background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
            }}
          >
            Đóng
          </Button>,
        ]}
        centered
        width={400}
        style={{
          borderRadius: "16px",
        }}
        bodyStyle={{
          textAlign: "center",
          padding: "40px 20px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <ExclamationCircleOutlined
            style={{
              fontSize: "80px",
              color: "#ff4d4f",
              marginBottom: "20px",
            }}
          />
          <Typography.Title
            level={3}
            style={{
              color: "#000000",
              marginBottom: "16px",
              fontWeight: "700",
            }}
          >
            CCCD này không hợp lệ trong ngày hiến máu này
          </Typography.Title>
          <Typography.Text
            style={{
              color: "#666666",
              fontSize: "16px",
            }}
          >
            Vui lòng kiểm tra lại số CCCD hoặc đăng ký lịch hiến máu
          </Typography.Text>
        </div>
      </Modal>

      {/* Already Checked In Modal */}
      <Modal
        open={alreadyCheckedInModalVisible}
        onCancel={() => setAlreadyCheckedInModalVisible(false)}
        footer={[
          <Button
            key="ok"
            type="primary"
            onClick={() => setAlreadyCheckedInModalVisible(false)}
            style={{
              background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
            }}
          >
            Đóng
          </Button>,
        ]}
        centered
        width={400}
        style={{
          borderRadius: "16px",
        }}
        bodyStyle={{
          textAlign: "center",
          padding: "40px 20px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <ExclamationCircleOutlined
            style={{
              fontSize: "80px",
              color: "#faad14",
              marginBottom: "20px",
            }}
          />
          <Typography.Title
            level={3}
            style={{
              color: "#000000",
              marginBottom: "16px",
              fontWeight: "700",
            }}
          >
            Bạn đã check-in trong hôm nay rồi
          </Typography.Title>
          <Typography.Text
            style={{
              color: "#666666",
              fontSize: "16px",
            }}
          >
            Vui lòng tiến ra quầy khám
          </Typography.Text>
        </div>
      </Modal>
    </Layout>
  );
};

export default CheckinPage;
