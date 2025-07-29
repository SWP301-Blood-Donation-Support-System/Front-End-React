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
  Statistic,
  Row,
  Col,
  Pagination,
  Tabs,
  Badge,
  Empty,
} from "antd";
import {
  HistoryOutlined,
  EyeOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import StaffSidebar from "../../components/StaffSidebar";
import StaffHeader from "../../components/StaffHeader";
import { AdminAPI } from "../../api/admin";
import { HospitalAPI } from "../../api/hospital";
import "../../styles/donation-records.scss";

const { Content } = Layout;
const { Text, Title } = Typography;

const RequestHistoryPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // Default to all requests
  const navigate = useNavigate();
  
  // Data states
  const [bloodRequests, setBloodRequests] = useState([]);
  const [bloodRequestStatuses, setBloodRequestStatuses] = useState({});
  const [bloodTypes, setBloodTypes] = useState({});
  const [bloodComponents, setBloodComponents] = useState({});
  const [urgencies, setUrgencies] = useState({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get current user info to filter requests
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      
      // Try different possible field names for user ID
      const currentUserId = userInfo?.UserID || userInfo?.UserId || userInfo?.userId || userInfo?.id;

      console.log("Current User Info:", userInfo);
      console.log("Current User ID:", currentUserId);

      if (!currentUserId) {
        message.error("Không thể xác định thông tin người dùng!");
        console.error("Cannot find user ID in userInfo:", userInfo);
        return;
      }

      // Fetch all necessary data
      const [
        requestsRes,
        statusesRes,
        typesRes,
        componentsRes,
        urgenciesRes,
      ] = await Promise.all([
        HospitalAPI.getAllBloodRequests(),
        HospitalAPI.getBloodRequestStatuses(),
        AdminAPI.getBloodTypesLookup(), // Use the same API as HospitalRequestsPage
        AdminAPI.getBloodComponents(),
        HospitalAPI.getUrgencies(),
      ]);

      console.log("Raw requests data:", requestsRes);
      console.log("Raw statuses data:", statusesRes);

      // Process blood request statuses
      const statusesData = Array.isArray(statusesRes) ? statusesRes : statusesRes.data || [];
      const statusesMap = {};
      statusesData.forEach(status => {
        statusesMap[status.id] = status;
      });
      setBloodRequestStatuses(statusesMap);

      // Process blood types
      const typesData = Array.isArray(typesRes) ? typesRes : typesRes.data || [];
      const typesMap = {};
      typesData.forEach(type => {
        typesMap[type.id] = type;
      });
      setBloodTypes(typesMap);
      
      // Process blood components
      const componentsData = Array.isArray(componentsRes) ? componentsRes : componentsRes.data || [];
      const componentsMap = {};
      componentsData.forEach(component => {
        componentsMap[component.id] = component;
      });
      setBloodComponents(componentsMap);
      
      // Process urgencies
      const urgenciesData = Array.isArray(urgenciesRes) ? urgenciesRes : urgenciesRes.data || [];
      const urgenciesMap = {};
      urgenciesData.forEach(urgency => {
        urgenciesMap[urgency.id] = urgency;
      });
      setUrgencies(urgenciesMap);
      
      // Filter requests created by current hospital user
      const requestsData = Array.isArray(requestsRes) ? requestsRes : requestsRes.data || [];
      console.log("All requests:", requestsData);
      
      // Convert currentUserId to both string and number for comparison
      const userIdAsString = String(currentUserId);
      const userIdAsNumber = parseInt(currentUserId, 10);
      
      console.log("Looking for requests with requestingStaffId:", userIdAsString, "or", userIdAsNumber);
      
      // Filter by requestingStaffId (the field that represents who created the request)
      let hospitalRequests = requestsData.filter(request => {
        const matchesString = String(request.requestingStaffId) === userIdAsString;
        const matchesNumber = request.requestingStaffId === userIdAsNumber;
        
        if (matchesString || matchesNumber) {
          console.log("Found matching request:", request);
        }
        
        return matchesString || matchesNumber;
      });

      console.log("Filtered hospital requests:", hospitalRequests);
      console.log("Total requests found for current user:", hospitalRequests.length);
      
      if (hospitalRequests.length === 0) {
        console.log("No requests found. Checking all request requestingStaffIds:");
        requestsData.forEach(req => {
          console.log(`Request ${req.requestId}: requestingStaffId = ${req.requestingStaffId} (type: ${typeof req.requestingStaffId})`);
        });
      }
      
      setBloodRequests(hospitalRequests);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Lỗi khi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  // Status filtering functions
  const getRequestsByStatus = (statusName) => {
    const statusId = Object.keys(bloodRequestStatuses).find(
      id => bloodRequestStatuses[id].name === statusName
    );
    
    return bloodRequests.filter(req => {
      return req.requestStatusId === statusId || req.requestStatusId === parseInt(statusId);
    });
  };

  const getRequestsCountByStatus = (statusName) => {
    return getRequestsByStatus(statusName).length;
  };

  const getFilteredRequests = () => {
    switch (activeTab) {
      case "pending":
        return getRequestsByStatus("Đang chờ duyệt");
      case "approved":
        return getRequestsByStatus("Đã duyệt");
      case "completed":
        return getRequestsByStatus("Đã hoàn thành");
      case "rejected":
        return getRequestsByStatus("Từ chối");
      case "all":
      default:
        return bloodRequests;
    }
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
              count={bloodRequests.length} 
              style={{ backgroundColor: '#722ed1' }}
            />
          </Space>
        ),
      },
    ];
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

  const getStatusTag = (statusId) => {
    const status = bloodRequestStatuses[statusId];
    if (!status) return <Tag>N/A</Tag>;
    
    let color = 'default';
    switch (status.name.toLowerCase()) {
      case 'đang chờ duyệt':
        color = 'processing';
        break;
      case 'đã duyệt':
        color = 'success';
        break;
      case 'đã từ chối':
        color = 'error';
        break;
      case 'đã hoàn thành':
        color = 'green';
        break;
      case 'đã hủy':
        color = 'default';
        break;
      default:
        color = 'default';
        break;
    }
    
    return <Tag color={color}>{status.name}</Tag>;
  };

  const getUrgencyTag = (urgencyId) => {
    const urgency = urgencies[urgencyId];
    if (!urgency) return <Tag>N/A</Tag>;
    
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
        break;
    }
    
    return <Tag color={color}>{vietnameseName}</Tag>;
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    return dayjs(dateTime).format('DD/MM/YYYY HH:mm');
  };

  const handleViewRequestDetail = (request) => {
    navigate(`/staff/request-history/detail/${request.requestId}`, {
      state: { 
        request,
        bloodTypes,
        bloodComponents,
        urgencies,
        bloodRequestStatuses,
        fromHistory: true // Flag to indicate coming from history page
      }
    });
  };

  // Get current page data based on filtered results
  const getCurrentPageData = () => {
    const filteredData = getFilteredRequests();
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  };

  // Handle page change
  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    if (size !== pageSize) {
      setPageSize(size);
      setCurrentPage(1); // Reset to first page when page size changes
    }
  };

  // Reset pagination when tab changes
  const handleTabChange = (key) => {
    setActiveTab(key);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Table columns for request history
  const requestColumns = [
    {
      title: 'ID',
      dataIndex: 'requestId',
      key: 'requestId',
      width: 80,
      sorter: (a, b) => a.requestId - b.requestId,
    },
    {
      title: 'Nhóm máu',
      dataIndex: 'bloodTypeId',
      key: 'bloodTypeId',
      render: (typeId) => {
        const type = bloodTypes[typeId];
        return type ? <Tag color="red">{type.name}</Tag> : 'N/A';
      },
      filters: Object.keys(bloodTypes).map(id => ({
        text: bloodTypes[id].name,
        value: id,
      })),
      onFilter: (value, record) => record.bloodTypeId === parseInt(value, 10),
    },
    {
      title: 'Thành phần',
      dataIndex: 'bloodComponentId',
      key: 'bloodComponentId',
      render: (componentId) => {
        const component = bloodComponents[componentId];
        return component ? <Tag color="blue">{component.name}</Tag> : 'N/A';
      },
      filters: Object.keys(bloodComponents).map(id => ({
        text: bloodComponents[id].name,
        value: id,
      })),
      onFilter: (value, record) => record.bloodComponentId === parseInt(value, 10),
    },
    {
      title: 'Thể tích',
      dataIndex: 'volume',
      key: 'volume',
      render: (volume) => `${volume} ml`,
      sorter: (a, b) => a.volume - b.volume,
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
      filters: Object.keys(bloodRequestStatuses).map(id => ({
        text: bloodRequestStatuses[id].name,
        value: id,
      })),
      onFilter: (value, record) => record.requestStatusId === parseInt(value, 10),
    },
    {
      title: 'Thời gian yêu cầu',
      dataIndex: 'requiredDateTime',
      key: 'requiredDateTime',
      render: (dateTime) => formatDateTime(dateTime),
      sorter: (a, b) => dayjs(a.requiredDateTime).unix() - dayjs(b.requiredDateTime).unix(),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (dateTime) => formatDateTime(dateTime),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewRequestDetail(record)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  // Calculate statistics based on filtered data
  const getStatistics = () => {
    const total = bloodRequests.length;
    
    const pending = bloodRequests.filter(req => {
      const status = bloodRequestStatuses[req.requestStatusId];
      return status && status.name === "Đang chờ duyệt";
    }).length;
    
    const approved = bloodRequests.filter(req => {
      const status = bloodRequestStatuses[req.requestStatusId];
      return status && status.name === "Đã duyệt";
    }).length;
    
    const rejected = bloodRequests.filter(req => {
      const status = bloodRequestStatuses[req.requestStatusId];
      return status && status.name === "Từ chối";
    }).length;

    const completed = bloodRequests.filter(req => {
      const status = bloodRequestStatuses[req.requestStatusId];
      return status && status.name === "Đã hoàn thành";
    }).length;

    return { total, pending, approved, rejected, completed };
  };

  const stats = getStatistics();

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
                  <HistoryOutlined /> Lịch sử tạo đơn
                </Title>
                <Text type="secondary">
                  Xem tất cả các đơn yêu cầu máu khẩn cấp mà bạn đã tạo
                </Text>
              </div>

              {/* Statistics Cards */}
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={4}>
                  <Card>
                    <Statistic
                      title="Tổng số đơn"
                      value={stats.total}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col span={5}>
                  <Card>
                    <Statistic
                      title="Đang chờ duyệt"
                      value={stats.pending}
                      valueStyle={{ color: '#fa8c16' }}
                    />
                  </Card>
                </Col>
                <Col span={5}>
                  <Card>
                    <Statistic
                      title="Đã duyệt"
                      value={stats.approved}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col span={5}>
                  <Card>
                    <Statistic
                      title="Đã hoàn thành"
                      value={stats.completed}
                      valueStyle={{ color: '#73d13d' }}
                    />
                  </Card>
                </Col>
                <Col span={5}>
                  <Card>
                    <Statistic
                      title="Từ chối"
                      value={stats.rejected}
                      valueStyle={{ color: '#f5222d' }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Requests Table */}
              <Card
                title={
                  <Space>
                    <HistoryOutlined />
                    <span>Danh sách đơn yêu cầu</span>
                  </Space>
                }
                extra={
                  <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={fetchData}
                    loading={loading}
                  >
                    Làm mới
                  </Button>
                }
              >
                <Tabs
                  activeKey={activeTab}
                  onChange={handleTabChange}
                  items={getTabItems()}
                  style={{ marginBottom: 16 }}
                />

                <Table
                  dataSource={getCurrentPageData()}
                  columns={requestColumns}
                  rowKey="requestId"
                  loading={loading}
                  pagination={false}
                  scroll={{ x: 1200 }}
                  locale={{
                    emptyText: <Empty description={getEmptyDescription()} />,
                  }}
                />
              </Card>

              {/* Custom Pagination */}
              {getFilteredRequests().length > 0 && (
                <div style={{ 
                  marginTop: '16px', 
                  display: 'flex', 
                  justifyContent: 'center',
                  padding: '16px 0'
                }}>
                  <Pagination
                    current={currentPage}
                    total={getFilteredRequests().length}
                    pageSize={pageSize}
                    showSizeChanger={true}
                    showQuickJumper={true}
                    showTotal={(total, range) =>
                      `${range[0]}-${range[1]} của ${total} đơn`
                    }
                    onChange={handlePageChange}
                    onShowSizeChange={handlePageChange}
                    pageSizeOptions={['5', '10', '20', '50']}
                  />
                </div>
              )}
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default RequestHistoryPage;
