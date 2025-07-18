import React, { useState, useEffect, useCallback } from "react";
import { Layout, Table, Typography, Button, Card, message, Tag, Progress, Space, Alert, Tabs, Modal } from "antd";
import { ArrowLeftOutlined, SelectOutlined, StarOutlined, CheckCircleOutlined, ExclamationCircleOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import dayjs from "dayjs";

import StaffSidebar from "../components/StaffSidebar";
import StaffHeader from "../components/StaffHeader";
import { HospitalAPI } from "../api/hospital";
import "../styles/donation-records.scss";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const BloodUnitSelectionPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { requestId } = useParams();
  const location = useLocation();
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [bloodTypes, setBloodTypes] = useState({});
  const [bloodComponents, setBloodComponents] = useState({});
  const [bloodRequestStatuses, setBloodRequestStatuses] = useState({});
  const [suggestedBloodUnits, setSuggestedBloodUnits] = useState([]);
  const [sentBloodUnits, setSentBloodUnits] = useState([]);
  const [loadingSentUnits, setLoadingSentUnits] = useState(false);
  const [insufficientBlood, setInsufficientBlood] = useState(false);
  const [backendErrorMessage, setBackendErrorMessage] = useState('');
  const [bloodSupplyInfo, setBloodSupplyInfo] = useState(null);
  const [defaultActiveTab, setDefaultActiveTab] = useState('suggested');
  
  // Modal states
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedBloodUnit, setSelectedBloodUnit] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Unassign modal states
  const [unassignModalVisible, setUnassignModalVisible] = useState(false);
  const [unassignBloodUnit, setUnassignBloodUnit] = useState(null);
  const [unassignLoading, setUnassignLoading] = useState(false);

  // Final confirmation modal states
  const [finalConfirmModalVisible, setFinalConfirmModalVisible] = useState(false);
  const [finalConfirmLoading, setFinalConfirmLoading] = useState(false);
  const [isBloodSent, setIsBloodSent] = useState(false); // Track if blood has been officially sent

  // Function to check if request is completed
  const isRequestCompleted = useCallback(() => {
    if (!selectedRequest || !bloodRequestStatuses) return false;
    const status = bloodRequestStatuses[selectedRequest.requestStatusId];
    return status && status.name === "Đã hoàn thành";
  }, [selectedRequest, bloodRequestStatuses]);

  // Function to fetch sent blood units
  const fetchSentBloodUnits = async (requestId) => {
    setLoadingSentUnits(true);
    try {
      const response = await HospitalAPI.getBloodUnitsByRequest(requestId);
      const bloodUnits = Array.isArray(response) ? response : response.data || [];
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Debug - Sent blood units response:', bloodUnits);
      }
      
      setSentBloodUnits(bloodUnits);
      
    } catch (error) {
      console.error("Error fetching sent blood units:", error);
      message.error("Lỗi khi tải danh sách túi máu đã gửi!");
    } finally {
      setLoadingSentUnits(false);
    }
  };

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Debug - BloodUnitSelectionPage mounted');
      console.log('Debug - location.state:', location.state);
    }
    
    const fetchSuggestedBloodUnits = async (requestId) => {
      setLoading(true);
      try {
        const response = await HospitalAPI.getSuggestedBloodUnits(requestId);
        const bloodUnits = Array.isArray(response) ? response : response.data || [];
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Debug - Suggested blood units response:', bloodUnits);
        }
        
        setSuggestedBloodUnits(bloodUnits);
        
        // If no blood units available and not already marked as insufficient, mark it
        // But don't mark as insufficient if request is already completed
        if (bloodUnits.length === 0 && !insufficientBlood && !isRequestCompleted()) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Debug - No blood units available, marking as insufficient');
          }
          setInsufficientBlood(true);
          setBackendErrorMessage('Không có túi máu phù hợp trong kho để đáp ứng yêu cầu này.');
        }
      } catch (error) {
        console.error("Error fetching suggested blood units:", error);
        
        // Check if this error indicates insufficient blood
        const errorMessage = error.response?.data?.msg || error.response?.data?.message || '';
        if (errorMessage.includes('Could not fulfill') || errorMessage.includes('still needed')) {
          setInsufficientBlood(true);
          setBackendErrorMessage(errorMessage);
        }
        
        message.error("Lỗi khi tải danh sách túi máu!");
      } finally {
        setLoading(false);
      }
    };
    
    if (location.state) {
      const { request, hospital, bloodTypes, bloodComponents, bloodRequestStatuses, insufficientBlood, backendErrorMessage } = location.state;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Debug - All state values:', { 
          request, 
          hospital, 
          bloodTypes, 
          bloodComponents, 
          bloodRequestStatuses,
          insufficientBlood, 
          backendErrorMessage 
        });
      }
      
      setSelectedRequest(request);
      setHospital(hospital);
      setBloodTypes(bloodTypes);
      setBloodComponents(bloodComponents);
      setBloodRequestStatuses(bloodRequestStatuses || {});
      
      // Check if request is completed and set default tab accordingly
      const status = bloodRequestStatuses && bloodRequestStatuses[request.requestStatusId];
      const isCompleted = status && status.name === "Đã hoàn thành";
      
      if (isCompleted) {
        setDefaultActiveTab('sent'); // If completed, show sent units tab
      } else {
        setDefaultActiveTab('suggested'); // Otherwise show suggested units tab
      }
      
      // Set insufficient blood warning if passed from previous page
      // But don't show it if request is already completed
      if (insufficientBlood && !isCompleted) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Debug - Insufficient blood detected:', insufficientBlood);
          console.log('Debug - Backend error message:', backendErrorMessage);
        }
        
        setInsufficientBlood(true);
        setBackendErrorMessage(backendErrorMessage || 'Kho máu hiện tại không đủ để đáp ứng hoàn toàn yêu cầu này.');
        
        // Parse backend message to extract blood supply information
        const parsedInfo = parseBackendErrorMessage(backendErrorMessage);
        if (process.env.NODE_ENV === 'development') {
          console.log('Debug - Parsed info:', parsedInfo);
        }
        setBloodSupplyInfo(parsedInfo);
      } else {
        // For completed requests or non-insufficient cases, clear any insufficient blood warnings
        setInsufficientBlood(false);
        setBackendErrorMessage('');
        setBloodSupplyInfo(null);
      }
      
      fetchSuggestedBloodUnits(request.requestId);
      fetchSentBloodUnits(request.requestId);
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('Debug - No location state, navigating back');
      }
      navigate('/staff/approve-requests');
    }
  }, [requestId, location.state, navigate, insufficientBlood, isRequestCompleted]);

  // Auto-set isBloodSent when request is completed
  useEffect(() => {
    if (isRequestCompleted()) {
      setIsBloodSent(true);
    }
  }, [isRequestCompleted]);

  // Function to parse backend error message
  const parseBackendErrorMessage = (message) => {
    if (!message) return null;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Debug - Parsing message:', message);
    }
    
    // Parse message like: "Could not fulfill the entire blood request for ID 17. Requested: 2000.00ml, Fulfilled: 700.00ml, Remaining: 1300.00ml still needed."
    // Or other formats with similar structure
    const requestedMatch = message.match(/Requested:\s*([\d.]+)\s*ml/i);
    const fulfilledMatch = message.match(/Fulfilled:\s*([\d.]+)\s*ml/i);
    const remainingMatch = message.match(/Remaining:\s*([\d.]+)\s*ml/i);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Debug - Regex matches:', { requestedMatch, fulfilledMatch, remainingMatch });
    }
    
    if (requestedMatch && fulfilledMatch && remainingMatch) {
      const result = {
        requested: parseFloat(requestedMatch[1]),
        fulfilled: parseFloat(fulfilledMatch[1]),
        remaining: parseFloat(remainingMatch[1])
      };
      if (process.env.NODE_ENV === 'development') {
        console.log('Debug - Parsed result:', result);
      }
      return result;
    }
    
    // Fallback: try to extract numbers from the message
    const numbers = message.match(/[\d.]+/g);
    if (numbers && numbers.length >= 3) {
      return {
        requested: parseFloat(numbers[0]),
        fulfilled: parseFloat(numbers[1]),
        remaining: parseFloat(numbers[2])
      };
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Debug - Could not parse message');
    }
    return null;
  };

  // Function to refresh request data from backend
  const refreshRequestData = async (requestId) => {
    try {
      const [requestResponse, statusesResponse] = await Promise.all([
        HospitalAPI.getBloodRequestById(requestId),
        HospitalAPI.getBloodRequestStatuses()
      ]);
      
      const updatedRequest = requestResponse.data || requestResponse;
      const updatedStatuses = statusesResponse.data || statusesResponse;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Debug - Refreshed request data:', updatedRequest);
        console.log('Debug - Updated statuses:', updatedStatuses);
      }
      
      // Update request and statuses
      setSelectedRequest(updatedRequest);
      setBloodRequestStatuses(updatedStatuses);
      
      return updatedRequest;
    } catch (error) {
      console.error("Error refreshing request data:", error);
      return selectedRequest; // Return current request if refresh fails
    }
  };

  const handleSelectBloodUnit = async (bloodUnit) => {
    // Instead of immediately assigning, show confirmation modal
    setSelectedBloodUnit(bloodUnit);
    setConfirmModalVisible(true);
  };

  // Function to actually assign blood unit after confirmation
  const handleConfirmAssignment = async () => {
    if (!selectedBloodUnit) return;
    
    setModalLoading(true);
    try {
      await HospitalAPI.assignBloodUnitToRequest(
        selectedBloodUnit.bloodUnitId, 
        selectedRequest.requestId
      );
      
      message.success(`Đã chọn và gửi túi máu #${selectedBloodUnit.bloodUnitId}`);
      
      // Refresh request data from backend to get updated status and volume
      const updatedRequest = await refreshRequestData(selectedRequest.requestId);
      
      // Refresh sent blood units list
      await fetchSentBloodUnits(selectedRequest.requestId);
      
      // Remove the selected unit from the suggested list
      setSuggestedBloodUnits(prev => 
        prev.filter(unit => unit.bloodUnitId !== selectedBloodUnit.bloodUnitId)
      );
      
      // Check if request is now completed and update tab if needed
      const status = bloodRequestStatuses[updatedRequest.requestStatusId];
      const isBackendCompleted = status && status.name === "Đã hoàn thành";
      const isCalculatedCompleted = calculateProgress().isComplete;
      
      if (isBackendCompleted || isCalculatedCompleted) {
        setDefaultActiveTab('sent');
        message.success('Yêu cầu đã được hoàn thành!', 3);
      }
      
      // Close modal
      setConfirmModalVisible(false);
      setSelectedBloodUnit(null);
      
    } catch (error) {
      console.error("Error selecting blood unit:", error);
      message.error("Lỗi khi chọn túi máu!");
    } finally {
      setModalLoading(false);
    }
  };

  // Function to unassign blood unit
  const handleUnassignBloodUnit = async (bloodUnit) => {
    console.log('handleUnassignBloodUnit called with:', bloodUnit);
    setUnassignBloodUnit(bloodUnit);
    setUnassignModalVisible(true);
  };

  // Function to actually unassign after confirmation
  const handleConfirmUnassign = async () => {
    if (!unassignBloodUnit) return;
    
    setUnassignLoading(true);
    try {
      console.log('Calling unassign API for unit:', unassignBloodUnit.bloodUnitId, 'from request:', selectedRequest.requestId);
      await HospitalAPI.unassignBloodUnitFromRequest(unassignBloodUnit.bloodUnitId, selectedRequest.requestId);
      
      message.success(`Đã hủy chọn túi máu #${unassignBloodUnit.bloodUnitId}`);
      
      // Refresh request data from backend
      await refreshRequestData(selectedRequest.requestId);
      
      // Refresh both lists
      await fetchSentBloodUnits(selectedRequest.requestId);
      // Also refresh suggested units as the unassigned unit might become available again
      const response = await HospitalAPI.getSuggestedBloodUnits(selectedRequest.requestId);
      const bloodUnits = Array.isArray(response) ? response : response.data || [];
      setSuggestedBloodUnits(bloodUnits);
      
      // Close modal
      setUnassignModalVisible(false);
      setUnassignBloodUnit(null);
      
    } catch (error) {
      console.error("Error unassigning blood unit:", error);
      message.error("Lỗi khi hủy chọn túi máu!");
    } finally {
      setUnassignLoading(false);
    }
  };

  // Final confirmation functions
  const handleShowFinalConfirmation = () => {
    setFinalConfirmModalVisible(true);
  };

  const handleFinalConfirmSend = async () => {
    setFinalConfirmLoading(true);
    try {
      // Không cần gọi API - chỉ cần confirm việc gửi và update local state
      // Status đã tự động chuyển thành "Đã hoàn thành" khi assign đủ túi máu
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      message.success('Đã xác nhận hoàn tất quá trình gửi túi máu!');
      setIsBloodSent(true);
      setFinalConfirmModalVisible(false);
      
      // Refresh data để đảm bảo có status mới nhất
      await refreshRequestData(selectedRequest.requestId);
      await fetchSentBloodUnits(selectedRequest.requestId);
      
    } catch (error) {
      console.error('Error confirming blood units sent:', error);
      message.error('Lỗi khi xác nhận gửi túi máu!');
    } finally {
      setFinalConfirmLoading(false);
    }
  };

  const handleCancelFinalConfirm = () => {
    setFinalConfirmModalVisible(false);
  };

  const handleBackToRequestDetail = () => {
    const progress = calculateProgress();
    
    // Kiểm tra nếu progress đã 100% nhưng chưa xác nhận gửi
    if (progress.isComplete && !isBloodSent && !isRequestCompleted()) {
      Modal.confirm({
        title: 'Xác nhận gửi túi máu',
        content: 'Bạn đã chọn đủ túi máu nhưng chưa xác nhận gửi. Bạn có muốn xác nhận gửi túi máu ngay bây giờ không?',
        okText: 'Xác nhận gửi',
        cancelText: 'Quay lại sau',
        icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
        onOk: () => {
          setFinalConfirmModalVisible(true);
        },
        onCancel: () => {
          // Proceed with navigation without sending
          proceedWithNavigation();
        }
      });
      return;
    }
    
    // Nếu không cần cảnh báo, tiếp tục navigation bình thường
    proceedWithNavigation();
  };

  const proceedWithNavigation = () => {
    // Kiểm tra xem có returnPath trong state không
    if (location.state?.returnPath) {
      navigate(location.state.returnPath);
    } else {
      // Fallback về RequestDetailPage nếu không có returnPath
      // Đảm bảo selectedRequest có đầy đủ thông tin
      const requestToPass = selectedRequest || location.state?.request;
      const hospitalToPass = hospital || location.state?.hospital;
      const bloodTypesToPass = bloodTypes || location.state?.bloodTypes || {};
      const bloodComponentsToPass = bloodComponents || location.state?.bloodComponents || {};
      
      if (requestToPass && requestToPass.requestId) {
        navigate(`/staff/approve-requests/request/${requestId}`, {
          state: { 
            request: requestToPass,
            hospital: hospitalToPass,
            bloodTypes: bloodTypesToPass,
            bloodComponents: bloodComponentsToPass 
          }
        });
      } else {
        // Nếu không có đủ dữ liệu, redirect về trang chính
        console.warn('Insufficient data to return to RequestDetailPage, redirecting to main page');
        navigate('/staff/approve-requests');
      }
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    return dayjs(dateTime).format('DD/MM/YYYY');
  };

  const calculateProgress = () => {
    if (!selectedRequest) return { percentage: 0, status: 'normal', isComplete: false };
    
    // Use backend fields: volume (original) and remainingVolume (still needed)
    const originalVolume = selectedRequest.volume || 0;
    const backendRemainingVolume = selectedRequest.remainingVolume || 0;
    
    // Calculate actual assigned volume from sent blood units for verification
    const actualSentVolume = sentBloodUnits.reduce((sum, unit) => sum + (unit.volume || 0), 0);
    
    // Check completion status from backend
    const backendCompleted = isRequestCompleted();
    
    // Cross-check: Only consider completed if backend says completed AND we have actually sent blood units
    // OR if we have sent enough volume to meet the original request
    const actuallyCompleted = backendCompleted && (actualSentVolume > 0 || actualSentVolume >= originalVolume);
    
    if (actuallyCompleted) {
      return { 
        percentage: 100, 
        status: 'success', 
        isComplete: true, 
        requiredVolume: originalVolume, 
        remainingVolume: 0 
      };
    }
    
    // For incomplete requests, calculate based on actual sent volume
    const percentage = originalVolume > 0 ? Math.min((actualSentVolume / originalVolume) * 100, 100) : 0;
    
    // Calculate remaining volume: prioritize manual calculation over potentially incorrect backend data
    let remainingVolume;
    if (actualSentVolume > 0) {
      // If we have sent blood units, calculate remaining manually for accuracy
      remainingVolume = Math.max(originalVolume - actualSentVolume, 0);
    } else {
      // If no blood units sent yet, use backend remaining volume
      remainingVolume = backendRemainingVolume;
    }
    
    let status = 'normal';
    let isComplete = false;
    
    if (percentage >= 100) {
      status = 'success';
      isComplete = true;
    } else if (percentage >= 80) {
      status = 'normal';
    } else if (percentage >= 50) {
      status = 'active';
    } else {
      status = 'exception';
    }
    
    return { 
      percentage: Math.round(percentage), 
      status, 
      isComplete, 
      requiredVolume: originalVolume, 
      remainingVolume: Math.max(remainingVolume, 0) 
    };
  };

  const columns = [
    {
      title: 'ID Túi máu',
      dataIndex: 'bloodUnitId',
      key: 'bloodUnitId',
      render: (id) => <Text strong>#{id}</Text>,
    },
    {
      title: 'Nhóm máu',
      dataIndex: 'bloodTypeId',
      key: 'bloodTypeId',
      render: (typeId) => {
        const type = bloodTypes[typeId];
        return type ? <Tag color="red">{type.name}</Tag> : 'N/A';
      },
    },
    {
      title: 'Thành phần',
      dataIndex: 'componentId',
      key: 'componentId',
      render: (componentId) => {
        const component = bloodComponents[componentId];
        return component ? <Tag color="blue">{component.name}</Tag> : 'N/A';
      },
    },
    {
      title: 'Thể tích',
      dataIndex: 'volume',
      key: 'volume',
      render: (volume) => `${volume} ml`,
    },
    {
      title: 'Ngày thu thập',
      dataIndex: 'collectedDateTime',
      key: 'collectedDateTime',
      render: (dateTime) => formatDateTime(dateTime),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<SelectOutlined />}
          onClick={() => handleSelectBloodUnit(record)}
          size="small"
        >
          Chọn
        </Button>
      ),
    },
  ];

  const sentUnitsColumns = [
    {
      title: 'ID Túi máu',
      dataIndex: 'bloodUnitId',
      key: 'bloodUnitId',
      render: (id) => <Text strong>#{id}</Text>,
    },
    {
      title: 'Nhóm máu',
      dataIndex: 'bloodTypeId',
      key: 'bloodTypeId',
      render: (typeId) => {
        const type = bloodTypes[typeId];
        return type ? <Tag color="red">{type.name}</Tag> : 'N/A';
      },
    },
    {
      title: 'Thành phần',
      dataIndex: 'componentId',
      key: 'componentId',
      render: (componentId) => {
        const component = bloodComponents[componentId];
        return component ? <Tag color="blue">{component.name}</Tag> : 'N/A';
      },
    },
    {
      title: 'Thể tích',
      dataIndex: 'volume',
      key: 'volume',
      render: (volume) => `${volume} ml`,
    },
    {
      title: 'Ngày thu thập',
      dataIndex: 'collectedDateTime',
      key: 'collectedDateTime',
      render: (dateTime) => formatDateTime(dateTime),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'bloodUnitStatusId',
      key: 'bloodUnitStatusId',
      render: (statusId) => {
        // Map status IDs to status names - you might need to adjust this based on your actual status mapping
        const statusMap = {
          1: { name: 'Có sẵn', color: 'green' },
          2: { name: 'Đã sử dụng', color: 'blue' },
          3: { name: 'Hết hạn', color: 'red' },
          4: { name: 'Đã gửi', color: 'orange' }
        };
        const status = statusMap[statusId] || { name: 'Không xác định', color: 'default' };
        return <Tag color={status.color}>{status.name}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center',
      render: (_, record) => {
        const requestCompleted = isRequestCompleted();
        console.log('Request completed status:', requestCompleted);
        console.log('Record for action:', record);
        
        return (
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              console.log('Button clicked, calling handleUnassignBloodUnit');
              handleUnassignBloodUnit(record);
            }}
            size="small"
            disabled={requestCompleted || isBloodSent}
            title={isBloodSent ? "Không thể hủy chọn sau khi đã xác nhận gửi" : undefined}
          >
            Hủy chọn
          </Button>
        );
      },
    },
  ];

  if (!selectedRequest) {
    return (
      <Layout className="staff-layout">
        <StaffSidebar collapsed={collapsed} onCollapse={setCollapsed} />
        <Layout className="staff-main-layout">
          <StaffHeader />
          <Layout className="staff-content-layout">
            <Content className="donation-records-content">
              <div className="donation-records-container">
                <Card>
                  <p>Đang tải...</p>
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
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBackToRequestDetail}
                  style={{ marginBottom: '16px' }}
                >
                  Quay lại
                </Button>
                <Title level={3} className="donation-records-title">
                  {isRequestCompleted() ? 
                    `Xem túi máu đã gửi - Đơn #${selectedRequest.requestId}` : 
                    `Chọn túi máu để cấp - Đơn #${selectedRequest.requestId}`
                  }
                </Title>
              </div>

              {/* Insufficient Blood Warning - Only show for non-completed requests */}
              {insufficientBlood && !isRequestCompleted() && (
                <Alert
                  message="Cảnh báo: Không đủ túi máu trong kho!"
                  description={
                    <div>
                      <p><strong>Thông báo từ hệ thống:</strong></p>
                      <p style={{ fontStyle: 'italic', color: '#666' }}>{backendErrorMessage}</p>
                      
                      {bloodSupplyInfo && (
                        <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#f6f6f6', borderRadius: '4px' }}>
                          <p><strong>Thống kê chi tiết:</strong></p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '14px' }}>
                            <div>
                              <span style={{ color: '#1890ff' }}>Yêu cầu: </span>
                              <strong>{bloodSupplyInfo.requested}ml</strong>
                            </div>
                            <div>
                              <span style={{ color: '#52c41a' }}>Có thể cung cấp: </span>
                              <strong>{bloodSupplyInfo.fulfilled}ml</strong>
                            </div>
                            <div>
                              <span style={{ color: '#f5222d' }}>Còn thiếu: </span>
                              <strong>{bloodSupplyInfo.remaining}ml</strong>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <p style={{ marginTop: '8px' }}>
                        Hiện tại kho máu không đủ để đáp ứng hoàn toàn yêu cầu này. 
                        Vui lòng chọn các túi máu có sẵn hoặc chờ thêm túi máu phù hợp được bổ sung.
                      </p>
                    </div>
                  }
                  type="warning"
                  showIcon
                  style={{ marginBottom: '16px' }}
                  closable
                  onClose={() => setInsufficientBlood(false)}
                />
              )}

              {/* Progress Tracker */}
              <Card 
                style={{ marginBottom: '16px' }}
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {calculateProgress().isComplete ? (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                    )}
                    <Text strong>Tiến độ đáp ứng yêu cầu</Text>
                  </div>
                }
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Progress
                    percent={calculateProgress().percentage}
                    status={calculateProgress().status}
                    size="default"
                    format={(percent) => `${percent}%`}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                      <Text>Đã gửi: <Text strong>
                        {sentBloodUnits.reduce((sum, unit) => sum + (unit.volume || 0), 0)} ml
                      </Text></Text>
                      <Text>Yêu cầu: <Text strong>{calculateProgress().requiredVolume} ml</Text></Text>
                      <Text>Còn thiếu: <Text strong style={{ color: calculateProgress().isComplete ? '#52c41a' : '#faad14' }}>
                        {calculateProgress().remainingVolume} ml
                      </Text></Text>
                    </Space>
                    <Text>Số túi đã gửi: <Text strong>{sentBloodUnits.length}</Text></Text>
                  </div>
                  
                  {/* Final confirmation button - only show when progress is complete and not already sent */}
                  {calculateProgress().isComplete && !isBloodSent && !isRequestCompleted() && (
                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                      <Button
                        type="primary"
                        size="large"
                        icon={<CheckCircleOutlined />}
                        onClick={handleShowFinalConfirmation}
                        style={{ 
                          backgroundColor: '#52c41a', 
                          borderColor: '#52c41a',
                          minWidth: '200px'
                        }}
                      >
                        Xác nhận hoàn tất gửi
                      </Button>
                    </div>
                  )}
                  
                  {/* Show confirmation message when blood has been sent */}
                  {isBloodSent && (
                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                      <Alert
                        message="Đã xác nhận hoàn tất gửi"
                        description="Quá trình gửi túi máu đã được hoàn tất. Không thể thay đổi sau bước này."
                        type="success"
                        showIcon
                      />
                    </div>
                  )}
                </Space>
              </Card>

              {/* Always display tabs for both completed and non-completed requests */}
              <Card>
                <Tabs defaultActiveKey={defaultActiveTab} size="large">
                  <TabPane 
                    tab={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <StarOutlined style={{ color: '#faad14' }} />
                        <Text strong>Túi máu được đề xuất</Text>
                      </div>
                    } 
                    key="suggested"
                  >
                    {/* Show completion message when request is completed */}
                    {(isRequestCompleted() || calculateProgress().isComplete) ? (
                      <Alert
                        message="Đã hoàn thành"
                        description="Yêu cầu này đã được hoàn thành thành công. Tất cả lượng máu cần thiết đã được cung cấp."
                        type="success"
                        showIcon
                      />
                    ) : (
                      <>
                        {/* Show "no suitable blood units" message only when not completed and no units available */}
                        {suggestedBloodUnits.length === 0 && !loading && !calculateProgress().isComplete && (
                          <Alert
                            message="Không có túi máu phù hợp"
                            description="Hiện tại không có túi máu nào phù hợp với yêu cầu. Vui lòng chờ thêm túi máu được bổ sung hoặc liên hệ với bộ phận quản lý túi máu."
                            type="info"
                            showIcon
                            style={{ marginBottom: '16px' }}
                          />
                        )}
                        
                        <Table
                          columns={columns}
                          dataSource={suggestedBloodUnits}
                          rowKey="bloodUnitId"
                          loading={loading}
                          pagination={false}
                          locale={{
                            emptyText: insufficientBlood ? (
                              <div style={{ padding: '20px', textAlign: 'center' }}>
                                <p>Không có túi máu phù hợp trong kho.</p>
                                {bloodSupplyInfo && (
                                  <p style={{ color: '#666', fontSize: '14px' }}>
                                    Hệ thống chỉ có thể cung cấp {bloodSupplyInfo.fulfilled}ml/{bloodSupplyInfo.requested}ml. 
                                    Thiếu {bloodSupplyInfo.remaining}ml.
                                  </p>
                                )}
                                <p style={{ color: '#faad14' }}>Vui lòng chờ bổ sung thêm túi máu.</p>
                              </div>
                            ) : 'Không có dữ liệu'
                          }}
                        />
                      </>
                    )}
                  </TabPane>
                  
                  <TabPane 
                    tab={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <EyeOutlined style={{ color: '#52c41a' }} />
                        <Text strong>Túi máu đã gửi ({sentBloodUnits.length})</Text>
                      </div>
                    } 
                    key="sent"
                  >
                    <Table
                      columns={sentUnitsColumns}
                      dataSource={sentBloodUnits}
                      rowKey="bloodUnitId"
                      loading={loadingSentUnits}
                      pagination={false}
                      locale={{
                        emptyText: 'Chưa có túi máu nào được gửi cho yêu cầu này'
                      }}
                      scroll={{ x: 800 }}
                    />
                  </TabPane>
                </Tabs>
              </Card>
            </div>
          </Content>
        </Layout>
      </Layout>

      {/* Confirmation Modal */}
      <Modal
        title="Xác nhận chọn túi máu"
        visible={confirmModalVisible}
        onOk={handleConfirmAssignment}
        onCancel={() => {
          setConfirmModalVisible(false);
          setSelectedBloodUnit(null);
        }}
        confirmLoading={modalLoading}
        okText="Xác nhận gửi"
        cancelText="Hủy"
        okType="primary"
      >
        {selectedBloodUnit && (
          <div>
            <p><strong>Bạn có chắc chắn muốn chọn và gửi túi máu này?</strong></p>
            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', marginTop: '12px' }}>
              <p><strong>Thông tin túi máu:</strong></p>
              <ul style={{ marginBottom: 0 }}>
                <li><strong>ID:</strong> #{selectedBloodUnit.bloodUnitId}</li>
                <li><strong>Nhóm máu:</strong> {bloodTypes[selectedBloodUnit.bloodTypeId]?.name || 'N/A'}</li>
                <li><strong>Thành phần:</strong> {bloodComponents[selectedBloodUnit.componentId]?.name || 'N/A'}</li>
                <li><strong>Thể tích:</strong> {selectedBloodUnit.volume} ml</li>
                <li><strong>Ngày thu thập:</strong> {formatDateTime(selectedBloodUnit.collectedDateTime)}</li>
              </ul>
            </div>
            <p style={{ marginTop: '12px', color: '#666' }}>
              <strong>Lưu ý:</strong> Sau khi xác nhận, túi máu sẽ được gửi đến bệnh viện ngay lập tức.
            </p>
          </div>
        )}
      </Modal>

      {/* Unassign Confirmation Modal */}
      <Modal
        title="Xác nhận hủy chọn túi máu"
        visible={unassignModalVisible}
        onOk={handleConfirmUnassign}
        onCancel={() => {
          setUnassignModalVisible(false);
          setUnassignBloodUnit(null);
        }}
        confirmLoading={unassignLoading}
        okText="Xác nhận hủy"
        cancelText="Hủy"
        okType="danger"
      >
        {unassignBloodUnit && (
          <div>
            <p><strong>Bạn có chắc chắn muốn hủy chọn túi máu này?</strong></p>
            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', marginTop: '12px' }}>
              <p><strong>Thông tin túi máu:</strong></p>
              <ul style={{ marginBottom: 0 }}>
                <li><strong>ID:</strong> #{unassignBloodUnit.bloodUnitId}</li>
                <li><strong>Nhóm máu:</strong> {bloodTypes[unassignBloodUnit.bloodTypeId]?.name || 'N/A'}</li>
                <li><strong>Thành phần:</strong> {bloodComponents[unassignBloodUnit.componentId]?.name || 'N/A'}</li>
                <li><strong>Thể tích:</strong> {unassignBloodUnit.volume} ml</li>
                <li><strong>Ngày thu thập:</strong> {formatDateTime(unassignBloodUnit.collectedDateTime)}</li>
              </ul>
            </div>
            <p style={{ marginTop: '12px', color: '#666' }}>
              <strong>Lưu ý:</strong> Sau khi hủy chọn, túi máu sẽ quay về danh sách đề xuất và có thể được chọn lại.
            </p>
          </div>
        )}
      </Modal>

      {/* Final Confirmation Modal */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <span>Xác nhận hoàn tất gửi túi máu</span>
          </Space>
        }
        open={finalConfirmModalVisible}
        onOk={handleFinalConfirmSend}
        onCancel={handleCancelFinalConfirm}
        confirmLoading={finalConfirmLoading}
        okText="Xác nhận hoàn tất"
        cancelText="Hủy"
        okType="primary"
        width={600}
        centered
      >
        <div style={{ marginBottom: '16px' }}>
          <p><strong>Bạn đã chuẩn bị đủ túi máu cho yêu cầu này. Xác nhận hoàn tất quá trình gửi?</strong></p>
          <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', marginTop: '12px' }}>
            <p><strong>Thông tin yêu cầu:</strong></p>
            <ul style={{ marginBottom: 0 }}>
              <li><strong>ID yêu cầu:</strong> #{selectedRequest?.requestId}</li>
              <li><strong>Thể tích yêu cầu:</strong> {selectedRequest?.volume} ml</li>
              <li><strong>Thể tích đã chuẩn bị:</strong> {sentBloodUnits.reduce((sum, unit) => sum + (unit.volume || 0), 0)} ml</li>
              <li><strong>Số túi máu:</strong> {sentBloodUnits.length} túi</li>
            </ul>
          </div>
          <Alert
            message="Lưu ý"
            description="Sau khi xác nhận, bạn sẽ không thể thay đổi hoặc hủy chọn các túi máu đã gửi."
            type="info"
            showIcon
            style={{ marginTop: '12px' }}
          />
        </div>
      </Modal>
    </Layout>
  );
};

export default BloodUnitSelectionPage;