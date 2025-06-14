import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form,
  Radio,
  Checkbox,
  Input,
  message,
  Steps,
  Divider
} from 'antd';
import { 
  HeartOutlined, 
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowLeftOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { TextArea } = Input;

const EligibilityFormPage = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [isEligible, setIsEligible] = useState(null);
  const [responses, setResponses] = useState({});  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state?.bookingData;  // Scroll to top when component mounts and check if bookingData exists
  useEffect(() => {
    // Check if there's booking data, if not redirect to booking page
    if (!bookingData) {
      message.warning('Vui lòng điền thông tin đặt lịch trước khi tiến hành kiểm tra điều kiện hiến máu.');
      navigate('/booking');
      return;
    }

    window.scrollTo(0, 0);
  }, [navigate, bookingData]);

  // Eligibility questions data
  const eligibilityQuestions = [
    {
      id: 1,
      title: "Anh/chị từng hiến máu chưa?",
      type: "radio",
      options: [
        { label: "Có", value: "yes" },
        { label: "Không", value: "no" }
      ],
      key: "previousDonation"
    },
    {
      id: 2,
      title: "Hiện tại, anh/ chị có mắc bệnh gì nào không?",
      type: "radio_with_text",
      options: [
        { label: "Có", value: "yes" },
        { label: "Không", value: "no" }
      ],
      key: "currentIllness",
      textField: "currentIllnessDetails"
    },
    {
      id: 3,
      title: "Trước đây, anh/chị có từng mắc một trong các bệnh: viêm gan siêu vi B, C, HIV, váy đỏ, phi đại tiền liệt tuyến, sốc phản vệ, tai biến mạch máu não, nhồi máu cơ tim, lupus ban đỏ, động kinh, ung thư, được cấy ghép mô tạng?",
      type: "checkbox",
      options: [
        { label: "Có", value: "yes" },
        { label: "Không", value: "no" },
        { label: "Bệnh khác", value: "other" }
      ],
      key: "seriousDiseases",
      textField: "seriousDiseasesDetails"
    },
    {
      id: 4,
      title: "Trong 12 tháng gần đây, anh/chị có:",
      type: "checkbox_multiple",
      options: [
        { 
          label: "Khỏi bệnh sau khi mắc một trong các bệnh: sốt rét, giang mai, lao, viêm não-màng não, uốn ván, phẫu thuật ngoại khoa?", 
          value: "recovered_diseases" 
        },
        { 
          label: "Được truyền máu hoặc các chế phẩm máu?", 
          value: "blood_transfusion" 
        },
        { 
          label: "Tiêm Vắc-xin?", 
          value: "vaccination" 
        },
        { 
          label: "Không", 
          value: "none" 
        }
      ],
      key: "last12Months"
    },
    {
      id: 5,
      title: "Trong 06 tháng gần đây, anh/chị có:",
      type: "checkbox_multiple",
      options: [
        { 
          label: "Khỏi bệnh sau khi mắc một trong các bệnh: thương hàn, nhiễm trùng máu, bị rắn cắn, viêm tắc động mạch, viêm tắc tĩnh mạch, viêm tụy, viêm túy xương?", 
          value: "recovered_6months" 
        },
        { 
          label: "Sút cân nhanh không rõ nguyên nhân?", 
          value: "weight_loss" 
        },
        { 
          label: "Nổi hạch kéo dài?", 
          value: "prolonged_swelling" 
        },
        { 
          label: "Thực hiện thủ thuật y tế xâm lấn (chữa răng, châm cứu, lăn kim, nội soi...)?", 
          value: "medical_procedures" 
        },
        { 
          label: "Xăm, xỏ lỗ tai, lỗ mũi hoặc các vị trí khác trên cơ thể?", 
          value: "tattoo_piercing" 
        },
        { 
          label: "Sử dụng ma túy?", 
          value: "drug_use" 
        },
        { 
          label: "Tiếp xúc trực tiếp với máu, dịch tiết của người khác hoặc bị thương bởi kim tiêm?", 
          value: "blood_contact" 
        },
        { 
          label: "Sinh sống chung với người nhiễm bệnh Viêm gan siêu vi B?", 
          value: "hepatitis_contact" 
        },
        { 
          label: "Quan hệ tình dục với người nhiễm viêm gan siêu vi B, C, HIV, giang mai hoặc người có nguy cơ nhiễm viêm gan siêu vi B, C, HIV, giang mai?", 
          value: "sexual_contact_risk" 
        },
        { 
          label: "Quan hệ tình dục với người cùng giới?", 
          value: "same_sex_contact" 
        },
        { 
          label: "Không", 
          value: "none" 
        }
      ],
      key: "last6Months"
    },
    {
      id: 6,
      title: "Trong 01 tháng gần đây, anh/chị có:",
      type: "checkbox_multiple",
      options: [
        { 
          label: "Khỏi bệnh sau khi mắc bệnh viêm đường tiết niệu, viêm da nhiễm trùng, viêm phế quản, viêm phổi, sởi, ho gà, quai bị, sốt xuất huyết, kiết lỵ, tả, Rubella?", 
          value: "recovered_1month" 
        },
        { 
          label: "Đi vào vùng có dịch bệnh trư hành (sốt rét, sốt xuất huyết, Zika...)?", 
          value: "epidemic_area" 
        },
        { 
          label: "Không", 
          value: "none" 
        }
      ],
      key: "last1Month"
    },
    {
      id: 7,
      title: "Trong 14 ngày gần đây, anh/chị có:",
      type: "checkbox_multiple",
      options: [
        { 
          label: "Bị cúm, cảm lạnh, ho, nhức đầu, sốt, đau họng?", 
          value: "flu_symptoms" 
        },
        { 
          label: "Không", 
          value: "none" 
        },
        { 
          label: "Khác (cụ thể)", 
          value: "other" 
        }
      ],
      key: "last14Days",
      textField: "last14DaysDetails"
    },
    {
      id: 8,
      title: "Trong 07 ngày gần đây, anh/chị có:",
      type: "checkbox_multiple",
      options: [
        { 
          label: "Dùng thuốc kháng sinh, kháng viêm, Aspirin, Corticoid?", 
          value: "medication" 
        },
        { 
          label: "Không", 
          value: "none" 
        },
        { 
          label: "Khác (cụ thể)", 
          value: "other" 
        }
      ],
      key: "last7Days",
      textField: "last7DaysDetails"
    },
    {
      id: 9,
      title: "Câu hỏi dành cho phụ nữ:",
      type: "checkbox_multiple",
      options: [
        { 
          label: "Hiện chị đang mang thai hoặc nuôi con dưới 12 tháng tuổi?", 
          value: "pregnant_nursing" 
        },
        { 
          label: "Chấm dứt thai kỳ trong 12 tháng gần đây (sẩy thai, phá thai, thai ngoài tử cung)?", 
          value: "pregnancy_termination" 
        },
        { 
          label: "Không", 
          value: "none" 
        }
      ],
      key: "femaleQuestions"
    }
  ];

  const steps = [
    {
      title: 'Thông tin',
      description: 'Kiểm tra điều kiện hiến máu',
    },
    {
      title: 'Kết quả',
      description: 'Xem kết quả đánh giá',
    }
  ];

  const checkEligibility = (formData) => {
    // Eligibility rules based on responses
    const ineligibleConditions = [
      // Question 3: Serious diseases
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

    return !ineligibleConditions.some(condition => condition);
  };
  const handleFormSubmit = (values) => {
    console.log('Form values:', values);
    setResponses(values);
    
    const eligible = checkEligibility(values);
    setIsEligible(eligible);
    setCurrentStep(1);
    
    if (eligible) {
      message.success('Chúc mừng! Bạn đủ điều kiện hiến máu.');
    } else {
      message.warning('Rất tiếc, hiện tại bạn chưa đủ điều kiện hiến máu.');
    }
  };

  const handleFormError = (errorInfo) => {
    console.log('Form validation failed:', errorInfo);
    
    // Find the first field with error and scroll to it
    const firstErrorField = errorInfo.errorFields[0];
    if (firstErrorField) {
      const fieldName = firstErrorField.name[0];
      
      // Find the question number for this field
      const question = eligibilityQuestions.find(q => q.key === fieldName || q.textField === fieldName);
      if (question) {
        const questionElement = document.getElementById(`question-${question.id}`);
        if (questionElement) {
          questionElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Add visual highlight
          questionElement.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.2)';
          setTimeout(() => {
            questionElement.style.boxShadow = '';
          }, 3000);
        }
      }
    }
    
    message.error('Vui lòng kiểm tra và điền đầy đủ thông tin bắt buộc!');
  };const handleBackToBooking = () => {
    // Pass back the booking data to preserve form values
    navigate('/booking', { state: { preservedBookingData: bookingData } });
  };  const handleProceedToBooking = () => {
    // Double-check authentication before completing booking
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
      message.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      navigate('/login', { 
        state: { 
          redirectPath: '/eligibility',
          bookingData: bookingData 
        }
      });
      return;
    }

    // Complete the booking with eligibility confirmation
    const userData = JSON.parse(user);
    const completeBookingData = {
      ...bookingData,
      userId: userData.id,
      userEmail: userData.email,
      eligibilityResponses: responses,
      eligibilityConfirmed: true,
      submittedAt: new Date().toISOString()
    };
    
    console.log('Complete booking data:', completeBookingData);
    
    // Here you would typically send the data to your API
    message.success({
      content: 'Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn trong vòng 24h để xác nhận lịch hẹn.',
      duration: 5,
    });
      // Navigate back to booking page or a confirmation page
    navigate('/booking', { state: { bookingComplete: true, preservedBookingData: bookingData } });
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case 'radio':
        return (
          <Form.Item 
            name={question.key} 
            rules={[{ required: true, message: 'Vui lòng chọn một lựa chọn!' }]}
          >
            <Radio.Group className="eligibility-radio-group">
              {question.options.map(option => (
                <Radio key={option.value} value={option.value} className="eligibility-radio">
                  {option.label}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        );

      case 'radio_with_text':
        return (
          <>
            <Form.Item 
              name={question.key} 
              rules={[{ required: true, message: 'Vui lòng chọn một lựa chọn!' }]}
            >
              <Radio.Group className="eligibility-radio-group">
                {question.options.map(option => (
                  <Radio key={option.value} value={option.value} className="eligibility-radio">
                    {option.label}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues[question.key] !== currentValues[question.key]
              }
            >
              {({ getFieldValue }) =>
                getFieldValue(question.key) === 'yes' ? (
                  <Form.Item
                    name={question.textField}
                    rules={[{ required: true, message: 'Vui lòng mô tả chi tiết!' }]}
                  >
                    <TextArea 
                      rows={3} 
                      placeholder="Vui lòng mô tả chi tiết..."
                      className="eligibility-textarea"
                    />
                  </Form.Item>
                ) : null
              }
            </Form.Item>
          </>
        );

      case 'checkbox':
        return (
          <>
            <Form.Item 
              name={question.key} 
              rules={[{ required: true, message: 'Vui lòng chọn ít nhất một lựa chọn!' }]}
            >
              <Checkbox.Group className="eligibility-checkbox-group">
                {question.options.map(option => (
                  <Checkbox key={option.value} value={option.value} className="eligibility-checkbox">
                    {option.label}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </Form.Item>
            {question.textField && (
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues[question.key] !== currentValues[question.key]
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue(question.key)?.includes('other') ? (
                    <Form.Item
                      name={question.textField}
                      rules={[{ required: true, message: 'Vui lòng mô tả chi tiết!' }]}
                    >
                      <TextArea 
                        rows={3} 
                        placeholder="Vui lòng mô tả chi tiết..."
                        className="eligibility-textarea"
                      />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
            )}
          </>
        );

      case 'checkbox_multiple':
        return (
          <>
            <Form.Item 
              name={question.key} 
              rules={[{ required: true, message: 'Vui lòng chọn ít nhất một lựa chọn!' }]}
            >
              <Checkbox.Group className="eligibility-checkbox-group">
                <div className="checkbox-options">
                  {question.options.map(option => (
                    <Checkbox key={option.value} value={option.value} className="eligibility-checkbox">
                      {option.label}
                    </Checkbox>
                  ))}
                </div>
              </Checkbox.Group>
            </Form.Item>
            {question.textField && (
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues[question.key] !== currentValues[question.key]
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue(question.key)?.includes('other') ? (
                    <Form.Item
                      name={question.textField}
                      rules={[{ required: true, message: 'Vui lòng mô tả chi tiết!' }]}
                    >
                      <TextArea 
                        rows={3} 
                        placeholder="Vui lòng mô tả chi tiết..."
                        className="eligibility-textarea"
                      />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
            )}
          </>
        );

      default:
        return null;
    }
  };

  const renderEligibilityForm = () => (    <Form
      form={form}
      layout="vertical"
      onFinish={handleFormSubmit}
      onFinishFailed={handleFormError}
      className="eligibility-form"
    >      <div className="eligibility-questions">
        {eligibilityQuestions.map((question, index) => (
          <Card 
            key={question.id} 
            id={`question-${question.id}`}
            className="question-card" 
            bordered={false}
          >
            <div className="question-header">
              <Text className="question-number">{index + 1}.</Text>
              <Title level={5} className="question-title">
                {question.title}
              </Title>
            </div>
            <div className="question-content">
              {renderQuestion(question)}
            </div>
          </Card>
        ))}
      </div>

      <div className="form-actions">
        <Button 
          type="default" 
          size="large"
          icon={<ArrowLeftOutlined />}
          onClick={handleBackToBooking}
          className="back-button"
        >
          Quay về
        </Button>
        <Button 
          type="primary" 
          htmlType="submit" 
          size="large"
          className="submit-button"
          icon={<CheckCircleOutlined />}
        >
          Tiếp tục
        </Button>
      </div>
    </Form>
  );

  const renderResult = () => (
    <div className="eligibility-result">
      <Card className={`result-card ${isEligible ? 'eligible' : 'not-eligible'}`} bordered={false}>
        <div className="result-content">
          {isEligible ? (
            <>
              <div className="result-icon eligible">
                <CheckCircleOutlined />
              </div>
              <Title level={3} className="result-title">
                Chúc mừng! Bạn đủ điều kiện hiến máu
              </Title>
              <Paragraph className="result-description">
                Dựa trên thông tin bạn cung cấp, bạn đáp ứng các tiêu chí cơ bản để hiến máu. 
                Hãy tiếp tục với quy trình đăng ký để hoàn tất việc đặt lịch hiến máu.
              </Paragraph>
              <div className="result-actions">
                <Button 
                  type="primary" 
                  size="large"
                  icon={<CalendarOutlined />}
                  onClick={handleProceedToBooking}
                  className="proceed-button"
                >
                  Tiếp tục đăng ký
                </Button>
                <Button 
                  type="default" 
                  size="large"
                  onClick={() => setCurrentStep(0)}
                  className="review-button"
                >
                  Xem lại câu trả lời
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="result-icon not-eligible">
                <ExclamationCircleOutlined />
              </div>
              <Title level={3} className="result-title">
                Rất tiếc, hiện tại bạn chưa đủ điều kiện hiến máu
              </Title>
              <Paragraph className="result-description">
                Dựa trên thông tin bạn cung cấp, bạn hiện chưa đáp ứng một số tiêu chí để hiến máu. 
                Vui lòng tham khảo ý kiến bác sĩ hoặc liên hệ với chúng tôi để được tư vấn thêm.
              </Paragraph>
              <div className="result-actions">
                <Button 
                  type="primary" 
                  size="large"
                  onClick={handleBackToBooking}
                  className="back-button"
                  icon={<ArrowLeftOutlined />}
                >
                  Quay về trang đặt lịch
                </Button>
                <Button 
                  type="default" 
                  size="large"
                  onClick={() => setCurrentStep(0)}
                  className="review-button"
                >
                  Xem lại câu trả lời
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );

  return (
    <Layout className="eligibility-layout">
      <Header />
      <Navbar />
      
      <Content className="eligibility-content">
        <div className="container">
          <div className="eligibility-header">
            <Title level={1} className="page-title">
              <HeartOutlined /> Phiếu đăng ký hiến máu
            </Title>
            <Paragraph className="page-description">
              Vui lòng trả lời các câu hỏi dưới đây để kiểm tra điều kiện hiến máu của bạn.
            </Paragraph>
          </div>

          <Row justify="center">
            <Col xs={24} lg={20} xl={16}>
              <div className="eligibility-steps">
                <Steps
                  current={currentStep}
                  items={steps}
                  className="custom-steps"
                />
              </div>

              <Divider />

              <div className="eligibility-main">
                {currentStep === 0 ? renderEligibilityForm() : renderResult()}
              </div>
            </Col>
          </Row>
        </div>
      </Content>

      <Footer />
    </Layout>
  );
};

export default EligibilityFormPage;
