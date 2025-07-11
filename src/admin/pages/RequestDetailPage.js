import React, { useState, useEffect } from "react";
import {
  Layout,
  Typography,
  Button,
  Card,
  Space,
  Divider,
  Form,
  Input,
  Row,
  Col,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
  AlertOutlined,
  DropboxOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import dayjs from "dayjs";

import StaffSidebar from "../components/StaffSidebar";
import StaffHeader from "../components/StaffHeader";
import { HospitalAPI } from "../api/hospital";
import "../styles/donation-records.scss";

const { Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;

const RequestDetailPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { requestId } = useParams();
  const location = useLocation();
  
  // Data states
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [bloodTypes, setBloodTypes] = useState({});
  const [bloodComponents, setBloodComponents] = useState({});
  const [urgencies, setUrgencies] = useState({});
  const [bloodRequestStatuses, setBloodRequestStatuses] = useState({});

  useEffect(() => {
    // Get data from location state if available
    if (location.state) {
      const { request, hospital, bloodTypes, bloodComponents, urgencies, bloodRequestStatuses } = location.state;
      setSelectedRequest(request);
      setHospital(hospital);
      setBloodTypes(bloodTypes);
      setBloodComponents(bloodComponents);
      setUrgencies(urgencies);
      setBloodRequestStatuses(bloodRequestStatuses);
    } else {
      // Fallback: fetch request details if state is not available
      fetchRequestDetails();
    }
  }, [requestId]);

  const fetchRequestDetails = async () => {
    setLoading(true);
    try {
      const detailedRequest = await HospitalAPI.getBloodRequestById(requestId);
      setSelectedRequest(detailedRequest);
    } catch (error) {
      console.error("Error fetching request details:", error);
      message.error("Lỗi khi tải chi tiết đơn khẩn cấp!");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHospitalRequests = () => {
    if (hospital) {
      navigate(`/staff/approve-requests/hospital/${hospital.hospitalId}`, {
        state: { hospital }
      });
    } else {
      navigate('/staff/approve-requests');
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    return dayjs(dateTime).format('DD/MM/YYYY HH:mm');
  };

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

  if (!selectedRequest) {
    return (
      <Layout className="staff-layout">
        <StaffSidebar
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        />
        <Layout className="staff-main-layout">
          <StaffHeader />
          <Layout className="staff-content-layout">
            <Content className="donation-records-content">
              <div className="donation-records-container">
                <Card>
                  <p>Đang tải chi tiết đơn khẩn cấp...</p>
                </Card>
              </div>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    );
  }

  return (
    <Layout className="staff-layout">
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
                  Chi tiết đơn khẩn cấp #{selectedRequest.requestId}
                </Title>
              </div>

              <div className="create-donation-form">
                <Card
                  title={
                    <Space>
                      <Button
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        onClick={handleBackToHospitalRequests}
                      >
                        Quay lại
                      </Button>
                      <Divider type="vertical" />
                      <ExclamationCircleOutlined style={{ color: '#f5222d' }} />
                      Chi tiết đơn khẩn cấp #{selectedRequest.requestId}
                    </Space>
                  }
                  className="detail-form-card"
                  extra={
                    <AlertOutlined style={{ color: '#f5222d', fontSize: '16px' }} />
                  }
                >
                  <Form
                    layout="vertical"
                    initialValues={{
                      requestId: selectedRequest.requestId,
                      requestingStaffId: selectedRequest.requestingStaffId,
                      bloodTypeId: bloodTypes[selectedRequest.bloodTypeId]?.name || 'N/A',
                      bloodComponentId: bloodComponents[selectedRequest.bloodComponentId]?.name || 'N/A',
                      volume: `${selectedRequest.volume || 0} ml`,
                      requiredDateTime: formatDateTime(selectedRequest.requiredDateTime),
                      urgencyId: urgencies[selectedRequest.urgencyId] ? 
                        `${urgencies[selectedRequest.urgencyId].name} - ${urgencies[selectedRequest.urgencyId].description}` : 
                        'N/A',
                      requestStatusId: bloodRequestStatuses[selectedRequest.requestStatusId]?.name || 'N/A',
                      note: selectedRequest.note || 'Không có ghi chú',
                      createdAt: formatDateTime(selectedRequest.createdAt),
                    }}
                  >
                    <Row gutter={[24, 16]}>
                      <Col span={8}>
                        <Form.Item
                          label="ID ĐƠN KHẨN CẤP"
                          name="requestId"
                        >
                          <Input readOnly style={{ backgroundColor: '#fff' }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label="NHÂN VIÊN YÊU CẦU"
                          name="requestingStaffId"
                        >
                          <Input readOnly style={{ backgroundColor: '#fff' }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label="THỜI GIAN TẠO"
                          name="createdAt"
                        >
                          <Input 
                            readOnly 
                            style={{ backgroundColor: '#fff' }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

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
                        >
                          <Input 
                            readOnly 
                            size="large"
                            style={{ backgroundColor: '#fff' }}
                          />
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
                        >
                          <Input 
                            readOnly 
                            size="large"
                            style={{ backgroundColor: '#fff' }}
                          />
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
                        >
                          <Input 
                            readOnly 
                            size="large"
                            style={{ backgroundColor: '#fff' }}
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
                        >
                          <Input 
                            readOnly 
                            size="large"
                            style={{ backgroundColor: '#fff' }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={[24, 16]}>
                      <Col span={12}>
                        <Form.Item
                          label={
                            <span>
                              <ExclamationCircleOutlined style={{ marginRight: '8px', color: '#f5222d' }} />
                              MỨC ĐỘ KHẨN CẤP
                            </span>
                          }
                          name="urgencyId"
                        >
                          <Input 
                            readOnly 
                            size="large"
                            style={{ 
                              backgroundColor: '#fff',
                              color: urgencies[selectedRequest.urgencyId] ? 
                                getUrgencyColor(urgencies[selectedRequest.urgencyId].name) : 
                                '#000'
                            }}
                          />
                        </Form.Item>
                      </Col>
                      
                      <Col span={12}>
                        <Form.Item
                          label={
                            <span>
                              <CheckCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                              TRẠNG THÁI
                            </span>
                          }
                          name="requestStatusId"
                        >
                          <Input 
                            readOnly 
                            size="large"
                            style={{ backgroundColor: '#fff' }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Divider orientation="left">GHI CHÚ</Divider>

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
                            readOnly
                            rows={4}
                            style={{ backgroundColor: '#fff' }}
                          />
                        </Form.Item>
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

export default RequestDetailPage; 