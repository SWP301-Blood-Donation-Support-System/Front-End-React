import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Card, 
  Typography, 
  Space, 
  Button, 
  Form,
  Select,
  Input,
  notification,
  Spin
} from 'antd';
import { 
  SafetyOutlined,
  ArrowLeftOutlined,
  UserAddOutlined,
  MailOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import StaffSidebar from '../../components/StaffSidebar';
import StaffHeader from '../../components/StaffHeader';
import { HospitalAPI } from '../../api/hospital';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { Option } = Select;

const CreateHospitalAccountPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const response = await HospitalAPI.getAllHospitals();
      console.log('Hospitals data:', response);
      
      // Handle the response based on the API structure (same as HospitalListPage)
      const hospitalData = Array.isArray(response) ? response : response.data || [];
      setHospitals(hospitalData);
      
      if (hospitalData.length > 0) {
        console.log('Loaded hospitals:', hospitalData);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      api.error({
        message: 'Lỗi!',
        description: 'Không thể tải danh sách bệnh viện. Vui lòng thử lại!',
        placement: 'topRight',
        duration: 3,
      });
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const accountData = {
        email: values.email,
        hospitalId: values.hospitalId
      };

      await HospitalAPI.registerHospitalAccount(accountData);
      
      api.success({
        message: 'Tạo tài khoản thành công!',
        description: 'Tài khoản bệnh viện đã được tạo thành công!',
        placement: 'topRight',
        duration: 3,
      });
      form.resetFields();
      
    } catch (error) {
      console.error('Error creating hospital account:', error);
      
      // Handle different types of errors
      let errorMessage = 'Không thể tạo tài khoản bệnh viện. Vui lòng thử lại!';
      
      if (error.response?.status === 400) {
        errorMessage = 'Thông tin không hợp lệ. Vui lòng kiểm tra lại!';
      } else if (error.response?.status === 409) {
        errorMessage = 'Email này đã được sử dụng cho bệnh viện khác!';
      }
      
      api.error({
        message: 'Lỗi!',
        description: errorMessage,
        placement: 'topRight',
        duration: 3,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {contextHolder}
      <StaffSidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout>
        <StaffHeader collapsed={collapsed} onCollapse={setCollapsed} />
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 600 }}>
              <div style={{ marginBottom: '24px' }}>
                <Space direction="vertical" size={0}>
                  <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                    <SafetyOutlined /> Tạo tài khoản bệnh viện
                  </Title>
                  
                </Space>
              </div>

              <Card>
                <Spin spinning={loading}>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  requiredMark="optional"
                >
                  <Form.Item
                    label="Chọn bệnh viện đăng ký"
                    name="hospitalId"
                    rules={[
                      { required: true, message: 'Vui lòng chọn bệnh viện!' }
                    ]}
                  >
                    <Select
                      placeholder="Chọn bệnh viện để tạo tài khoản"
                      suffixIcon={<EnvironmentOutlined />}
                      showSearch
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {hospitals.map((hospital) => (
                        <Option key={hospital.hospitalId} value={hospital.hospitalId}>
                          {hospital.hospitalName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email!' },
                      { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="Nhập email cho tài khoản bệnh viện"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<UserAddOutlined />}
                      loading={submitting}
                      size="large"
                    >
                      Tạo tài khoản
                    </Button>
                  </Form.Item>
                </Form>
              </Spin>
            </Card>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CreateHospitalAccountPage; 
