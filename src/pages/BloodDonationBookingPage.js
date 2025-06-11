import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Button, 
  Steps, 
  Collapse,
  Divider,
  Form,
  Input,
  Select,
  DatePicker,
  Radio,
  message
} from 'antd';
import { 
  HeartOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/BloodDonationBookingPage.css';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

const BloodDonationBookingPage = () => {
  const [donationType, setDonationType] = useState('whole-blood');
  const [form] = Form.useForm();  // Scroll to form when there's a hash in URL (từ trang chủ)
  useEffect(() => {
    if (window.location.hash === '#booking-form') {
      const timer = setTimeout(() => {
        const formElement = document.getElementById('booking-form');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300); // Small delay for page load

      return () => clearTimeout(timer);
    }
  }, []);
  
  const handleFormSubmit = (values) => {
    console.log('Form Data:', values);
    message.success({
      content: 'Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn trong vòng 24h để xác nhận lịch hẹn.',
      duration: 5,
    });
    form.resetFields();
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
      label: 'Ai có thể hiến máu?',
      children: (
        <div>
          <p>Để hiến máu, bạn cần đáp ứng các điều kiện sau:</p>
          <ul>
            <li>Tuổi từ 18-60 (lần đầu) hoặc 18-65 (đã hiến trước đó)</li>
            <li>Cân nặng tối thiểu 45kg</li>
            <li>Sức khỏe tốt, không mắc các bệnh truyền nhiễm</li>
            <li>Huyết áp trong khoảng bình thường (90-180 mmHg / 60-100 mmHg)</li>
            <li>Hemoglobin ≥ 120g/L (nữ) hoặc ≥ 125g/L (nam)</li>
          </ul>
        </div>
      )
    },
    {
      key: '2',
      label: 'Tôi cần chuẩn bị gì trước khi hiến máu?',
      children: (
        <div>
          <ul>
            <li>Ngủ đủ giấc (ít nhất 6-8 tiếng)</li>
            <li>Ăn đầy đủ, tránh đồ ăn nhiều dầu mỡ</li>
            <li>Uống đủ nước (ít nhất 2-3 ly nước)</li>
            <li>Mang theo CMND/CCCD gốc</li>
            <li>Không uống rượu bia 24h trước hiến máu</li>
            <li>Thông báo các loại thuốc đang sử dụng</li>
          </ul>
        </div>
      )
    },
    {
      key: '3',
      label: 'Sau khi hiến máu tôi cần lưu ý gì?',
      children: (
        <div>
          <ul>
            <li>Giữ băng keo ít nhất 4-6 giờ</li>
            <li>Tránh các hoạt động nặng trong 24h</li>
            <li>Uống nhiều nước và ăn đầy đủ</li>
            <li>Không hút thuốc lá trong 2-3 giờ</li>
            <li>Liên hệ với trung tâm nếu có bất thường</li>
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
    }  ];

  return (
    <Layout>
      <Header />
      <Navbar />      {/* Hero Section */}
      <div className="hero-section-compact" style={{
        background: '#761611',
        minHeight: '500px',
        padding: '50px 80px',
        color: 'white'
      }}>
        <Row align="middle" gutter={[32, 32]}>
          <Col xs={24} md={12}>
            <div style={{ maxWidth: '500px' }}>              <Title level={1} style={{ 
                color: 'white', 
                fontSize: '48px', 
                fontWeight: 'bold',
                marginBottom: '24px',
                lineHeight: '1.2'
              }}>
                Hiến Máu, Cứu Sống Người
              </Title>
              
              <Paragraph style={{ 
                color: 'white', 
                fontSize: '18px', 
                marginBottom: '32px',
                lineHeight: '1.6'
              }}>
                Sự đóng góp của bạn có thể giúp cứu sống tới 3 người. Quy trình hiến 
                máu an toàn, đơn giản và chỉ mất không quá một giờ từ đầu đến cuối.
              </Paragraph>
                <Button 
                size="large"
                style={{
                  background: 'white',
                  color: '#761611',
                  border: '2px solid #761611',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  height: '56px',
                  padding: '0 36px',
                  borderRadius: '8px'
                }}
                icon={<CalendarOutlined />}
                onClick={() => document.getElementById('booking-form').scrollIntoView({ behavior: 'smooth' })}
              >
                ĐẶT LỊCH HIẾN MÁU NGAY
              </Button>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ textAlign: 'center' }}>              <img 
                src="/images/hero_banner_2.jpg" 
                alt="Hiến máu cứu người"
                style={{
                  width: '100%',
                  maxWidth: '540px',
                  borderRadius: '12px',
                  boxShadow: '0 15px 40px rgba(0,0,0,0.3)',
                  transform: 'scale(1.05)'
                }}
              />
            </div>
          </Col>
        </Row>
      </div>

      <Content className="booking-content">        {/* Quy trình hiến máu */}        <section className="process-section">
          <div className="container">
            <Title level={2} className="section-title">
              Quy Trình Hiến Máu
            </Title>
            <Paragraph style={{
              textAlign: 'center',
              fontSize: '18px',
              color: '#6c757d',
              maxWidth: '600px',
              margin: '0 auto 40px auto',
              lineHeight: '1.6'
            }}>
              Quy trình hiến máu đơn giản, an toàn và được thực hiện bởi đội ngũ y tế chuyên nghiệp
            </Paragraph>            <Steps
              current={-1}
              items={donationSteps}
              className="donation-steps"
              size="default"
              direction="horizontal"
            />
          </div>
        </section>        {/* Các loại hiến máu */}
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
          </div>        </section>        {/* Form đăng ký hiến máu */}
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
                <div className="form-container">
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    requiredMark={false}
                    size="large"
                    className="donation-form"
                  >                    <Row gutter={[24, 24]}>
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
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={[24, 24]}>
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
                          />
                        </Form.Item>
                      </Col>
                        <Col xs={24} md={12}>
                        <Form.Item
                          label="Ngày hiến"
                          name="donationDate"
                          rules={[{ required: true, message: 'Vui lòng chọn ngày hiến máu' }]}
                        >
                          <DatePicker 
                            className="form-input"
                            placeholder="Chọn ngày hiến máu"
                            format="DD/MM/YYYY"
                            style={{ width: '100%' }}
                            disabledDate={(current) => current && current.valueOf() < Date.now()}
                          />
                        </Form.Item>
                      </Col>
                    </Row>                    <Row gutter={[24, 24]}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Giới tính"
                          name="gender"
                          rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
                        >
                          <div className="radio-group-wrapper">
                            <Radio.Group className="custom-radio-group">
                              <Radio.Button value="male">Nam</Radio.Button>
                              <Radio.Button value="female">Nữ</Radio.Button>
                              <Radio.Button value="other">Khác</Radio.Button>
                            </Radio.Group>
                          </div>
                        </Form.Item>
                      </Col>
                      
                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Loại hiến máu"
                          name="donationType"
                          rules={[{ required: true, message: 'Vui lòng chọn loại hiến máu' }]}
                          initialValue="whole-blood"
                        >
                          <Select 
                            className="form-input"
                            placeholder="Chọn loại hiến máu"
                          >
                            <Select.Option value="whole-blood">Hiến máu toàn phần</Select.Option>
                            <Select.Option value="platelets">Hiến tiểu cầu</Select.Option>
                            <Select.Option value="plasma">Hiến huyết tương</Select.Option>
                            <Select.Option value="red-cells">Hiến hồng cầu</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>                    <Form.Item
                      label="Thời gian hiến máu"
                      name="donationSlot"
                      rules={[{ required: true, message: 'Vui lòng chọn thời gian hiến máu' }]}
                    >
                      <div className="time-slot-wrapper">
                        <Radio.Group className="time-slot-group">
                          <div className="time-slot-options">
                            <Radio.Button value="morning" className="time-slot-option">
                              <div className="time-slot-content">
                                <div className="time-slot-title">Buổi sáng</div>
                                <div className="time-slot-time">7:00 - 11:00</div>
                              </div>
                            </Radio.Button>
                            <Radio.Button value="afternoon" className="time-slot-option">
                              <div className="time-slot-content">
                                <div className="time-slot-title">Buổi chiều</div>
                                <div className="time-slot-time">13:00 - 17:00</div>
                              </div>
                            </Radio.Button>
                          </div>
                        </Radio.Group>
                      </div>
                    </Form.Item>                    <div className="form-submit-section">
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
        </section>        {/* FAQ Section */}
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

      <Footer />
    </Layout>
  );
};

export default BloodDonationBookingPage;
