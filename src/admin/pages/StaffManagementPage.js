import React, { useState, useEffect } from 'react';
import { 
  Layout,
  Table, 
  Tag, 
  Space, 
  Typography, 
  Button,
  message,
  InputNumber
} from 'antd';
import { AdminAPI } from '../api/admin';

import StaffSidebar from '../components/StaffSidebar';
import StaffHeader from '../components/StaffHeader';
import '../styles/staff-management.scss';

const { Content } = Layout;
const { Text, Title } = Typography;

const StaffManagementPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [staffUsers, setStaffUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bloodTypes, setBloodTypes] = useState({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    fetchStaffUsers();
    fetchBloodTypes();
  }, []);

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

  const fetchStaffUsers = async () => {
    setLoading(true);
    try {
      // Fetch staff users (role ID 2)
      const response = await AdminAPI.getUsersByRole(2);
      const userData = response.data || [];
      setStaffUsers(userData);
    } catch (error) {
      console.error('Error fetching staff users:', error);
      message.error('Lỗi khi tải dữ liệu nhân viên');
      setStaffUsers([]);
    } finally {
      setLoading(false);
    }
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
    return staffUsers.slice(startIndex, endIndex);
  };

  const handlePageChange = (page) => {
    const totalPages = Math.ceil(staffUsers.length / pageSize);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const handleGoToPage = (page) => {
    const totalPages = Math.ceil(staffUsers.length / pageSize);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const currentData = staffUsers;
  const totalPages = Math.ceil(currentData.length / pageSize);
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, currentData.length);

  const staffColumns = [
    {
      title: 'Mã Nhân Viên (User ID)',
      dataIndex: 'userId',
      key: 'userId',
      width: '15%',
      render: (text) => (
        <span style={{ fontWeight: 'bold', color: '#dc2626' }}>
          NV{text || 'N/A'}
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
      width: '25%',
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
    },
    {
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
      dataIndex: 'isActive',
      key: 'isActive',
      width: '8%',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Không hoạt động'}
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
          <Content className="staff-management-content">
            <div className="staff-management-container">
              <div className="staff-header-section">
                <Space className="staff-controls">
                  <Title level={3} className="staff-management-title">
                    Quản Lý Nhân Viên
                  </Title>
                  
                  <div style={{ fontSize: '14px', color: '#666', marginLeft: 'auto' }}>
                    <Text strong>Tổng số nhân viên:</Text> {staffUsers.length}
                  </div>
                </Space>
              </div>

              <div className="staff-table-container">
                <Table
                  columns={staffColumns}
                  dataSource={getPaginatedData()}
                  rowKey={(record) => record.userId || Math.random()}
                  loading={loading}
                  pagination={false}
                  size="large"
                  className="staff-wide-table"
                />
                
                {/* Enhanced Pagination Controls */}
                {currentData.length > 0 && (
                  <div className="staff-pagination">
                    <div className="pagination-info">
                      <Text>
                        Hiển thị {startRecord}-{endRecord} của {currentData.length} nhân viên
                      </Text>
                    </div>
                    
                    <div className="pagination-controls">
                      <Space>
                        <Text>Số bản ghi mỗi trang:</Text>
                        <select
                          value={pageSize}
                          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                          className="page-size-select"
                        >
                          <option value={5}>5</option>
                          <option value={8}>8</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
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
                        <Text className="goto-label">Đến trang:</Text>
                        <InputNumber
                          min={1}
                          max={totalPages}
                          value={currentPage}
                          onChange={(value) => value && handleGoToPage(value)}
                          className="goto-input"
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

export default StaffManagementPage; 