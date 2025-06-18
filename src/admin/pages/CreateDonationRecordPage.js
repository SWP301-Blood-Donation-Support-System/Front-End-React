import React, { useState, useEffect } from 'react';
import { 
  Layout,
  Card, 
  Row, 
  Col, 
  Button,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Checkbox,
  message,
  Typography,
  Divider,
  Form 
} from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import StaffSidebar from '../components/StaffSidebar';
import StaffHeader from '../components/StaffHeader';
import StaffNavbar from '../components/StaffNavbar';
import { AdminAPI } from '../api/admin';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const CreateDonationRecordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [donationTypes, setDonationTypes] = useState([]);
  const [bloodTestResults, setBloodTestResults] = useState([]);

  useEffect(() => {
    fetchDonationTypes();
    fetchBloodTestResults();
    
    // Handle pre-filled data from schedule management
    const preFilledData = location.state?.preFilledData;
    const fromScheduleManagement = location.state?.fromScheduleManagement;
    
    if (preFilledData && fromScheduleManagement) {
      // Pre-fill the form with data from schedule management
      setTimeout(() => {
        const formValues = {
          registrationId: preFilledData.registrationId,
          userId: preFilledData.userId,
          username: preFilledData.username
        };

        // Calculate donation date time based on schedule date and time slot
        if (preFilledData.scheduleDate && preFilledData.timeSlot) {
          const scheduleDate = dayjs(preFilledData.scheduleDate);
          const startTime = preFilledData.timeSlot.startTime; // Format: "HH:mm:ss"
          const [hours, minutes] = startTime.split(':');
          
          // Set the donation time to the start of the time slot
          const donationDateTime = scheduleDate
            .hour(parseInt(hours))
            .minute(parseInt(minutes))
            .second(0);
          
          formValues.donationDateTime = donationDateTime;
        }

        form.setFieldsValue(formValues);
        
        // Show success message
        message.success('Đã điền sẵn thông tin từ lịch hiến máu!');
      }, 500); // Small delay to ensure form is ready
    } else {
      // For normal cases (not from schedule management), auto-fill current date/time
      setTimeout(() => {
        form.setFieldsValue({
          donationDateTime: dayjs() // Current date and time
        });
      }, 300);
    }
  }, [location.state, form]);

  const fetchDonationTypes = async () => {
    try {
      const response = await AdminAPI.getDonationTypes();
      setDonationTypes(response.data || []);
    } catch (error) {
      console.error('Error fetching donation types:', error);
    }
  };

  const fetchBloodTestResults = async () => {
    try {
      const response = await AdminAPI.getBloodTestResults();
      setBloodTestResults(response.data || []);
    } catch (error) {
      console.error('Error fetching blood test results:', error);
    }
  };



  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const recordData = {
        registrationId: values.registrationId,
        donationDateTime: values.donationDateTime.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
        donorWeight: values.donorWeight || 0,
        donorTemperature: values.donorTemperature || 0,
        donorBloodPressure: values.donorBloodPressure || '',
        donationTypeId: values.donationTypeId,
        volumeDonated: values.volumeDonated || 0,
        note: values.note || '',
        bloodTestResult: values.bloodTestResult || 0,
        cannotDonate: values.cannotDonate || false
      };

      await AdminAPI.createDonationRecord(recordData);
      message.success('Tạo hồ sơ hiến máu thành công!');
      
      // Reset form and navigate back
      form.resetFields();
      
      // Navigate back to appropriate page
      if (location.state?.fromScheduleManagement) {
        navigate('/staff/schedule-management');
      } else {
        navigate('/staff/donation-records');
      }
      
    } catch (error) {
      console.error('Error creating donation record:', error);
      message.error('Lỗi khi tạo hồ sơ hiến máu');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // If we came from schedule management, go back there
    if (location.state?.fromScheduleManagement) {
      navigate('/staff/schedule-management');
    } else {
      navigate('/staff/donation-records');
    }
  };

  return (
    <Layout className="staff-layout">
      <StaffSidebar
        collapsed={collapsed}
        onCollapse={value => setCollapsed(value)}
      />
      
      <Layout className="staff-main-layout">
        <StaffHeader />

        <Layout className="staff-content-layout">
          <StaffNavbar />
          
          <Content className="donation-records-content">
            <div className="donation-records-container">
              <div className="donation-records-header-section">
                <Title level={3} className="donation-records-title">
                  Tạo Hồ Sơ Hiến Máu Mới
                </Title>
              </div>

              <div className="create-donation-form">
                <Card title="THÔNG TIN HỒ SƠ HIẾN MÁU" className="detail-form-card">
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    requiredMark={false}
                  >
                    <Row gutter={[24, 16]}>
                      <Col span={8}>
                        <Form.Item
                          label="MÃ ĐĂNG KÝ"
                          name="registrationId"
                        >
                          <Input disabled />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="MÃ NGƯỜI DÙNG" name="userId">
                          <Input disabled />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="TÊN NGƯỜI DÙNG" name="username">
                          <Input disabled />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="THỜI GIAN HIẾN MÁU"
                          name="donationDateTime"
                        >
                          <DatePicker 
                            showTime 
                            format="DD/MM/YYYY HH:mm"
                            style={{ width: '100%' }}
                            disabled
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Divider orientation="left">THÔNG TIN SỨC KHỎE</Divider>
                    
                    <Row gutter={[24, 16]}>

                      <Col span={8}>
                        <Form.Item 
                          label="NHIỆT ĐỘ (°C)" 
                          name="donorTemperature"
                          rules={[{ required: true, message: 'Vui lòng nhập nhiệt độ!' }]}
                        >
                          <InputNumber 
                            style={{ width: '100%' }}
                            placeholder="Nhập nhiệt độ"
                            min={30}
                            max={45}
                            step={0.1}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item 
                          label="HUYẾT ÁP" 
                          name="donorBloodPressure"
                          rules={[{ required: true, message: 'Vui lòng nhập huyết áp!' }]}
                        >
                          <Input placeholder="Ví dụ: 120/80" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="CÂN NẶNG (kg)" name="donorWeight">
                          <InputNumber 
                            style={{ width: '100%' }}
                            placeholder="Nhập cân nặng"
                            min={0}
                            max={200}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Divider orientation="left">THÔNG TIN HIẾN MÁU</Divider>
                    
                    <Row gutter={[24, 16]}>
                      <Col span={12}>
                        <Form.Item
                          label="LOẠI HIẾN MÁU"
                          name="donationTypeId"
                          rules={[{ required: true, message: 'Vui lòng chọn loại hiến máu!' }]}
                        >
                          <Select placeholder="Chọn loại hiến máu">
                            {donationTypes.map(type => (
                              <Option key={type.id || type.Id} value={type.id || type.Id}>
                                {type.name || type.Name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="THỂ TÍCH HIẾN (ml)"
                          name="volumeDonated"
                          rules={[{ required: true, message: 'Vui lòng nhập thể tích hiến!' }]}
                        >
                          <InputNumber 
                            style={{ width: '100%' }}
                            placeholder="Nhập thể tích hiến"
                            min={0}
                            max={1000}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Divider orientation="left">KẾT LUẬN</Divider>
                    
                    <Row gutter={[24, 16]}>
                      <Col span={12}>
                        <Form.Item
                          label="KẾT QUẢ XÉT NGHIỆM"
                          name="bloodTestResult"
                          rules={[{ required: true, message: 'Vui lòng chọn kết quả xét nghiệm!' }]}
                        >
                          <Select placeholder="Chọn kết quả xét nghiệm">
                            {bloodTestResults.map(result => (
                              <Option key={result.id || result.Id} value={result.id || result.Id}>
                                {result.name || result.Name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="cannotDonate" valuePropName="checked">
                          <Checkbox>Không thể hiến máu được</Checkbox>
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item label="GHI CHÚ" name="note">
                          <Input.TextArea 
                            rows={3}
                            placeholder="Nhập ghi chú (không bắt buộc)"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Divider />
                    
                    <Row gutter={[16, 16]} justify="center">
                      <Col>
                        <Button onClick={handleCancel}>
                          Hủy
                        </Button>
                      </Col>
                      <Col>
                        <Button 
                          type="primary" 
                          htmlType="submit"
                          loading={loading}
                        >
                          Tạo Hồ Sơ
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Card>
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default CreateDonationRecordPage; 