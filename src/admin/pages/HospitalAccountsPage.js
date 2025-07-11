import React, { useState, useEffect } from 'react';
import { 
  Layout,
  Table, 
  Card,
  Typography, 
  Space, 
  Button,
  message,
  Spin,
  Tag,
  Input,
  Row,
  Col,
  Tooltip
} from 'antd';
import { 
  UserOutlined,
  SearchOutlined,
  ReloadOutlined,
  BankOutlined
} from '@ant-design/icons';
import StaffSidebar from '../components/StaffSidebar';
import StaffHeader from '../components/StaffHeader';
import { AdminAPI } from '../api/admin';
import { HospitalAPI } from '../api/hospital';
import '../styles/user-management.scss';

const { Content } = Layout;
const { Text, Title } = Typography;
const { Search } = Input;

const HospitalAccountsPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [hospitalAccounts, setHospitalAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [hospitals, setHospitals] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch hospital accounts and hospital data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch hospital accounts (roleId = 4)
      const accountsResponse = await AdminAPI.getUsersByRole(4);
      const accountsData = accountsResponse.data || [];
      
      // Fetch all hospitals to get hospital names
      const hospitalsResponse = await HospitalAPI.getAllHospitals();
      const hospitalsData = Array.isArray(hospitalsResponse) ? hospitalsResponse : hospitalsResponse.data || [];
      
      // Create a map of hospitalId to hospital info
      const hospitalsMap = {};
      hospitalsData.forEach(hospital => {
        hospitalsMap[hospital.hospitalId] = hospital;
      });
      
      setHospitalAccounts(accountsData);
      setFilteredAccounts(accountsData);
      setHospitals(hospitalsMap);
      
      message.success(`Đã tải ${accountsData.length} tài khoản bệnh viện thành công!`);
    } catch (error) {
      console.error('Error fetching hospital accounts:', error);
      message.error('Không thể tải danh sách tài khoản bệnh viện. Vui lòng thử lại!');
      setHospitalAccounts([]);
      setFilteredAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search functionality
  const handleSearch = (value) => {
    setSearchText(value);
    if (!value.trim()) {
      setFilteredAccounts(hospitalAccounts);
      setCurrentPage(1);
      return;
    }

    const filtered = hospitalAccounts.filter(account => {
      const hospitalName = hospitals[account.hospitalId]?.hospitalName || '';
      return (
        account.email?.toLowerCase().includes(value.toLowerCase()) ||
        account.userId?.toString().includes(value) ||
        account.hospitalId?.toString().includes(value) ||
        hospitalName.toLowerCase().includes(value.toLowerCase())
      );
    });
    
    setFilteredAccounts(filtered);
    setCurrentPage(1);
  };

  // Table columns configuration
  const columns = [
    {
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
      sorter: (a, b) => a.userId - b.userId,
      render: (text) => (
        <span style={{ fontWeight: 'bold', color: '#059669' }}>
          {text || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Hospital ID',
      dataIndex: 'hospitalId',
      key: 'hospitalId',
      width: 120,
      sorter: (a, b) => a.hospitalId - b.hospitalId,
      render: (text) => (
        <Tag color="blue" icon={<BankOutlined />}>
          {text || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: {
        showTitle: false,
      },
      render: (email) => (
        <Tooltip placement="topLeft" title={email}>
          <Text copyable={{ text: email }}>
            {email || 'Chưa cập nhật'}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Tên bệnh viện',
      dataIndex: 'hospitalId',
      key: 'hospitalName',
      ellipsis: {
        showTitle: false,
      },
      render: (hospitalId) => {
        const hospital = hospitals[hospitalId];
        const hospitalName = hospital?.hospitalName || 'Không tìm thấy';
        return (
          <Tooltip placement="topLeft" title={hospitalName}>
            <Text strong={hospital ? true : false} type={hospital ? undefined : 'secondary'}>
              {hospitalName}
            </Text>
          </Tooltip>
        );
      },
    },
  ];

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <StaffSidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout>
        <StaffHeader collapsed={collapsed} onCollapse={setCollapsed} />
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div className="user-management-container">
            <Card className="user-management-card">
              <div className="user-management-header">
                <div className="header-content">
                  <div className="title-section">
                    <UserOutlined className="title-icon" />
                    <div>
                      <Title level={2} className="page-title">
                        Tài khoản bệnh viện
                      </Title>
                      <Text type="secondary" className="page-description">
                        Quản lý các tài khoản đã được đăng ký cho bệnh viện
                      </Text>
                    </div>
                  </div>
                  <Space size="middle">
                    <Button
                      type="default"
                      icon={<ReloadOutlined />}
                      onClick={fetchData}
                      loading={loading}
                    >
                      Làm mới
                    </Button>
                  </Space>
                </div>
              </div>

              <div className="user-management-controls">
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Search
                      placeholder="Tìm kiếm theo email, ID, tên bệnh viện..."
                      allowClear
                      onSearch={handleSearch}
                      onChange={(e) => handleSearch(e.target.value)}
                      value={searchText}
                      style={{ width: '100%' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Text strong>
                      Tổng số: {filteredAccounts.length} tài khoản
                    </Text>
                  </Col>
                </Row>
              </div>

              <div className="user-management-table">
                <Table
                  columns={columns}
                  dataSource={filteredAccounts}
                  rowKey="userId"
                  loading={loading}
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: filteredAccounts.length,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} của ${total} tài khoản`,
                    onChange: setCurrentPage,
                    onShowSizeChange: (current, size) => {
                      setPageSize(size);
                      setCurrentPage(1);
                    },
                    pageSizeOptions: ['5', '10', '20', '50'],
                  }}
                  scroll={{ x: 800 }}
                  size="middle"
                />
              </div>
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default HospitalAccountsPage; 