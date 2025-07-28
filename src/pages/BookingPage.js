import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { 
  Layout, 
  Typography, 
  Row, 
  Col, 
  Button, 
  Form,
  Input,
  DatePicker,
  Modal,
  message,
  notification
} from 'antd';
import { 
  HeartOutlined, 
  CalendarOutlined, 
  UserOutlined,
  LoginOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import ProfileWarning from '../components/ProfileWarning';
import Footer from '../components/Footer';
import { UserAPI } from '../api/User';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

const BookingPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [api, contextHolder] = notification.useNotification();
  const preservedData = location.state?.preservedBookingData;
  const bookingComplete = location.state?.bookingComplete;  const [formValues, setFormValues] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [donationSchedule, setDonationSchedule] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  
  // Check if user profile is complete
  const isProfileComplete = (userProfile) => {
    if (!userProfile) return false;
    
    const requiredFields = [
      userProfile.FullName || userProfile.name,
      userProfile.PhoneNumber,
      userProfile.Address,
      userProfile.DateOfBirth,
      userProfile.GenderId || userProfile.GenderID,
      userProfile.BloodTypeId || userProfile.BloodTypeID
    ];
    
    return requiredFields.every(field => field != null && field !== '');
  };
  
  // Handle navigation and scroll effects
  useEffect(() => {
    // Scroll to form when there's a hash in URL (từ trang chủ)
    if (window.location.hash === '#booking-form') {
      const timer = setTimeout(() => {
        const formElement = document.getElementById('booking-form');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300); // Small delay for page load

      return () => clearTimeout(timer);
    } else {
      // Scroll to top when navigating to booking page without hash
      window.scrollTo(0, 0);
    }
  }, []);
  // Check if user is logged in and auto-fill form
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const userInfo = localStorage.getItem('userInfo');
    
    if (token && (user || userInfo)) {
      setIsLoggedIn(true);
      
      // Try to get user data from either source
      let userData = null;
      if (userInfo) {
        userData = JSON.parse(userInfo);
      } else if (user) {
        userData = JSON.parse(user);
      }        
      
      // Auto-fill form with user information
      // Handle different possible field names from different data sources
      form.setFieldsValue({
        fullName: userData.FullName || userData.fullName || userData.name || '',
        phone: userData.PhoneNumber || userData.phone || userData.phoneNumber || '',
        email: userData.email || userData.Email || '',
        nationalId: userData.NationalId || userData.NationalID || userData.nationalId || userData.citizenId || ''
      });
      
      console.log('User data for auto-fill:', userData);
    } else {
      setIsLoggedIn(false);
    }
  }, [form]);
  // Fetch time slots from API
  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const response = await UserAPI.getTimeSlots();
        
        if (response.status === 200) {
          const timeSlotsData = response.data || [];
          
          // Filter out deleted slots and format for display
          const availableSlots = timeSlotsData.filter(slot => !slot.isDeleted);
          
          setTimeSlots(availableSlots);
        }      } catch (error) {
        // Fallback to hardcoded slots if API fails
        const fallbackSlots = [
          {
            timeSlotId: 1,
            timeSlotName: 'Slot 1',
            startTime: '08:00:00',
            endTime: '10:00:00',
            isDeleted: false
          },
          {
            timeSlotId: 2,
            timeSlotName: 'Slot 2',
            startTime: '10:00:00', 
            endTime: '12:00:00',
            isDeleted: false
          }
        ];
        
        setTimeSlots(fallbackSlots);
      }
    };

    fetchTimeSlots();
  }, []);

  // Fetch donation schedule from API
  useEffect(() => {
    const fetchDonationSchedule = async () => {
      try {
        const response = await UserAPI.getDonationSchedule();
        
        if (response.status === 200) {
          const scheduleData = response.data || [];
          setDonationSchedule(scheduleData);          // Extract unique dates from schedule
          const uniqueDates = [...new Set(scheduleData.map(item => item.scheduleDate))];
          setAvailableDates(uniqueDates);
        }
      } catch (error) {
        // Fallback to allowing all dates if API fails
        setAvailableDates([]);
      }
    };

    fetchDonationSchedule();
  }, []);

  // Restore form data when coming back from eligibility page
  useEffect(() => {
    if (preservedData) {
      // Create a copy of preserved data to avoid mutating the original
      const formData = { ...preservedData };
      
      // Skip date field to avoid validation issues - user will need to re-select date
      delete formData.donationDate;
        form.setFieldsValue(formData);
      // Also restore selected time slot if it was preserved
      if (preservedData.timeSlotId) {
        setSelectedTimeSlot(preservedData.timeSlotId);
      }
    }
  }, [preservedData, form]);  // Clear any validation errors on mount
  useEffect(() => {
    // Small delay to ensure form is ready
    const timer = setTimeout(() => {
      form.clearValidate?.();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [form]);  const handleFormSubmit = (values) => {
    console.log('✅ Form submit SUCCESS! Values:', values);
    
    // Validate required fields with custom error messages
    const fieldValidations = [];
    
    // Check date selection
    if (!values.donationDate) {
      fieldValidations.push({
        name: 'donationDate',
        errors: ['Vui lòng chọn ngày hiến máu']
      });
    }
    
    // Check time slot selection
    if (!selectedTimeSlot) {
      fieldValidations.push({
        name: 'donationSlot',
        errors: ['Vui lòng chọn khung giờ hiến máu']
      });
    }
    
    // If there are validation errors for date/time, show them and return
    if (fieldValidations.length > 0) {
      form.setFields(fieldValidations);
      return;
    }
    
    // Check authentication before proceeding
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');
    
    if ((!user && !userInfo) || !token) {
      // Store form data temporarily for after login
      sessionStorage.setItem('pendingBookingData', JSON.stringify({
        ...values,
        timeSlotId: selectedTimeSlot
      }));
      
      // Show login modal instead of redirecting
      setShowLoginModal(true);
      return;
    }

    // Get user profile data
    let userData = null;
    if (userInfo) {
      userData = JSON.parse(userInfo);
    } else if (user) {
      userData = JSON.parse(user);
    }

    console.log('BookingPage - userData for validation:', userData);
    console.log('BookingPage - isProfileComplete:', isProfileComplete(userData));

    // Check individual fields from profile and show notification if missing
    const missingFields = [];
    const fieldChecks = [
      { field: userData.FullName || userData.name, name: 'Họ và tên' },
      { field: userData.PhoneNumber, name: 'Số điện thoại' },
      { field: userData.Address, name: 'Địa chỉ' },
      { field: userData.DateOfBirth, name: 'Ngày sinh' },
      { field: userData.GenderId || userData.GenderID, name: 'Giới tính' },
      { field: userData.BloodTypeId || userData.BloodTypeID, name: 'Nhóm máu' }
    ];

    fieldChecks.forEach(check => {
      if (!check.field || check.field === '') {
        missingFields.push(check.name);
      }
    });

    if (missingFields.length > 0) {
      // Show notification similar to ProfilePage
      api.error({
        message: 'Thiếu thông tin bắt buộc!',
        description: 'Vui lòng cập nhật đầy đủ thông tin để được hiến máu!',
        placement: 'topRight',
        duration: 4,
      });
      
      // Also show a detailed modal
      Modal.error({
        title: 'Thông tin cá nhân chưa đầy đủ',
        content: (
          <div>
            <p style={{ marginBottom: '15px' }}>
              Để có thể đăng ký hiến máu, bạn cần hoàn thành đầy đủ thông tin cá nhân bao gồm:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
              {missingFields.map((field, index) => (
                <li key={index} style={{ color: '#dc2626' }}>{field}</li>
              ))}
            </ul>
            <p style={{ marginTop: '15px', color: '#dc2626', fontWeight: '500' }}>
              Vui lòng cập nhật thông tin tại trang cá nhân trước khi đăng ký hiến máu.
            </p>
          </div>
        ),
        okText: 'Đi tới trang cá nhân',
        okButtonProps: {
          style: {
            backgroundColor: '#dc2626',
            borderColor: '#dc2626'
          }
        },
        onOk: () => {
          navigate('/profile');
        }
      });
      return;
    }
    
    // Include donation type and time slot in the booking data and safely handle date
    const completeBookingData = {
      ...values,
      timeSlotId: selectedTimeSlot, // Include selected time slot ID
      userId: userData.id || userData.userId // Add user ID to booking data
    };
    
    // Safely convert date to string for state transfer and find schedule info
    if (values.donationDate) {
      try {
        const selectedDateStr = values.donationDate.format ? 
          values.donationDate.format('YYYY-MM-DD') : 
          values.donationDate.toString();
          
        completeBookingData.donationDate = selectedDateStr;
          // Find corresponding schedule entry for validation
        const matchingSchedule = donationSchedule.find(schedule => 
          schedule.scheduleDate && schedule.scheduleDate.startsWith(selectedDateStr)
        );
        
        if (matchingSchedule) {
          // Include schedule information in booking data
          completeBookingData.scheduleId = matchingSchedule.scheduleId;
          completeBookingData.scheduleDate = matchingSchedule.scheduleDate;
        } else if (availableDates.length > 0) {
          // If we have available dates but no matching schedule, this is an error
          form.setFields([{
            name: 'donationDate',
            errors: ['Ngày được chọn không khớp với lịch hiến máu. Vui lòng chọn lại']
          }]);
          return;
        }
      } catch (error) {
        completeBookingData.donationDate = null;
      }
    }
      // Navigate to eligibility form
    navigate('/eligibility-form', { state: { bookingData: completeBookingData } });
  };const handleLoginClick = () => {    // Save booking data to sessionStorage before redirecting
    if (form.getFieldsValue()) {
      sessionStorage.setItem('pendingBookingData', JSON.stringify({
        ...form.getFieldsValue(),
        timeSlotId: selectedTimeSlot
      }));
    }
    
    navigate('/login', {
      state: {
        redirectPath: '/booking',
        preserveHash: window.location.hash
      }
    });
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
  };



  // Handle direct donation registration
  
  // Xử lý thông báo khi booking hoàn thành
  useEffect(() => {
    if (bookingComplete) {
      message.success({
        content: 'Cảm ơn bạn đã đăng ký hiến máu! Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.',
        duration: 8,
      });
    }
    
    // Xử lý thông báo khi user đã đăng ký rồi
    if (location.state?.alreadyRegistered) {
      const customMessage = location.state?.message;
      message.info({
        content: customMessage || 'Bạn đã có lịch hiến máu. Vui lòng kiểm tra thông tin hoặc chọn ngày khác.',
        duration: 6,
      });
    }
  }, [bookingComplete, location.state]);
  
  return (
    <Layout>
      {contextHolder}
      <Header />
      <Navbar />
      <ProfileWarning />

      <Content className="booking-content">
        {/* Form đăng ký hiến máu */}
        <section className="registration-form-section" id="booking-form">
          <div className="container">
            <div className="form-header">
              <Title level={2} className="form-title">
                <HeartOutlined className="form-title-icon" />
                Đăng Ký Hiến Máu
              </Title>
              <Paragraph className="form-subtitle">
                Một hành động nhỏ, một sự sống lớn. Hãy cùng chúng tôi cứu sống những con người cần giúp đỡ.
              </Paragraph>
            </div>
            
            <Row justify="center">
              <Col xs={24} lg={20} xl={18}>
                <div className="form-container">                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}                    onFinishFailed={(errorInfo) => {
                      console.log('❌ Form validation FAILED:', errorInfo);
                      console.log('Failed fields:', errorInfo.errorFields);
                    }}
                    onValuesChange={(changedValues, allValues) => setFormValues(allValues)}
                    requiredMark={false}
                    size="large"
                    className="donation-form"
                  ><Row gutter={[24, 24]}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Họ và tên"
                          name="fullName"
                        >
                          <Input 
                            className="form-input"
                            placeholder="Nhập họ tên đầy đủ"
                            disabled={isLoggedIn}
                          />
                        </Form.Item>
                      </Col>
                      
                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Số điện thoại"
                          name="phone"
                        >
                          <Input 
                            className="form-input"
                            placeholder="Nhập số điện thoại"
                            disabled={isLoggedIn}
                          />
                        </Form.Item>
                      </Col>
                    </Row>                    <Row gutter={[24, 24]}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Email"
                          name="email"
                        >
                          <Input 
                            className="form-input"
                            placeholder="Nhập địa chỉ email"
                            disabled={isLoggedIn}
                          />
                        </Form.Item>
                      </Col>
                      
                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Số CMND/CCCD"
                          name="nationalId"
                        >
                          <Input 
                            className="form-input"
                            placeholder="Nhập số căn cước công dân"
                            disabled={isLoggedIn}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={[24, 24]}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Chọn ngày hiến"
                          name="donationDate"
                          rules={[{ required: true, message: 'Vui lòng chọn ngày hiến máu' }]}
                          normalize={(value) => {
                            // Ensure we return a dayjs object
                            return value && dayjs.isDayjs(value) ? value : (value ? dayjs(value) : null);
                          }}
                          getValueFromEvent={(value) => {
                            console.log('DatePicker value received:', value);
                            return value;
                          }}
                        >
                          <DatePicker 
                            className="form-input"
                            placeholder="Chọn ngày hiến máu"
                            format="DD/MM/YYYY"
                            size="large"
                            style={{ width: '100%' }}
                            onChange={(date) => {
                              // Clear any previous errors when user selects a date
                              if (date) {
                                form.setFields([{
                                  name: 'donationDate',
                                  errors: []
                                }]);
                              }
                              
                              // Reset time slot selection when date changes
                              setSelectedTimeSlot(null);
                              form.setFieldsValue({ donationSlot: null });
                            }}
                            disabledDate={(current) => {
                              if (!current) return false;
                              
                              // Disable past dates  
                              if (current.isBefore(dayjs(), 'day')) return true;
                              
                              // Giới hạn chỉ cho phép đặt lịch trong vòng 7 ngày tính từ hôm nay
                              const maxDate = dayjs().add(7, 'day');
                              if (current.isAfter(maxDate, 'day')) return true;
                              
                              // If we have available dates from API, only allow those dates within 7 days
                              if (availableDates.length > 0) {
                                const currentDateStr = current.format('YYYY-MM-DD');
                                return !availableDates.some(date => 
                                  date.startsWith(currentDateStr)
                                );
                              }
                              
                              // If no available dates from API, allow all dates within 7 days
                              return false;
                            }}
                          />
                        </Form.Item>
                      </Col>
                      
                      <Col xs={24} md={12}>
                        {/* Empty column for layout balance */}
                      </Col>
                    </Row>

                    {isLoggedIn && (
                      <Row gutter={[24, 24]}>
                        <Col xs={24}>
                          <div style={{ 
                            padding: '12px 16px', 
                            backgroundColor: '#f6ffed', 
                            border: '1px solid #b7eb8f', 
                            borderRadius: '6px',
                            marginBottom: '16px'
                          }}>
                            <Text style={{ color: '#52c41a' }}>
                              <UserOutlined style={{ marginRight: '8px' }} />
                              Thông tin cá nhân đã được điền tự động. 
                              Để thay đổi thông tin, vui lòng cập nhật trong{' '}
                              <Button 
                                type="link" 
                                size="small" 
                                style={{ padding: 0, height: 'auto' }}
                                onClick={() => navigate('/profile')}
                              >
                                trang cá nhân
                              </Button>
                              .
                            </Text>
                          </div>
                        </Col>
                      </Row>
                    )}                    {/* Only show time slots after date is selected */}
                    {form.getFieldValue('donationDate') && (
                      <Form.Item
                        label="Chọn khung giờ hiến máu"
                        name="donationSlot"
                        rules={[{ required: true, message: 'Vui lòng chọn khung giờ hiến máu' }]}
                      >
                      <div className="time-slot-wrapper">
                        <div className="time-slot-subtitle">
                          Thời gian nhận hồ sơ
                        </div>
                        <div className="time-slot-options">
                          {timeSlots.length === 0 && (
                            <div className="time-slot-loading">
                              Đang tải khung giờ hiến máu...
                            </div>
                          )}
                          {timeSlots.map((slot) => {
                            // Kiểm tra xem khung giờ có bị ẩn không (đã qua 30 phút trước khi kết thúc)
                            const isSlotHidden = () => {
                              const selectedDate = form.getFieldValue('donationDate');
                              if (!selectedDate || !slot.endTime) return false;
                              
                              // Chỉ ẩn khung giờ nếu ngày được chọn là hôm nay
                              const isToday = selectedDate.isSame(dayjs(), 'day');
                              if (!isToday) return false;
                              
                              // Lấy thời gian hiện tại
                              const now = dayjs();
                              
                              // Tạo thời gian kết thúc của khung giờ hôm nay
                              const endHour = parseInt(slot.endTime.substring(0,2));
                              const endMinute = parseInt(slot.endTime.substring(3,5));
                              const endTime = dayjs().hour(endHour).minute(endMinute).second(0).millisecond(0);
                              
                              // Thời gian ẩn khung giờ = thời gian kết thúc - 30 phút
                              const hideTime = endTime.subtract(30, 'minute');
                              
                              console.log(`Slot ${slot.timeSlotId}: ${slot.startTime}-${slot.endTime}`);
                              console.log(`Current time: ${now.format('HH:mm:ss')}`);
                              console.log(`Hide time: ${hideTime.format('HH:mm:ss')}`);
                              console.log(`Should hide: ${now.isAfter(hideTime)}`);
                              
                              return now.isAfter(hideTime);
                            };

                            // Nếu khung giờ bị ẩn thì không render
                            if (isSlotHidden()) {
                              return null;
                            }

                            return (<div 
                                key={slot.timeSlotId}
                                className={`time-slot-item ${selectedTimeSlot === slot.timeSlotId ? 'selected' : ''}`}
                                onClick={() => {
                                  const currentValue = selectedTimeSlot;
                                  const newValue = currentValue === slot.timeSlotId ? null : slot.timeSlotId;
                                  setSelectedTimeSlot(newValue);
                                  form.setFieldsValue({ donationSlot: newValue });
                                  setFormValues({ ...formValues, donationSlot: newValue });
                                  
                                  // Trigger validation for donation slot
                                  if (newValue) {
                                    form.validateFields(['donationSlot']);
                                  }
                                }}
                              >
                                <div className="time-slot-time">
                                  {slot.startTime && slot.endTime ? 
                                    `${slot.startTime.substring(0,5)} - ${slot.endTime.substring(0,5)}` :
                                    'Thời gian chưa xác định'
                                  }
                                </div>
                              </div>
                            );
                          }).filter(Boolean)}
                        </div>
                      </div>
                    </Form.Item>
                    )}

                    <div className="form-submit-section">
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        size="large"
                        className="submit-button"
                        icon={<CalendarOutlined />}
                      >
                        Đăng Ký Hiến Máu
                      </Button>
                    </div>
                  </Form>
                </div>
              </Col>
            </Row>
          </div>
        </section>

      </Content>

      <Footer />      {/* Modal thông báo đăng nhập */}
      <Modal
        open={showLoginModal}
        onCancel={handleCloseModal}
        footer={null}
        className="login-notification-modal"
        centered
        width={480}
      >
        <div className="login-modal-content">
          <div className="login-modal-icon">
            <UserOutlined style={{ fontSize: '48px', color: '#dc2626' }} />
          </div>
          
          <Title level={3} className="login-modal-title" style={{ textAlign: 'center', marginTop: '16px' }}>
            Yêu Cầu Đăng Nhập
          </Title>
          
          <Paragraph className="login-modal-description" style={{ textAlign: 'center', marginBottom: '24px' }}>
            Bạn cần đăng nhập để thực hiện đăng ký hiến máu. Thông tin đặt lịch của bạn sẽ được lưu lại.
          </Paragraph>

          <div className="login-modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Button 
              type="primary" 
              size="large"
              icon={<LoginOutlined />}
              onClick={handleLoginClick}
              className="login-button"
            >
              Đăng Nhập
            </Button>
            
            <Button 
              size="large"
              onClick={handleRegisterClick}
              className="register-button"
            >
              Đăng Ký
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default BookingPage;
