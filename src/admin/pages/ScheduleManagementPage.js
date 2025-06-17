import React, { useState, useEffect } from 'react';
import { 
  Layout,
  Table, 
  Tag, 
  Space, 
  Typography, 
  Select, 
  Button
} from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { AdminAPI } from '../api/admin';
import StaffNavbar from '../components/StaffNavbar';
import StaffSidebar from '../components/StaffSidebar';
import StaffHeader from '../components/StaffHeader';
import '../styles/schedule-management.scss';

const { Content } = Layout;
const { Text, Title } = Typography;
const { Option } = Select;

const ScheduleManagementPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scheduleType, setScheduleType] = useState('upcoming');
  const [donors, setDonors] = useState({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  
  // View state - for switching between schedule list and registration details
  const [currentView, setCurrentView] = useState('schedules'); // 'schedules' or 'registrations'
  const [viewTitle, setViewTitle] = useState('Lịch Hiến Máu');
  
  // New state for lookup data
  const [timeSlots, setTimeSlots] = useState({});
  const [registrationStatuses, setRegistrationStatuses] = useState({});
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type') || 'upcoming';
    setScheduleType(type);
  }, [location.search]);

  useEffect(() => {
    fetchAllDonors();
    fetchTimeSlots();
    fetchRegistrationStatuses();
    fetchSchedules();
    setCurrentPage(1); // Reset to first page when schedule type changes
  }, [scheduleType]);

  const fetchAllDonors = async () => {
    try {
      const response = await AdminAPI.getAllDonors();
      const donorsData = response.data || [];
      
      // Debug: Check what the API returns
      console.log('getAllDonors API response:', response);
      console.log('donorsData:', donorsData);
      
      const donorMap = {};
      donorsData.forEach(donor => {
        // Handle all possible ID field variations
        const id = donor.DonorID || donor.donorId || donor.DonorId || donor.id || donor.Id;
        console.log('Processing donor:', donor, 'extracted ID:', id);
        donorMap[id] = {
          name: donor.FullName || donor.fullName || donor.name || donor.Name || `Donor ${id}`,
          email: donor.Email || donor.email || ''
        };
      });
      
      console.log('Final donorMap:', donorMap);
      setDonors(donorMap);
    } catch (error) {
      console.error('Error fetching donors:', error);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const response = await AdminAPI.getTimeSlots();
      const timeSlotsData = response.data || [];
      const timeSlotMap = {};
      timeSlotsData.forEach(slot => {
        const id = slot.timeSlotId || slot.TimeSlotId || slot.id;
        timeSlotMap[id] = {
          name: slot.timeSlotName || slot.TimeSlotName || `Slot ${id}`,
          startTime: slot.startTime || slot.StartTime || '00:00:00',
          endTime: slot.endTime || slot.EndTime || '00:00:00'
        };
      });
      setTimeSlots(timeSlotMap);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    }
  };

  const fetchRegistrationStatuses = async () => {
    try {
      const response = await AdminAPI.getRegistrationStatuses();
      const statusesData = response.data || [];
      const statusMap = {};
      statusesData.forEach(status => {
        const id = status.id || status.Id;
        statusMap[id] = {
          name: status.name || status.Name || 'Unknown Status',
          description: status.description || status.Description || ''
        };
      });
      setRegistrationStatuses(statusMap);
    } catch (error) {
      console.error('Error fetching registration statuses:', error);
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await AdminAPI.getDonationSchedules();
      const data = response.data || [];
      const now = new Date();
      
      let filteredData = data;
      if (scheduleType === 'upcoming') {
        filteredData = data.filter(schedule => new Date(schedule.scheduleDate) >= now);
      } else if (scheduleType === 'past') {
        filteredData = data.filter(schedule => new Date(schedule.scheduleDate) < now);
      }
      
      setSchedules(filteredData);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (schedule) => {
    setSelectedSchedule(schedule);
    
    const scheduleId = schedule.scheduleId || schedule.ScheduleId || schedule.id || schedule.Id;
    const scheduleDate = new Date(schedule.scheduleDate).toLocaleDateString('vi-VN');
    
    // Switch to registrations view
    setCurrentView('registrations');
    setViewTitle(`Chi Tiết Lịch Hiến Máu - ${scheduleDate}`);
    setCurrentPage(1); // Reset pagination
    
    if (scheduleId) {
      try {
        setLoading(true);
        const response = await AdminAPI.getDonationRegistrations();
        const registrationData = response.data || [];
        
        const filteredRegistrations = registrationData.filter(reg => {
          const regScheduleId = reg.scheduleId || reg.ScheduleId || reg.ScheduleID;
          return regScheduleId == scheduleId;
        });
        
        // Fetch donor details for each registration
        const uniqueDonorIds = [...new Set(filteredRegistrations.map(reg => 
          reg.donorId || reg.DonorId || reg.DonorID
        ).filter(Boolean))];
        
        const newDonorData = {};
        await Promise.all(
          uniqueDonorIds.map(async (donorId) => {
            if (!donors[donorId]) {
              try {
                const donorResponse = await AdminAPI.getDonorById(donorId);
                const donorData = donorResponse.data;
                if (donorData) {
                  newDonorData[donorId] = {
                    name: donorData.FullName || donorData.fullName || donorData.name || donorData.Name || `Donor ${donorId}`,
                    email: donorData.Email || donorData.email || ''
                  };
                }
              } catch (error) {
                console.error(`Error fetching donor ${donorId}:`, error);
              }
            }
          })
        );
        
        // Update donors state with all new donor data at once
        if (Object.keys(newDonorData).length > 0) {
          setDonors(prev => ({ ...prev, ...newDonorData }));
        }
        
        setRegistrations(filteredRegistrations);
      } catch (error) {
        console.error('Error fetching registrations:', error);
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    } else {
      setRegistrations([]);
    }
  };

  const handleBackToSchedules = () => {
    setCurrentView('schedules');
    setViewTitle('Lịch Hiến Máu');
    setCurrentPage(1);
    setSelectedSchedule(null);
    setRegistrations([]);
  };

  const getDonorName = (donorId) => {
    // Handle all possible ID field variations 
    const id = donorId?.DonorID || donorId?.donorId || donorId?.DonorId || donorId?.id || donorId?.Id || donorId;
    const donor = donors[id];
    
    console.log('getDonorName - Input:', donorId, 'Extracted ID:', id, 'Found donor:', donor, 'All donors:', Object.keys(donors));
    
    return donor ? donor.name : `ID: ${id || 'N/A'}`;
  };

  // Pagination functions
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    if (currentView === 'schedules') {
      return schedules.slice(startIndex, endIndex);
    } else {
      return registrations.slice(startIndex, endIndex);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const handleGoToPage = (page) => {
    const totalPages = Math.ceil(schedules.length / pageSize);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const currentData = currentView === 'schedules' ? schedules : registrations;
  const totalPages = Math.ceil(currentData.length / pageSize);
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, currentData.length);

  const scheduleColumns = [
    {
      title: 'Schedule ID',
      dataIndex: 'scheduleId',
      key: 'scheduleId',
      width: '20%',
      render: (_, record) => {
        const scheduleId = record.scheduleId || record.ScheduleId || record.id || record.Id || 'N/A';
        return (
          <span style={{ fontWeight: 'bold', color: '#cf1322' }}>
            {scheduleId}
          </span>
        );
      },
    },
    {
      title: 'Ngày Hiến Máu',
      dataIndex: 'scheduleDate',
      key: 'scheduleDate',
      width: '45%',
      render: (date) => (
        <a style={{ fontWeight: 'bold', color: '#1890ff' }}>
          {new Date(date).toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          })}
        </a>
      ),
    },
    {
      title: 'Trạng Thái',
      key: 'status',
      dataIndex: 'scheduleDate',
      width: '20%',
      render: (_, { scheduleDate }) => {
        const now = new Date();
        const date = new Date(scheduleDate);
        const isUpcoming = date >= now;
        
        return (
          <Tag color={isUpcoming ? 'orange' : 'default'}>
            {isUpcoming ? 'SẮP DIỄN RA' : 'ĐÃ QUA'}
          </Tag>
        );
      },
    },
    {
      title: 'Chi Tiết',
      key: 'actions',
      width: '15%',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => handleViewDetails(record)}>
            Xem Chi Tiết
          </a>
        </Space>
      ),
    },
  ];

  const registrationColumns = [
    {
      title: 'Schedule ID',
      dataIndex: 'scheduleId',
      key: 'scheduleId',
      width: '15%',
      render: (_, record) => {
        const scheduleId = record.scheduleId || record.ScheduleId || record.ScheduleID || 'N/A';
        return (
          <span style={{ fontWeight: 'bold', color: '#cf1322' }}>
            {scheduleId}
          </span>
        );
      },
    },
    {
      title: 'Donor ID',
      dataIndex: 'donorId',
      key: 'donorId',
      width: '15%',
      render: (_, record) => {
        const donorId = record.DonorID || record.donorId || record.DonorId || record.id || record.Id || 'N/A';
        return (
          <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
            {donorId}
          </span>
        );
      },
    },
    {
      title: 'Tên Người Hiến',
      dataIndex: 'donorId',
      key: 'donorName',
      width: '25%',
      render: (_, record) => {
        const actualDonorId = record.DonorID || record.donorId || record.DonorId || record.id || record.Id;
        const donorName = getDonorName(actualDonorId);
        const donor = donors[actualDonorId];
        
        return (
          <div>
            <div style={{ fontWeight: 'bold' }}>{donorName}</div>
            {donor?.email && (
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                {donor.email}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Thời Gian Bắt Đầu - Thời Gian Kết Thúc',
      dataIndex: 'timeSlotId',
      key: 'timeRange',
      width: '25%',
      render: (_, record) => {
        const actualTimeSlotId = record.TimeSlotID || record.timeSlotId || record.TimeSlotId;
        const timeSlot = timeSlots[actualTimeSlotId];
        
        if (timeSlot) {
          const startTime = timeSlot.startTime.substring(0, 5); // Remove seconds
          const endTime = timeSlot.endTime.substring(0, 5); // Remove seconds
          return (
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#52c41a' }}>{startTime}</span>
              <span style={{ margin: '0 8px', color: '#666' }}>-</span>
              <span style={{ fontWeight: 'bold', color: '#f5222d' }}>{endTime}</span>
            </div>
          );
        }
        
        return `Slot ${actualTimeSlotId || 'N/A'}`;
      },
    },
    {
      title: 'Trạng Thái',
      key: 'status',
      dataIndex: 'registrationStatusId',
      width: '20%',
      render: (_, record) => {
        const actualStatusId = record.RegistrationStatusID || record.registrationStatusId || record.RegistrationStatusId;
        const status = registrationStatuses[actualStatusId];
        
        if (status) {
          // Map status names to colors
          const colorMap = {
            'Đang chờ xác nhận': 'blue',
            'Đã xác nhận': 'green', 
            'Đã hoàn thành': 'purple',
            'Đã hủy': 'red',
            'No Show': 'orange'
          };
          
          const color = colorMap[status.name] || 'default';
          
          return (
            <Tag color={color}>
              {status.name.toUpperCase()}
            </Tag>
          );
        }
        
        // Fallback to old mapping if API data not available
        const statusMap = {
          1: { text: 'Đã Đăng Ký', color: 'blue' },
          2: { text: 'Đã Xác Nhận', color: 'green' },
          3: { text: 'Đã Hủy', color: 'red' },
          4: { text: 'Hoàn Thành', color: 'purple' }
        };
        const fallbackStatus = statusMap[actualStatusId] || { text: 'Không Xác Định', color: 'default' };
        
        return (
          <Tag color={fallbackStatus.color}>
            {fallbackStatus.text.toUpperCase()}
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
          <StaffNavbar />
          
                    <Content className="schedule-management-content">
            <div className="schedule-management-container">
              <div className="schedule-header-section">
                <Space className="schedule-controls">
                  {currentView === 'registrations' && (
                    <Button 
                      onClick={handleBackToSchedules}
                      style={{ marginRight: 16 }}
                      icon={<span>←</span>}
                    >
                      Quay Lại
                    </Button>
                  )}
                  <Title level={3} className="schedule-management-title">
                    {viewTitle}
                  </Title>
                  {currentView === 'schedules' && (
                    <Select
                      value={scheduleType}
                      onChange={(value) => {
                        setScheduleType(value);
                        navigate(`/staff/schedule-management?type=${value}`);
                      }}
                      style={{ width: 200 }}
                    >
                      <Option value="upcoming">Lịch Sắp Tới</Option>
                      <Option value="past">Lịch Đã Qua</Option>
                      <Option value="all">Tất Cả Lịch</Option>
                    </Select>
                  )}
                  {currentView === 'registrations' && selectedSchedule && (
                    <div style={{ fontSize: '14px', color: '#666', marginLeft: 'auto' }}>
                      <Text strong>Số người đăng ký:</Text> {registrations.length}
                    </div>
                  )}
                </Space>
              </div>

              <div className="schedule-table-container">
                <Table
                  columns={currentView === 'schedules' ? scheduleColumns : registrationColumns}
                  dataSource={getPaginatedData()}
                  rowKey={(record) => {
                    if (currentView === 'schedules') {
                      return record.scheduleId || record.ScheduleId || record.id || record.Id || Math.random();
                    } else {
                      return record.registrationId || record.RegistrationID || record.id || Math.random();
                    }
                  }}
                  loading={loading}
                  pagination={false}
                  size="large"
                  className="schedule-wide-table"
                />
                <div className="custom-pagination">
                  <div className="pagination-info">
                    {currentData.length > 0 ? 
                      `${startRecord}-${endRecord} của ${currentData.length} ${currentView === 'schedules' ? 'lịch hiến máu' : 'đăng ký'}` : 
                      `0 ${currentView === 'schedules' ? 'lịch hiến máu' : 'đăng ký'}`
                    }
                  </div>
                  <div className="pagination-buttons">
                    <button 
                      className="pagination-btn" 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      {'<'}
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button 
                        key={page}
                        className={`pagination-btn ${page === currentPage ? 'active' : 'inactive'}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    ))}
                    <button 
                      className="pagination-btn" 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      {'>'}
                    </button>
                  </div>
                  <div className="pagination-controls">
                    <select 
                      className="page-size-select"
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    >
                      <option value={8}>8 / page</option>
                      <option value={16}>16 / page</option>
                      <option value={24}>24 / page</option>
                    </select>
                    <input 
                      placeholder="Go to" 
                      className="goto-input"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleGoToPage(Number(e.target.value));
                          e.target.value = '';
                        }
                      }}
                    />
                    <span className="goto-label">Page</span>
                  </div>
                </div>
              </div>
             </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default ScheduleManagementPage; 