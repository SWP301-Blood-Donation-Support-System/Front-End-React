import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card, 
  Row, 
  Col, 
  Typography, 
  Tag, 
  Button, 
  Space,
  Spin,
  message,
  notification,
  Layout,
  Alert,
  Table,
  Modal,
  Popconfirm,
  Divider,
  Input
} from 'antd';
import {
  CalendarOutlined,
  HeartOutlined,
  DeleteOutlined,
  DownloadOutlined,
  CommentOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserAPI } from '../api/User';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import ProfileWarning from '../components/ProfileWarning';
import Footer from '../components/Footer';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const DonationSchedulePage = () => {
  const [api, contextHolder] = notification.useNotification();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State for donation info
  const [donationInfo, setDonationInfo] = useState(null);
  const [donationInfoLoading, setDonationInfoLoading] = useState(false);
  
  // Schedule related states
  const [registrations, setRegistrations] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [registrationStatuses, setRegistrationStatuses] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [donationSchedule, setDonationSchedule] = useState([]);
  const [donationTypes, setDonationTypes] = useState({});
  const [bloodTestResults, setBloodTestResults] = useState({});
  
  // Modal states
  const [selectedDonationRecord, setSelectedDonationRecord] = useState(null);
  const [selectedRegistrationForDetail, setSelectedRegistrationForDetail] = useState(null);
  const [donationDetailVisible, setDonationDetailVisible] = useState(false);
  const [certificateDownloading, setCertificateDownloading] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedRegistrationId, setSelectedRegistrationId] = useState(null);
  const [feedbackViewVisible, setFeedbackViewVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [feedbackExistence, setFeedbackExistence] = useState({});
  
  const navigate = useNavigate();
  const location = useLocation();
  const notificationShown = useRef(false);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return dayjs(dateString).format('DD/MM/YYYY');
    } catch (error) {
      return 'N/A';
    }
  };

  const getCompletedDonationCount = () => {
    if (!registrations || registrations.length === 0) return 0;
    return registrations.filter(registration => registration.registrationStatusId === 3).length;
  };

  const getLastCompletedDonationDate = () => {
    if (!registrations || registrations.length === 0) return null;
    
    // Get all completed registrations
    const completedRegistrations = registrations.filter(registration => registration.registrationStatusId === 3);
    
    if (completedRegistrations.length === 0) return null;
    
    // Get the latest donation date from completed registrations
    let latestDate = null;
    
    completedRegistrations.forEach(registration => {
      const scheduleId = registration.scheduleId || 
                        registration.ScheduleId || 
                        registration.scheduleID || 
                        registration.ScheduleID ||
                        registration.donationScheduleId ||
                        registration.DonationScheduleId;
      
      if (scheduleId && donationSchedule && donationSchedule.length > 0) {
        const schedule = donationSchedule.find(s => 
          s.id === scheduleId || 
          s.scheduleId === scheduleId || 
          s.ScheduleId === scheduleId ||
          s.donationScheduleId === scheduleId ||
          s.DonationScheduleId === scheduleId
        );
        
        if (schedule) {
          const dateField = schedule.donationDate || schedule.DonationDate || schedule.scheduleDate || schedule.ScheduleDate;
          if (dateField) {
            const donationDate = new Date(dateField);
            if (!latestDate || donationDate > latestDate) {
              latestDate = donationDate;
            }
          }
        }
      }
    });
    
    return latestDate;
  };

  // Function to fetch donation info from API
  const fetchDonationInfo = async () => {
    try {
      setDonationInfoLoading(true);
      
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const userId = userInfo?.userId || userInfo?.UserId || userInfo?.UserID || userInfo?.id;
      
      if (!userInfo || !userId) {
        if (userInfo) {
          const fallbackData = {
            donationCount: userInfo.donationCount || userInfo.DonationCount || 0,
            lastDonationDate: userInfo.lastDonationDate || userInfo.LastDonationDate,
            nextEligibleDonationDate: userInfo.nextEligibleDonationDate || userInfo.NextEligibleDonationDate
          };
          setDonationInfo(fallbackData);
        }
        return;
      }

      const response = await UserAPI.getUserById(userId);
      
      if (response.status === 200 && response.data) {
        const userData = response.data;
        const newDonationInfo = {
          donationCount: userData.donationCount || userData.DonationCount || 0,
          lastDonationDate: userData.lastDonationDate || userData.LastDonationDate,
          nextEligibleDonationDate: userData.nextEligibleDonationDate || userData.NextEligibleDonationDate
        };
        setDonationInfo(newDonationInfo);
      } else {
        const fallbackData = {
          donationCount: userInfo.donationCount || userInfo.DonationCount || 0,
          lastDonationDate: userInfo.lastDonationDate || userInfo.LastDonationDate,
          nextEligibleDonationDate: userInfo.nextEligibleDonationDate || userInfo.NextEligibleDonationDate
        };
        setDonationInfo(fallbackData);
      }
    } catch (error) {
      console.error("Error fetching donation info:", error);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (userInfo) {
        const fallbackData = {
          donationCount: userInfo.donationCount || userInfo.DonationCount || 0,
          lastDonationDate: userInfo.lastDonationDate || userInfo.LastDonationDate,
          nextEligibleDonationDate: userInfo.nextEligibleDonationDate || userInfo.NextEligibleDonationDate
        };
        setDonationInfo(fallbackData);
      }
    } finally {
      setDonationInfoLoading(false);
    }
  };

  // Function to check feedback existence
  const checkFeedbackExistence = async (registrationsList) => {
    try {
      const feedbackChecks = {};
      
      for (const registration of registrationsList) {
        if (registration.registrationStatusId === 3) {
          try {
            const response = await UserAPI.getFeedbackByRegistrationId(registration.registrationId);
            // Check if response has actual feedback data, not just empty array or null
            const hasValidFeedback = response.status === 200 && 
                                   response.data && 
                                   (Array.isArray(response.data) ? response.data.length > 0 : true) &&
                                   response.data !== null &&
                                   response.data !== undefined;
            
            feedbackChecks[registration.registrationId] = hasValidFeedback;
            console.log(`Feedback check for registration ${registration.registrationId}: response =`, response.data, `exists = ${hasValidFeedback}`);
          } catch (error) {
            feedbackChecks[registration.registrationId] = false;
            console.log(`Feedback check for registration ${registration.registrationId}: error = ${error.response?.status || 'unknown'}, exists = false`);
          }
        }
      }
      
      console.log('Feedback existence state:', feedbackChecks);
      setFeedbackExistence(feedbackChecks);
    } catch (error) {
      console.error('Error checking feedback existence:', error);
    }
  };

  // Initialize data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));

        if (!token || !userInfo) {
          navigate('/login');
          return;
        }

        setUser(userInfo);
      } catch (error) {
        console.error("Error loading user profile:", error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    const fetchRegistrationStatuses = async () => {
      try {
        const response = await UserAPI.getRegistrationStatuses();
        if (response.status === 200) {
          setRegistrationStatuses(response.data);
        }
      } catch (error) {
        console.error("Error fetching registration statuses:", error);
      }
    };

    const fetchTimeSlots = async () => {
      try {
        const response = await UserAPI.getTimeSlots();
        if (response.status === 200) {
          setTimeSlots(response.data);
        }
      } catch (error) {
        console.error("Error fetching time slots:", error);
      }
    };

    const fetchDonationSchedule = async () => {
      try {
        const response = await UserAPI.getDonationSchedule();
        if (response.status === 200) {
          setDonationSchedule(response.data);
        }
      } catch (error) {
        console.error("Error fetching donation schedule:", error);
      }
    };

    const fetchDonationTypes = async () => {
      try {
        const response = await UserAPI.getDonationTypes();
        if (response.status === 200) {
          const donationTypesMap = {};
          response.data.forEach(type => {
            donationTypesMap[type.id] = type.name;
          });
          setDonationTypes(donationTypesMap);
        }
      } catch (error) {
        console.error("Error fetching donation types:", error);
      }
    };

    const fetchBloodTestResults = async () => {
      try {
        const response = await UserAPI.getBloodTestResults();
        if (response.status === 200) {
          const resultsMap = {};
          response.data.forEach(result => {
            resultsMap[result.id] = result;
          });
          setBloodTestResults(resultsMap);
        }
      } catch (error) {
        console.error("Error fetching blood test results:", error);
      }
    };

    fetchUserProfile();
    fetchRegistrationStatuses();
    fetchTimeSlots();
    fetchDonationSchedule();
    fetchDonationTypes();
    fetchBloodTestResults();
    fetchDonationInfo();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchRegistrations();
    }
  }, [user, donationInfo]);

  const fetchRegistrations = async () => {
    try {
      setRegistrationsLoading(true);
      
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const userId = userInfo?.userId || userInfo?.UserId || userInfo?.UserID || userInfo?.id;
      
      if (!userId) {
        console.error("No user ID found for fetching registrations");
        return;
      }

      const response = await UserAPI.getDonationRegistrationsByDonorId(userId);
      
      if (response.status === 200) {
        const registrationsList = response.data || [];
        setRegistrations(registrationsList);
        await checkFeedbackExistence(registrationsList);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
      setRegistrations([]);
    } finally {
      setRegistrationsLoading(false);
    }
  };

  const getScheduleDateById = (scheduleId) => {
    if (!scheduleId || !donationSchedule || donationSchedule.length === 0) {
      return 'N/A';
    }
    
    const schedule = donationSchedule.find(s => 
      s.id === scheduleId || 
      s.scheduleId === scheduleId || 
      s.ScheduleId === scheduleId ||
      s.donationScheduleId === scheduleId ||
      s.DonationScheduleId === scheduleId
    );
    
    if (schedule) {
      const dateField = schedule.donationDate || schedule.DonationDate || schedule.scheduleDate || schedule.ScheduleDate;
      return formatDate(dateField);
    }
    
    return 'N/A';
  };

  const getScheduleDateTimeForDetail = () => {
    if (!selectedRegistrationForDetail) {
      return 'N/A';
    }
    
    const scheduleId = selectedRegistrationForDetail.scheduleId || 
                      selectedRegistrationForDetail.ScheduleId || 
                      selectedRegistrationForDetail.scheduleID || 
                      selectedRegistrationForDetail.ScheduleID ||
                      selectedRegistrationForDetail.donationScheduleId ||
                      selectedRegistrationForDetail.DonationScheduleId;
    
    const timeslotId = selectedRegistrationForDetail.timeslotId || 
                      selectedRegistrationForDetail.timeSlotId || 
                      selectedRegistrationForDetail.TimeslotId || 
                      selectedRegistrationForDetail.TimeSlotId;
    
    const scheduleDate = getScheduleDateById(scheduleId);
    const timeSlot = getTimeSlotDisplay(timeslotId);
    
    if (scheduleDate !== 'N/A' && timeSlot !== 'N/A') {
      return `${scheduleDate} ${timeSlot}`;
    } else if (scheduleDate !== 'N/A') {
      return scheduleDate;
    }
    
    return 'N/A';
  };

  const handleCancelRegistration = async (registrationId) => {
    try {
      const response = await UserAPI.cancelDonationRegistration(registrationId);
      if (response.status === 200) {
        api.success({
          message: 'Hủy đăng ký thành công!',
          description: 'Đăng ký hiến máu đã được hủy',
          placement: 'topRight',
          duration: 3,
        });
        fetchRegistrations();
      }
    } catch (error) {
      console.error("Error canceling registration:", error);
      api.error({
        message: 'Lỗi!',
        description: 'Có lỗi xảy ra khi hủy đăng ký',
        placement: 'topRight',
        duration: 3,
      });
    }
  };

  const handleDownloadCertificate = async (registrationId) => {
    try {
      setCertificateDownloading(true);
      
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const userName = userInfo?.FullName || userInfo?.name || 'User';
      
      const removeVietnameseDiacritics = (str) => {
        return str
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd').replace(/Đ/g, 'D')
          .replace(/[^a-zA-Z0-9 ]/g, '')
          .replace(/\s+/g, '_');
      };
      
      const sanitizedUserName = removeVietnameseDiacritics(userName);
      const fileName = `Certificate_${sanitizedUserName}_${registrationId}.pdf`;
      
      const response = await UserAPI.getCertificateByRegistrationId(registrationId);
      
      if (response.status === 200) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        api.success({
          message: 'Tải xuống thành công!',
          description: 'Chứng nhận hiến máu đã được tải xuống',
          placement: 'topRight',
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error downloading certificate:", error);
      api.error({
        message: 'Lỗi!',
        description: 'Có lỗi xảy ra khi tải chứng nhận',
        placement: 'topRight',
        duration: 3,
      });
    } finally {
      setCertificateDownloading(false);
    }
  };

  const getStatusColor = (statusId) => {
    switch (statusId) {
      case 1:
        return 'blue';
      case 2:
        return 'orange';  
      case 3:
        return 'green';
      case 4:
        return 'red';
      case 5:
        return 'purple';
      default:
        return 'default';
    }
  };

  const getStatusText = (statusId) => {
    const status = registrationStatuses.find(s => s.id === statusId);
    return status ? status.name : `Status ${statusId}`;
  };

  const getTimeSlotDisplay = (timeslotId) => {
    if (!timeslotId || !timeSlots || timeSlots.length === 0) {
      return 'N/A';
    }
    
    const timeSlot = timeSlots.find(slot => 
      slot.id === timeslotId || 
      slot.timeslotId === timeslotId ||
      slot.TimeSlotId === timeslotId ||
      slot.timeSlotId === timeslotId
    );
    
    if (timeSlot) {
      const startTime = timeSlot.startTime || timeSlot.StartTime;
      const endTime = timeSlot.endTime || timeSlot.EndTime;
      
      if (startTime && endTime) {
        const formattedStart = startTime.substring(0, 5);
        const formattedEnd = endTime.substring(0, 5);
        return `${formattedStart} - ${formattedEnd}`;
      }
      
      return timeSlot.name || timeSlot.timeRange || 'N/A';
    }
    
    return 'N/A';
  };

  const getDonationRecordByRegistrationId = async (registrationId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const userId = userInfo?.userId || userInfo?.UserId || userInfo?.UserID || userInfo?.id;
      
      if (!userId) {
        console.error("No user ID found for fetching donation records");
        return null;
      }

      const response = await UserAPI.getDonationRecordsByDonorId(userId);
      
      if (response.status === 200) {
        const records = response.data || [];
        
        // Find the record that matches the registration ID
        const record = records.find(record => 
          (record.registrationId || record.RegistrationId) === registrationId
        );
        
        return record || null;
      }
      return null;
    } catch (error) {
      console.error('Error fetching donation record:', error);
      return null;
    }
  };

  const getDonationTypeName = (typeId) => {
    return donationTypes[typeId] || 'N/A';
  };

  const getBloodTestResultTag = (resultId) => {
    const result = bloodTestResults[resultId];
    if (!result) return <Tag>N/A</Tag>;
    
    let color = 'default';
    switch (result.name?.toLowerCase()) {
      case 'qualified':
      case 'đạt':
        color = 'green';
        break;
      case 'unqualified':
      case 'không đạt':
        color = 'red';
        break;
      default:
        color = 'orange';
    }
    
    return <Tag color={color}>{result.name}</Tag>;
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    try {
      return dayjs(dateTime).format('DD/MM/YYYY HH:mm');
    } catch (error) {
      return 'N/A';
    }
  };

  const formatBloodPressure = (bp) => {
    return bp || 'N/A';
  };

  const handleViewDonationDetail = async (registrationId) => {
    try {
      const donationRecord = await getDonationRecordByRegistrationId(registrationId);
      
      if (donationRecord) {
        // Find the registration to get schedule info
        const registration = registrations.find(reg => reg.registrationId === registrationId);
        
        setSelectedDonationRecord(donationRecord);
        setSelectedRegistrationForDetail(registration);
        setDonationDetailVisible(true);
      } else {
        api.warning({
          message: 'Không tìm thấy dữ liệu!',
          description: 'Không tìm thấy hồ sơ hiến máu cho đăng ký này',
          placement: 'topRight',
          duration: 3,
        });
      }
    } catch (error) {
      console.error('Error viewing donation detail:', error);
      api.error({
        message: 'Lỗi!',
        description: 'Có lỗi xảy ra khi xem chi tiết hiến máu',
        placement: 'topRight',
        duration: 3,
      });
    }
  };

  const handleCloseDonationDetail = () => {
    setDonationDetailVisible(false);
    setSelectedDonationRecord(null);
    setSelectedRegistrationForDetail(null);
  };

  const handleOpenFeedback = async (registrationId) => {
    setSelectedRegistrationId(registrationId);
    
    const feedbackExists = feedbackExistence[registrationId];
    console.log(`Opening feedback for registration ${registrationId}: feedbackExists = ${feedbackExists}`);
    
    if (feedbackExists) {
      console.log('Opening view feedback modal');
      await handleViewFeedback(registrationId);
    } else {
      console.log('Opening submit feedback modal');
      setFeedbackText('');
      setFeedbackVisible(true);
    }
  };

  const handleCloseFeedback = () => {
    setFeedbackVisible(false);
    setFeedbackText('');
    setSelectedRegistrationId(null);
  };

  const handleViewFeedback = async (registrationId) => {
    try {
      const response = await UserAPI.getFeedbackByRegistrationId(registrationId);
      console.log('View feedback response:', response);
      
      // Check if response has valid feedback data
      const hasValidFeedback = response.status === 200 && 
                             response.data && 
                             (Array.isArray(response.data) ? response.data.length > 0 : true) &&
                             response.data !== null &&
                             response.data !== undefined;
      
      if (hasValidFeedback) {
        const feedbackData = Array.isArray(response.data) ? response.data[0] : response.data;
        // Additional check to ensure feedbackData has actual content
        if (feedbackData && (feedbackData.feedbackInfo || feedbackData.FeedbackInfo || feedbackData.content || feedbackData.Content)) {
          setSelectedFeedback(feedbackData);
          setFeedbackViewVisible(true);
        } else {
          console.log('Feedback data exists but has no content, showing submit modal');
          // If feedback data exists but has no content, show submit modal
          setFeedbackExistence(prev => ({
            ...prev,
            [registrationId]: false
          }));
          setSelectedRegistrationId(registrationId);
          setFeedbackText('');
          setFeedbackVisible(true);
        }
      } else {
        console.log('No valid feedback found, showing submit modal');
        // If no feedback found, update the feedback existence state and show submit modal instead
        setFeedbackExistence(prev => ({
          ...prev,
          [registrationId]: false
        }));
        setSelectedRegistrationId(registrationId);
        setFeedbackText('');
        setFeedbackVisible(true);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      console.log('Feedback fetch failed, showing submit modal');
      // Any error means no valid feedback, show submit modal
      setFeedbackExistence(prev => ({
        ...prev,
        [registrationId]: false
      }));
      setSelectedRegistrationId(registrationId);
      setFeedbackText('');
      setFeedbackVisible(true);
    }
  };

  const handleCloseFeedbackView = () => {
    setFeedbackViewVisible(false);
    setSelectedFeedback(null);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedRegistrationId) {
      api.error({
        message: 'Lỗi!',
        description: 'Không tìm thấy ID đăng ký',
        placement: 'topRight',
        duration: 3,
      });
      return;
    }

    if (feedbackText.trim().length < 5) {
      api.error({
        message: 'Nội dung quá ngắn!',
        description: 'Phản hồi phải có ít nhất 5 ký tự',
        placement: 'topRight',
        duration: 3,
      });
      return;
    }

    try {
      setFeedbackLoading(true);

      const response = await UserAPI.submitFeedback(feedbackText, selectedRegistrationId);
      
      if (response.status === 200 || response.status === 201) {
        setFeedbackExistence(prev => ({
          ...prev,
          [selectedRegistrationId]: true
        }));
        
        handleCloseFeedback();
        
        api.success({
          message: 'Gửi phản hồi thành công!',
          description: 'Cảm ơn bạn đã gửi phản hồi cho chúng tôi',
          placement: 'topRight',
          duration: 3,
        });
      } else {
        api.error({
          message: 'Lỗi!',
          description: 'Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại sau.',
          placement: 'topRight',
          duration: 3,
        });
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      if (error.response && error.response.status === 409) {
        Modal.error({
          title: 'Không thể gửi phản hồi',
          content: 'Bạn đã gửi phản hồi cho đăng ký này rồi. Mỗi đăng ký chỉ có thể gửi phản hồi một lần duy nhất.',
          okText: 'Đã hiểu'
        });
      } else if (error.response && error.response.status === 400) {
        api.error({
          message: 'Thông tin không hợp lệ!',
          description: 'Thông tin phản hồi không hợp lệ. Vui lòng kiểm tra lại.',
          placement: 'topRight',
          duration: 3,
        });
      } else if (error.response && error.response.status === 401) {
        api.error({
          message: 'Phiên đăng nhập hết hạn!',
          description: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
          placement: 'topRight',
          duration: 3,
        });
      } else {
        api.error({
          message: 'Lỗi!',
          description: 'Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại sau.',
          placement: 'topRight',
          duration: 3,
        });
      }
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="donation-schedule-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="donation-schedule-error">
        <Text type="danger">Failed to load user profile</Text>
      </div>
    );
  }

  return (
    <Layout>
      {contextHolder}
      <Header />
      <Navbar />
      <ProfileWarning />
      <div className="donation-schedule-page">
        <div className="donation-schedule-container">
          <Title level={2} className="donation-schedule-title">
            <HeartOutlined /> Lịch Sử Đặt Hẹn
          </Title>

          <Row gutter={[24, 24]}>
            {/* Donation Statistics */}
            <Col span={24}>
              <Card title="Thống Kê Hiến Máu" className="donation-stats-card">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <div className="donation-stat">
                      <div className="stat-icon">
                        <HeartOutlined style={{ fontSize: '24px', color: '#dc2626' }} />
                      </div>
                      <div className="stat-content">
                        <div className="stat-label">Số lần hiến máu</div>
                        <div className="stat-value">
                          {donationInfoLoading || registrationsLoading ? (
                            <Spin size="small" />
                          ) : (
                            getCompletedDonationCount()
                          )}
                        </div>
                      </div>
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={8}>
                    <div className="donation-stat">
                      <div className="stat-icon">
                        <CalendarOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                      </div>
                      <div className="stat-content">
                        <div className="stat-label">Lần hiến máu gần nhất</div>
                        <div className="stat-value">
                          {donationInfoLoading || registrationsLoading ? (
                            <Spin size="small" />
                          ) : (
                            (() => {
                              const lastDate = getLastCompletedDonationDate();
                              return lastDate ? formatDate(lastDate) : 'Chưa hiến máu';
                            })()
                          )}
                        </div>
                      </div>
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={8}>
                    <div className="donation-stat">
                      <div className="stat-icon">
                        <CalendarOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                      </div>
                      <div className="stat-content">
                        <div className="stat-label">Thời gian có thể hiến máu lại</div>
                        <div className="stat-value-with-tag">
                          <span className="stat-value">
                            {(donationInfo?.nextEligibleDonationDate || user?.nextEligibleDonationDate || user?.NextEligibleDonationDate)
                              ? formatDate(donationInfo?.nextEligibleDonationDate || user?.nextEligibleDonationDate || user?.NextEligibleDonationDate)
                              : 'Chưa xác định'
                            }
                          </span>
                          {(donationInfo?.nextEligibleDonationDate || user?.nextEligibleDonationDate || user?.NextEligibleDonationDate) ? (
                            <span className="stat-tag">
                              {new Date(donationInfo?.nextEligibleDonationDate || user?.nextEligibleDonationDate || user?.NextEligibleDonationDate) > new Date() 
                                ? (
                                  <Tag color="orange">
                                    Cần chờ thêm {Math.ceil((new Date(donationInfo?.nextEligibleDonationDate || user?.nextEligibleDonationDate || user?.NextEligibleDonationDate) - new Date()) / (1000 * 60 * 60 * 24))} ngày
                                  </Tag>
                                ) : (
                                  <Tag color="green">
                                    Đã đủ điều kiện hiến máu
                                  </Tag>
                                )
                              }
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
                
                {/* Additional donation availability notice */}
                {user.nextEligibleDonationDate || user.NextEligibleDonationDate ? (
                  <Alert
                    message={
                      new Date(user.nextEligibleDonationDate || user.NextEligibleDonationDate) > new Date()
                        ? "Bạn cần chờ thêm thời gian để có thể hiến máu tiếp theo"
                        : "Bạn đã đủ điều kiện để hiến máu!"
                    }
                    description={
                      new Date(user.nextEligibleDonationDate || user.NextEligibleDonationDate) > new Date()
                        ? "Để đảm bảo sức khỏe, bạn cần tuân thủ khoảng cách thời gian giữa các lần hiến máu theo quy định."
                        : "Hãy đăng ký lịch hiến máu để đóng góp vào công tác hiến máu nhân đạo!"
                    }
                    type={
                      new Date(user.nextEligibleDonationDate || user.NextEligibleDonationDate) > new Date()
                        ? "warning"
                        : "success"
                    }
                    showIcon
                    style={{ marginTop: '16px' }}
                  />
                ) : null}
              </Card>
            </Col>

            {/* Registered Schedules */}
            <Col span={24}>
              <Card title="Lịch Đã Đăng Kí" className="schedule-card">
                <div className="schedule-content">
                  {registrationsLoading ? (
                    <div className="schedule-loading">
                      <Spin size="large" />
                      <Text style={{ marginTop: '16px', display: 'block', textAlign: 'center' }}>
                        Đang tải thông tin lịch đăng kí...
                      </Text>
                    </div>
                  ) : registrations.length > 0 ? (
                    <Table
                      dataSource={registrations}
                      rowKey="registrationId"
                      pagination={false}
                      className="registration-table"
                      size="large"
                      columns={[
                        {
                          title: 'Ngày đăng kí',
                          dataIndex: 'createdAt',
                          key: 'createdAt',
                          width: '20%',
                          render: (date) => (
                            <span style={{ color: 'black', fontWeight: 'bold' }}>
                              {formatDate(date)}
                            </span>
                          )
                        },
                        {
                          title: 'Ngày hiến máu',
                          key: 'donationDate',
                          width: '20%',
                          render: (_, record) => {
                            const scheduleId = record.scheduleId || record.ScheduleId || record.scheduleID || record.ScheduleID;
                            const dateText = getScheduleDateById(scheduleId);
                            return (
                              <span style={{ color: 'black', fontWeight: 'bold' }}>
                                {dateText}
                              </span>
                            );
                          }
                        },
                        {
                          title: 'Trạng thái',
                          dataIndex: 'registrationStatusId',
                          key: 'status',
                          width: '18%',
                          render: (statusId) => (
                            <Tag color={getStatusColor(statusId)}>
                              {getStatusText(statusId)}
                            </Tag>
                          )
                        },
                        {
                          title: 'Khung giờ',
                          key: 'timeslot',
                          width: '18%',
                          render: (_, record) => {
                            const timeslotId = record.timeslotId || record.timeSlotId || record.TimeslotId || record.TimeSlotId;
                            return getTimeSlotDisplay(timeslotId);
                          }
                        },
                        {
                          title: 'Chi tiết hiến máu',
                          key: 'donationRecord',
                          width: '16%',
                          render: (_, record) => {
                            const statusId = record.registrationStatusId;
                            const registrationId = record.registrationId;
                            
                            const status = registrationStatuses.find(s => s.id === statusId);
                            const isCompleted = statusId === 3 || 
                                              (status && status.name && status.name.toLowerCase().includes('hoàn thành'));

                            if (isCompleted) {
                              return (
                                <Space direction="vertical" size="small">
                                  <Button 
                                    type="primary"
                                    size="small"
                                    onClick={() => handleViewDonationDetail(registrationId)}
                                  >
                                    Xem chi tiết
                                  </Button>
                                  <Button 
                                    type="default"
                                    size="small"
                                    icon={<DownloadOutlined />}
                                    loading={certificateDownloading}
                                    onClick={() => handleDownloadCertificate(registrationId)}
                                  >
                                    Tải chứng nhận
                                  </Button>
                                </Space>
                              );
                            } else {
                              return (
                                <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                                  Chưa hoàn thành
                                </Text>
                              );
                            }
                          }
                        },
                        {
                          title: 'Phản hồi',
                          key: 'feedback',
                          width: '12%',
                          render: (_, record) => {
                            const statusId = record.registrationStatusId;
                            const registrationId = record.registrationId;
                            
                            const status = registrationStatuses.find(s => s.id === statusId);
                            const isCompleted = statusId === 3 || 
                                              (status && status.name && status.name.toLowerCase().includes('hoàn thành'));
                            
                            if (isCompleted) {
                              const feedbackExists = feedbackExistence[registrationId];
                              const buttonText = feedbackExists ? 'Xem phản hồi' : 'Gửi phản hồi';
                              const buttonIcon = feedbackExists ? <EyeOutlined /> : <CommentOutlined />;
                              
                              return (
                                <Button 
                                  type="default"
                                  size="small"
                                  icon={buttonIcon}
                                  onClick={() => handleOpenFeedback(registrationId)}
                                  style={{ 
                                    color: feedbackExists ? '#52c41a' : '#1890ff',
                                    borderColor: feedbackExists ? '#52c41a' : '#1890ff'
                                  }}
                                >
                                  {buttonText}
                                </Button>
                              );
                            } else {
                              return (
                                <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                                  Chưa khả dụng
                                </Text>
                              );
                            }
                          }
                        },
                        {
                          title: 'Thao tác',
                          key: 'actions',
                          width: '12%',
                          render: (_, record) => {
                            const statusId = record.registrationStatusId;
                            const registrationId = record.registrationId;
                            
                            const canCancel = statusId === 1;
                            
                            if (canCancel) {
                              return (
                                <Popconfirm
                                  title="Hủy đăng ký hiến máu"
                                  description="Bạn có chắc chắn muốn hủy đăng ký này?"
                                  onConfirm={() => handleCancelRegistration(registrationId)}
                                  okText="Hủy đăng ký"
                                  cancelText="Không"
                                  okButtonProps={{ danger: true }}
                                >
                                  <Button 
                                    type="primary" 
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                  >
                                    Hủy
                                  </Button>
                                </Popconfirm>
                              );
                            } else if (statusId === 4) {
                              return (
                                <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                                  Đã huỷ
                                </Text>
                              );
                            } else {
                              return (
                                <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                                  Đã xử lý
                                </Text>
                              );
                            }
                          }
                        }
                      ]}
                      scroll={{ x: 'max-content' }}
                    />
                  ) : (
                    <div className="schedule-placeholder">
                      <div className="placeholder-icon">
                        <CalendarOutlined style={{ fontSize: '48px', color: '#d1d5db' }} />
                      </div>
                      <div className="placeholder-text">
                        <Title level={4} style={{ color: '#6b7280', marginBottom: '8px' }}>
                          Chưa có lịch đăng kí nào
                        </Title>
                        <Text style={{ color: '#9ca3af' }}>
                          Các lịch hiến máu đã đăng kí sẽ hiển thị tại đây
                        </Text>
                      </div>
                      <div className="placeholder-actions">
                        <Button 
                          type="primary" 
                          size="large"
                          onClick={() => navigate('/booking')}
                          style={{ marginTop: '16px' }}
                        >
                          Đăng Kí Hiến Máu
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Donation Record Detail Modal */}
      <Modal
        title="Chi Tiết Hồ Sơ Hiến Máu"
        open={donationDetailVisible}
        onCancel={handleCloseDonationDetail}
        footer={[
          <Button key="close" onClick={handleCloseDonationDetail}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedDonationRecord && (
          <div className="donation-detail-form">
            <Row gutter={[24, 16]}>
              <Col span={24}>
                <div className="form-field">
                  <label className="form-label">THỜI GIAN HIẾN MÁU</label>
                  <div className="form-value">
                    {getScheduleDateTimeForDetail()}
                  </div>
                </div>
              </Col>
            </Row>
            
            <Row gutter={[24, 16]}>
              <Col span={8}>
                <div className="form-field">
                  <label className="form-label">NHIỆT ĐỘ</label>
                  <div className="form-value">
                    {selectedDonationRecord.donorTemperature || selectedDonationRecord.DonorTemperature || 'N/A'}
                    {selectedDonationRecord.donorTemperature || selectedDonationRecord.DonorTemperature ? ' °C' : ''}
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div className="form-field">
                  <label className="form-label">HUYẾT ÁP</label>
                  <div className="form-value">
                    {formatBloodPressure(selectedDonationRecord.donorBloodPressure || selectedDonationRecord.DonorBloodPressure)}
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div className="form-field">
                  <label className="form-label">CÂN NẶNG</label>
                  <div className="form-value">
                    {selectedDonationRecord.donorWeight || selectedDonationRecord.DonorWeight || 'N/A'}
                    {selectedDonationRecord.donorWeight || selectedDonationRecord.DonorWeight ? ' kg' : ''}
                  </div>
                </div>
              </Col>
            </Row>
            
            <Divider orientation="left">THÔNG TIN HIẾN MÁU</Divider>
            
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <div className="form-field">
                  <label className="form-label">LOẠI HIẾN MÁU</label>
                  <div className="form-value">
                    {getDonationTypeName(selectedDonationRecord.donationTypeId || selectedDonationRecord.DonationTypeId)}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="form-field">
                  <label className="form-label">THỂ TÍCH HIẾN</label>
                  <div className="form-value">
                    {selectedDonationRecord.volumeDonated || selectedDonationRecord.VolumeDonated || 'N/A'}
                    {selectedDonationRecord.volumeDonated || selectedDonationRecord.VolumeDonated ? ' ml' : ''}
                  </div>
                </div>
              </Col>
            </Row>
            
            <Divider orientation="left">KẾT LUẬN</Divider>
            
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <div className="form-field">
                  <label className="form-label">KẾT QUẢ XÉT NGHIỆM</label>
                  <div className="form-value">
                    {getBloodTestResultTag(selectedDonationRecord.bloodTestResult || selectedDonationRecord.BloodTestResult)}
                  </div>
                </div>
              </Col>

              <Col span={24}>
                <div className="form-field">
                  <label className="form-label">GHI CHÚ</label>
                  <div className="form-value">
                    {selectedDonationRecord.note || selectedDonationRecord.Note || 'Không có ghi chú'}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Feedback Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CommentOutlined style={{ color: '#ffa940' }} />
            Gửi Phản Hồi Trải Nghiệm Hiến Máu
          </div>
        }
        open={feedbackVisible}
        onCancel={handleCloseFeedback}
        footer={[
          <Button key="cancel" onClick={handleCloseFeedback}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={feedbackLoading}
            onClick={handleSubmitFeedback}
            icon={<CommentOutlined />}
          >
            Gửi Phản Hồi
          </Button>
        ]}
        width={600}
      >
        <div style={{ padding: '16px 0' }}>
          <Text style={{ 
            display: 'block', 
            marginBottom: '16px', 
            color: '#666',
            fontSize: '14px'
          }}>
            Trải nghiệm hiến máu của bạn như thế nào? Hãy chia sẻ để giúp chúng tôi cải thiện dịch vụ tốt hơn.
          </Text>
          <Input.TextArea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về quy trình hiến máu, thái độ phục vụ, cơ sở vật chất... (tối thiểu 5 ký tự)"
            rows={6}
            maxLength={1000}
            showCount
            style={{
              resize: 'none',
              borderRadius: '8px'
            }}
          />
          <div style={{ 
            marginTop: '12px', 
            fontSize: '12px', 
            color: '#999',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <CommentOutlined />
            Phản hồi của bạn sẽ giúp chúng tôi cải thiện chất lượng dịch vụ
          </div>
        </div>
      </Modal>

      {/* View Feedback Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CommentOutlined style={{ color: '#1890ff' }} />
            Xem Phản Hồi
          </div>
        }
        open={feedbackViewVisible}
        onCancel={handleCloseFeedbackView}
        footer={[
          <Button key="close" onClick={handleCloseFeedbackView}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {selectedFeedback && (
          <div style={{ padding: '16px 0' }}>
            <div style={{ marginBottom: '16px' }}>
              <Text style={{ color: '#666', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                Nội dung phản hồi:
              </Text>
              <div style={{ 
                background: '#f5f5f5', 
                padding: '16px', 
                borderRadius: '8px',
                minHeight: '100px',
                lineHeight: '1.6'
              }}>
                <Text>
                  {selectedFeedback.feedbackInfo || 
                   selectedFeedback.FeedbackInfo ||
                   selectedFeedback.content || 
                   selectedFeedback.Content || 
                   selectedFeedback.feedbackContent || 
                   selectedFeedback.FeedbackContent ||
                   selectedFeedback.text ||
                   selectedFeedback.Text ||
                   selectedFeedback.message ||
                   selectedFeedback.Message ||
                   selectedFeedback.comment ||
                   selectedFeedback.Comment ||
                   'Không có nội dung'}
                </Text>
              </div>
            </div>
            
            <div style={{ marginTop: '16px' }}>
              <Text>
                <HeartOutlined /> Cảm ơn bạn đã chia sẻ trải nghiệm hiến máu!
              </Text>
            </div>
          </div>
        )}
      </Modal>
      
      <Footer />
    </Layout>
  );
};

export default DonationSchedulePage;