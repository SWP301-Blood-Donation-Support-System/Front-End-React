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
  message,
  Modal,
  Tag,
  Space
} from 'antd';
import { 
  HeartOutlined, 
  CheckCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EditOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  CheckOutlined,
  ExclamationCircleOutlined
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
      return `${timeSlot.startTime.slice(0, 5)} - ${timeSlot.endTime.slice(0, 5)}`;
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
    // Check validation before proceeding
    const validationResults = getValidationResults();
    
    if (!validationResults.isEligible) {
      let errorTitle = '';
      let errorMessage = '';
      
      if (validationResults.validationType === 'warning') {
        errorTitle = 'Không thể đăng ký';
        errorMessage = validationResults.statusMessage + '\n\n' + validationResults.failedChecks.join('\n');
      } else {
        errorTitle = 'Chưa đủ điều kiện hiến máu';
        errorMessage = 'Vui lòng kiểm tra lại các thông tin trong phần "Kết quả đánh giá" và liên hệ với chúng tôi để được tư vấn thêm.';
      }
      
      Modal.error({
        title: errorTitle,
        content: errorMessage,
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Kiểm tra authentication
      const userInfo = localStorage.getItem('userInfo');
      const token = localStorage.getItem('token');
      
      if (!userInfo || !token) {
        message.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
        return;
      }

      // Lấy thông tin user
      const userData = JSON.parse(userInfo);
      const donorId = userData.UserID || userData.UserId || userData.id || userData.userId || userData.Id;
      
      // Chuẩn bị dữ liệu đăng ký
      const donationData = {
        donorId: donorId,
        scheduleId: bookingData.scheduleId || 2, // Default fallback
        timeSlotId: bookingData.timeSlotId
      };
      
      // Validation
      if (!donorId || !bookingData.timeSlotId) {
        throw new Error('Thiếu thông tin cần thiết để đăng ký');
      }

      // Gọi API đăng ký
      const response = await UserAPI.registerDonation(donationData);
      
      if (response.status === 200 || response.status === 201) {
        // Prepare donation registration notification data
        const donationRegistrationNotification = {
          message: 'Đăng ký hiến máu thành công!',
          description: 'Cảm ơn bạn đã đăng ký hiến máu, vui lòng kiểm tra email',
        };
        
        // Also store in sessionStorage as backup
        sessionStorage.setItem('showDonationSuccessNotification', 'true');
        
        // Navigate to donation schedule page with notification
        navigate('/donation-schedule', { 
          state: { donationRegistrationNotification } 
        });
      } else {
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

  // Xử lý chỉnh sửa thông tin đặt lịch
  const handleEditBooking = () => {
    navigate('/booking', { 
      state: { 
        preservedBookingData: bookingData 
      } 
    });
  };

  // Xử lý xem lại phiếu đăng ký hiến máu (chỉ xem, không chỉnh sửa)
  const handleViewEligibilityForm = () => {
    navigate('/eligibility', { 
      state: { 
        bookingData: bookingData,
        preservedEligibilityData: eligibilityData,
        viewOnly: true // Flag để báo rằng chỉ xem, không cho chỉnh sửa
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
      title: 'Phiếu đăng ký hiến máu',
      status: 'finish',
      icon: <FileTextOutlined />
    },
    {
      title: 'Xác nhận',
      status: 'process',
      icon: <CheckOutlined />
    }
  ];

  // Validation logic - replicated from EligibilityFormPage
  const checkEligibility = (formData) => {
    const ineligibleConditions = [
      // Question 3: Serious diseases - if user selects "yes" 
      formData.seriousDiseases?.includes('yes'),
      
      // Question 4: Recent diseases/procedures in last 12 months
      formData.last12Months?.includes('recovered_diseases') ||
      formData.last12Months?.includes('blood_transfusion'),
      
      // Question 5: Issues in last 6 months
      formData.last6Months?.includes('recovered_6months') ||
      formData.last6Months?.includes('weight_loss') ||
      formData.last6Months?.includes('prolonged_swelling') ||
      formData.last6Months?.includes('drug_use') ||
      formData.last6Months?.includes('hepatitis_contact') ||
      formData.last6Months?.includes('sexual_contact_risk'),
      
      // Question 6: Recent illnesses in last month
      formData.last1Month?.includes('recovered_1month') ||
      formData.last1Month?.includes('epidemic_area'),
      
      // Question 7: Recent symptoms in last 14 days
      formData.last14Days?.includes('flu_symptoms'),
      
      // Question 8: Recent medication in last 7 days
      formData.last7Days?.includes('medication'),
      
      // Question 9: Pregnancy related
      formData.femaleQuestions?.includes('pregnant_nursing') ||
      formData.femaleQuestions?.includes('pregnancy_termination')
    ];

    const hasIneligibleCondition = ineligibleConditions.some(condition => condition === true);
    return !hasIneligibleCondition;
  };

  // Get comprehensive validation results including all scheduling validations
  const getValidationResults = () => {
    if (!eligibilityData) return { 
      isEligible: false, 
      failedChecks: ['Không có dữ liệu đánh giá'],
      validationType: 'error'
    };
    
    // Check form eligibility first
    const formEligible = checkEligibility(eligibilityData);
    const failedChecks = [];
    let validationType = 'success'; // success, warning, error
    let statusMessage = 'Đủ điều kiện hiến máu';
    
    // Check donation date eligibility (from EligibilityFormPage logic)
    const userEligibleDate = eligibilityData.userEligibleDate || eligibilityData.nextEligibleDonationDate;
    const daysLeft = eligibilityData.daysLeft || 0;
    let isEligibleByDate = true;
    
    if (userEligibleDate) {
      const currentDate = new Date();
      const nextEligibleDate = new Date(userEligibleDate);
      currentDate.setHours(0, 0, 0, 0);
      nextEligibleDate.setHours(0, 0, 0, 0);
      isEligibleByDate = nextEligibleDate <= currentDate;
    }
    
    // Check if user already has pending registrations
    const hasExistingRegistrations = eligibilityData.hasExistingRegistrations || false;
    
    // Priority 1: Check form eligibility FIRST (most important)
    if (!formEligible) {
      validationType = 'error';
      statusMessage = 'Chưa đủ điều kiện hiến máu';
      
      // Check each condition and add to failed checks if applicable
      if (eligibilityData.seriousDiseases?.includes('yes')) {
        failedChecks.push('Có tiền sử bệnh nghiêm trọng');
      }
      
      if (eligibilityData.last12Months?.includes('recovered_diseases')) {
        failedChecks.push('Đã khỏi bệnh nghiêm trọng trong 12 tháng qua');
      }
      
      if (eligibilityData.last12Months?.includes('blood_transfusion')) {
        failedChecks.push('Đã được truyền máu trong 12 tháng qua');
      }
      
      if (eligibilityData.last6Months?.includes('recovered_6months')) {
        failedChecks.push('Đã khỏi bệnh nghiêm trọng trong 6 tháng qua');
      }
      
      if (eligibilityData.last6Months?.includes('weight_loss')) {
        failedChecks.push('Sút cân nhanh không rõ nguyên nhân trong 6 tháng qua');
      }
      
      if (eligibilityData.last6Months?.includes('prolonged_swelling')) {
        failedChecks.push('Nổi hạch kéo dài trong 6 tháng qua');
      }
      
      if (eligibilityData.last6Months?.includes('drug_use')) {
        failedChecks.push('Sử dụng ma túy trong 6 tháng qua');
      }
      
      if (eligibilityData.last6Months?.includes('hepatitis_contact')) {
        failedChecks.push('Sinh sống chung với người nhiễm viêm gan B trong 6 tháng qua');
      }
      
      if (eligibilityData.last6Months?.includes('sexual_contact_risk')) {
        failedChecks.push('Quan hệ tình dục với người có nguy cơ cao trong 6 tháng qua');
      }
      
      if (eligibilityData.last1Month?.includes('recovered_1month')) {
        failedChecks.push('Đã khỏi bệnh trong 1 tháng qua');
      }
      
      if (eligibilityData.last1Month?.includes('epidemic_area')) {
        failedChecks.push('Đi vào vùng có dịch bệnh trong 1 tháng qua');
      }
      
      if (eligibilityData.last14Days?.includes('flu_symptoms')) {
        failedChecks.push('Có triệu chứng cúm, cảm lạnh trong 14 ngày qua');
      }
      
      if (eligibilityData.last7Days?.includes('medication')) {
        failedChecks.push('Sử dụng thuốc kháng sinh, kháng viêm trong 7 ngày qua');
      }
      
      if (eligibilityData.femaleQuestions?.includes('pregnant_nursing')) {
        failedChecks.push('Đang mang thai hoặc nuôi con dưới 12 tháng tuổi');
      }
      
      if (eligibilityData.femaleQuestions?.includes('pregnancy_termination')) {
        failedChecks.push('Chấm dứt thai kỳ trong 12 tháng qua');
      }
      
      return { isEligible: false, failedChecks, validationType, statusMessage };
    }
    
    // Priority 2: Check if user already has pending registration (only if eligible by form)
    if (hasExistingRegistrations) {
      validationType = 'warning';
      statusMessage = 'Bạn đã đăng ký lịch hiến máu gần đây rồi!';
      failedChecks.push('Đã có lịch hiến máu đang chờ');
      failedChecks.push('Vui lòng đợi tới ngày hiến hoặc huỷ lịch hiện tại để đăng ký lại');
      return { isEligible: false, failedChecks, validationType, statusMessage };
    }
    
    // Priority 3: Check donation date eligibility (only if eligible by form and no existing registrations)
    if (!isEligibleByDate && daysLeft > 0) {
      validationType = 'warning';
      statusMessage = 'Bạn chưa thể hiến máu lúc này!';
      failedChecks.push('Để đảm bảo sức khỏe, bạn cần nghỉ ngơi ít nhất 12-16 tuần giữa các lần hiến máu');
      failedChecks.push(`Bạn có thể hiến máu trở lại sau: ${daysLeft} ngày nữa`);
      if (userEligibleDate) {
        failedChecks.push(`Ngày có thể hiến máu tiếp theo: ${new Date(userEligibleDate).toLocaleDateString('vi-VN')}`);
      }
      return { isEligible: false, failedChecks, validationType, statusMessage };
    }
    
    // All checks passed
    return { 
      isEligible: true, 
      failedChecks: [], 
      validationType: 'success',
      statusMessage: 'Đủ điều kiện hiến máu'
    };
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
                      Đặt lại lịch hẹn
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
                      icon={<InfoCircleOutlined />} 
                      onClick={handleViewEligibilityForm}
                      style={{ color: '#dc2626' }}
                    >
                      Xem lại phiếu đăng ký hiến máu
                    </Button>
                  </Space>
                }
                style={{ height: '100%' }}
              >
                {(() => {
                  const validationResults = getValidationResults();
                  
                  return (
                    <div>
                      {validationResults.validationType === 'success' ? (
                        <div style={{ marginBottom: '20px' }}>
                          <Tag icon={<CheckCircleOutlined />} color="success" style={{ fontSize: '14px', padding: '8px 16px', marginBottom: '16px' }}>
                            ✓ {validationResults.statusMessage}
                          </Tag>
                          <div style={{ marginTop: '16px', color: '#52c41a', fontSize: '14px' }}>
                            <CheckCircleOutlined style={{ marginRight: '8px' }} />
                            Tất cả các tiêu chí đánh giá đều đạt yêu cầu
                          </div>
                        </div>
                      ) : validationResults.validationType === 'warning' ? (
                        <div>
                          <Tag icon={<ExclamationCircleOutlined />} color="warning" style={{ fontSize: '14px', padding: '8px 16px', marginBottom: '16px' }}>
                            ⚠️ {validationResults.statusMessage}
                          </Tag>
                          <div style={{ marginBottom: '16px' }}>
                            <Text strong style={{ color: '#fa8c16', fontSize: '14px' }}>
                              Thông tin chi tiết:
                            </Text>
                            <div style={{ 
                              marginTop: '12px', 
                              padding: '12px', 
                              backgroundColor: '#fff7e6', 
                              borderRadius: '6px',
                              border: '1px solid #ffd591'
                            }}>
                              {validationResults.failedChecks.map((check, index) => (
                                <div key={index} style={{ 
                                  color: '#d46b08', 
                                  marginBottom: index < validationResults.failedChecks.length - 1 ? '8px' : '0', 
                                  fontSize: '13px',
                                  lineHeight: '1.5'
                                }}>
                                  • {check}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Tag icon={<ExclamationCircleOutlined />} color="error" style={{ fontSize: '14px', padding: '8px 16px', marginBottom: '16px' }}>
                            ✗ {validationResults.statusMessage}
                          </Tag>
                          <div style={{ marginBottom: '16px' }}>
                            <Text strong style={{ color: '#ff4d4f', fontSize: '14px' }}>
                              Các vấn đề cần lưu ý:
                            </Text>
                            <div style={{ 
                              marginTop: '12px', 
                              padding: '12px', 
                              backgroundColor: '#fff2f0', 
                              borderRadius: '6px',
                              border: '1px solid #ffccc7'
                            }}>
                              {validationResults.failedChecks.map((check, index) => (
                                <div key={index} style={{ 
                                  color: '#cf1322', 
                                  marginBottom: index < validationResults.failedChecks.length - 1 ? '6px' : '0', 
                                  fontSize: '13px',
                                  lineHeight: '1.5'
                                }}>
                                  • {check}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
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
            {(() => {
              const validationResults = getValidationResults();
              
              if (validationResults.isEligible) {
                return (
                  <div className="action-buttons-container" style={{ display: 'flex', gap: '16px', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button 
                      size="large" 
                      className="secondary-action"
                      onClick={() => {
                        navigate('/booking');
                      }}
                      style={{ 
                        borderColor: '#dc2626',
                        color: '#dc2626',
                        minWidth: '180px'
                      }}
                    >
                      Hủy đăng ký lịch hiện tại
                    </Button>
                    <Button 
                      type="primary" 
                      size="large" 
                      icon={<HeartOutlined />}
                      loading={loading}
                      onClick={handleConfirmRegistration}
                      className="primary-action"
                      style={{ 
                        backgroundColor: '#dc2626', 
                        borderColor: '#dc2626',
                        minWidth: '200px'
                      }}
                    >
                      Xác nhận đăng ký hiến máu
                    </Button>
                  </div>
                );
              } else if (validationResults.validationType === 'warning') {
                return (
                  <div className="action-buttons-container" style={{ display: 'flex', gap: '16px', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button 
                      size="large" 
                      className="secondary-action"
                      onClick={() => {
                        navigate('/');
                      }}
                      style={{ 
                        borderColor: '#ffc53d',
                        color: '#ffc53d',
                        minWidth: '160px'
                      }}
                    >
                      Quay về trang chủ
                    </Button>
                    <Button 
                      size="large" 
                      disabled
                      className="primary-action"
                      style={{ 
                        minWidth: '200px',
                        backgroundColor: '#ffc53d',
                        borderColor: '#ffc53d',
                        color: '#ffffff'
                      }}
                    >
                      Không thể đăng ký hiến máu
                    </Button>
                  </div>
                );
              } else {
                return (
                  <div className="action-buttons-container" style={{ display: 'flex', gap: '16px', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button 
                      size="large" 
                      className="secondary-action"
                      onClick={() => {
                        navigate('/');
                      }}
                      style={{ 
                        borderColor: '#ff7875',
                        color: '#ff7875',
                        minWidth: '160px'
                      }}
                    >
                      Quay về trang chủ
                    </Button>
                    <Button 
                      size="large" 
                      disabled
                      className="primary-action"
                      style={{ 
                        minWidth: '200px',
                        backgroundColor: '#ff7875',
                        borderColor: '#ff7875',
                        color: '#ffffff'
                      }}
                    >
                      Chưa đủ điều kiện hiến máu
                    </Button>
                  </div>
                );
              }
            })()}
          </Card>
        </div>
      </Content>
      
      <Footer />
    </Layout>
  );
};

export default ConfirmationPage;
