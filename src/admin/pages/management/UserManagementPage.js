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
  InputNumber
} from 'antd';
import { AdminAPI } from '../../api/admin';

import StaffSidebar from '../../components/StaffSidebar';
import StaffHeader from '../../components/StaffHeader';
import '../../styles/user-management.scss';

const { Content } = Layout;
const { Text, Title } = Typography;
const { Option } = Select;

const UserManagementPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(3); // Default to role 3 (donors)
  const [bloodTypes, setBloodTypes] = useState({});
  const [donationAvailabilities, setDonationAvailabilities] = useState({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  
  // View state
  const [viewTitle, setViewTitle] = useState('Quản Lý Người Hiến');

  // Role mapping
  const roleMapping = {
    1: { name: 'Quản trị viên', color: 'red' },
    2: { name: 'Nhân viên', color: 'blue' },
    3: { name: 'Người hiến máu', color: 'green' }
  };
  useEffect(() => {
    fetchUsersByRole(selectedRole);
    fetchBloodTypes();
    fetchDonationAvailabilities();
  }, [selectedRole]);

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

  const fetchDonationAvailabilities = async () => {
    try {
      const response = await AdminAPI.getDonationAvailabilities();
      const availabilitiesData = response.data || [];
      const availabilitiesMap = {};
      availabilitiesData.forEach(availability => {
        availabilitiesMap[availability.id] = availability;
      });
      setDonationAvailabilities(availabilitiesMap);
    } catch (error) {
      console.error('Error fetching donation availabilities:', error);
    }
  };

  const fetchUsersByRole = async (roleId) => {
    setLoading(true);
    try {
      const response = await AdminAPI.getUsersByRole(roleId);
      const userData = response.data || [];
      setUsers(userData);
      
      // Update view title based on role
      const roleName = roleMapping[roleId]?.name || 'Người dùng';
      setViewTitle(`Quản Lý ${roleName}`);
    } catch (error) {
      console.error('Error fetching users by role:', error);
      message.error('Lỗi khi tải dữ liệu người dùng');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    setCurrentPage(1); // Reset pagination when changing role
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Pagination functions
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return users.slice(startIndex, endIndex);
  };

  const handlePageChange = (page) => {
    const totalPages = Math.ceil(users.length / pageSize);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const handleGoToPage = (page) => {
    const totalPages = Math.ceil(users.length / pageSize);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const currentData = users;
  const totalPages = Math.ceil(currentData.length / pageSize);
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, currentData.length);

  const userColumns = [
    {
      title: 'Mã Người Dùng',
      dataIndex: 'userId',
      key: 'userId',
      width: '15%',
      render: (text) => (
        <span style={{ fontWeight: 'bold', color: '#059669' }}>
          {text || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Tên Đầy Đủ',
      dataIndex: 'fullName',
      key: 'fullName',
      width: '20%',
      render: (text) => (
        <span style={{ fontWeight: '500', color: '#374151' }}>
          {text || 'Chưa cập nhật'}
        </span>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '20%',
      render: (text) => (
        <span style={{ color: '#6b7280' }}>
          {text || 'Chưa cập nhật'}
        </span>
      ),
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: '15%',
      render: (text) => (
        <span style={{ color: '#374151' }}>
          {text || 'Chưa cập nhật'}
        </span>
      ),
    },
    {
      title: 'Ngày Sinh',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      width: '12%',
      render: (date) => (
        <span style={{ color: '#374151' }}>
          {formatDate(date)}
        </span>
      ),
    },    {
      title: 'Nhóm Máu',
      dataIndex: 'bloodTypeId',
      key: 'bloodTypeId',
      width: '10%',
      render: (bloodTypeId, record) => {
        // Try to get blood type from bloodTypeId or fallback to bloodType field
        const bloodType = bloodTypes[bloodTypeId];
        const displayName = bloodType?.name || record.bloodType || 'N/A';
        
        if (displayName !== 'N/A') {
          const bloodTypeColors = {
            'A+': 'red', 'A-': 'volcano',
            'B+': 'blue', 'B-': 'geekblue', 
            'AB+': 'purple', 'AB-': 'magenta',
            'O+': 'green', 'O-': 'lime',
            // Fallback for basic types without +/-
            'A': 'red',
            'B': 'blue',
            'AB': 'purple',
            'O': 'green'
          };
          const color = bloodTypeColors[displayName] || 'default';
          return (
            <Tag color={color}>
              {displayName}
            </Tag>
          );
        }
        return <span style={{ color: '#9ca3af' }}>N/A</span>;
      },
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'donationAvailabilityId',
      key: 'donationAvailabilityId',
      width: '12%',
      render: (donationAvailabilityId, record) => {
        // Get donation availability from API data
        const availability = donationAvailabilities[donationAvailabilityId];
        const displayStatus = availability?.name || 'N/A';
        
        // Set colors based on status
        const getStatusColor = (status) => {
          if (status.includes('Đủ điều kiện')) return 'green';
          if (status.includes('Chưa đủ điều kiện')) return 'orange';
          if (status.includes('Tạm thời không')) return 'red';
          if (status.includes('medical hold')) return 'volcano';
          return 'default';
        };
        
        return (
          <Tag color={getStatusColor(displayStatus)}>
            {displayStatus}
          </Tag>
        );
      },
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

          
          <Content className="user-management-content">
            <div className="user-management-container">
              <div className="user-header-section">
                <Space className="user-controls">
                  <Title level={3} className="user-management-title">
                    {viewTitle}
                  </Title>
                  <Select
                    value={selectedRole}
                    onChange={handleRoleChange}
                    style={{ width: 200 }}
                  >
                    <Option value={3}>Người Hiến Máu</Option>
                    <Option value={2}>Nhân Viên</Option>
                    <Option value={1}>Quản Trị Viên</Option>
                  </Select>
                  
                  <div style={{ fontSize: '14px', color: '#666', marginLeft: 'auto' }}>
                    <Text strong>Tổng số người dùng:</Text> {users.length}
                  </div>
                </Space>
              </div>

              <div className="user-table-container">
                <Table
                  columns={userColumns}
                  dataSource={getPaginatedData()}
                  rowKey={(record) => record.userId || Math.random()}
                  loading={loading}
                  pagination={false}
                  size="large"
                  className="user-wide-table"
                />
                
                {/* Enhanced Pagination Controls */}
                {currentData.length > 0 && (
                  <div className="user-pagination">
                    <div className="pagination-info">
                      <Text>
                        Hiển thị {startRecord}-{endRecord} của {currentData.length} người dùng
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

export default UserManagementPage; 
