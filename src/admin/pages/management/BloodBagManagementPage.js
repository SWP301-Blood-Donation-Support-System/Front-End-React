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
  Statistic,
  Tabs
} from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { AdminAPI } from '../../api/admin';

import StaffSidebar from '../../components/StaffSidebar';
import StaffHeader from '../../components/StaffHeader';
import '../../styles/blood-bag-management.scss';

const { Content } = Layout;
const { Text, Title } = Typography;
const { Option } = Select;

const BloodBagManagementPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [bloodUnits, setBloodUnits] = useState([]);
  const [filteredBloodUnits, setFilteredBloodUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' or statusId
  const [selectedBloodType, setSelectedBloodType] = useState('all'); // 'all' or bloodTypeId
  const [bloodComponents, setBloodComponents] = useState({});
  const [bloodTypes, setBloodTypes] = useState({});
  const [bloodUnitStatuses, setBloodUnitStatuses] = useState({}); // Map of statusId to status object
  const [donationRecordsMap, setDonationRecordsMap] = useState({}); // Map donationRecordId to registrationId
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  
  // View state
  const [viewTitle, setViewTitle] = useState('Tất Cả Túi Máu');
  
  const location = useLocation();
  const navigate = useNavigate();

  // This will be replaced by actual API data

  useEffect(() => {
    // Get filter from URL params or default to 'all'
    const params = new URLSearchParams(location.search);
    const statusFilter = params.get('status') || 'all';
    setSelectedStatus(statusFilter);
    
    fetchBloodUnits();
    fetchBloodComponents();
    fetchBloodTypes();
    fetchBloodUnitStatuses();
    fetchDonationRecordsMapping();
  }, [location.search]);

  useEffect(() => {
    filterBloodUnits();
  }, [bloodUnits, selectedStatus, selectedBloodType]);

  const fetchBloodUnits = async () => {
    setLoading(true);
    try {
      const response = await AdminAPI.getBloodUnits();
      const bloodUnitsData = response.data || [];
      
      // Debug: Log the first blood unit to see its structure
      if (bloodUnitsData.length > 0) {
        console.log('Debug - Sample blood unit structure:', bloodUnitsData[0]);
        console.log('Debug - Available fields:', Object.keys(bloodUnitsData[0]));
      }
      
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

  const fetchBloodUnitStatuses = async () => {
    try {
      const response = await AdminAPI.getBloodUnitStatuses();
      const statusesData = response.data || [];
      const statusesMap = {};
      statusesData.forEach(status => {
        statusesMap[status.id] = status;
      });
      setBloodUnitStatuses(statusesMap);
    } catch (error) {
      console.error('Error fetching blood unit statuses:', error);
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
    
    console.log('🔍 Filtering started with:', {
      totalUnits: bloodUnits.length,
      selectedStatus,
      selectedBloodType,
      bloodTypes,
      bloodUnitStatuses
    });
    
    // Filter by status first
    if (selectedStatus !== 'all') {
      const targetStatusId = parseInt(selectedStatus);
      const targetStatusObject = bloodUnitStatuses[selectedStatus];
      const beforeCount = filtered.length;
      
      filtered = filtered.filter(unit => {
        // Try to match by status ID first
        const unitStatusId = unit.bloodUnitStatusId || unit.statusId || unit.BloodUnitStatusId;
        if (unitStatusId) {
          const statusIdNum = parseInt(unitStatusId);
          return statusIdNum === targetStatusId;
        }
        
        // If no status ID, try to match by status name
        const unitStatusName = unit.statusName || unit.StatusName;
        if (unitStatusName && targetStatusObject) {
          const matches = unitStatusName === targetStatusObject.name;
          console.log(`📝 Status name match: "${unitStatusName}" === "${targetStatusObject.name}" = ${matches}`);
          return matches;
        }
        
        console.log(`❌ Status mismatch: unit has statusName="${unitStatusName}", looking for "${targetStatusObject?.name}"`);
        return false;
      });
      
      console.log(`✅ Status filter: ${beforeCount} → ${filtered.length} units`);
    }
    
    // Then filter by blood type
    if (selectedBloodType !== 'all') {
      const beforeCount = filtered.length;
      
      if (selectedBloodType === 'unknown') {
        // Filter for units with no blood type or "Chưa biết" blood type
        filtered = filtered.filter(unit => {
          const unitBloodTypeId = unit.bloodTypeId || unit.BloodTypeId || unit.bloodType?.id;
          const unitBloodTypeName = unit.bloodTypeName || unit.BloodTypeName || unit.bloodType?.name;
          
          // Return true if no blood type info is available OR blood type is "Chưa biết"
          return unitBloodTypeName === 'Chưa biết' || (!unitBloodTypeId && !unitBloodTypeName);
        });
      } else {
        const targetBloodTypeId = parseInt(selectedBloodType);
        const targetBloodType = bloodTypes[selectedBloodType];
        
        console.log(`🩸 Looking for blood type ID: ${targetBloodTypeId}, object:`, targetBloodType);
        
        filtered = filtered.filter(unit => {
          // Try different possible field names for blood type ID and name
          const unitBloodTypeId = unit.bloodTypeId || unit.BloodTypeId || unit.bloodType?.id;
          const unitBloodTypeName = unit.bloodTypeName || unit.BloodTypeName || unit.bloodType?.name;
          
          console.log(`🔎 Unit blood type: ID=${unitBloodTypeId}, Name=${unitBloodTypeName}`);
          
          // Match by ID first
          if (unitBloodTypeId) {
            const bloodTypeIdNum = parseInt(unitBloodTypeId);
            const matches = bloodTypeIdNum === targetBloodTypeId;
            console.log(`🆔 ID match: ${bloodTypeIdNum} === ${targetBloodTypeId} = ${matches}`);
            return matches;
          }
          
          // If no ID, try to match by name
          if (unitBloodTypeName && targetBloodType) {
            const matches = unitBloodTypeName === targetBloodType.name;
            console.log(`📝 Name match: "${unitBloodTypeName}" === "${targetBloodType.name}" = ${matches}`);
            return matches;
          }
          
          // If still no match, try to find blood type by name in the bloodTypes object
          if (unitBloodTypeName) {
            const matchingBloodType = Object.values(bloodTypes).find(bt => bt.name === unitBloodTypeName);
            if (matchingBloodType && matchingBloodType.id === targetBloodTypeId) {
              console.log(`🎯 Indirect match: "${unitBloodTypeName}" found in bloodTypes with ID ${matchingBloodType.id}`);
              return true;
            }
          }
          
          console.log(`❌ No blood type match found for unit`);
          return false;
        });
      }
      
      console.log(`🩸 Blood type filter: ${beforeCount} → ${filtered.length} units`);
    }
    
    // Set title based on filters
    let title = 'Tất Cả Túi Máu';
    if (selectedBloodType !== 'all') {
      if (selectedBloodType === 'unknown') {
        title = 'Nhóm Máu Chưa Biết';
      } else {
        const bloodTypeObject = bloodTypes[selectedBloodType];
        if (bloodTypeObject) {
          title = `Nhóm Máu ${bloodTypeObject.name}`;
        }
      }
    }
    if (selectedStatus !== 'all') {
      const statusObject = bloodUnitStatuses[selectedStatus];
      if (statusObject) {
        if (selectedBloodType !== 'all') {
          title += ` - ${statusObject.name}`;
        } else {
          title = statusObject.name;
        }
      }
    }
    setViewTitle(title);
    
    console.log(`🎯 Final result: ${filtered.length} units after all filters`);
    console.log('📋 Final filtered units:', filtered);
    
    setFilteredBloodUnits(filtered);
    setCurrentPage(1); // Reset pagination when filtering
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    navigate(`/staff/blood-bag-management?status=${status}`);
  };

  const handleBloodTypeChange = (bloodTypeKey) => {
    setSelectedBloodType(bloodTypeKey);
  };

  // Calculate blood type counts for filter tabs
  const getBloodTypeCounts = () => {
    const counts = {};
    
    // Initialize counts for all blood types + unknown (excluding "Chưa biết" types)
    Object.keys(bloodTypes).forEach(typeId => {
      const bloodType = bloodTypes[typeId];
      if (bloodType.name !== 'Chưa biết') {
        counts[typeId] = 0;
      }
    });
    counts['unknown'] = 0;
    
    // Count blood units by blood type
    bloodUnits.forEach(unit => {
      // Try different possible field names for blood type ID
      const unitBloodTypeId = unit.bloodTypeId || unit.BloodTypeId || unit.bloodType?.id;
      const unitBloodTypeName = unit.bloodTypeName || unit.BloodTypeName || unit.bloodType?.name;
      
      let counted = false;
      
      // Check if this is an unknown blood type (either no type or "Chưa biết")
      if (unitBloodTypeName === 'Chưa biết' || (!unitBloodTypeId && !unitBloodTypeName)) {
        counts['unknown']++;
        counted = true;
      } else if (unitBloodTypeId) {
        const typeIdStr = unitBloodTypeId.toString();
        const bloodType = bloodTypes[typeIdStr];
        // Only count if it's not "Chưa biết" type
        if (bloodType && bloodType.name !== 'Chưa biết' && counts.hasOwnProperty(typeIdStr)) {
          counts[typeIdStr]++;
          counted = true;
        }
      } else if (unitBloodTypeName) {
        // If we don't have ID, try to match by name (excluding "Chưa biết")
        const matchingType = Object.entries(bloodTypes).find(([id, type]) => 
          type.name === unitBloodTypeName && type.name !== 'Chưa biết'
        );
        if (matchingType) {
          counts[matchingType[0]]++;
          counted = true;
        }
      }
      
      // If no blood type found or it was "Chưa biết", count as unknown
      if (!counted) {
        counts['unknown']++;
      }
    });
    return counts;
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

  // Format date only function (without time)
  const formatDateOnly = (dateString) => {
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

  // Get status tag color
  const getStatusColor = (statusName) => {
    const statusColors = {
      'Khả dụng': 'green',
      'Đã được sử dụng': 'blue', 
      'Hết hạn': 'red',
      'Hư': 'volcano',
      'Available': 'green',
      'Used': 'blue',
      'Expired': 'red',
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

  const currentData = filteredBloodUnits;
  const totalPages = Math.ceil(currentData.length / pageSize);
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, currentData.length);
  const bloodTypeCounts = getBloodTypeCounts();

  const bloodUnitColumns = [
    {
      title: 'Mã Túi Máu (BloodUnitID)',
      dataIndex: 'bloodUnitId',
      key: 'bloodUnitId',
      width: '10%',
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
    },    {
      title: 'Ngày Thu Thập',
      dataIndex: 'collectedDateTime',
      key: 'collectedDateTime',
      width: '10%',
      render: (date) => (
        <span style={{ color: '#374151' }}>
          {formatDateOnly(date)}
        </span>
      ),
    },
    {
      title: 'Ngày Hết Hạn',
      dataIndex: 'expiryDateTime',
      key: 'expiryDateTime',
      width: '10%',
      render: (date) => {
        const isExpired = date && new Date(date) < new Date();
        return (
          <span style={{ 
            color: isExpired ? '#f5222d' : '#374151',
            fontWeight: isExpired ? 'bold' : 'normal'
          }}>
            {formatDateOnly(date)}
          </span>
        );
      },
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'statusName',
      key: 'statusName',
      width: '8%',
      render: (statusName, record) => {
        // Try to get status from API data first, then fallback to record
        const unitStatusId = record.bloodUnitStatusId || record.statusId || record.BloodUnitStatusId;
        const statusFromAPI = bloodUnitStatuses[unitStatusId];
        const displayStatus = statusFromAPI?.name || statusName || 'N/A';
        
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
          <Content className="blood-bag-content">
            <div className="blood-bag-container">

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
                    {Object.values(bloodUnitStatuses).map(status => (
                      <Option key={status.id} value={status.id.toString()}>
                        {status.name}
                      </Option>
                    ))}
                  </Select>
                  
                  <div style={{ fontSize: '14px', color: '#666', marginLeft: 'auto' }}>
                    <Text strong>Số túi máu hiển thị:</Text> {currentData.length}
                  </div>
                </Space>
              </div>

              {/* Blood Type Filter Tabs */}
              <div className="blood-type-filters" style={{ marginBottom: 24 }}>
                <Tabs
                  activeKey={selectedBloodType}
                  onChange={handleBloodTypeChange}
                  type="card"
                  size="small"
                  items={[
                    {
                      key: 'all',
                      label: (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>Tất cả</span>
                          <Tag color="blue" style={{ margin: 0 }}>
                            {bloodUnits.length}
                          </Tag>
                        </span>
                      ),
                    },
                    ...Object.entries(bloodTypes)
                      .filter(([typeId, bloodType]) => bloodType.name !== 'Chưa biết')
                      .map(([typeId, bloodType]) => ({
                        key: typeId,
                        label: (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>{bloodType.name}</span>
                            <Tag 
                              color={
                                bloodType.name.includes('A') && !bloodType.name.includes('AB') ? 'red' :
                                bloodType.name.includes('B') && !bloodType.name.includes('AB') ? 'blue' :
                                bloodType.name.includes('AB') ? 'purple' :
                                bloodType.name.includes('O') ? 'green' : 'default'
                              } 
                              style={{ margin: 0 }}
                            >
                              {bloodTypeCounts[typeId] || 0}
                            </Tag>
                          </span>
                        ),
                      })),
                    {
                      key: 'unknown',
                      label: (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>Chưa biết</span>
                          <Tag color="default" style={{ margin: 0 }}>
                            {bloodTypeCounts['unknown'] || 0}
                          </Tag>
                        </span>
                      ),
                    }
                  ]}
                />
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
