import React, { useState, useEffect, useCallback } from "react";
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
  Tag,
} from "antd";
import {
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
  AlertOutlined,
  DropboxOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  HistoryOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import dayjs from "dayjs";

import StaffSidebar from "../../components/StaffSidebar";
import StaffHeader from "../../components/StaffHeader";
import { HospitalAPI } from "../../api/hospital";
import { AdminAPI } from "../../api/admin";
import "../../styles/donation-records.scss";

const { Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;

const RequestHistoryDetailPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { requestId } = useParams();
  const location = useLocation();
  
  // Data states
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [bloodTypes, setBloodTypes] = useState({});
  const [bloodComponents, setBloodComponents] = useState({});
  const [urgencies, setUrgencies] = useState({});
  const [bloodRequestStatuses, setBloodRequestStatuses] = useState({});

  const fetchRequestDetails = useCallback(async () => {
    setLoading(true);
    try {
      const [
        detailedRequest,
        statusesRes,
        typesRes,
        componentsRes,
        urgenciesRes,
      ] = await Promise.all([
        HospitalAPI.getBloodRequestById(requestId),
        HospitalAPI.getBloodRequestStatuses(),
        AdminAPI.getBloodTypesLookup(),
        AdminAPI.getBloodComponents(),
        HospitalAPI.getUrgencies(),
      ]);

      setSelectedRequest(detailedRequest);

      // Process lookup data
      const statusesData = Array.isArray(statusesRes) ? statusesRes : statusesRes.data || [];
      const statusesMap = {};
      statusesData.forEach(status => {
        statusesMap[status.id] = status;
      });
      setBloodRequestStatuses(statusesMap);

      const typesData = Array.isArray(typesRes) ? typesRes : typesRes.data || [];
      const typesMap = {};
      typesData.forEach(type => {
        typesMap[type.id] = type;
      });
      setBloodTypes(typesMap);
      
      const componentsData = Array.isArray(componentsRes) ? componentsRes : componentsRes.data || [];
      const componentsMap = {};
      componentsData.forEach(component => {
        componentsMap[component.id] = component;
      });
      setBloodComponents(componentsMap);
      
      const urgenciesData = Array.isArray(urgenciesRes) ? urgenciesRes : urgenciesRes.data || [];
      const urgenciesMap = {};
      urgenciesData.forEach(urgency => {
        urgenciesMap[urgency.id] = urgency;
      });
      setUrgencies(urgenciesMap);

    } catch (error) {
      console.error("Error fetching request details:", error);
      message.error("Lỗi khi tải chi tiết đơn khẩn cấp!");
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    // Get data from location state if available
    if (location.state) {
      const { request, bloodTypes, bloodComponents, urgencies, bloodRequestStatuses } = location.state;
      setSelectedRequest(request);
      if (bloodTypes) setBloodTypes(bloodTypes);
      if (bloodComponents) setBloodComponents(bloodComponents);
      if (urgencies) setUrgencies(urgencies);
      if (bloodRequestStatuses) setBloodRequestStatuses(bloodRequestStatuses);
    } else {
      // Fallback: fetch request details if state is not available
      fetchRequestDetails();
    }
  }, [requestId, location.state, fetchRequestDetails]);

  const handleBackToRequestHistory = () => {
    if (location.state?.fromHistory) {
      navigate('/staff/request-history');
    } else {
      navigate('/staff/request-history');
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

  const getUrgencyVietnameseName = (urgencyName) => {
    switch (urgencyName?.toLowerCase()) {
      case 'low':
        return 'Thấp - Không khẩn cấp';
      case 'medium':
        return 'Trung bình - Khẩn cấp vừa phải';
      case 'high':
        return 'Cao - Ưu tiên cao';
      case 'critical':
        return 'Khẩn cấp - Cần chú ý ngay lập tức';
      default:
        return urgencyName || 'N/A';
    }
  };

  const getStatusColor = (statusName) => {
    switch (statusName?.toLowerCase()) {
      case 'đang chờ duyệt':
        return 'processing';
      case 'đã duyệt':
        return 'success';
      case 'đã từ chối':
        return 'error';
      case 'đã hoàn thành':
        return 'green';
      case 'đã hủy':
        return 'default';
      default:
        return 'default';
    }
  };

  const isRejected = () => {
    if (!bloodRequestStatuses || !selectedRequest) return false;
    const currentStatus = bloodRequestStatuses[selectedRequest.requestStatusId];
    return currentStatus && currentStatus.name === "Đã từ chối";
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
                <Card loading={loading}>
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
                  <HistoryOutlined /> Chi tiết đơn khẩn cấp #{selectedRequest.requestId}
                </Title>
              </div>

              <div className="create-donation-form">
                <Card
                  title={
                    <Space>
                      <Button
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        onClick={handleBackToRequestHistory}
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
                    <Space>
                      <Tag 
                        color={getStatusColor(bloodRequestStatuses[selectedRequest.requestStatusId]?.name)}
                        style={{ fontSize: '14px', padding: '4px 12px' }}
                      >
                        {bloodRequestStatuses[selectedRequest.requestStatusId]?.name || 'N/A'}
                      </Tag>
                      <AlertOutlined style={{ color: '#f5222d', fontSize: '16px' }} />
                    </Space>
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
                      urgencyId: (urgencies && selectedRequest.urgencyId && urgencies[selectedRequest.urgencyId]) ? 
                        getUrgencyVietnameseName(urgencies[selectedRequest.urgencyId].name) : 
                        'N/A',
                      requestStatusId: bloodRequestStatuses[selectedRequest.requestStatusId]?.name || 'N/A',
                      note: selectedRequest.note || 'Không có ghi chú',
                      rejectionReason: selectedRequest.rejectionReason || selectedRequest.reason || 'Không có lý do từ chối',
                      createdAt: formatDateTime(selectedRequest.createdAt),
                      updatedAt: formatDateTime(selectedRequest.updatedAt),
                    }}
                  >
                    <Row gutter={[24, 16]}>
                      <Col span={8}>
                        <Form.Item
                          label="ID ĐƠN KHẨN CẤP"
                          name="requestId"
                        >
                          <Input readOnly style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label="THỜI GIAN TẠO"
                          name="createdAt"
                        >
                          <Input 
                            readOnly 
                            style={{ backgroundColor: '#f5f5f5' }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label="LẦN CẬP NHẬT CUỐI"
                          name="updatedAt"
                        >
                          <Input 
                            readOnly 
                            style={{ backgroundColor: '#f5f5f5' }}
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
                            style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', color: '#f5222d' }}
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
                            style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', color: '#1890ff' }}
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
                            style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', color: '#52c41a' }}
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
                            style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', color: '#faad14' }}
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
                              backgroundColor: '#f5f5f5',
                              fontWeight: 'bold',
                              color: (urgencies && selectedRequest.urgencyId && urgencies[selectedRequest.urgencyId]) ? 
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
                            style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={[24, 16]}>
                      <Col span={24}>
                        <Form.Item
                          label={
                            <span>
                              <FileTextOutlined style={{ marginRight: '8px', color: '#8c8c8c' }} />
                              GHI CHÚ
                            </span>
                          }
                          name="note"
                        >
                          <TextArea
                            rows={4}
                            readOnly
                            style={{ 
                              backgroundColor: '#f5f5f5',
                              resize: 'none'
                            }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Rejection Reason - Only show if request is rejected */}
                    {isRejected() && (
                      <Row gutter={[24, 16]}>
                        <Col span={24}>
                          <Form.Item
                            label={
                              <span>
                                <CloseOutlined style={{ marginRight: '8px', color: '#f5222d' }} />
                                LÝ DO TỪ CHỐI
                              </span>
                            }
                            name="rejectionReason"
                          >
                            <TextArea
                              rows={3}
                              readOnly
                              style={{ 
                                backgroundColor: '#fff2f0',
                                border: '1px solid #ffccc7',
                                resize: 'none',
                                color: '#f5222d'
                              }}
                              placeholder="Không có lý do từ chối được cung cấp"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    )}

                    {/* Information Notice */}
                    <Card 
                      size="small" 
                      style={{ 
                        backgroundColor: '#e6f7ff', 
                        border: '1px solid #91d5ff',
                        marginTop: '16px'
                      }}
                    >
                      <Space>
                        <AlertOutlined style={{ color: '#1890ff' }} />
                        <span style={{ color: '#1890ff' }}>
                          <strong>Thông tin:</strong> Đây là trang xem chi tiết đơn khẩn cấp mà bạn đã tạo. 
                          Để tạo đơn mới, vui lòng truy cập trang "Tạo đơn khẩn cấp".
                        </span>
                      </Space>
                    </Card>
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

export default RequestHistoryDetailPage;
