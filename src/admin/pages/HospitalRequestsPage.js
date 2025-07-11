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
  Divider,
  Statistic,
} from "antd";
import {
  BankOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  SelectOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import dayjs from "dayjs";

import StaffSidebar from "../components/StaffSidebar";
import StaffHeader from "../components/StaffHeader";
import { AdminAPI } from "../api/admin";
import { HospitalAPI } from "../api/hospital";
import "../styles/donation-records.scss";

const { Content } = Layout;
const { Text, Title } = Typography;

const HospitalRequestsPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { hospitalId } = useParams();
  const location = useLocation();
  
  // Data states
  const [hospital, setHospital] = useState(null);
  const [hospitalAccounts, setHospitalAccounts] = useState([]);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [hospitalRequests, setHospitalRequests] = useState([]);
  const [bloodRequestStatuses, setBloodRequestStatuses] = useState({});
  const [bloodTypes, setBloodTypes] = useState({});
  const [bloodComponents, setBloodComponents] = useState({});
  const [urgencies, setUrgencies] = useState({});

  useEffect(() => {
    // Get hospital data from location state or fetch it
    if (location.state?.hospital) {
      setHospital(location.state.hospital);
    }
    
    fetchAllData();
  }, [hospitalId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        hospitalAccountsRes,
        bloodRequestsRes,
        statusesRes,
        bloodTypesRes,
        bloodComponentsRes,
        urgenciesRes,
      ] = await Promise.all([
        AdminAPI.getUsersByRole(4), // Hospital accounts
        HospitalAPI.getAllBloodRequests(),
        HospitalAPI.getBloodRequestStatuses(),
        AdminAPI.getBloodTypesLookup(),
        AdminAPI.getBloodComponents(),
        HospitalAPI.getUrgencies(),
      ]);

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
      
      // Filter requests for this hospital
      filterHospitalRequests(accountsData, requestsData, hospitalId);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Lỗi khi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  const filterHospitalRequests = (accountsData, requestsData, targetHospitalId) => {
    // Find staff accounts from this hospital
    const staffToHospitalMap = {};
    accountsData.forEach(account => {
      if (account.hospitalId == targetHospitalId) {
        staffToHospitalMap[account.userId] = account.hospitalId;
      }
    });
    
    // Filter requests from this hospital
    const requests = requestsData.filter(request => 
      staffToHospitalMap[request.requestingStaffId]
    );
    
    setHospitalRequests(requests);
  };

  const handleBackToHospitals = () => {
    navigate('/staff/approve-requests');
  };

  const handleViewRequestDetail = (request) => {
    navigate(`/staff/approve-requests/request/${request.requestId}`, {
      state: { 
        request,
        hospital,
        bloodTypes,
        bloodComponents,
        urgencies,
        bloodRequestStatuses
      }
    });
  };

  const handleSelectBloodUnits = (request) => {
    navigate(`/staff/approve-requests/blood-selection/${request.requestId}`, {
      state: { 
        request,
        hospital,
        bloodTypes,
        bloodComponents,
        urgencies,
        bloodRequestStatuses
      }
    });
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
    let vietnameseName = urgency.name;
    
    switch (urgency.name.toLowerCase()) {
      case 'low':
        color = 'green';
        vietnameseName = 'Thấp';
        break;
      case 'medium':
        color = 'orange';
        vietnameseName = 'Trung bình';
        break;
      case 'high':
        color = 'red';
        vietnameseName = 'Cao';
        break;
      case 'critical':
        color = 'magenta';
        vietnameseName = 'Khẩn cấp';
        break;
    }
    
    return <Tag color={color}>{vietnameseName}</Tag>;
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    return dayjs(dateTime).format('DD/MM/YYYY HH:mm');
  };

  // Hospital requests table columns
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
      render: (_, record) => {
        const status = bloodRequestStatuses[record.requestStatusId];
        const isApproved = status && status.name === "Đã duyệt";
        
        return (
          <Space>
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewRequestDetail(record)}
            >
              Chi tiết
            </Button>
            {isApproved && (
              <Button
                type="primary"
                icon={<SelectOutlined />}
                onClick={() => handleSelectBloodUnits(record)}
                size="small"
              >
                Chọn túi máu
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  const getPendingRequestsCount = () => {
    const pendingStatusId = Object.keys(bloodRequestStatuses).find(
      id => bloodRequestStatuses[id].name === "Đang chờ duyệt"
    );
    return hospitalRequests.filter(req => req.requestStatusId == pendingStatusId).length;
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
                  Đơn khẩn cấp - {hospital?.hospitalName || `Bệnh viện #${hospitalId}`}
                </Title>
              </div>

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
                    {hospital?.hospitalName || `Bệnh viện #${hospitalId}`}
                  </Space>
                }
                extra={
                  <Statistic
                    title="Đơn chờ duyệt"
                    value={getPendingRequestsCount()}
                    valueStyle={{ color: '#f5222d' }}
                    prefix={<ClockCircleOutlined />}
                  />
                }
              >
                <Table
                  columns={requestColumns}
                  dataSource={hospitalRequests}
                  rowKey={(record) => `hospital-${hospitalId}-request-${record.requestId}`}
                  loading={loading}
                  pagination={false}
                />
              </Card>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default HospitalRequestsPage; 