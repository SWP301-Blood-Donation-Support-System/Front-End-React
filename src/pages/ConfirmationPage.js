import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Button, 
  Descriptions,
  Steps,
  Divider,
  message,
  Modal,
  Tag,
  Space
} from 'antd';
import { 
  HeartOutlined, 
  CheckCircleOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EditOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { UserAPI } from '../api/User';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import ProfileWarning from '../components/ProfileWarning';
import Footer from '../components/Footer';

const { Title, Text } = Typography;
const { Content } = Layout;

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  
  // Lấy dữ liệu từ state
  const { bookingData, eligibilityData } = location.state || {};

  useEffect(() => {
    // Kiểm tra xem có đủ dữ liệu không
    if (!bookingData || !eligibilityData) {
      message.warning('Không tìm thấy thông tin đăng ký. Vui lòng bắt đầu lại từ trang đặt lịch.');
      navigate('/booking');
      return;
    }

    // Scroll to top
    window.scrollTo(0, 0);
    
    // Fetch time slots để hiển thị tên thời gian
    fetchTimeSlots();
  }, [navigate, bookingData, eligibilityData]);

  // Fetch time slots
  const fetchTimeSlots = async () => {
    try {
      const response = await UserAPI.getTimeSlots();
      if (response.status === 200) {
        setTimeSlots(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      // Fallback time slots
      setTimeSlots([
        { timeSlotId: 1, timeSlotName: 'Slot 1', startTime: '08:00:00', endTime: '10:00:00' },
        { timeSlotId: 2, timeSlotName: 'Slot 2', startTime: '10:00:00', endTime: '12:00:00' }
      ]);
    }
  };

  // Lấy thông tin time slot
  const getTimeSlotInfo = (timeSlotId) => {
    const timeSlot = timeSlots.find(slot => slot.timeSlotId === timeSlotId);
    if (timeSlot) {
      return `${timeSlot.timeSlotName} (${timeSlot.startTime.slice(0, 5)} - ${timeSlot.endTime.slice(0, 5)})`;
    }
    return 'Chưa xác định';
  };

  // Format ngày
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Chưa xác định';
    try {
      return dayjs(dateStr).format('DD/MM/YYYY');
    } catch {
      return dateStr;
    }
  };

  // Xử lý xác nhận đăng ký
  const handleConfirmRegistration = async () => {
    setLoading(true);
    
    try {
      // Kiểm tra authentication
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!user || !token) {
        message.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
        return;
      }

      // Lấy thông tin user
      const userData = JSON.parse(user);
      const donorId = userData.UserID || userData.UserId || userData.id || userData.userId || userData.Id;
      
      // Chuẩn bị dữ liệu đăng ký
      const donationData = {
        donorId: donorId,
        scheduleId: bookingData.scheduleId || 2, // Default fallback
        timeSlotId: bookingData.timeSlotId
      };
      
      console.log('Sending donation registration data:', donationData);
      
      // Validation
      if (!donorId || !bookingData.timeSlotId) {
        throw new Error('Thiếu thông tin cần thiết để đăng ký');
      }

      // Gọi API đăng ký
      const response = await UserAPI.registerDonation(donationData);
      
      console.log('API Response Status:', response.status);
      console.log('API Response Data:', response.data);
      
      if (response.status === 200 || response.status === 201) {
        console.log('Registration successful, navigating to donation-schedule with state:', {
          fromRegistration: true,
          message: 'Cảm ơn bạn đã đăng ký hiến máu! Chúng tôi sẽ liên hệ với bạn trong vòng 24h để xác nhận lịch hẹn.'
        });
        
        // Navigate to donation schedule page
        navigate('/donation-schedule');
      } else {
        console.log('Unexpected response status:', response.status);
        throw new Error('Có lỗi xảy ra khi đăng ký hiến máu');
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

  // Xử lý quay lại trang eligibility
  const handleBackToEligibility = () => {
    navigate('/eligibility', { 
      state: { 
        bookingData: bookingData,
        preservedEligibilityData: eligibilityData 
      } 
    });
  };

  // Xử lý chỉnh sửa thông tin đặt lịch
  const handleEditBooking = () => {
    navigate('/booking', { 
      state: { 
        preservedBookingData: bookingData 
      } 
    });
  };

  // Steps cho progress
  const steps = [
    {
      title: 'Thông tin đăng ký',
      status: 'finish',
      icon: <UserOutlined />
    },
    {
      title: 'Bảng câu hỏi',
      status: 'finish',
      icon: <FileTextOutlined />
    },
    {
      title: 'Xác nhận',
      status: 'process',
      icon: <CheckOutlined />
    }
  ];

  // Render answers cho eligibility form
  const renderEligibilityAnswers = () => {
    const answers = [];
    
    // Previous donation
    if (eligibilityData.previousDonation) {
      answers.push({
        question: 'Đã từng hiến máu',
        answer: eligibilityData.previousDonation === 'yes' ? 'Có' : 'Không'
      });
    }
    
    // Current illness
    if (eligibilityData.currentIllness) {
      answers.push({
        question: 'Hiện tại có mắc bệnh',
        answer: eligibilityData.currentIllness === 'yes' ? 'Có' : 'Không',
        details: eligibilityData.currentIllnessDetails
      });
    }
    
    // Serious diseases
    if (eligibilityData.seriousDiseases) {
      const values = Array.isArray(eligibilityData.seriousDiseases) ? eligibilityData.seriousDiseases : [eligibilityData.seriousDiseases];
      answers.push({
        question: 'Bệnh nghiêm trọng trong quá khứ',
        answer: values.includes('yes') ? 'Có' : values.includes('no') ? 'Không' : 'Bệnh khác',
        details: eligibilityData.seriousDiseasesDetails
      });
    }
    
    // Last 12 months
    if (eligibilityData.last12Months) {
      const values = Array.isArray(eligibilityData.last12Months) ? eligibilityData.last12Months : [eligibilityData.last12Months];
      answers.push({
        question: 'Tình trạng trong 12 tháng qua',
        answer: values.includes('none') ? 'Không có' : values.join(', ')
      });
    }
    
    // Last 6 months
    if (eligibilityData.last6Months) {
      const values = Array.isArray(eligibilityData.last6Months) ? eligibilityData.last6Months : [eligibilityData.last6Months];
      answers.push({
        question: 'Tình trạng trong 6 tháng qua',
        answer: values.includes('none') ? 'Không có' : values.join(', ')
      });
    }
    
    return answers;
  };

  if (!bookingData || !eligibilityData) {
    return (
      <Layout className="min-h-screen">
        <Header />
        <Navbar />
        <Content style={{ padding: '50px' }}>
          <div className="text-center">
            <Title level={3}>Không tìm thấy thông tin đăng ký</Title>
            <Button type="primary" onClick={() => navigate('/booking')}>
              Quay lại trang đặt lịch
            </Button>
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen confirmation-page">
      <Header />
      <Navbar />
      <ProfileWarning />
      
      <Content style={{ padding: '50px 0', backgroundColor: '#f5f5f5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          {/* Header with Steps */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Title level={2} style={{ color: '#dc2626', marginBottom: '8px' }}>
              <CheckCircleOutlined style={{ marginRight: '12px' }} />
              Xác Nhận Đăng Ký Hiến Máu
            </Title>
            <Text style={{ fontSize: '16px', color: '#6b7280' }}>
              Vui lòng kiểm tra lại thông tin của bạn trước khi xác nhận đăng ký hiến máu
            </Text>
          </div>

          {/* Steps */}
          <Card className="steps-card">
            <Steps current={2} items={steps} />
          </Card>

          <Row gutter={[24, 24]}>
            {/* Thông tin đặt lịch */}
            <Col xs={24} lg={12}>
              <Card
                className="booking-info-card"
                title={
                  <Space>
                    <CalendarOutlined style={{ color: '#dc2626' }} />
                    <span>Thông Tin Đăng Ký</span>
                    <Button 
                      type="link" 
                      icon={<EditOutlined />} 
                      onClick={handleEditBooking}
                      style={{ color: '#dc2626' }}
                    >
                      Chỉnh sửa
                    </Button>
                  </Space>
                }
                style={{ height: '100%' }}
              >
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Họ và tên">
                    <Text strong>{bookingData.fullName}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    <Text strong>{bookingData.phone}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    <Text strong>{bookingData.email}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="CCCD/CMND">
                    <Text strong>{bookingData.nationalId}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày hiến máu">
                    <Tag icon={<CalendarOutlined />} color="blue">
                      {formatDate(bookingData.donationDate)}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian">
                    <Tag icon={<ClockCircleOutlined />} color="green">
                      {getTimeSlotInfo(bookingData.timeSlotId)}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* Kết quả kiểm tra điều kiện */}
            <Col xs={24} lg={12}>
              <Card
                className="eligibility-results-card"
                title={
                  <Space>
                    <FileTextOutlined style={{ color: '#dc2626' }} />
                    <span>Kết Quả Đánh Giá</span>
                    <Button 
                      type="link" 
                      icon={<EditOutlined />} 
                      onClick={handleBackToEligibility}
                      style={{ color: '#dc2626' }}
                    >
                      Chỉnh sửa
                    </Button>
                  </Space>
                }
                style={{ height: '100%' }}
              >
                <div style={{ marginBottom: '20px' }}>
                  <Tag icon={<CheckCircleOutlined />} color="success" className="eligibility-status-tag success" style={{ fontSize: '14px', padding: '8px 16px' }}>
                    ✓ Đủ điều kiện hiến máu
                  </Tag>
                </div>
                
                <Divider orientation="left" style={{ fontSize: '14px', margin: '16px 0' }}>
                  Thông tin đã khai báo
                </Divider>
                
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {renderEligibilityAnswers().map((item, index) => (
                    <div key={index} className="eligibility-answer-item">
                      <div className="question-text">
                        {item.question}:
                      </div>
                      <div className="answer-text">{item.answer}</div>
                      {item.details && (
                        <div className="details-text">
                          Chi tiết: {item.details}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>

          {/* Lưu ý quan trọng */}
          <Card className="important-notes-card" style={{ marginTop: '30px' }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <InfoCircleOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                  Lưu ý quan trọng
                </Title>
              </div>
              
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <div className="note-item">
                    <CalendarOutlined className="note-icon" />
                    <div className="note-title">Đến đúng giờ</div>
                    <div className="note-description">
                      Vui lòng có mặt đúng thời gian đã đăng ký
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <div className="note-item">
                    <UserOutlined className="note-icon" />
                    <div className="note-title">Mang giấy tờ tùy thân</div>
                    <div className="note-description">
                      CCCD/CMND hoặc hộ chiếu còn hiệu lực
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <div className="note-item">
                    <HeartOutlined className="note-icon" />
                    <div className="note-title">Ăn uống đầy đủ</div>
                    <div className="note-description">
                      Ăn sáng và uống đủ nước trước khi hiến máu
                    </div>
                  </div>
                </Col>
              </Row>
            </Space>
          </Card>

          {/* Action buttons */}
          <Card className="action-buttons-card" style={{ marginTop: '30px', textAlign: 'center' }}>
            <Space size="large">
              <Button 
                size="large" 
                icon={<ArrowLeftOutlined />}
                onClick={handleBackToEligibility}
              >
                Quay lại
              </Button>
              <Button 
                type="primary" 
                size="large" 
                icon={<HeartOutlined />}
                loading={loading}
                onClick={handleConfirmRegistration}
                style={{ 
                  backgroundColor: '#dc2626', 
                  borderColor: '#dc2626',
                  minWidth: '200px'
                }}
              >
                Xác nhận đăng ký hiến máu
              </Button>
            </Space>
          </Card>
        </div>
      </Content>
      
      <Footer />
    </Layout>
  );
};

export default ConfirmationPage;
