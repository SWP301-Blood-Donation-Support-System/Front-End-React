import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, 
  Row, 
  Col, 
  Avatar, 
  Typography, 
  Tag, 
  Button, 
  Descriptions,
  Space,
  Spin,
  message,
  Layout,
  Input,
  Select,
  DatePicker,
  Alert,
  Table,
  Modal,
  Popconfirm,
  Divider
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  HeartOutlined,
  IdcardOutlined,
  TeamOutlined,
  BankOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserAPI } from '../api/User';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // State riêng cho thông tin hiến máu
  const [donationInfo, setDonationInfo] = useState(null);
  const [donationInfoLoading, setDonationInfoLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [bloodTypes, setBloodTypes] = useState([]);
  const [genders, setGenders] = useState([]);
  const [occupations, setOccupations] = useState([]);
  const [showUpdateRequired, setShowUpdateRequired] = useState(false);
  const [editValues, setEditValues] = useState({});
  const [registrations, setRegistrations] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [registrationStatuses, setRegistrationStatuses] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [donationSchedule, setDonationSchedule] = useState([]);
  const [donationRecords, setDonationRecords] = useState([]);
  const [donationTypes, setDonationTypes] = useState({});
  const [bloodTestResults, setBloodTestResults] = useState({});
  const [selectedDonationRecord, setSelectedDonationRecord] = useState(null);
  const [donationDetailVisible, setDonationDetailVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();  // Function để lấy thông tin hiến máu từ API getUserById
  const fetchDonationInfo = async () => {
    try {
      setDonationInfoLoading(true);
      
      // Lấy userId từ localStorage
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      console.log("📱 LocalStorage userInfo:", userInfo);
      
      // Kiểm tra các trường userId có thể có
      const userId = userInfo?.userId || userInfo?.UserId || userInfo?.UserID || userInfo?.id;
      console.log("🔍 Extracted userId:", userId);
      
      if (!userInfo || !userId) {
        console.error("❌ No user ID found in localStorage");
        console.error("❌ Available userInfo keys:", userInfo ? Object.keys(userInfo) : "No userInfo");
        
        // Fallback to localStorage data immediately
        if (userInfo) {
          const fallbackData = {
            donationCount: userInfo.donationCount || userInfo.DonationCount || 0,
            lastDonationDate: userInfo.lastDonationDate || userInfo.LastDonationDate,
            nextEligibleDonationDate: userInfo.nextEligibleDonationDate || userInfo.NextEligibleDonationDate
          };
          console.log("🔄 Using localStorage fallback immediately:", fallbackData);
          setDonationInfo(fallbackData);
        }
        return;
      }

      console.log("🚀 Fetching donation info for user ID:", userId);
      const response = await UserAPI.getUserById(userId);
      console.log("📡 API Response status:", response.status);
      console.log("📡 API Response data:", response.data);
      
      if (response.status === 200 && response.data) {
        const userData = response.data;
        console.log("✅ User data from API:", userData);
        console.log("🩸 Donation Count from API:", userData.donationCount);
        console.log("📅 Last Donation Date from API:", userData.lastDonationDate);
        console.log("🗓️ Next Eligible Date from API:", userData.nextEligibleDonationDate);
        
        const newDonationInfo = {
          donationCount: userData.donationCount || userData.DonationCount || 0,
          lastDonationDate: userData.lastDonationDate || userData.LastDonationDate,
          nextEligibleDonationDate: userData.nextEligibleDonationDate || userData.NextEligibleDonationDate
        };
        
        console.log("💾 Setting donationInfo to:", newDonationInfo);
        setDonationInfo(newDonationInfo);
      } else {
        console.warn("⚠️ API call successful but no data returned");
        // Fallback to localStorage data
        const fallbackData = {
          donationCount: userInfo.donationCount || userInfo.DonationCount || 0,
          lastDonationDate: userInfo.lastDonationDate || userInfo.LastDonationDate,
          nextEligibleDonationDate: userInfo.nextEligibleDonationDate || userInfo.NextEligibleDonationDate
        };
        console.log("🔄 Using localStorage fallback:", fallbackData);
        setDonationInfo(fallbackData);
      }
    } catch (error) {
      console.error("❌ Error fetching donation info:", error);
      console.error("❌ Error details:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      
      // Fallback to localStorage data
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (userInfo) {
        const fallbackData = {
          donationCount: userInfo.donationCount || userInfo.DonationCount || 0,
          lastDonationDate: userInfo.lastDonationDate || userInfo.LastDonationDate,
          nextEligibleDonationDate: userInfo.nextEligibleDonationDate || userInfo.NextEligibleDonationDate
        };
        console.log("🔄 Error fallback to localStorage data:", fallbackData);
        setDonationInfo(fallbackData);
      }
    } finally {
      setDonationInfoLoading(false);
      console.log("🏁 fetchDonationInfo completed");
    }
  };

  useEffect(() => {
    // Check if user was redirected here for profile update
    const urlParams = new URLSearchParams(location.search);
    const updateRequired = urlParams.get('updateRequired');
    
    if (updateRequired === 'true') {
      setShowUpdateRequired(true);
      // Show immediate notification
      message.warning({
        content: 'Vui lòng cập nhật thông tin cá nhân để có thể đăng ký hiến máu!',
        duration: 5,
        style: { marginTop: '20px' }
      });
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));

        if (!token || !userInfo) {
          message.error("Please login to view your profile");
          navigate('/login');
          return;        }

        // Use stored userInfo from localStorage instead of API call
        setUser(userInfo);
      } catch (error) {
        console.error("Error loading user profile:", error);
        // Fallback to stored userInfo
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (userInfo) {
          setUser(userInfo);
        } else {
          message.error("Failed to load profile information");
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchBloodTypes = async () => {
      try {
        const response = await UserAPI.getBloodTypes();
        if (response.status === 200) {
          setBloodTypes(response.data.result || response.data);
        }
      } catch (error) {
        console.error("Error fetching blood types:", error);
        // Fallback to hardcoded values if API fails
        setBloodTypes([
          { id: 1, name: 'A+' },
          { id: 2, name: 'A-' },
          { id: 3, name: 'B+' },
          { id: 4, name: 'B-' },
          { id: 5, name: 'AB+' },
          { id: 6, name: 'AB-' },
          { id: 7, name: 'O+' },
          { id: 8, name: 'O-' }
        ]);
      }
    };

    const fetchGenders = async () => {
      try {
        const response = await UserAPI.getGenders();
        if (response.status === 200) {
          const genderData = response.data.result || response.data;
          setGenders(genderData);
        }
      } catch (error) {
        console.error("Error fetching genders:", error);
      }
    };

    const fetchOccupations = async () => {
      try {
        const response = await UserAPI.getOccupations();
        if (response.status === 200) {
          const occupationData = response.data.result || response.data;
          setOccupations(occupationData);
        }
      } catch (error) {
        console.error("Error fetching occupations:", error);
      }
    };

    const fetchRegistrationStatuses = async () => {
      try {
        const response = await UserAPI.getRegistrationStatuses();
        if (response.status === 200) {
          const statusData = response.data.result || response.data;
          setRegistrationStatuses(statusData);
        }
      } catch (error) {
        console.error("Error fetching registration statuses:", error);
        // Fallback to hardcoded values if API fails
        setRegistrationStatuses([
          { id: 1, name: 'Đang chờ xác nhận' },
          { id: 2, name: 'Đã xác nhận' },
          { id: 3, name: 'Đã hoàn thành' },
          { id: 4, name: 'Đã hủy' },
          { id: 5, name: 'No Show' }
        ]);
      }
    };

    const fetchTimeSlots = async () => {
      try {
        const response = await UserAPI.getTimeSlots();
        if (response.status === 200) {
          const timeSlotsData = response.data.result || response.data;
          setTimeSlots(timeSlotsData);
        }
      } catch (error) {
        console.error("Error fetching time slots:", error);
        // Don't set fallback as time slots are dynamic
      }
    };

    const fetchDonationSchedule = async () => {
      try {
        const response = await UserAPI.getDonationSchedule();
        if (response.status === 200) {
          const scheduleData = response.data || [];
          setDonationSchedule(scheduleData);
        }
      } catch (error) {
        console.error("Error fetching donation schedule:", error);
        // Don't set fallback as schedule is dynamic
      }
    };

    const fetchDonationRecords = async () => {
      try {
        const response = await UserAPI.getUserDonationRecords();
        if (response.status === 200) {
          const recordsData = response.data || [];
          setDonationRecords(recordsData);
        }
      } catch (error) {
        console.error("Error fetching donation records:", error);
        setDonationRecords([]);
      }
    };

    const fetchDonationTypes = async () => {
      try {
        const response = await UserAPI.getDonationTypes();
        if (response.status === 200) {
          const typesData = response.data.result || response.data;
          const typesMap = {};
          typesData.forEach(type => {
            typesMap[type.id] = type;
          });
          setDonationTypes(typesMap);
        }
      } catch (error) {
        console.error("Error fetching donation types:", error);
      }
    };

    const fetchBloodTestResults = async () => {
      try {
        const response = await UserAPI.getBloodTestResults();
        if (response.status === 200) {
          const resultsData = response.data.result || response.data;
          const resultsMap = {};
          resultsData.forEach(result => {
            resultsMap[result.id] = result;
          });
          setBloodTestResults(resultsMap);
        }
      } catch (error) {
        console.error("Error fetching blood test results:", error);
      }
    };

    fetchUserProfile();
    fetchBloodTypes();
    fetchGenders();
    fetchOccupations();
    fetchRegistrationStatuses();
    fetchTimeSlots();    fetchDonationSchedule();
    fetchDonationRecords();
    fetchDonationTypes();
    fetchBloodTestResults();    // Fetch thông tin hiến máu từ API getUserById
    fetchDonationInfo();
  }, [navigate, location]);

  // Debug useEffect to track donationInfo changes
  useEffect(() => {
    console.log("🔄 donationInfo state changed:", donationInfo);
  }, [donationInfo]);
  const fetchRegistrations = async () => {
    try {
      setRegistrationsLoading(true);
      const token = localStorage.getItem("token");
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      console.log("Fetching registrations - Token:", token ? "Available" : "Not available");
      console.log("Fetching registrations - UserInfo:", userInfo);

      if (!token || !userInfo) {
        console.log("No token or user info available for fetching registrations");
        return;
      }

      console.log("Calling API to get all registrations");
      const response = await UserAPI.getDonationRegistrations();
      console.log("Registrations API response:", response);
      console.log("Registrations API response status:", response.status);
      console.log("Registrations API response data:", response.data);
        if (response.status === 200) {
        // Filter registrations for current user
        const userId = userInfo.UserId || userInfo.UserID || userInfo.id;
        console.log("Current user ID:", userId);
        console.log("User ID type:", typeof userId);
        
        const allRegistrations = response.data || [];
        console.log("All registrations:", allRegistrations);
        console.log("Total registrations count:", allRegistrations.length);
        
        // Log some sample donorIds to see the format
        if (allRegistrations.length > 0) {
          console.log("Sample donorIds:", allRegistrations.slice(0, 5).map(reg => ({
            registrationId: reg.registrationId,
            donorId: reg.donorId,
            donorIdType: typeof reg.donorId
          })));
        }
        
        // Filter by donorId matching current user - try both string and number comparison
        const userRegistrations = allRegistrations.filter(reg => {
          const donorId = reg.donorId || reg.DonorId || reg.donorID || reg.DonorID;
          const match = donorId === userId || 
                       donorId === parseInt(userId) || 
                       donorId === String(userId) ||
                       parseInt(donorId) === parseInt(userId);
          
          if (match) {
            console.log("Found matching registration:", reg);
          }
          
          return match;
        });        console.log("User registrations after filtering:", userRegistrations);
        console.log("Filtered registrations count:", userRegistrations.length);
        setRegistrations(userRegistrations);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      // Don't show error message as this might be normal for new users
    } finally {
      setRegistrationsLoading(false);
    }
  };// Fetch registrations when user data is available
  useEffect(() => {
    if (user) {
      fetchRegistrations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleEditProfile = useCallback(() => {
    // Check if user data is available before proceeding
    if (!user) {
      console.warn('User data not available yet, cannot enable edit mode');
      return;
    }

    setEditMode(true);
  }, [user]);

  // Auto-enable edit mode when user data is loaded and update is required
  useEffect(() => {
    if (user && showUpdateRequired && !isProfileComplete(user)) {
      // Auto-enable edit mode after user data is loaded only if profile is incomplete
      const timer = setTimeout(() => {
        handleEditProfile();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user, showUpdateRequired, handleEditProfile]);
  // Initialize edit values when edit mode is enabled
  useEffect(() => {
    if (editMode && user && genders.length > 0 && bloodTypes.length > 0 && occupations.length > 0) {
      const genderIdValue = user.GenderId || user.GenderID;
      const bloodTypeIdValue = user.BloodTypeId || user.BloodTypeID;
      const occupationIdValue = user.OccupationId || user.OccupationID;
      
      // Ensure IDs are numbers for proper matching
      const parsedGenderId = genderIdValue ? parseInt(genderIdValue) : null;
      const parsedBloodTypeId = bloodTypeIdValue ? parseInt(bloodTypeIdValue) : null;
      const parsedOccupationId = occupationIdValue ? parseInt(occupationIdValue) : null;
      
      setEditValues({
        fullName: user.FullName || user.name || '',
        email: user.Email || user.email || '',
        phoneNumber: user.PhoneNumber || '',
        address: user.Address || '',
        nationalID: user.NationalId || user.NationalID || '',
        dateOfBirth: user.DateOfBirth || null,
        genderID: parsedGenderId,
        bloodTypeID: parsedBloodTypeId,        occupationID: parsedOccupationId
      });
    }
  }, [editMode, user, genders, bloodTypes, occupations]);

  const handleSaveProfile = async () => {
    try {
      setEditLoading(true);
        // Prepare the data for API
      const updateData = {
        FullName: editValues.fullName,
        Email: editValues.email,
        PhoneNumber: editValues.phoneNumber,
        Address: editValues.address,
        NationalID: editValues.nationalID,
        DateOfBirth: editValues.dateOfBirth,
        GenderID: editValues.genderID,
        BloodTypeID: editValues.bloodTypeID,
        OccupationID: editValues.occupationID
      };

      // Call the update API  
      const userId = user.UserId || user.UserID;
      const response = await UserAPI.updateUserProfile(userId, updateData);
      
      if (response.status === 200) {
        // Update the local user state
        const updatedUser = { ...user, ...updateData };
        setUser(updatedUser);
        
        // Update localStorage as well
        localStorage.setItem("userInfo", JSON.stringify(updatedUser));
        
        setEditMode(false);
        setEditValues({});
        
        // Show appropriate success message based on profile completeness
        if (isProfileComplete(updatedUser)) {
          message.success('Hồ sơ đã được cập nhật thành công! Bây giờ bạn có thể đăng ký hiến máu.');
          // Clear the update required flag only when profile is complete
          setShowUpdateRequired(false);
          
          // Update URL to remove updateRequired parameter
          const url = new URL(window.location);
          url.searchParams.delete('updateRequired');
          window.history.replaceState({}, '', url);
        } else {
          message.success('Hồ sơ đã được cập nhật thành công! Vui lòng hoàn thiện thông tin còn lại.');
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Failed to update profile. Please try again.');
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditValues({});
  };

  const handleFieldChange = (field, value) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get schedule date by scheduleId
  const getScheduleDateById = (scheduleId) => {
    if (!scheduleId || !donationSchedule.length) return 'N/A';
    
    const schedule = donationSchedule.find(s => s.scheduleId === scheduleId || s.ScheduleId === scheduleId || s.id === scheduleId);
    return schedule ? formatDate(schedule.scheduleDate || schedule.ScheduleDate) : 'N/A';
  };

  // Refresh registrations data
  const refreshRegistrations = () => {
    fetchRegistrations();
  };

  // Handle cancel registration
  const handleCancelRegistration = async (registrationId) => {
    try {
      setRegistrationsLoading(true);
      const response = await UserAPI.cancelDonationRegistration(registrationId);
      
      if (response.status === 200) {
        message.success('Đã hủy đăng ký hiến máu thành công!');
        // Refresh the registrations list
        await fetchRegistrations();
      }
    } catch (error) {
      console.error('Error canceling registration:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Không thể hủy đăng ký. Vui lòng thử lại sau.');
      }
    } finally {
      setRegistrationsLoading(false);
    }
  };

  // Check if profile is complete
  const isProfileComplete = (userData) => {
    if (!userData) return false;
    
    const requiredFields = [
      userData.FullName || userData.name,
      userData.Email || userData.email,
      userData.PhoneNumber,
      userData.Address,
      userData.DateOfBirth,
      userData.GenderId || userData.GenderID,
      userData.BloodTypeId || userData.BloodTypeID,
      userData.OccupationId || userData.OccupationID
    ];
    
    return requiredFields.every(field => field !== null && field !== undefined && field !== '');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getBloodTypeDisplay = (bloodTypeID) => {
    // Handle both field name cases
    const bloodTypeIdValue = bloodTypeID || user?.BloodTypeId || user?.BloodTypeID;
    
    if (!bloodTypeIdValue || bloodTypes.length === 0) return 'Not specified';
    
    const bloodType = bloodTypes.find(bt => bt.id === bloodTypeIdValue || bt.id === parseInt(bloodTypeIdValue));
    return bloodType ? bloodType.name : 'Not specified';
  };

  const getGenderDisplay = (genderID) => {
    // Handle both field name cases
    const genderIdValue = genderID || user?.GenderId || user?.GenderID;
    
    if (!genderIdValue || genders.length === 0) return 'Not specified';
    
    // Handle both string and number comparison
    const gender = genders.find(g => g.id === genderIdValue || g.id === parseInt(genderIdValue));
    
    return gender ? gender.name : 'Not specified';
  };

  const getOccupationDisplay = (occupationID) => {
    // Handle both field name cases
    const occupationIdValue = occupationID || user?.OccupationId || user?.OccupationID;
    
    if (!occupationIdValue || occupations.length === 0) return 'Not specified';
    
    // Handle both string and number comparison
    const occupation = occupations.find(o => o.id === occupationIdValue || o.id === parseInt(occupationIdValue));
    return occupation ? occupation.name : 'Not specified';
  };  // Helper functions for registration status
  const getStatusColor = (statusId) => {
    // Get status name from lookup array
    const status = registrationStatuses.find(s => s.id === statusId);
    const statusName = status ? status.name.toLowerCase() : '';
    
    if (statusName.includes('chờ') || statusName.includes('pending')) {
      return 'orange';
    } else if (statusName.includes('xác nhận') || statusName.includes('confirmed')) {
      return 'green';
    } else if (statusName.includes('hủy') || statusName.includes('cancelled')) {
      return 'red';
    } else if (statusName.includes('hoàn thành') || statusName.includes('completed')) {
      return 'blue';
    } else if (statusName.includes('no show')) {
      return 'volcano';
    }
    
    // Fallback colors based on ID
    switch (statusId) {
      case 1:
        return 'orange'; // Đang chờ xác nhận
      case 2:
        return 'green'; // Đã xác nhận
      case 3:
        return 'blue'; // Đã hoàn thành
      case 4:
        return 'red'; // Đã hủy
      case 5:
        return 'volcano'; // No Show
      default:
        return 'default';
    }
  };

  const getStatusText = (statusId) => {
    // Get status name from lookup array
    const status = registrationStatuses.find(s => s.id === statusId);
    if (status) {
      return status.name;
    }
    
    // Fallback text based on ID
    switch (statusId) {
      case 1:
        return 'Đang chờ xác nhận';
      case 2:
        return 'Đã xác nhận';
      case 3:
        return 'Đã hoàn thành';
      case 4:
        return 'Đã hủy';
      case 5:
        return 'No Show';
      default:
        return 'Không xác định';
    }
  };  // Helper function for timeslot display with short format
  const getTimeSlotDisplay = (timeslotId) => {
    if (!timeslotId) return 'N/A';
    
    // Find timeslot from lookup array
    const timeSlot = timeSlots.find(ts => ts.id === timeslotId || ts.timeSlotId === timeslotId);
    
    if (timeSlot) {
      // Try different possible field names for time display
      const timeDisplay = timeSlot.timeRange || timeSlot.time || timeSlot.name || 
                         `${timeSlot.startTime} - ${timeSlot.endTime}` ||
                         `${timeSlot.StartTime} - ${timeSlot.EndTime}`;
      
      if (timeDisplay && !timeDisplay.includes('undefined')) {
        // Format time to short format (HH:mm - HH:mm)
        // Remove seconds from time format: 10:00:00 -> 10:00
        const formatted = timeDisplay.replace(/:\d{2}(?=\s*[-\s]|$)/g, '');
        return formatted;
      }
    }
    
    // Fallback to slot ID if no time info found
    return `Slot ${timeslotId}`;
  };

  // Helper functions for donation records
  const getDonationRecordByRegistrationId = (registrationId) => {
    return donationRecords.find(record => 
      (record.registrationId || record.RegistrationId) === registrationId
    );
  };

  const getDonationTypeName = (typeId) => {
    if (!typeId || !donationTypes[typeId]) {
      return 'N/A';
    }
    return donationTypes[typeId].name;
  };

  const getBloodTestResultTag = (resultId) => {
    if (!resultId || !bloodTestResults[resultId]) {
      return <Tag color="default">N/A</Tag>;
    }

    const result = bloodTestResults[resultId];
    const name = result.name;
    
    // Color mapping based on result names
    let color = 'default';
    if (name.includes('Đang chờ xét nghiệm')) {
      color = 'orange';
    } else if (name.includes('Máu đạt')) {
      color = 'green';
    } else if (name.includes('Máu không đạt')) {
      color = 'red';
    } else if (name.includes('Chưa có kết quả')) {
      color = 'gray';
    }
    
    return <Tag color={color}>{name}</Tag>;
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
    if (!bp) return 'N/A';
    return bp;
  };

  const handleViewDonationDetail = async (registrationId) => {
    try {
      const donationRecord = getDonationRecordByRegistrationId(registrationId);
      if (!donationRecord) {
        message.warning('Không tìm thấy hồ sơ hiến máu cho đăng ký này');
        return;
      }

      setSelectedDonationRecord(donationRecord);
      setDonationDetailVisible(true);
    } catch (error) {
      console.error('Error viewing donation detail:', error);
      message.error('Không thể xem chi tiết hồ sơ hiến máu');
    }
  };

  const handleCloseDonationDetail = () => {
    setSelectedDonationRecord(null);
    setDonationDetailVisible(false);
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-error">
        <Text type="danger">Failed to load user profile</Text>
      </div>
    );
  }

  return (
    <Layout>
      <Header />
      <Navbar />
      <div className="profile-page">
        <div className="profile-container">
          <Title level={2} className="profile-title">
            <UserOutlined /> Hồ Sơ Cá Nhân
          </Title>

                     {/* Update Required Alert */}
           {(showUpdateRequired || !isProfileComplete(user)) && user && !isProfileComplete(user) && (
             <Alert
               message="Cập nhật thông tin cá nhân cần thiết"
               description="Để có thể đăng ký hiến máu, vui lòng cập nhật đầy đủ thông tin cá nhân của bạn bao gồm: họ tên, số điện thoại, địa chỉ, ngày sinh, giới tính và nhóm máu."
               type="warning"
               icon={<ExclamationCircleOutlined />}
               showIcon
               style={{ marginBottom: 24 }}
             />
           )}

          <Row gutter={[24, 24]}>
            {/* Profile Header Card */}
            <Col span={24}>
              <Card className="profile-header-card">
                <div className="profile-header">                  <Avatar
                    size={120}
                    src={user.picture || "/images/huy1.png"} // Use Google profile picture if available
                    icon={<UserOutlined />}
                    className="profile-avatar"
                  />
                  <div className="profile-header-info">                    <Title level={3} className="profile-name">
                      {user.FullName || user.name || 'Full Name'}
                    </Title>
                    <Text className="profile-username">@{user.UserName || user.email?.split('@')[0] || 'username'}</Text>                    <div className="profile-tags">
                      <Tag color="blue">
                        Nhóm máu: {getBloodTypeDisplay(user.BloodTypeID)}
                      </Tag>
                    </div>
                  </div>
                  <div className="profile-actions">
                    {!editMode ? (
                      <Button type="primary" icon={<EditOutlined />} onClick={handleEditProfile}>
                        Chỉnh sửa
                      </Button>
                    ) : (
                      <Space>
                        <Button onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                        <Button type="primary" loading={editLoading} onClick={handleSaveProfile}>
                          Save Changes
                        </Button>
                      </Space>
                    )}
                  </div>
                </div>
              </Card>
            </Col>

            {/* Personal Information */}
            <Col xs={24} lg={12}>
              <Card title="Thông Tin Cá Nhân" className="profile-info-card">
                <Descriptions column={1} size="middle">                  <Descriptions.Item 
                    label={<span><UserOutlined /> Họ và Tên</span>}
                  >
                    {!editMode ? (
                      user.FullName || user.name || 'Not specified'
                    ) : (
                      <Input 
                        value={editValues.fullName || ''}
                        onChange={(e) => handleFieldChange('fullName', e.target.value)}
                        placeholder="Enter full name"
                      />
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span><IdcardOutlined /> Số CMND/CCCD</span>}
                  >
                    {!editMode ? (
                      user.NationalId || user.NationalID || 'Not specified'
                    ) : (
                      <Input 
                        value={editValues.nationalID || ''}
                        onChange={(e) => handleFieldChange('nationalID', e.target.value)}
                        placeholder="Enter national ID"
                      />                    )}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span><EnvironmentOutlined /> Địa Chỉ</span>}
                  >
                    {!editMode ? (
                      user.Address || 'Not specified'
                    ) : (
                      <Input.TextArea 
                        value={editValues.address || ''}
                        onChange={(e) => handleFieldChange('address', e.target.value)}
                        placeholder="Enter address"
                        rows={2}
                      />
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span><BankOutlined /> Nghề Nghiệp</span>}
                  >
                    {!editMode ? (
                      getOccupationDisplay(user.OccupationId || user.OccupationID)
                    ) : (
                      occupations.length > 0 ? (
                        <Select 
                          key={`occupation-select-${occupations.length}-${editValues.occupationID}`}
                          value={editValues.occupationID}
                          onChange={(value) => handleFieldChange('occupationID', value)}
                          placeholder="Select occupation"
                          style={{ width: '100%' }}
                        >
                          {occupations.map(occupation => (
                            <Option key={occupation.id} value={occupation.id}>
                              {occupation.name}
                            </Option>
                          ))}
                        </Select>
                      ) : (
                        <Select placeholder="Loading occupations..." disabled style={{ width: '100%' }} />
                      )                    )}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span><HeartOutlined /> Nhóm Máu</span>}
                  >
                    {!editMode ? (
                      getBloodTypeDisplay(user.BloodTypeId || user.BloodTypeID)
                    ) : (
                      bloodTypes.length > 0 ? (
                        <Select 
                          key={`bloodtype-select-${bloodTypes.length}-${editValues.bloodTypeID}`}
                          value={editValues.bloodTypeID}
                          onChange={(value) => handleFieldChange('bloodTypeID', value)}
                          placeholder="Select blood type"
                          style={{ width: '100%' }}
                        >
                          {bloodTypes.map(bloodType => (
                            <Option key={bloodType.id} value={bloodType.id}>
                              {bloodType.name}
                            </Option>
                          ))}
                        </Select>
                      ) : (
                        <Select placeholder="Loading blood types..." disabled style={{ width: '100%' }} />
                      )
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* Contact & Account Information */}
            <Col xs={24} lg={12}>
              <Card title="Thông Tin Liên Hệ" className="profile-info-card">
                <Descriptions column={1} size="middle">                  <Descriptions.Item 
                    label={<span><MailOutlined /> Email</span>}
                  >
                    <span style={{ color: editMode ? '#999' : 'inherit' }}>
                      {user.Email || user.email || 'Not specified'}
                    </span>
                    {editMode && (
                      <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                        (Không thể chỉnh sửa)
                      </Text>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span><UserOutlined /> Username</span>}
                  >
                    {user.Username || user.UserName || user.email?.split('@')[0] || 'Not specified'}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span><PhoneOutlined /> Số Điện Thoại</span>}
                  >
                    {!editMode ? (
                      user.PhoneNumber || 'Not specified'
                    ) : (
                      <Input 
                        value={editValues.phoneNumber || ''}
                        onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                        placeholder="Enter phone number"
                      />
                    )}                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* Donation Information */}
            <Col span={24}>              <Card 
                title={
                  <span>
                    <HeartOutlined style={{ marginRight: '8px', color: '#ff4d4f' }} />
                    Thông Tin Hiến Máu
                  </span>
                } 
                className="profile-donation-card"
                loading={donationInfoLoading}
              >
                <Row gutter={[24, 16]}>
                  <Col xs={24} sm={8}>
                    <div className="donation-stat">
                      <div className="stat-icon">
                        <HeartOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />
                      </div>
                      <div className="stat-content">                        <div className="stat-label">Số lần hiến máu</div>                        <div className="stat-value">
                          {(() => {
                            const count = donationInfo?.donationCount ?? user?.donationCount ?? user?.DonationCount ?? 0;
                            console.log("🎯 Display donationCount - Current state:", {
                              donationInfo: donationInfo,
                              donationInfoCount: donationInfo?.donationCount,
                              userDonationCount: user?.donationCount,
                              userDonationCountCaps: user?.DonationCount,
                              finalValue: count
                            });
                            return count;
                          })()} lần
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
                        <div className="stat-label">Lần hiến gần nhất</div>
                        <div className="stat-value">
                          {(donationInfo?.lastDonationDate || user?.lastDonationDate || user?.LastDonationDate)
                            ? formatDate(donationInfo?.lastDonationDate || user?.lastDonationDate || user?.LastDonationDate)
                            : 'Chưa hiến máu'
                          }
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
                        <div className="stat-label">Có thể hiến tiếp</div>
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
              <Card title="Lịch Đã Đăng Kí" className="profile-schedule-card">
                <div className="schedule-content">
                  {registrationsLoading ? (
                    <div className="schedule-loading">
                      <Spin size="large" />
                      <Text style={{ marginTop: '16px', display: 'block', textAlign: 'center' }}>
                        Đang tải thông tin lịch đăng kí...
                      </Text>
                    </div>
                  ) : registrations.length > 0 ? (                    <Table
                      dataSource={registrations}
                      rowKey="registrationId"
                      pagination={false}
                      className="registration-table"
                      size="large"                      columns={[
                        {
                          title: 'Mã Đăng Ký (Registration ID)',
                          dataIndex: 'registrationId',
                          key: 'registrationId',
                          width: '15%',
                          render: (registrationId) => <strong>#{registrationId || 'N/A'}</strong>
                        },                        {
                          title: 'Ngày đăng kí',
                          dataIndex: 'createdAt',
                          key: 'createdAt',
                          width: '18%',
                          render: (date) => formatDate(date)
                        },
                        {
                          title: 'Ngày hiến máu',
                          key: 'donationDate',
                          width: '18%',
                          render: (_, record) => {
                            // Try multiple possible field names for scheduleId
                            const scheduleId = record.scheduleId || record.ScheduleId || record.scheduleID || record.ScheduleID;
                            return getScheduleDateById(scheduleId);
                          }
                        },
                        {
                          title: 'Trạng thái',
                          dataIndex: 'registrationStatusId',
                          key: 'status',
                          width: '15%',
                          render: (statusId) => (
                            <Tag color={getStatusColor(statusId)}>
                              {getStatusText(statusId)}
                            </Tag>
                          )
                        },                        {
                          title: 'Khung giờ',
                          key: 'timeslot',
                          width: '15%',
                          render: (_, record) => {
                            // Try multiple possible field names
                            const timeslotId = record.timeslotId || record.timeSlotId || record.TimeslotId || record.TimeSlotId;
                            
                            return getTimeSlotDisplay(timeslotId);
                          }
                        },
                        {
                          title: 'Chi tiết hiến máu',
                          key: 'donationRecord',
                          width: '18%',
                          render: (_, record) => {
                            const statusId = record.registrationStatusId;
                            const registrationId = record.registrationId;
                            const donationRecord = getDonationRecordByRegistrationId(registrationId);
                            
                            // Only show donation record details for completed donations (status 3)
                            if (statusId === 3 && donationRecord) {
                              return (
                                <Button 
                                  type="primary"
                                  size="small"
                                  onClick={() => handleViewDonationDetail(registrationId)}
                                >
                                  Xem chi tiết
                                </Button>
                              );
                            } else if (statusId === 3 && !donationRecord) {
                              return (
                                <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                                  Chưa có hồ sơ
                                </Text>
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
                          title: 'Thao tác',
                          key: 'actions',
                          width: '14%',
                          render: (_, record) => {
                            const statusId = record.registrationStatusId;
                            const registrationId = record.registrationId;
                            
                            // Only allow cancellation when status is 1 (Đang chờ hiến)
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
                      <div className="placeholder-actions">                        <Button 
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
                    {formatDateTime(selectedDonationRecord.donationDateTime || selectedDonationRecord.DonationDateTime)}
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
              <Col span={12}>
                <div className="form-field">
                  <label className="form-label">KHÔNG THỂ HIẾN MÁU</label>
                  <div className="form-value">
                    <input 
                      type="checkbox" 
                      checked={selectedDonationRecord.cannotDonate || selectedDonationRecord.CannotDonate || false}
                      disabled
                      style={{ pointerEvents: 'none' }}
                    />
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

      <Footer />
    </Layout>
  );
};

export default ProfilePage;