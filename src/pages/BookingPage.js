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

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

const BookingPage = () => {
  const [donationType, setDonationType] = useState('whole-blood');
  const [form] = Form.useForm();

  // Scroll to form when there's a hash in URL (từ trang chủ)
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
                  
                  <div className="booking-hero-disclaimer">
                    *Điều khoản áp dụng, tìm hiểu thêm
                  </div>
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
                <div className="form-container">
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    requiredMark={false}
                    size="large"
                    className="donation-form"
                  >
                    <Row gutter={[24, 24]}>
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
                            disabledDate={(current) => current && current.valueOf() < Date.now()}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={[24, 24]}>
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
                    </Row>

                    <Form.Item
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
                    </Form.Item>

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

      <Footer />
    </Layout>
  );
};

export default BookingPage;
