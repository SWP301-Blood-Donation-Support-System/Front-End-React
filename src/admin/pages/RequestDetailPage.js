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
  Modal,
} from "antd";
import {
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
  AlertOutlined,
  DropboxOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  CheckOutlined,
  CloseOutlined,
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

  // Rejection modal states
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectForm] = Form.useForm();
  const [rejectLoading, setRejectLoading] = useState(false);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      setLoading(true);
      try {
        const detailedRequest = await HospitalAPI.getBloodRequestById(requestId);
        setSelectedRequest(detailedRequest);
        
        // Fetch lookup data if not available - removed bloodTypes dependency check
      } catch (error) {
        console.error("Error fetching request details:", error);
        message.error("Lỗi khi tải chi tiết đơn khẩn cấp!");
      } finally {
        setLoading(false);
      }
    };

    // Get data from location state if available
    if (location.state) {
      const { request, hospital, bloodTypes, bloodComponents, urgencies, bloodRequestStatuses } = location.state;
      if (request && request.requestId) setSelectedRequest(request);
      if (hospital) setHospital(hospital);
      if (bloodTypes) setBloodTypes(bloodTypes);
      if (bloodComponents) setBloodComponents(bloodComponents);
      if (urgencies) setUrgencies(urgencies);
      if (bloodRequestStatuses) setBloodRequestStatuses(bloodRequestStatuses);
      
      // Nếu không có request trong state, fetch từ API
      if (!request || !request.requestId) {
        fetchRequestDetails();
      }
    } else {
      // Fallback: fetch request details if state is not available
      fetchRequestDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId, location.state]);

  const handleBackToHospitalRequests = () => {
    // Kiểm tra xem có returnPath trong state không
    if (location.state?.returnPath) {
      navigate(location.state.returnPath);
    } else if (hospital) {
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

  const handleApproveRequest = async () => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      // Try different possible field names for user ID
      const approverUserId = parseInt(userInfo.UserId || userInfo.UserID || userInfo.userId || userInfo.id);
      
      console.log('Approval Debug - userInfo:', userInfo);
      console.log('Approval Debug - approverUserId:', approverUserId);
      console.log('Approval Debug - selectedRequest.requestId:', selectedRequest.requestId);
      
      if (!approverUserId) {
        message.error('Không thể xác định người duyệt. Vui lòng đăng nhập lại!');
        return;
      }
      
      if (!selectedRequest.requestId) {
        message.error('Không thể xác định ID đơn khẩn cấp!');
        return;
      }
      
      console.log('Debug - About to call approveBloodRequest API');
      const response = await HospitalAPI.approveBloodRequest(parseInt(selectedRequest.requestId), approverUserId);
      console.log('Debug - API response:', response);
      
      // Check if response contains insufficient blood warning
      const responseMessage = response?.message || response?.msg || response?.data?.message || response?.data?.msg || '';
      console.log('Debug - Response message:', responseMessage);
      
      const hasInsufficientBloodWarning = responseMessage.includes('Could not fulfill the entire blood request') || 
                                         responseMessage.includes('still needed') ||
                                         responseMessage.includes('Requested:') ||
                                         responseMessage.includes('Fulfilled:') ||
                                         responseMessage.includes('Remaining:');
      
      console.log('Debug - hasInsufficientBloodWarning:', hasInsufficientBloodWarning);
      
      if (hasInsufficientBloodWarning) {
        message.warning('Đã duyệt đơn nhưng kho máu không đủ để đáp ứng hoàn toàn!');
        
        console.log('Debug - Navigating with insufficientBlood=true from SUCCESS response');
        navigate(`/staff/approve-requests/blood-selection/${selectedRequest.requestId}`, {
          state: { 
            request: selectedRequest,
            hospital,
            bloodTypes,
            bloodComponents,
            urgencies,
            bloodRequestStatuses,
            insufficientBlood: true,
            backendErrorMessage: responseMessage
          }
        });
      } else {
        message.success('Đã duyệt đơn khẩn cấp thành công!');
        
        // Navigate to blood unit selection page
        navigate(`/staff/approve-requests/blood-selection/${selectedRequest.requestId}`, {
          state: { 
            request: selectedRequest,
            hospital,
            bloodTypes,
            bloodComponents,
            urgencies,
            bloodRequestStatuses
          }
        });
      }
    } catch (error) {
      console.error('Error approving request:', error);
      console.error('Error details:', error.response?.data);
      
      // Check if this is an insufficient blood supply error
      const errorMessage = error.response?.data?.msg || error.response?.data?.message || '';
      console.log('Debug - Full error response:', error.response?.data);
      console.log('Debug - Error message:', errorMessage);
      console.log('Debug - Status:', error.response?.status);
      
      const isInsufficientBlood = errorMessage.includes('Could not fulfill the entire blood request') || 
                                  errorMessage.includes('still needed') ||
                                  errorMessage.includes('Requested:') ||
                                  errorMessage.includes('Fulfilled:') ||
                                  errorMessage.includes('Remaining:') ||
                                  (error.response?.status === 400 && errorMessage.length > 0);
      
      console.log('Debug - isInsufficientBlood:', isInsufficientBlood);
      
      if (isInsufficientBlood) {
        // Still navigate to blood selection page but with insufficient blood warning
        // Use the exact message from backend
        message.warning('Đã duyệt đơn nhưng kho máu không đủ để đáp ứng hoàn toàn!');
        
        console.log('Debug - Navigating with insufficientBlood=true');
        navigate(`/staff/approve-requests/blood-selection/${selectedRequest.requestId}`, {
          state: { 
            request: selectedRequest,
            hospital,
            bloodTypes,
            bloodComponents,
            urgencies,
            bloodRequestStatuses,
            insufficientBlood: true,
            backendErrorMessage: errorMessage // Use exact backend message
          }
        });
      } else {
        // Handle other types of errors
        if (error.response?.status === 401) {
          message.error('Bạn không có quyền duyệt đơn này!');
        } else if (error.response?.status === 404) {
          message.error('Không tìm thấy đơn khẩn cấp!');
        } else {
          message.error('Lỗi khi duyệt đơn khẩn cấp!');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = () => {
    // Show rejection modal instead of directly rejecting
    setRejectModalVisible(true);
  };

  const handleRejectSubmit = async (values) => {
    setRejectLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      // Try different possible field names for user ID
      const approverUserId = parseInt(userInfo.UserId || userInfo.UserID || userInfo.userId || userInfo.id);
      
      console.log('Rejection Debug - userInfo:', userInfo);
      console.log('Rejection Debug - approverUserId:', approverUserId);
      console.log('Rejection Debug - selectedRequest.requestId:', selectedRequest.requestId);
      console.log('Rejection Debug - reason:', values.reason);
      
      if (!approverUserId) {
        message.error('Không thể xác định người duyệt. Vui lòng đăng nhập lại!');
        return;
      }
      
      if (!selectedRequest.requestId) {
        message.error('Không thể xác định ID đơn khẩn cấp!');
        return;
      }
      
      // Send rejection data according to API format
      const rejectionData = {
        userId: approverUserId,
        reason: values.reason
      };
      
      await HospitalAPI.rejectBloodRequest(parseInt(selectedRequest.requestId), rejectionData);
      message.success('Đã từ chối đơn khẩn cấp!');
      
      // Close modal and reset form
      setRejectModalVisible(false);
      rejectForm.resetFields();
      
      // Go back to hospital requests page
      handleBackToHospitalRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      console.error('Error details:', error.response?.data);
      
      // Show more specific error message
      if (error.response?.status === 400) {
        message.error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin!');
      } else if (error.response?.status === 401) {
        message.error('Bạn không có quyền từ chối đơn này!');
      } else if (error.response?.status === 404) {
        message.error('Không tìm thấy đơn khẩn cấp!');
      } else {
        message.error('Lỗi khi từ chối đơn khẩn cấp!');
      }
    } finally {
      setRejectLoading(false);
    }
  };

  const handleRejectCancel = () => {
    setRejectModalVisible(false);
    rejectForm.resetFields();
  };

  const isPendingApproval = () => {
    if (!bloodRequestStatuses || !selectedRequest) return false;
    
    const pendingStatus = Object.values(bloodRequestStatuses).find(
      status => status && status.name === "Đang chờ duyệt"
    );
    return pendingStatus && selectedRequest.requestStatusId === pendingStatus.id;
  };

  const isRejected = () => {
    if (!bloodRequestStatuses || !selectedRequest) return false;
    const currentStatus = bloodRequestStatuses[selectedRequest.requestStatusId];
    return currentStatus && currentStatus.name === "Đã từ chối";
  };

  if (!selectedRequest || loading) {
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
                      urgencyId: (urgencies && selectedRequest.urgencyId && urgencies[selectedRequest.urgencyId]) ? 
                        getUrgencyVietnameseName(urgencies[selectedRequest.urgencyId].name) : 
                        'N/A',
                      requestStatusId: bloodRequestStatuses[selectedRequest.requestStatusId]?.name || 'N/A',
                      note: selectedRequest.note || 'Không có ghi chú',
                      rejectionReason: selectedRequest.rejectionReason || selectedRequest.reason || 'Không có lý do từ chối',
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

                    {/* Rejection Reason - Only show if request is rejected */}
                    {isRejected() && (
                      <Row gutter={[24, 16]}>
                        <Col span={24}>
                          <Divider orientation="left" style={{ color: '#f5222d' }}>
                            <span style={{ color: '#f5222d' }}>
                              <CloseOutlined style={{ marginRight: '8px' }} />
                              LÝ DO TỪ CHỐI
                            </span>
                          </Divider>
                          <Form.Item
                            name="rejectionReason"
                          >
                            <TextArea
                              readOnly
                              rows={3}
                              style={{ 
                                backgroundColor: '#fff2f0',
                                border: '1px solid #ffccc7',
                                color: '#f5222d'
                              }}
                              placeholder="Không có lý do từ chối được cung cấp"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    )}
                  </Form>

                  {/* Approval Buttons - Only show if request is pending approval */}
                  {isPendingApproval() && (
                    <>
                      <Divider orientation="left">THAO TÁC DUYỆT</Divider>
                      <Row justify="center" gutter={[24, 16]} style={{ marginTop: '24px' }}>
                        <Col>
                          <Button
                            type="primary"
                            size="large"
                            icon={<CheckOutlined />}
                            onClick={handleApproveRequest}
                            loading={loading}
                            style={{ 
                              backgroundColor: '#52c41a', 
                              borderColor: '#52c41a',
                              minWidth: '150px'
                            }}
                          >
                            Duyệt
                          </Button>
                        </Col>
                        <Col>
                          <Button
                            type="primary"
                            size="large"
                            danger
                            icon={<CloseOutlined />}
                            onClick={handleRejectRequest}
                            loading={loading}
                            style={{ minWidth: '150px' }}
                          >
                            Từ chối
                          </Button>
                        </Col>
                      </Row>
                    </>
                  )}
                </Card>
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>

      {/* Rejection Modal */}
      <Modal
        title={
          <Space>
            <CloseOutlined style={{ color: '#f5222d' }} />
            <span>Từ chối đơn yêu cầu máu khẩn cấp</span>
          </Space>
        }
        open={rejectModalVisible}
        onCancel={handleRejectCancel}
        footer={null}
        width={600}
        centered
      >
        <Form
          form={rejectForm}
          layout="vertical"
          onFinish={handleRejectSubmit}
          requiredMark={false}
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <p style={{ marginBottom: '16px', color: '#666' }}>
                Bạn đang từ chối đơn yêu cầu máu khẩn cấp <strong>#{selectedRequest?.requestId}</strong>. 
                Vui lòng nhập lý do từ chối để bệnh viện có thể hiểu và cải thiện.
              </p>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Lý do từ chối"
                name="reason"
                rules={[
                  { 
                    required: true, 
                    message: 'Vui lòng nhập lý do từ chối!' 
                  },
                  {
                    min: 10,
                    message: 'Lý do từ chối phải có ít nhất 10 ký tự!'
                  }
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Nhập lý do từ chối đơn khẩn cấp (ví dụ: Không đủ túi máu, thông tin không chính xác, v.v.)"
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row justify="end" gutter={[8, 8]} style={{ marginTop: '16px' }}>
            <Col>
              <Button onClick={handleRejectCancel}>
                Hủy
              </Button>
            </Col>
            <Col>
              <Button 
                type="primary" 
                danger 
                htmlType="submit"
                loading={rejectLoading}
                icon={<CloseOutlined />}
              >
                Xác nhận từ chối
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Layout>
  );
};

export default RequestDetailPage; 