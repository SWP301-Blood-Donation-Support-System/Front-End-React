import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { 
  Layout, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Button, 
  Steps, 
  Collapse,
  Divider,  Form,
  Input,
  DatePicker,
  Modal,
  message
} from 'antd';
import { 
  HeartOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined,
  QuestionCircleOutlined,
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

const BookingPage = () => {  const [donationType, setDonationType] = useState('whole-blood');
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
      // Also set donation type if it was preserved
      if (preservedData.donationType) {
        setDonationType(preservedData.donationType);
      }
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
        donationType,
        timeSlotId: selectedTimeSlot
      }));
      
      // Show login modal instead of redirecting
      setShowLoginModal(true);
      return;    }
    
    // Include donation type and time slot in the booking data and safely handle date
    const completeBookingData = {
      ...values,
      donationType, // Use the selected donation type from state
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
        donationType,
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

  const donationTypes = [
    {
      key: 'whole-blood',
      title: 'Hiến Máu Toàn Phần',
      description: 'Phù hợp với người hiến máu lần đầu. Quy trình đơn giản, an toàn và được sử dụng phổ biến nhất.',
      duration: '45-60 phút',
      volume: '450ml',
      frequency: 'Mỗi 3 tháng',
      benefits: ['Phù hợp với người hiến máu lần đầu', 'Quy trình đơn giản', 'Thời gian ngắn']
    },
    {
      key: 'platelets',
      title: 'Hiến Tiểu Cầu',
      description: 'Dành cho việc cứu chữa bệnh nhân ung thư, bỏng nặng. Cơ thể phục hồi nhanh sau khi hiến.',
      duration: '2-3 giờ',
      volume: 'Tùy theo trọng lượng',
      frequency: 'Mỗi 2 tuần',
      benefits: ['Giúp bệnh nhân ung thư', 'Phục hồi nhanh', 'Có thể hiến thường xuyên']
    },
    {
      key: 'plasma',
      title: 'Hiến Huyết Tương',
      description: 'Giúp điều trị bệnh nhân bỏng nặng, suy gan. Ít ảnh hưởng đến sức khỏe người hiến.',
      duration: '1.5-2 giờ',
      volume: '600-880ml',
      frequency: 'Mỗi 4 tuần',
      benefits: ['Giúp điều trị bỏng nặng', 'Hỗ trợ bệnh nhân suy gan', 'Ít ảnh hưởng đến sức khỏe']
    },
    {
      key: 'red-cells',
      title: 'Hiến Hồng Cầu',
      description: 'Hiệu quả cao cho bệnh nhân cần truyền máu thường xuyên. Đặc biệt phù hợp với nhóm máu hiếm.',
      duration: '1.5-2 giờ',
      volume: 'Tương đương 2 đơn vị máu',
      frequency: 'Mỗi 4 tháng',
      benefits: ['Hiệu quả cao cho bệnh nhân', 'Phù hợp với nhóm máu hiếm', 'Lượng thu được nhiều']
    }
  ];

  const donationSteps = [
    {
      title: 'Đăng ký',
      description: 'Điền thông tin cá nhân và đặt lịch hẹn'
    },
    {
      title: 'Kiểm tra sức khỏe',
      description: 'Đo huyết áp, nhiệt độ, kiểm tra hemoglobin'
    },
    {
      title: 'Tư vấn',
      description: 'Trao đổi với bác sĩ về loại hiến máu phù hợp'
    },
    {
      title: 'Hiến máu',
      description: 'Thực hiện quy trình hiến máu an toàn'
    },
    {
      title: 'Nghỉ ngơi',
      description: 'Ăn nhẹ và nghỉ ngơi 15-30 phút'
    }
  ];

  const faqData = [
    {
      key: '1',
      label: 'Có đau khi hiến máu không?',
      children: (
        <div>
          <p>
          Hầu hết người hiến máu chỉ cảm thấy hơi đau khi kim được đưa vào. 
          Trong suốt quá trình hiến máu, bạn sẽ chỉ cảm thấy khó chịu rất ít. 
          Đội ngũ nhân viên được đào tạo của chúng tôi có kỹ năng đảm bảo quá trình hiến máu của bạn được thoải mái nhất có thể.
          </p>
        </div>
      )
    },
    {
      key: '2',
      label: 'Hiến máu mất bao nhiêu thời gian?',
      children: (
        <div>
          <p>
          Toàn bộ quá trình mất khoảng một giờ từ đầu đến cuối. 
          Việc hiến máu thực tế thường kéo dài khoảng 8-10 phút, 
          nhưng bạn nên dành thời gian cho đăng ký, kiểm tra tiền sử sức khỏe, 
          kiểm tra thể chất cơ bản, và thời gian nghỉ ngơi sau khi hiến máu.
          </p>
        </div>
      )
    },
    {
      key: '3',
      label: 'Sau khi hiến máu tôi cần lưu ý gì?',
      children: (
        <div>
          <ul>
            <li>Giữ băng gạc ít nhất từ 4 đến 6 giờ</li>
            <li>Tránh các hoạt động nặng, gắng sức trong vòng 24 giờ</li>
            <li>Ăn uống đầy đủ dưỡng chất và uống nhiều nước</li>
            <li>Không hút thuốc lá trong 2 đến 3 giờ</li>
            <li>Nếu bạn cảm thấy chóng mặt, hãy nằm xuống với chân nâng cao</li>
            <li>Hãy liên hệ với trung tâm y tế nếu có gì bất thường</li>
          </ul>
        </div>
      )
    },
    {
      key: '4',
      label: 'Hiến máu có an toàn không?',
      children: (
        <div>
          <p>Hiến máu hoàn toàn an toàn khi được thực hiện tại các cơ sở y tế có đủ điều kiện:</p>
          <ul>
            <li>Dụng cụ y tế vô trùng, dùng một lần</li>
            <li>Quy trình nghiêm ngặt theo tiêu chuẩn WHO</li>
            <li>Có bác sĩ và điều dưỡng chuyên nghiệp</li>
            <li>Kiểm tra sức khỏe kỹ lưỡng trước khi hiến</li>
          </ul>
        </div>
      )
    },
    {
      key: '5',
      label: 'Tôi có thể hiến máu bao lâu một lần?',
      children: (
        <div>
          <p>Khoảng cách hiến máu tùy thuộc vào loại hiến máu:</p>
          <ul>
            <li><strong>Máu toàn phần:</strong> Ít nhất 3 tháng</li>
            <li><strong>Tiểu cầu:</strong> Ít nhất 2 tuần</li>
            <li><strong>Huyết tương:</strong> Ít nhất 4 tuần</li>
            <li><strong>Hồng cầu:</strong> Ít nhất 4 tháng</li>
          </ul>
        </div>
      )
    }
  ];

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
          donationType,
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
            setDonationType('whole-blood');
            
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
        {/* Quy trình hiến máu */}
        <section className="process-section">
          <div className="container">
            <Title level={2} className="section-title">
              Quy Trình Hiến Máu
            </Title>
            <Paragraph className="process-subtitle">
              Quy trình hiến máu đơn giản, an toàn và được thực hiện bởi đội ngũ y tế chuyên nghiệp
            </Paragraph>
            
            <Steps
              current={-1}
              items={donationSteps}
              className="donation-steps"
              size="default"
              direction="horizontal"
            />
          </div>
        </section>

        {/* Các loại hiến máu */}
        <section className="donation-types-section">
          <div className="container">
            <Title level={2} className="section-title">
              Các Loại Hiến Máu
            </Title>
            <Row gutter={[24, 24]}>
              {donationTypes.map((type, index) => (
                <Col xs={24} md={12} lg={6} key={type.key}>
                  <Card
                    hoverable
                    className={`donation-type-card ${donationType === type.key ? 'selected' : ''}`}
                    onClick={() => setDonationType(type.key)}
                  >
                    <div className="card-header">
                      <HeartOutlined className="card-icon" />
                      <Title level={4}>{type.title}</Title>
                    </div>
                    <Paragraph className="card-description">
                      {type.description}
                    </Paragraph>
                    <div className="card-details">
                      <div className="detail-item">
                        <ClockCircleOutlined /> <strong>Thời gian:</strong> {type.duration}
                      </div>
                      <div className="detail-item">
                        <strong>Lượng máu:</strong> {type.volume}
                      </div>
                      <div className="detail-item">
                        <strong>Tần suất:</strong> {type.frequency}
                      </div>
                      <Divider />
                      <div className="benefits">
                        <Text strong>Lợi ích:</Text>
                        <ul>
                          {type.benefits.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

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

        {/* FAQ Section */}
        <section className="faq-section">
          <div className="container">
            <Title level={2} className="section-title">
              <QuestionCircleOutlined /> Câu Hỏi Thường Gặp
            </Title>
            <Row justify="center">
              <Col xs={24} lg={20}>
                <Collapse
                  items={faqData}
                  defaultActiveKey={['1']}
                  className="faq-collapse"
                  size="large"
                />
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
