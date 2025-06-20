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
  Modal,
  InputNumber
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
  
  // State for upcoming schedules
  const [upcomingDates, setUpcomingDates] = useState(new Set());
  
  // State for status change functionality
  const [statusChanges, setStatusChanges] = useState({}); // Track status changes per registration
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [validationMessages, setValidationMessages] = useState({}); // Track validation messages per registration
  
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
    fetchUpcomingSchedules();
    setCurrentPage(1); // Reset to first page when schedule type changes
  }, [scheduleType]);

  // Fetch schedules after upcoming schedules are loaded
  useEffect(() => {
    fetchSchedules();
  }, [upcomingDates, scheduleType]);

  // Auto-update expired schedules when upcoming dates are loaded
  useEffect(() => {
    if (upcomingDates.size > 0) {
      autoUpdateExpiredScheduleDonors();
    }
  }, [upcomingDates]);

  const fetchAllDonors = async () => {
    try {
      const response = await AdminAPI.getAllDonors();
      const donorsData = response.data || [];
      
      // Debug: Check what the API returns
      console.log('getAllDonors API response:', response);
      console.log('donorsData:', donorsData);
      
      const donorMap = {};
      donorsData.forEach(donor => {
        // Handle all possible ID field variations from User API (userId) and Donor API fallback
        const id = donor.userId || donor.UserId || donor.UserID || donor.donorId || donor.DonorId || donor.DonorID || donor.id || donor.Id;
        console.log('Processing donor:', donor, 'extracted ID:', id);
        donorMap[id] = {
          name: donor.fullName || donor.FullName || donor.username || donor.Username || donor.name || donor.Name || `User ${id}`,
          email: donor.email || ''
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

  const fetchUpcomingSchedules = async () => {
    try {
      const response = await AdminAPI.getUpcomingDonationSchedules();
      const upcomingData = response.data || [];
      
      // Extract dates from upcoming schedules
      const upcomingDateSet = new Set();
      upcomingData.forEach(schedule => {
        const scheduleDate = schedule.scheduleDate;
        if (scheduleDate) {
          // Convert to YYYY-MM-DD format for consistent comparison
          const dateStr = new Date(scheduleDate).toISOString().split('T')[0];
          upcomingDateSet.add(dateStr);
        }
      });
      
      console.log('Upcoming dates:', upcomingDateSet);
      setUpcomingDates(upcomingDateSet);
    } catch (error) {
      console.error('Error fetching upcoming schedules:', error);
      setUpcomingDates(new Set());
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await AdminAPI.getDonationSchedules();
      const data = response.data || [];
      
      let filteredData = data;
      if (scheduleType === 'upcoming') {
        // Filter using upcoming dates from API
        filteredData = data.filter(schedule => {
          const scheduleDate = schedule.scheduleDate;
          if (scheduleDate) {
            const dateStr = new Date(scheduleDate).toISOString().split('T')[0];
            return upcomingDates.has(dateStr);
          }
          return false;
        });
      } else if (scheduleType === 'past') {
        // Filter for past schedules (not in upcoming dates)
        filteredData = data.filter(schedule => {
          const scheduleDate = schedule.scheduleDate;
          if (scheduleDate) {
            const dateStr = new Date(scheduleDate).toISOString().split('T')[0];
            return !upcomingDates.has(dateStr);
          }
          return true;
        });
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
                    name: donorData.fullName || donorData.FullName || donorData.username || donorData.Username || donorData.name || donorData.Name || `User ${donorId}`,
                    email: donorData.email || donorData.Email || ''
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
        
        // Sort registrations by time slot ID
        const sortedRegistrations = filteredRegistrations.sort((a, b) => {
          const timeSlotA = a.TimeSlotID || a.timeSlotId || a.TimeSlotId || 0;
          const timeSlotB = b.TimeSlotID || b.timeSlotId || b.TimeSlotId || 0;
          return timeSlotA - timeSlotB; // Sort in ascending order (slot 1, 2, 3, 4)
        });
        
        setRegistrations(sortedRegistrations);
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
    const currentData = currentView === 'schedules' ? schedules : registrations;
    const totalPages = Math.ceil(currentData.length / pageSize);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const handleGoToPage = (page) => {
    const currentData = currentView === 'schedules' ? schedules : registrations;
    const totalPages = Math.ceil(currentData.length / pageSize);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle status change dropdown
  const handleStatusChange = async (registrationId, newStatusId) => {
    // Clear any existing validation message for this registration
    setValidationMessages(prev => {
      const updated = { ...prev };
      delete updated[registrationId];
      return updated;
    });

    // If trying to set status to "Đã hoàn thành" (id=3), validate first
    if (newStatusId === 3) {
      const recordExists = await checkDonationRecordExists(registrationId);
      if (!recordExists) {
        // Show validation message in the UI
        setValidationMessages(prev => ({
          ...prev,
          [registrationId]: 'Không có hồ sơ người hiến, không thể hoàn thành'
        }));
        return; // Don't update the status change
      }
    }

    setStatusChanges(prev => ({
      ...prev,
      [registrationId]: newStatusId
    }));
  };

  // Handle confirm status change
  const handleConfirmStatusChange = (registrationId) => {
    const newStatusId = statusChanges[registrationId];
    if (!newStatusId) {
      message.warning('Vui lòng chọn trạng thái mới');
      return;
    }

    setPendingStatusChange({ registrationId, newStatusId });
    setConfirmModalVisible(true);
  };

  // Check if donation record exists for a registration
  const checkDonationRecordExists = async (registrationId) => {
    try {
      const response = await AdminAPI.getDonationRecords();
      const donationRecords = response.data || [];
      
      // Check if any donation record has this registrationId
      const recordExists = donationRecords.some(record => {
        const recordRegId = record.registrationId || record.RegistrationId || record.RegistrationID;
        return recordRegId == registrationId;
      });
      
      return recordExists;
    } catch (error) {
      console.error('Error checking donation record existence:', error);
      return false;
    }
  };

  // Execute status update
  const executeStatusUpdate = async () => {
    if (!pendingStatusChange) return;

    const { registrationId, newStatusId } = pendingStatusChange;
    
    try {
      setLoading(true);
      await AdminAPI.updateDonationRegistrationStatus(registrationId, newStatusId);
      
      // Update local state
      setRegistrations(prev => prev.map(reg => {
        const regId = reg.registrationId || reg.RegistrationID || reg.id;
        if (regId == registrationId) {
          return {
            ...reg,
            registrationStatusId: newStatusId,
            RegistrationStatusID: newStatusId,
            RegistrationStatusId: newStatusId
          };
        }
        return reg;
      }));

      // Clear the status change
      setStatusChanges(prev => {
        const updated = { ...prev };
        delete updated[registrationId];
        return updated;
      });

      message.success('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Lỗi khi cập nhật trạng thái. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setConfirmModalVisible(false);
      setPendingStatusChange(null);
    }
  };

  const cancelStatusUpdate = () => {
    setConfirmModalVisible(false);
    setPendingStatusChange(null);
  };

  // Handle creating donation record for present donors
  const handleCreateDonationRecord = (record) => {
    const registrationId = record.registrationId || record.RegistrationID || record.id;
    const donorId = record.DonorID || record.donorId || record.DonorId;
    const timeSlotId = record.TimeSlotID || record.timeSlotId || record.TimeSlotId;
    const donor = donors[donorId];
    
    // Get time slot details
    const timeSlot = timeSlots[timeSlotId];
    const scheduleDate = selectedSchedule?.scheduleDate;
    
    // Prepare pre-filled data
    const preFilledData = {
      registrationId: registrationId,
      userId: donorId,
      username: donor ? donor.name : `User ${donorId}`,
      donationDateTime: null // Will be set in the create page based on schedule date and time slot
    };

    // Add schedule and time slot info for date calculation
    if (scheduleDate && timeSlot) {
      preFilledData.scheduleDate = scheduleDate;
      preFilledData.timeSlot = timeSlot;
    }
    
    // Navigate to create page with pre-filled data
    navigate('/staff/donation-records/create', { 
      state: { 
        preFilledData: preFilledData,
        fromScheduleManagement: true 
      } 
    });
  };

  // Auto-update donor statuses for schedules with status "ĐÃ QUA" 
  const autoUpdateExpiredScheduleDonors = async () => {
    if (upcomingDates.size === 0) return; // Wait for upcoming dates to load
    
    try {
      const result = await AdminAPI.autoUpdateExpiredScheduleDonors(upcomingDates);
      if (result.success && result.updatedCount > 0) {
        message.info(result.message);
        
        // Refresh the current view if we're looking at registrations
        if (currentView === 'registrations' && selectedSchedule) {
          handleViewDetails(selectedSchedule);
        }
      }
    } catch (error) {
      console.error('Error auto-updating expired schedules:', error);
      message.error('Không thể tự động cập nhật trạng thái cho các lịch đã qua');
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
      render: (_, record) => {
        const scheduleDate = record.scheduleDate;
        let isUpcoming = false;
        
        if (scheduleDate) {
          const dateStr = new Date(scheduleDate).toISOString().split('T')[0];
          isUpcoming = upcomingDates.has(dateStr);
        }
        
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
      title: 'Mã Đăng Ký (Registration ID)',
      dataIndex: 'registrationId',
      key: 'registrationId',
      width: '12%',
      render: (_, record) => {
        const registrationId = record.registrationId || record.RegistrationID || record.id || 'N/A';
        return (
          <span style={{ fontWeight: 'bold', color: '#722ed1' }}>
            {registrationId}
          </span>
        );
      },
    },
    {
      title: 'Mã Lịch (Schedule ID)',
      dataIndex: 'scheduleId',
      key: 'scheduleId',
      width: '12%',
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
      title: 'Mã Người Hiến (Donor ID)',
      dataIndex: 'donorId',
      key: 'donorId',
      width: '12%',
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
      width: '20%',
      render: (_, record) => {
        const actualDonorId = record.donorId;
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
      title: 'Thời Gian',
      dataIndex: 'timeSlotId',
      key: 'timeRange',
      width: '18%',
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
      title: 'Trạng Thái Người Hiến',
      key: 'status',
      dataIndex: 'registrationStatusId',
      width: '26%',
      render: (_, record) => {
        const registrationId = record.registrationId || record.RegistrationID || record.id;
        const actualStatusId = record.RegistrationStatusID || record.registrationStatusId || record.RegistrationStatusId;
        const status = registrationStatuses[actualStatusId];
        const selectedStatusId = statusChanges[registrationId] || actualStatusId;
        
        // Get current status display
        let currentStatusTag;
        if (status) {
          const colorMap = {
            'Đang chờ xác nhận': 'blue',
            'Đã xác nhận': 'green', 
            'Đã hoàn thành': 'purple',
            'Đã hủy': 'red',
            'No Show': 'orange'
          };
          const color = colorMap[status.name] || 'default';
          currentStatusTag = (
            <Tag color={color} style={{ marginBottom: 8 }}>
              {status.name.toUpperCase()}
            </Tag>
          );
        } else {
          const statusMap = {
            1: { text: 'Đã Đăng Ký', color: 'blue' },
            2: { text: 'Đã Xác Nhận', color: 'green' },
            3: { text: 'Đã Hủy', color: 'red' },
            4: { text: 'Hoàn Thành', color: 'purple' }
          };
          const fallbackStatus = statusMap[actualStatusId] || { text: 'Không Xác Định', color: 'default' };
          currentStatusTag = (
            <Tag color={fallbackStatus.color} style={{ marginBottom: 8 }}>
              {fallbackStatus.text.toUpperCase()}
            </Tag>
          );
        }
        
        return (
          <div style={{ minWidth: 200 }}>
            {currentStatusTag}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Select
                size="small"
                style={{ width: '100%' }}
                placeholder="Chọn trạng thái mới"
                value={selectedStatusId}
                onChange={(value) => handleStatusChange(registrationId, value)}
              >
                {Object.entries(registrationStatuses).map(([id, statusInfo]) => (
                  <Option key={id} value={parseInt(id)}>
                    {statusInfo.name}
                  </Option>
                ))}
              </Select>
              
              {statusChanges[registrationId] && statusChanges[registrationId] !== actualStatusId && (
                <Space size={4}>
                  <Button 
                    size="small" 
                    type="primary"
                    style={{ fontSize: '10px', padding: '2px 8px' }}
                    onClick={() => handleConfirmStatusChange(registrationId)}
                  >
                    Xác nhận
                  </Button>
                  <Button 
                    size="small"
                    style={{ fontSize: '10px', padding: '2px 8px' }}
                    onClick={() => handleStatusChange(registrationId, actualStatusId)}
                  >
                    Từ chối
                  </Button>
                </Space>
              )}

              {/* Show validation message if exists */}
              {validationMessages[registrationId] && (
                <div style={{ 
                  fontSize: '11px', 
                  color: '#ff4d4f', 
                  marginTop: '4px',
                  padding: '2px 4px',
                  backgroundColor: '#fff2f0',
                  border: '1px solid #ffccc7',
                  borderRadius: '4px'
                }}>
                  {validationMessages[registrationId]}
                </div>
              )}

              {/* Show "Tạo hồ sơ hiến" button when status is 2 (Đã có mặt) */}
              {actualStatusId === 2 && (
                <Button 
                  size="small" 
                  type="primary"
                  style={{ 
                    fontSize: '10px', 
                    padding: '2px 8px',
                    backgroundColor: '#52c41a',
                    borderColor: '#52c41a',
                    marginTop: '4px'
                  }}
                  onClick={() => handleCreateDonationRecord(record)}
                >
                  Tạo hồ sơ hiến
                </Button>
              )}
            </div>
          </div>
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
                
                {/* Enhanced Pagination Controls */}
                {currentData.length > 0 && (
                  <div className="schedule-pagination">
                    <div className="pagination-info">
                      <Text>
                        Hiển thị {startRecord}-{endRecord} của {currentData.length} {currentView === 'schedules' ? 'lịch hiến máu' : 'đăng ký'}
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
                      
                      <div className="pagination-buttons">
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
                        
                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageStart = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                          const pageNum = pageStart + i;
                          
                          if (pageNum <= totalPages) {
                            return (
                              <Button
                                key={pageNum}
                                type={currentPage === pageNum ? "primary" : "default"}
                                onClick={() => handlePageChange(pageNum)}
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                          return null;
                        })}
                        
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

      {/* Confirmation Modal */}
      <Modal
        title="Xác nhận thay đổi trạng thái"
        open={confirmModalVisible}
        onOk={executeStatusUpdate}
        onCancel={cancelStatusUpdate}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        {pendingStatusChange && (
          <div>
            <p>
              Bạn có chắc chắn muốn thay đổi trạng thái của đăng ký{' '}
              <strong>#{pendingStatusChange.registrationId}</strong> thành{' '}
              <strong>
                {registrationStatuses[pendingStatusChange.newStatusId]?.name || 'Không xác định'}
              </strong>?
            </p>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default ScheduleManagementPage; 