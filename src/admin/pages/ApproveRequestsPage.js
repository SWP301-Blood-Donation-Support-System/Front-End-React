import React, { useState, useEffect } from "react";
import {
  Layout,
  Table,
  Tag,
  Space,
  Typography,
  Button,
  message,
  Card,
  Row,
  Col,
  Divider,
  Statistic,
  Badge,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
} from "antd";
import {
  BankOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  DropboxOutlined,
  CalendarOutlined,
  AlertOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import StaffSidebar from "../components/StaffSidebar";
import StaffHeader from "../components/StaffHeader";
import { AdminAPI } from "../api/admin";
import { HospitalAPI } from "../api/hospital";
import "../styles/donation-records.scss";

const { Content } = Layout;
const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ApproveRequestsPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [hospitals, setHospitals] = useState([]);
  const [hospitalAccounts, setHospitalAccounts] = useState([]);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [bloodRequestStatuses, setBloodRequestStatuses] = useState({});
  const [bloodTypes, setBloodTypes] = useState({});
  const [bloodComponents, setBloodComponents] = useState({});
  const [urgencies, setUrgencies] = useState({});
  
  // View states - 3 layers
  const [currentView, setCurrentView] = useState("hospitals"); // 'hospitals' | 'hospitalRequests' | 'requestDetail'
  const [viewTitle, setViewTitle] = useState("Duyệt Đơn Khẩn Cấp");
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [hospitalRequests, setHospitalRequests] = useState([]);
  
  // Hospital summary data
  const [hospitalSummary, setHospitalSummary] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        hospitalsRes,
        hospitalAccountsRes,
        bloodRequestsRes,
        statusesRes,
        bloodTypesRes,
        bloodComponentsRes,
        urgenciesRes,
      ] = await Promise.all([
        HospitalAPI.getAllHospitals(),
        AdminAPI.getUsersByRole(4), // Hospital accounts
        HospitalAPI.getAllBloodRequests(),
        HospitalAPI.getBloodRequestStatuses(),
        AdminAPI.getBloodTypesLookup(),
        AdminAPI.getBloodComponents(),
        HospitalAPI.getUrgencies(),
      ]);

      // Process hospitals
      const hospitalsData = Array.isArray(hospitalsRes) ? hospitalsRes : hospitalsRes.data || [];
      setHospitals(hospitalsData);
      
      // Process hospital accounts  
      const accountsData = hospitalAccountsRes.data || [];
      setHospitalAccounts(accountsData);
      
      // Process blood requests
      const requestsData = Array.isArray(bloodRequestsRes) ? bloodRequestsRes : bloodRequestsRes.data || [];
      setBloodRequests(requestsData);
      
      // Process lookups
      const statusesData = Array.isArray(statusesRes) ? statusesRes : statusesRes.data || [];
      const statusesMap = {};
      statusesData.forEach(status => {
        statusesMap[status.id] = status;
      });
      setBloodRequestStatuses(statusesMap);
      
      const bloodTypesData = bloodTypesRes.data || [];
      const typesMap = {};
      bloodTypesData.forEach(type => {
        typesMap[type.id] = type;
      });
      setBloodTypes(typesMap);
      
      const componentsData = bloodComponentsRes.data || [];
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
      
      // Create hospital summary with pending request counts
      createHospitalSummary(hospitalsData, accountsData, requestsData, statusesMap);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Lỗi khi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  const createHospitalSummary = (hospitalsData, accountsData, requestsData, statusesMap) => {
    // Find "Đang chờ duyệt" status ID
    const pendingStatusId = Object.keys(statusesMap).find(
      id => statusesMap[id].name === "Đang chờ duyệt"
    );
    
    // Create mapping of requestingStaffId to hospitalId
    const staffToHospitalMap = {};
    accountsData.forEach(account => {
      if (account.hospitalId) {
        staffToHospitalMap[account.userId] = account.hospitalId;
      }
    });
    
    // Group requests by hospital and count pending ones
    const hospitalRequestCounts = {};
    requestsData.forEach(request => {
      const hospitalId = staffToHospitalMap[request.requestingStaffId];
      if (hospitalId) {
        if (!hospitalRequestCounts[hospitalId]) {
          hospitalRequestCounts[hospitalId] = {
            total: 0,
            pending: 0,
          };
        }
        hospitalRequestCounts[hospitalId].total++;
        
        if (request.requestStatusId == pendingStatusId) {
          hospitalRequestCounts[hospitalId].pending++;
        }
      }
    });
    
    // Create summary data
    const summary = hospitalsData.map(hospital => ({
      ...hospital,
      totalRequests: hospitalRequestCounts[hospital.hospitalId]?.total || 0,
      pendingRequests: hospitalRequestCounts[hospital.hospitalId]?.pending || 0,
    })).filter(hospital => hospital.totalRequests > 0); // Only show hospitals with requests
    
    setHospitalSummary(summary);
  };

  const handleViewHospitalRequests = (hospital) => {
    setSelectedHospital(hospital);
    
    // Find requests from this hospital
    const staffToHospitalMap = {};
    hospitalAccounts.forEach(account => {
      if (account.hospitalId === hospital.hospitalId) {
        staffToHospitalMap[account.userId] = account.hospitalId;
      }
    });
    
    const requests = bloodRequests.filter(request => 
      staffToHospitalMap[request.requestingStaffId]
    );
    
    setHospitalRequests(requests);
    setCurrentView("hospitalRequests");
    setViewTitle(`Đơn khẩn cấp - ${hospital.hospitalName}`);
  };

  const handleViewRequestDetail = async (request) => {
    try {
      // Fetch detailed request data
      const detailedRequest = await HospitalAPI.getBloodRequestById(request.requestId);
      setSelectedRequest(detailedRequest);
      setCurrentView("requestDetail");
      setViewTitle(`Chi tiết đơn khẩn cấp #${request.requestId}`);
    } catch (error) {
      console.error("Error fetching request details:", error);
      message.error("Lỗi khi tải chi tiết đơn khẩn cấp!");
    }
  };

  const handleBackToHospitals = () => {
    setCurrentView("hospitals");
    setViewTitle("Duyệt Đơn Khẩn Cấp");
    setSelectedHospital(null);
    setHospitalRequests([]);
  };

  const handleBackToHospitalRequests = () => {
    setCurrentView("hospitalRequests");
    setViewTitle(`Đơn khẩn cấp - ${selectedHospital?.hospitalName}`);
    setSelectedRequest(null);
  };

  const getStatusTag = (statusId) => {
    const status = bloodRequestStatuses[statusId];
    if (!status) return <Tag>Không xác định</Tag>;
    
    let color = 'default';
    switch (status.name) {
      case 'Đang chờ duyệt':
        color = 'orange';
        break;
      case 'Đã duyệt':
        color = 'green';
        break;
      case 'Đã hoàn thành':
        color = 'blue';
        break;
      case 'Từ chối':
        color = 'red';
        break;
    }
    
    return <Tag color={color}>{status.name}</Tag>;
  };

  const getUrgencyTag = (urgencyId) => {
    const urgency = urgencies[urgencyId];
    if (!urgency) return <Tag>Không xác định</Tag>;
    
    let color = 'default';
    switch (urgency.name.toLowerCase()) {
      case 'low':
        color = 'green';
        break;
      case 'medium':
        color = 'orange';
        break;
      case 'high':
        color = 'red';
        break;
      case 'critical':
        color = 'magenta';
        break;
    }
    
    return <Tag color={color}>{urgency.name}</Tag>;
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

  // Layer 1: Hospitals summary
  const hospitalColumns = [
    {
      title: 'Tên bệnh viện',
      dataIndex: 'hospitalName',
      key: 'hospitalName',
      render: (text, record) => (
        <Space>
          <BankOutlined style={{ color: '#1890ff' }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'hospitalAddress',
      key: 'hospitalAddress',
      ellipsis: true,
    },
    {
      title: 'Tổng đơn',
      dataIndex: 'totalRequests',
      key: 'totalRequests',
      align: 'center',
      render: (count) => (
        <Badge count={count} style={{ backgroundColor: '#1890ff' }} />
      ),
    },
    {
      title: 'Chờ duyệt',
      dataIndex: 'pendingRequests',
      key: 'pendingRequests',
      align: 'center',
      render: (count) => (
        <Badge 
          count={count} 
          style={{ backgroundColor: count > 0 ? '#f5222d' : '#d9d9d9' }} 
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewHospitalRequests(record)}
          disabled={record.totalRequests === 0}
        >
          Xem đơn
        </Button>
      ),
    },
  ];

  // Layer 2: Hospital requests
  const requestColumns = [
    {
      title: 'ID',
      dataIndex: 'requestId',
      key: 'requestId',
      width: 80,
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
      dataIndex: 'bloodComponentId',
      key: 'bloodComponentId',
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
      title: 'Mức độ khẩn cấp',
      dataIndex: 'urgencyId',
      key: 'urgencyId',
      render: (urgencyId) => getUrgencyTag(urgencyId),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'requestStatusId',
      key: 'requestStatusId',
      render: (statusId) => getStatusTag(statusId),
    },
    {
      title: 'Thời gian yêu cầu',
      dataIndex: 'requiredDateTime',
      key: 'requiredDateTime',
      render: (dateTime) => formatDateTime(dateTime),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewRequestDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const renderHospitalsList = () => (
    <Card title="Danh sách bệnh viện có đơn khẩn cấp">
      <Table
        columns={hospitalColumns}
        dataSource={hospitalSummary}
        rowKey="hospitalId"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} bệnh viện`,
        }}
      />
    </Card>
  );

  const renderHospitalRequests = () => (
    <div>
      <Card
        title={
          <Space>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleBackToHospitals}
            >
              Quay lại
            </Button>
            <Divider type="vertical" />
            <BankOutlined />
            {selectedHospital?.hospitalName}
          </Space>
        }
        extra={
          <Statistic
            title="Đơn chờ duyệt"
            value={hospitalRequests.filter(req => {
              const pendingStatusId = Object.keys(bloodRequestStatuses).find(
                id => bloodRequestStatuses[id].name === "Đang chờ duyệt"
              );
              return req.requestStatusId == pendingStatusId;
            }).length}
            valueStyle={{ color: '#f5222d' }}
            prefix={<ClockCircleOutlined />}
          />
        }
      >
        <Table
          columns={requestColumns}
          dataSource={hospitalRequests}
          rowKey="requestId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} đơn khẩn cấp`,
          }}
        />
      </Card>
    </div>
  );

  const renderRequestDetail = () => {
    if (!selectedRequest) return null;

    return (
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
              bloodTypeId: selectedRequest.bloodTypeId,
              bloodComponentId: selectedRequest.bloodComponentId,
              volume: selectedRequest.volume,
              requiredDateTime: selectedRequest.requiredDateTime ? dayjs(selectedRequest.requiredDateTime) : null,
              urgencyId: selectedRequest.urgencyId,
              requestStatusId: selectedRequest.requestStatusId,
              note: selectedRequest.note,
              createdAt: selectedRequest.createdAt,
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
                    value={formatDateTime(selectedRequest.createdAt)} 
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
                    value={bloodTypes[selectedRequest.bloodTypeId]?.name || 'N/A'}
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
                    value={bloodComponents[selectedRequest.bloodComponentId]?.name || 'N/A'}
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
                    value={`${selectedRequest.volume || 0} ml`}
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
                    value={formatDateTime(selectedRequest.requiredDateTime)}
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
                    value={urgencies[selectedRequest.urgencyId] ? 
                      `${urgencies[selectedRequest.urgencyId].name} - ${urgencies[selectedRequest.urgencyId].description}` : 
                      'N/A'
                    }
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
                    value={bloodRequestStatuses[selectedRequest.requestStatusId]?.name || 'N/A'}
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
                    value={selectedRequest.note || 'Không có ghi chú'}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "hospitals":
        return renderHospitalsList();
      case "hospitalRequests":
        return renderHospitalRequests();
      case "requestDetail":
        return renderRequestDetail();
      default:
        return renderHospitalsList();
    }
  };

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
                  {viewTitle}
                </Title>
              </div>

              {renderCurrentView()}
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default ApproveRequestsPage; 