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
  message
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
import Footer from '../components/Footer';
import { UserAPI } from '../api/User';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

const BookingPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();  const location = useLocation();
  const preservedData = location.state?.preservedBookingData;
  const bookingComplete = location.state?.bookingComplete;const [formValues, setFormValues] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [donationSchedule, setDonationSchedule] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(false);
  
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
      }        setUserProfile(userData);
      
      // Auto-fill form with user information
      // Handle different possible field names from different data sources
      form.setFieldsValue({
        fullName: userData.FullName || userData.fullName || userData.name || '',
        phone: userData.PhoneNumber || userData.phone || userData.phoneNumber || '',
        email: userData.email || userData.Email || ''
      });
    } else {
      setIsLoggedIn(false);
      setUserProfile(null);
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
    
    // Check if time slot is selected
    if (!selectedTimeSlot) {
      form.setFields([{
        name: 'donationSlot',
        errors: ['Vui lòng chọn thời gian hiến máu']
      }]);
      return;
    }
    if (!selectedTimeSlot) {
      form.setFields([{
        name: 'donationSlot',
        errors: ['Vui lòng chọn thời gian hiến máu']
      }]);
      return;
    }
    
    // Check authentication before proceeding to eligibility form
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!user || !token) {      // Store form data temporarily for after login
      sessionStorage.setItem('pendingBookingData', JSON.stringify({
        ...values,
        timeSlotId: selectedTimeSlot
      }));
      
      // Show login modal instead of redirecting
      setShowLoginModal(true);
      return;    }
    
    // Include donation type and time slot in the booking data and safely handle date
    const completeBookingData = {
      ...values,
      timeSlotId: selectedTimeSlot, // Include selected time slot ID
      userId: JSON.parse(user).id // Add user ID to booking data
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
    navigate('/eligibility', { state: { bookingData: completeBookingData } });
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
  const handleDonationRegistration = async (values) => {
    setLoading(true);
    try {
      // Manual validation for date
      const donationDate = form.getFieldValue('donationDate');
      if (!donationDate) {
        form.setFields([{
          name: 'donationDate',
          errors: ['Vui lòng chọn ngày hiến máu']
        }]);
        setLoading(false);
        return;
      }
      
      // Validate if selected date is available in donation schedule
      if (availableDates.length > 0) {
        const selectedDateStr = donationDate.format('YYYY-MM-DD');
        const isDateAvailable = availableDates.some(date => 
          date.startsWith(selectedDateStr)
        );
        
        if (!isDateAvailable) {
          form.setFields([{
            name: 'donationDate',
            errors: ['Ngày được chọn không có sẵn trong lịch hiến máu. Vui lòng chọn ngày khác']
          }]);
          setLoading(false);
          return;
        }
      }
      
      // Check if time slot is selected
      if (!selectedTimeSlot) {
        form.setFields([{
          name: 'donationSlot',
          errors: ['Vui lòng chọn thời gian hiến máu']
        }]);
        setLoading(false);
        return;
      }
      
      // Check authentication
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!user || !token) {
        // Store form data temporarily for after login
        sessionStorage.setItem('pendingBookingData', JSON.stringify({
          ...values,
          timeSlotId: selectedTimeSlot
        }));
        
        setShowLoginModal(true);
        setLoading(false);
        return;
      }
      
      // Prepare donation registration data
      const userData = JSON.parse(user);
      
      // Find matching schedule
      const selectedDateStr = donationDate.format('YYYY-MM-DD');
      const matchingSchedule = donationSchedule.find(schedule => 
        schedule.scheduleDate && schedule.scheduleDate.startsWith(selectedDateStr)
      );
      
      const donationData = {
        donorId: userData.id,        scheduleId: matchingSchedule ? matchingSchedule.scheduleId : 2, // Default schedule ID
        timeSlotId: selectedTimeSlot
      };
      
      console.log('Sending donation registration data:', donationData);
      
      // Call API to register donation
      const response = await UserAPI.registerDonation(donationData);
      
      if (response.status === 200) {
        Modal.success({
          title: 'Đăng ký thành công!',
          content: 'Bạn đã đăng ký hiến máu thành công. Vui lòng đến đúng giờ để hiến máu.',
          onOk: () => {
            // Reset form
            form.resetFields();
            setSelectedTimeSlot(null);
            
            // Navigate to profile or home page
            navigate('/profile');
          }
        });
      }
      
    } catch (error) {
      console.error('Error registering donation:', error);
      
      let errorMessage = 'Đã có lỗi xảy ra khi đăng ký hiến máu. Vui lòng thử lại.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      }
      
      Modal.error({
        title: 'Đăng ký thất bại',
        content: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };
  
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
      <Header />
      <Navbar />

      {/* Hero Section */}
      <div className="booking-hero-wrapper">
        <div className="hero-section-compact">
          <div className="booking-hero-container">
            <Row align="middle" gutter={[60, 32]} className="booking-hero-row">
              <Col xs={24} md={12}>
                <div className="booking-hero-content">
                  <Title level={1} className="booking-hero-title">
                    Hiến Máu, Cứu Sống Người
                  </Title>
                  
                  <Paragraph className="booking-hero-description">
                    Sự đóng góp của bạn có thể giúp cứu sống tới 3 người. Quy trình hiến 
                    máu an toàn, đơn giản và chỉ mất không quá một giờ từ đầu đến cuối.
                  </Paragraph>
                  
                  <Button 
                    size="large"
                    className="hero-button"
                    icon={<CalendarOutlined />}
                    onClick={() => document.getElementById('booking-form').scrollIntoView({ behavior: 'smooth' })}
                  >
                    ĐẶT LỊCH HIẾN MÁU NGAY
                  </Button>
                  
                  
                </div>
              </Col>
              
              <Col xs={24} md={12}>
                <div className="booking-hero-image-container">
                  <img 
                    src="/images/hero_banner_2.jpg" 
                    alt="Hiến máu cứu người"
                    className="booking-hero-image"
                  />
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>

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
                          rules={[
                            { required: true, message: 'Vui lòng nhập họ và tên' },
                            { min: 2, message: 'Tên phải có ít nhất 2 ký tự' }
                          ]}
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
                          rules={[
                            { required: true, message: 'Vui lòng nhập số điện thoại' },
                            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
                          ]}
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
                          rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' }
                          ]}
                        >
                          <Input 
                            className="form-input"
                            placeholder="Nhập địa chỉ email"
                            disabled={isLoggedIn}
                          />
                        </Form.Item>
                      </Col>
                      
                      <Col xs={24} md={12}>                        <Form.Item
                          label="Ngày hiến"
                          name="donationDate"
                          rules={[{ required: true, message: 'Vui lòng chọn ngày hiến máu' }]}
                          normalize={(value) => {
                            // Ensure we return a dayjs object
                            return value && dayjs.isDayjs(value) ? value : (value ? dayjs(value) : null);
                          }}                          getValueFromEvent={(value) => {
                            console.log('DatePicker value received:', value);
                            return value;
                          }}
                        ><DatePicker 
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
                            }}
                            disabledDate={(current) => {
                              if (!current) return false;
                              
                              // Disable past dates  
                              if (current.isBefore(dayjs(), 'day')) return true;
                              
                              // If we have available dates from API, only allow those dates
                              if (availableDates.length > 0) {
                                const currentDateStr = current.format('YYYY-MM-DD');
                                return !availableDates.some(date => 
                                  date.startsWith(currentDateStr)
                                );
                              }
                              
                              // If no available dates from API, allow all future dates
                              return false;
                            }}
                          /></Form.Item>
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
                    )}                    <Form.Item
                      label="Thời gian hiến máu"
                      name="donationSlot"
                      rules={[{ required: true, message: 'Vui lòng chọn thời gian hiến máu' }]}
                    >
                      <div className="time-slot-group time-slot-wrapper">                        <div className="time-slot-options">
                          {timeSlots.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                              Đang tải khung giờ hiến máu...
                            </div>
                          )}
                          {timeSlots.map((slot) => {
                            return (<div 
                                key={slot.timeSlotId}
                                className={`time-slot-option ${selectedTimeSlot === slot.timeSlotId ? 'selected' : ''}`}                                onClick={() => {
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
                                <div className="time-slot-content">
                                  <div className="time-slot-title">{slot.timeSlotName}</div>
                                  <div className="time-slot-time">
                                    {slot.startTime && slot.endTime ? 
                                      `${slot.startTime.substring(0,5)} - ${slot.endTime.substring(0,5)}` :
                                      'Thời gian chưa xác định'
                                    }
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </Form.Item>

                    <div className="form-submit-section">
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        size="large"
                        className="submit-button"
                        icon={<CalendarOutlined />}
                        loading={loading}
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
