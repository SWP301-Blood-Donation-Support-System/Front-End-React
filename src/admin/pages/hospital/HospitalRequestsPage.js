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
  Tabs,
  Badge,
  Empty,
  Spin,
} from "antd";
import {
  BankOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  SelectOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import dayjs from "dayjs";

import StaffSidebar from "../../components/StaffSidebar";
import StaffHeader from "../../components/StaffHeader";
import { AdminAPI } from "../../api/admin";
import { HospitalAPI } from "../../api/hospital";
import "../../styles/donation-records.scss";

const { Content } = Layout;
const { Title } = Typography;

const HospitalRequestsPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pending"); // Default to pending requests
  const navigate = useNavigate();
  const { hospitalId } = useParams();
  const location = useLocation();
  
  // Data states
  const [hospital, setHospital] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [hospitalAccounts, setHospitalAccounts] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [bloodRequests, setBloodRequests] = useState([]);
  const [hospitalRequests, setHospitalRequests] = useState([]);
  const [bloodRequestStatuses, setBloodRequestStatuses] = useState({});
  const [bloodTypes, setBloodTypes] = useState({});
  const [bloodComponents, setBloodComponents] = useState({});
  const [urgencies, setUrgencies] = useState({});

  useEffect(() => {
    // Get hospital data from location state or sessionStorage
    if (location.state?.hospital) {
      setHospital(location.state.hospital);
      // Save to sessionStorage for future use
      sessionStorage.setItem(`hospital_${hospitalId}`, JSON.stringify(location.state.hospital));
    } else {
      // Try to get from sessionStorage
      const savedHospital = sessionStorage.getItem(`hospital_${hospitalId}`);
      if (savedHospital) {
        try {
          setHospital(JSON.parse(savedHospital));
        } catch (error) {
          console.error("Error parsing saved hospital data:", error);
        }
      }
    }
    
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    let hospitalInfo = null;
    
    accountsData.forEach(account => {
      // Convert both to string for comparison to avoid type mismatch
      if (String(account.hospitalId) === String(targetHospitalId)) {
        staffToHospitalMap[account.userId] = account.hospitalId;
        // Save hospital info if not already set
        if (!hospitalInfo && account.hospital) {
          hospitalInfo = account.hospital;
        }
      }
    });
    
    // Set hospital info if we found it and don't have it yet
    if (hospitalInfo && !hospital) {
      setHospital(hospitalInfo);
      // Save to sessionStorage for future use
      sessionStorage.setItem(`hospital_${targetHospitalId}`, JSON.stringify(hospitalInfo));
    }
    
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
        bloodRequestStatuses,
        returnPath: `/staff/approve-requests/hospital/${hospitalId}` // Thêm thông tin trang nguồn
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
        bloodRequestStatuses,
        returnPath: `/staff/approve-requests/hospital/${hospitalId}` // Thêm thông tin trang nguồn
      }
    });
  };

  const handleViewSentBloodUnits = (request) => {
    navigate(`/staff/approve-requests/blood-selection/${request.requestId}`, {
      state: { 
        request,
        hospital,
        bloodTypes,
        bloodComponents,
        urgencies,
        bloodRequestStatuses,
        returnPath: `/staff/approve-requests/hospital/${hospitalId}` // Thêm thông tin trang nguồn
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
      default:
        color = 'default';
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
      default:
        color = 'default';
        vietnameseName = urgency.name;
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
      filters: Object.keys(urgencies).map(id => {
        const urgency = urgencies[id];
        let vietnameseName = urgency.name;
        
        switch (urgency.name.toLowerCase()) {
          case 'low':
            vietnameseName = 'Thấp';
            break;
          case 'medium':
            vietnameseName = 'Trung bình';
            break;
          case 'high':
            vietnameseName = 'Cao';
            break;
          case 'critical':
            vietnameseName = 'Khẩn cấp';
            break;
          default:
            vietnameseName = urgency.name;
            break;
        }
        
        return {
          text: vietnameseName,
          value: id,
        };
      }),
      onFilter: (value, record) => record.urgencyId === parseInt(value, 10),
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
        const isCompleted = status && status.name === "Đã hoàn thành";
        
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
            {isCompleted && (
              <Button
                type="default"
                icon={<UnorderedListOutlined />}
                onClick={() => handleViewSentBloodUnits(record)}
                size="small"
              >
                Xem túi máu đã gửi
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
    return hospitalRequests.filter(req => req.requestStatusId === pendingStatusId).length;
  };

  const getRequestsByStatus = (statusName) => {
    const statusId = Object.keys(bloodRequestStatuses).find(
      id => bloodRequestStatuses[id].name === statusName
    );
    
    return hospitalRequests.filter(req => {
      return req.requestStatusId === statusId || req.requestStatusId === parseInt(statusId);
    });
  };

  const getRequestsCountByStatus = (statusName) => {
    return getRequestsByStatus(statusName).length;
  };

  const sortByUrgencyPriority = (requests) => {
    const getUrgencyPriority = (urgencyId) => {
      const urgency = urgencies[urgencyId];
      if (!urgency) return 0;
      
      switch (urgency.name.toLowerCase()) {
        case 'critical': return 4; // Highest priority
        case 'high': return 3;
        case 'medium': return 2;
        case 'low': return 1; // Lowest priority
        default: return 0;
      }
    };
    
    return [...requests].sort((a, b) => {
      return getUrgencyPriority(b.urgencyId) - getUrgencyPriority(a.urgencyId); // Descending order (highest first)
    });
  };

  const getFilteredRequests = () => {
    let filteredRequests;
    
    switch (activeTab) {
      case "pending":
        filteredRequests = getRequestsByStatus("Đang chờ duyệt");
        break;
      case "approved":
        filteredRequests = getRequestsByStatus("Đã duyệt");
        break;
      case "completed":
        filteredRequests = getRequestsByStatus("Đã hoàn thành");
        break;
      case "rejected":
        filteredRequests = getRequestsByStatus("Từ chối");
        break;
      case "all":
      default:
        filteredRequests = hospitalRequests;
        break;
    }
    
    // Automatically sort by urgency priority
    return sortByUrgencyPriority(filteredRequests);
  };

  const getTabItems = () => {
    return [
      {
        key: "pending",
        label: (
          <Space>
            <ClockCircleOutlined style={{ color: '#fa8c16' }} />
            Đang chờ duyệt
            <Badge 
              count={getRequestsCountByStatus("Đang chờ duyệt")} 
              style={{ backgroundColor: '#fa8c16' }}
            />
          </Space>
        ),
      },
      {
        key: "approved",
        label: (
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            Đã duyệt
            <Badge 
              count={getRequestsCountByStatus("Đã duyệt")} 
              style={{ backgroundColor: '#52c41a' }}
            />
          </Space>
        ),
      },
      {
        key: "completed",
        label: (
          <Space>
            <SyncOutlined style={{ color: '#1890ff' }} />
            Đã hoàn thành
            <Badge 
              count={getRequestsCountByStatus("Đã hoàn thành")} 
              style={{ backgroundColor: '#1890ff' }}
            />
          </Space>
        ),
      },
      {
        key: "rejected",
        label: (
          <Space>
            <CloseCircleOutlined style={{ color: '#f5222d' }} />
            Từ chối
            <Badge 
              count={getRequestsCountByStatus("Từ chối")} 
              style={{ backgroundColor: '#f5222d' }}
            />
          </Space>
        ),
      },
      {
        key: "all",
        label: (
          <Space>
            <UnorderedListOutlined style={{ color: '#722ed1' }} />
            Tất cả
            <Badge 
              count={hospitalRequests.length} 
              style={{ backgroundColor: '#722ed1' }}
            />
          </Space>
        ),
      },
    ];
  };

  const getHospitalDisplayName = () => {
    return hospital?.hospitalName || `Bệnh viện #${hospitalId}`;
  };

  const getEmptyDescription = () => {
    switch (activeTab) {
      case "pending":
        return "Không có đơn yêu cầu nào đang chờ duyệt";
      case "approved":
        return "Không có đơn yêu cầu nào đã được duyệt";
      case "completed":
        return "Không có đơn yêu cầu nào đã hoàn thành";
      case "rejected":
        return "Không có đơn yêu cầu nào bị từ chối";
      default:
        return "Không có đơn yêu cầu nào";
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
                  Đơn khẩn cấp - {getHospitalDisplayName()}
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
                    {getHospitalDisplayName()}
                  </Space>
                }
              >
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  items={getTabItems()}
                  style={{ marginBottom: 16 }}
                />
                
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <Spin size="large" />
                  </div>
                ) : (
                  <Table
                    columns={requestColumns}
                    dataSource={getFilteredRequests()}
                    rowKey={(record) => `hospital-${hospitalId}-request-${record.requestId}`}
                    locale={{
                      emptyText: <Empty description={getEmptyDescription()} />,
                    }}
                    pagination={false}
                  />
                )}
              </Card>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default HospitalRequestsPage;