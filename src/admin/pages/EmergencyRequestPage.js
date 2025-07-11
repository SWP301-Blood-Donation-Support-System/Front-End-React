import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Row,
  Col,
  Button,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Typography,
  Divider,
  Form,
  notification,
} from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import StaffSidebar from "../components/StaffSidebar";
import StaffHeader from "../components/StaffHeader";
import { 
  ExclamationCircleOutlined,
  DropboxOutlined,
  ClockCircleOutlined,
  AlertOutlined,
  FileTextOutlined
} from '@ant-design/icons';

import { AdminAPI } from "../api/admin";
import { HospitalAPI } from "../api/hospital";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EmergencyRequestPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  
  // Lookup data
  const [bloodTypes, setBloodTypes] = useState([]);
  const [bloodComponents, setBloodComponents] = useState([]);
  const [urgencies, setUrgencies] = useState([]);

  useEffect(() => {
    fetchLookupData();
    
    // Set default required date/time to current time
    form.setFieldsValue({
      requiredDateTime: dayjs(),
    });
  }, [form]);

  const fetchLookupData = async () => {
    try {
      const [bloodTypesRes, bloodComponentsRes, urgenciesRes] = await Promise.all([
        AdminAPI.getBloodTypesLookup(),
        AdminAPI.getBloodComponents(),
        HospitalAPI.getUrgencies(),
      ]);
      
      setBloodTypes(bloodTypesRes.data || []);
      setBloodComponents(bloodComponentsRes.data || []);
      setUrgencies(urgenciesRes || []);
    } catch (error) {
      console.error("Error fetching lookup data:", error);
      message.error("Lỗi khi tải dữ liệu!");
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Get current user info
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const requestingStaffId = userInfo?.UserId || userInfo?.UserID || userInfo?.userId;

      const requestData = {
        requestingStaffId: requestingStaffId,
        bloodTypeId: values.bloodTypeId,
        bloodComponentId: values.bloodComponentId,
        volume: values.volume,
        requiredDateTime: values.requiredDateTime.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
        urgencyId: values.urgencyId,
        note: values.note || "string",
      };

      console.log("Emergency request data:", requestData);

      await HospitalAPI.createBloodRequest(requestData);
      
      // Success notification similar to create staff account
      api.success({
        message: 'Tạo đơn khẩn cấp thành công!',
        description: 'Đơn yêu cầu máu khẩn cấp đã được tạo thành công!',
        placement: 'topRight',
        duration: 4,
      });

      // Reset form and navigate to request history for hospital users
      form.resetFields();
      setTimeout(() => {
        navigate("/staff/request-history");
      }, 1500);

    } catch (error) {
      console.error("Error creating emergency request:", error);
      
      let errorMessage = 'Có lỗi xảy ra khi tạo đơn khẩn cấp!';
      
      if (error.response?.status === 400) {
        errorMessage = 'Thông tin không hợp lệ! Vui lòng kiểm tra lại.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Bạn không có quyền thực hiện thao tác này!';
      }
      
      api.error({
        message: 'Lỗi!',
        description: errorMessage,
        placement: 'topRight',
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/staff/request-history");
  };

  // Get urgency color for display
  const getUrgencyColor = (urgencyName) => {
    switch (urgencyName?.toLowerCase()) {
      case 'low':
        return '#52c41a'; // green
      case 'medium':
        return '#faad14'; // orange
      case 'high':
        return '#f5222d'; // red
      case 'critical':
        return '#722ed1'; // purple
      default:
        return '#1890ff'; // blue
    }
  };

  // Get Vietnamese name for urgency
  const getUrgencyVietnameseName = (urgencyName) => {
    switch (urgencyName?.toLowerCase()) {
      case 'low':
        return 'Thấp';
      case 'medium':
        return 'Trung bình';
      case 'high':
        return 'Cao';
      case 'critical':
        return 'Khẩn cấp';
      default:
        return urgencyName;
    }
  };

  // Get Vietnamese description for urgency
  const getUrgencyVietnameseDescription = (urgencyName) => {
    switch (urgencyName?.toLowerCase()) {
      case 'low':
        return 'Không khẩn cấp';
      case 'medium':
        return 'Khẩn cấp vừa phải';
      case 'high':
        return 'Ưu tiên cao';
      case 'critical':
        return 'Cần chú ý ngay lập tức';
      default:
        return 'Mức độ khẩn cấp';
    }
  };

  return (
    <Layout className="staff-layout">
      {contextHolder}
      <StaffSidebar
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      />

      <Layout className="staff-main-layout">
        <StaffHeader />

        <Layout className="staff-content-layout">
          <Content className="donation-records-content">
            <div className="donation-records-container">
              <div className="donation-records-header-section">
                <Title level={3} className="donation-records-title">
                  <ExclamationCircleOutlined style={{ color: '#f5222d', marginRight: '8px' }} />
                  Tạo Đơn Yêu Cầu Máu Khẩn Cấp
                </Title>
              </div>

              <div className="create-donation-form">
                <Card
                  title="THÔNG TIN YÊU CẦU MÁU KHẨN CẤP"
                  className="detail-form-card"
                  extra={
                    <AlertOutlined style={{ color: '#f5222d', fontSize: '16px' }} />
                  }
                >
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    requiredMark={false}
                  >
                    <Row gutter={[24, 16]}>
                      <Col span={12}>
                        <Form.Item
                          label={
                            <span>
                              <DropboxOutlined style={{ marginRight: '8px', color: '#f5222d' }} />
                              NHÓM MÁU
                            </span>
                          }
                          name="bloodTypeId"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn nhóm máu!",
                            },
                          ]}
                        >
                          <Select
                            placeholder="Chọn nhóm máu"
                            size="large"
                            showSearch
                            filterOption={(input, option) =>
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            {bloodTypes.map((type) => (
                              <Option key={type.id} value={type.id}>
                                {type.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      
                      <Col span={12}>
                        <Form.Item
                          label={
                            <span>
                              <DropboxOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                              THÀNH PHẦN MÁU
                            </span>
                          }
                          name="bloodComponentId"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn thành phần máu!",
                            },
                          ]}
                        >
                          <Select
                            placeholder="Chọn thành phần máu"
                            size="large"
                            showSearch
                            filterOption={(input, option) =>
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            {bloodComponents.map((component) => (
                              <Option key={component.id} value={component.id}>
                                {component.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={[24, 16]}>
                      <Col span={12}>
                        <Form.Item
                          label={
                            <span>
                              <DropboxOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                              THỂ TÍCH (ml)
                            </span>
                          }
                          name="volume"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập thể tích!",
                            },
                            {
                              type: "number",
                              min: 1,
                              max: 5000,
                              message: "Thể tích phải từ 1-5000ml!",
                            },
                          ]}
                        >
                          <InputNumber
                            placeholder="Nhập thể tích cần thiết"
                            style={{ width: "100%" }}
                            size="large"
                            min={1}
                            max={5000}
                            addonAfter="ml"
                          />
                        </Form.Item>
                      </Col>
                      
                      <Col span={12}>
                        <Form.Item
                          label={
                            <span>
                              <ClockCircleOutlined style={{ marginRight: '8px', color: '#faad14' }} />
                              THỜI GIAN CẦN THIẾT
                            </span>
                          }
                          name="requiredDateTime"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn thời gian cần thiết!",
                            },
                          ]}
                        >
                          <DatePicker
                            showTime
                            format="DD/MM/YYYY HH:mm"
                            placeholder="Chọn thời gian cần thiết"
                            style={{ width: "100%" }}
                            size="large"
                            disabledDate={(current) =>
                              current && current < dayjs().startOf('day')
                            }
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={[24, 16]}>
                      <Col span={24}>
                        <Form.Item
                          label={
                            <span>
                              <ExclamationCircleOutlined style={{ marginRight: '8px', color: '#f5222d' }} />
                              MỨC ĐỘ KHẨN CẤP
                            </span>
                          }
                          name="urgencyId"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn mức độ khẩn cấp!",
                            },
                          ]}
                        >
                          <Select
                            placeholder="Chọn mức độ khẩn cấp"
                            size="large"
                          >
                            {urgencies.map((urgency) => (
                              <Option key={urgency.id} value={urgency.id}>
                                <span style={{ color: getUrgencyColor(urgency.name) }}>
                                  <ExclamationCircleOutlined style={{ marginRight: '8px' }} />
                                  {getUrgencyVietnameseName(urgency.name)} - {getUrgencyVietnameseDescription(urgency.name)}
                                </span>
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Divider orientation="left">GHI CHÚ THÊM</Divider>

                    <Row gutter={[24, 16]}>
                      <Col span={24}>
                        <Form.Item
                          label={
                            <span>
                              <FileTextOutlined style={{ marginRight: '8px', color: '#722ed1' }} />
                              GHI CHÚ
                            </span>
                          }
                          name="note"
                        >
                          <TextArea
                            rows={4}
                            placeholder="Nhập ghi chú thêm về yêu cầu khẩn cấp (tùy chọn)..."
                            maxLength={500}
                            showCount
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Divider />

                    <Row gutter={[16, 16]} justify="center">
                      <Col>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={loading}
                          size="large"
                          danger
                          style={{ minWidth: '150px' }}
                        >
                          <ExclamationCircleOutlined />
                          Tạo Đơn Khẩn Cấp
                        </Button>
                      </Col>
                      <Col>
                        <Button
                          htmlType="button"
                          onClick={handleCancel}
                          size="large"
                          style={{ minWidth: '120px' }}
                        >
                          Hủy Bỏ
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Card>
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default EmergencyRequestPage; 