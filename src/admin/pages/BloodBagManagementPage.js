import React, { useState, useEffect } from 'react';
import { 
  Layout,
  Table, 
  Tag, 
  Space, 
  Typography, 
  Select, 
  Button,
  message,
  InputNumber,
  Card,
  Row,
  Col,
  Statistic
} from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { AdminAPI } from '../api/admin';
import StaffNavbar from '../components/StaffNavbar';
import StaffSidebar from '../components/StaffSidebar';
import StaffHeader from '../components/StaffHeader';
import '../styles/blood-bag-management.scss';

const { Content } = Layout;
const { Text, Title } = Typography;
const { Option } = Select;

const BloodBagManagementPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [bloodUnits, setBloodUnits] = useState([]);
  const [filteredBloodUnits, setFilteredBloodUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all', 'qualified', 'disqualified', 'pending'
  const [bloodComponents, setBloodComponents] = useState({});
  const [bloodTypes, setBloodTypes] = useState({});
  const [donationRecordsMap, setDonationRecordsMap] = useState({}); // Map donationRecordId to registrationId
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  
  // View state
  const [viewTitle, setViewTitle] = useState('Tất Cả Túi Máu');
  
  const location = useLocation();
  const navigate = useNavigate();

  // Status mapping for blood units
  const statusMapping = {
    'all': { name: 'Tất cả túi máu', color: 'blue' },
    'qualified': { name: 'Túi máu đạt', color: 'green' },
    'disqualified': { name: 'Túi máu không đạt', color: 'red' },
    'pending': { name: 'Túi máu chờ duyệt', color: 'orange' }
  };

  useEffect(() => {
    // Get filter from URL params or default to 'all'
    const params = new URLSearchParams(location.search);
    const statusFilter = params.get('status') || 'all';
    setSelectedStatus(statusFilter);
    
    fetchBloodUnits();
    fetchBloodComponents();
    fetchBloodTypes();
    fetchDonationRecordsMapping();
  }, [location.search]);

  useEffect(() => {
    filterBloodUnits();
  }, [bloodUnits, selectedStatus]);

  const fetchBloodUnits = async () => {
    setLoading(true);
    try {
      const response = await AdminAPI.getBloodUnits();
      const bloodUnitsData = response.data || [];
      setBloodUnits(bloodUnitsData);
    } catch (error) {
      console.error('Error fetching blood units:', error);
      message.error('Lỗi khi tải dữ liệu túi máu');
      setBloodUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBloodComponents = async () => {
    try {
      const response = await AdminAPI.getBloodComponents();
      const componentsData = response.data || [];
      const componentsMap = {};
      componentsData.forEach(component => {
        componentsMap[component.id] = component;
      });
      setBloodComponents(componentsMap);
    } catch (error) {
      console.error('Error fetching blood components:', error);
    }
  };

  const fetchBloodTypes = async () => {
    try {
      const response = await AdminAPI.getBloodTypesLookup();
      const typesData = response.data || [];
      const typesMap = {};
      typesData.forEach(type => {
        typesMap[type.id] = type;
      });
      setBloodTypes(typesMap);
    } catch (error) {
      console.error('Error fetching blood types:', error);
    }
  };

  const fetchDonationRecordsMapping = async () => {
    try {
      const response = await AdminAPI.getDonationRecords();
      const donationRecords = response.data || [];
      
      const recordsMap = {};
      
      // Create mapping from donationRecordId to registrationId
      donationRecords.forEach(record => {
        const donationRecordId = record.donationRecordId || record.DonationRecordId || record.id;
        const registrationId = record.registrationId || record.RegistrationId || record.RegistrationID;
        
        if (donationRecordId && registrationId) {
          recordsMap[donationRecordId] = registrationId;
        }
      });
      
      setDonationRecordsMap(recordsMap);
    } catch (error) {
      console.error('Error fetching donation records mapping:', error);
    }
  };

  const filterBloodUnits = () => {
    let filtered = [...bloodUnits];
    
    switch (selectedStatus) {
      case 'qualified':
        // Assuming status "Available" means qualified
        filtered = bloodUnits.filter(unit => 
          unit.statusName === 'Available' || unit.bloodUnitStatusId === 1
        );
        setViewTitle('Túi Máu Đạt');
        break;
      case 'disqualified':
        // Assuming certain statuses mean disqualified
        filtered = bloodUnits.filter(unit => 
          unit.statusName === 'Expired' || unit.statusName === 'Contaminated' || 
          unit.bloodUnitStatusId === 2 || unit.bloodUnitStatusId === 3
        );
        setViewTitle('Túi Máu Không Đạt');
        break;
      case 'pending':
        // Assuming certain statuses mean pending approval
        filtered = bloodUnits.filter(unit => 
          unit.statusName === 'Pending' || unit.bloodUnitStatusId === 4
        );
        setViewTitle('Túi Máu Chờ Duyệt');
        break;
      default:
        filtered = bloodUnits;
        setViewTitle('Tất Cả Túi Máu');
    }
    
    setFilteredBloodUnits(filtered);
    setCurrentPage(1); // Reset pagination when filtering
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    navigate(`/staff/blood-bag-management?status=${status}`);
  };

  // Format date function
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Get status tag color
  const getStatusColor = (statusName) => {
    const statusColors = {
      'Available': 'green',
      'Expired': 'red',
      'Used': 'blue',
      'Contaminated': 'volcano',
      'Pending': 'orange',
      'Reserved': 'purple'
    };
    return statusColors[statusName] || 'default';
  };

  // Pagination functions
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredBloodUnits.slice(startIndex, endIndex);
  };

  const handlePageChange = (page) => {
    const totalPages = Math.ceil(filteredBloodUnits.length / pageSize);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleGoToPage = (page) => {
    const totalPages = Math.ceil(filteredBloodUnits.length / pageSize);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Statistics calculations
  const getStatistics = () => {
    const total = bloodUnits.length;
    const available = bloodUnits.filter(unit => unit.statusName === 'Available').length;
    const expired = bloodUnits.filter(unit => unit.statusName === 'Expired').length;
    const pending = bloodUnits.filter(unit => unit.statusName === 'Pending').length;
    
    return { total, available, expired, pending };
  };

  const currentData = filteredBloodUnits;
  const totalPages = Math.ceil(currentData.length / pageSize);
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, currentData.length);
  const stats = getStatistics();

  const bloodUnitColumns = [
    {
      title: 'Mã Người Hiến',
      dataIndex: 'donorId',
      key: 'donorId',
      width: '10%',
      render: (text) => (
        <span style={{ fontWeight: 'bold', color: '#722ed1' }}>
          #{text || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Mã Đăng Ký',
      dataIndex: 'registrationId',
      key: 'registrationId',
      width: '10%',
      render: (text, record) => {
        // If registrationId is not directly available, try to map from donationRecordId
        let displayRegistrationId = text;
        

        
        if (!displayRegistrationId && record.donationRecordId) {
          displayRegistrationId = donationRecordsMap[record.donationRecordId];
        }
        
        return (
          <span style={{ fontWeight: 'bold', color: '#13c2c2' }}>
            #{displayRegistrationId || 'N/A'}
          </span>
        );
      },
    },
    {
      title: 'Mã Hồ Sơ',
      dataIndex: 'donationRecordId',
      key: 'donationRecordId',
      width: '10%',
      render: (text) => (
        <span style={{ fontWeight: 'bold', color: '#fa541c' }}>
          #{text || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Mã Túi Máu (BloodUnitID)',
      dataIndex: 'bloodUnitId',
      key: 'bloodUnitId',
      width: '8%',
      render: (text) => (
        <span style={{ fontWeight: 'bold', color: '#dc2626' }}>
          #{text || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Nhóm Máu',
      dataIndex: 'bloodTypeName',
      key: 'bloodTypeName',
      width: '8%',
      render: (text, record) => {
        const bloodTypeId = record.bloodTypeId;
        const bloodType = bloodTypes[bloodTypeId];
        const displayName = text || bloodType?.name || 'N/A';
        
        if (displayName !== 'N/A') {
          const bloodTypeColors = {
            'A+': 'red', 'A-': 'volcano',
            'B+': 'blue', 'B-': 'geekblue',
            'AB+': 'purple', 'AB-': 'magenta',
            'O+': 'green', 'O-': 'lime'
          };
          const color = bloodTypeColors[displayName] || 'default';
          return <Tag color={color}>{displayName}</Tag>;
        }
        return <span style={{ color: '#9ca3af' }}>N/A</span>;
      },
    },
    {
      title: 'Loại Hiến Máu',
      dataIndex: 'componentName',
      key: 'componentName',
      width: '10%',
      render: (text, record) => {
        const componentId = record.componentId;
        const component = bloodComponents[componentId];
        const displayName = text || component?.name || 'N/A';
        return (
          <span style={{ color: '#374151', fontWeight: '500' }}>
            {displayName}
          </span>
        );
      },
    },
    {
      title: 'Tên Người Hiến',
      dataIndex: 'donorName',
      key: 'donorName',
      width: '12%',
      render: (text) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          {text || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Thể Tích (ml)',
      dataIndex: 'volume',
      key: 'volume',
      width: '8%',
      render: (volume) => (
        <span style={{ color: '#374151', fontWeight: '500' }}>
          {volume || 'N/A'} ml
        </span>
      ),
    },
    {
      title: 'Ngày Thu Thập',
      dataIndex: 'collectedDateTime',
      key: 'collectedDateTime',
      width: '10%',
      render: (date) => (
        <span style={{ color: '#374151' }}>
          {formatDateTime(date)}
        </span>
      ),
    },
    {
      title: 'Ngày Hết Hạn',
      dataIndex: 'expirationTime',
      key: 'expirationTime',
      width: '10%',
      render: (date) => {
        const isExpired = date && new Date(date) < new Date();
        return (
          <span style={{ 
            color: isExpired ? '#f5222d' : '#374151',
            fontWeight: isExpired ? 'bold' : 'normal'
          }}>
            {formatDateTime(date)}
          </span>
        );
      },
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'statusName',
      key: 'statusName',
      width: '8%',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status || 'N/A'}
        </Tag>
      ),
    },
  ];

  return (
    <Layout className="staff-layout">
      <StaffSidebar
        collapsed={collapsed}
        onCollapse={value => setCollapsed(value)}
      />
      
      <Layout className="staff-main-layout">
        <StaffHeader />

        <Layout className="staff-content-layout">
          <StaffNavbar />
          
          <Content className="blood-bag-content">
            <div className="blood-bag-container">
              {/* Statistics Cards */}
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Tổng Số Túi Máu"
                      value={stats.total}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Túi Máu Khả Dụng"
                      value={stats.available}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Túi Máu Hết Hạn"
                      value={stats.expired}
                      valueStyle={{ color: '#f5222d' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Túi Máu Chờ Duyệt"
                      value={stats.pending}
                      valueStyle={{ color: '#fa8c16' }}
                    />
                  </Card>
                </Col>
              </Row>

              <div className="blood-bag-header-section">
                <Space className="blood-bag-controls">
                  <Title level={3} className="blood-bag-title">
                    {viewTitle}
                  </Title>
                  <Select
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    style={{ width: 200 }}
                  >
                    <Option value="all">Tất Cả Túi Máu</Option>
                    <Option value="qualified">Túi Máu Đạt</Option>
                    <Option value="disqualified">Túi Máu Không Đạt</Option>
                    <Option value="pending">Túi Máu Chờ Duyệt</Option>
                  </Select>
                  
                  <div style={{ fontSize: '14px', color: '#666', marginLeft: 'auto' }}>
                    <Text strong>Số túi máu hiển thị:</Text> {currentData.length}
                  </div>
                </Space>
              </div>

              <div className="blood-bag-table-container">
                <Table
                  columns={bloodUnitColumns}
                  dataSource={getPaginatedData()}
                  rowKey={(record) => record.bloodUnitId || Math.random()}
                  loading={loading}
                  pagination={false}
                  size="large"
                  className="blood-bag-wide-table"
                  scroll={{ x: 'max-content' }}
                />
                
                {/* Enhanced Pagination Controls */}
                {currentData.length > 0 && (
                  <div className="blood-bag-pagination">
                    <div className="pagination-info">
                      <Text>
                        Hiển thị {startRecord}-{endRecord} của {currentData.length} túi máu
                      </Text>
                    </div>
                    
                    <div className="pagination-controls">
                      <Space>
                        <Text>Số bản ghi mỗi trang:</Text>
                        <Select
                          value={pageSize}
                          onChange={handlePageSizeChange}
                          style={{ width: 80 }}
                        >
                          <Option value={5}>5</Option>
                          <Option value={8}>8</Option>
                          <Option value={10}>10</Option>
                          <Option value={20}>20</Option>
                          <Option value={50}>50</Option>
                        </Select>
                      </Space>
                      
                      <div className="page-navigation">
                        <Button 
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(1)}
                        >
                          ❮❮
                        </Button>
                        <Button 
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                        >
                          ❮
                        </Button>
                        <span className="page-indicator">
                          Trang {currentPage} / {totalPages}
                        </span>
                        <Button 
                          disabled={currentPage === totalPages}
                          onClick={() => handlePageChange(currentPage + 1)}
                        >
                          ❯
                        </Button>
                        <Button 
                          disabled={currentPage === totalPages}
                          onClick={() => handlePageChange(totalPages)}
                        >
                          ❯❯
                        </Button>
                      </div>
                      
                      <div className="goto-page">
                        <Text>Đến trang:</Text>
                        <InputNumber
                          min={1}
                          max={totalPages}
                          value={currentPage}
                          onChange={(value) => value && handleGoToPage(value)}
                          style={{ width: 60, marginLeft: 8 }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default BloodBagManagementPage; 