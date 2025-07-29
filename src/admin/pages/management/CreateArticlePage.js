import React, { useState, useEffect } from 'react';
import { 
  Layout,
  Form,
  Input,
  Button,
  Typography,
  Card,
  Space,
  notification,
  Select,
  Row,
  Col,
  Divider
} from 'antd';
import { 
  FileTextOutlined, 
  SaveOutlined, 
  EyeOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AdminAPI } from '../../api/admin';
import StaffSidebar from '../../components/StaffSidebar';
import StaffHeader from '../../components/StaffHeader';
import ImageUpload from '../../components/ImageUpload';
import '../../styles/article-create.scss';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CreateArticlePage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [api, contextHolder] = notification.useNotification();
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchStatuses();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await AdminAPI.getArticleCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await AdminAPI.getArticleStatuses();
      setStatuses(response.data || []);
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  const handleImageUpload = async (imageUrl) => {
    try {
      // Simply store the image URL for later use in createArticle
      setUploadedImageUrl(imageUrl);
      
      // Check if imageUrl is empty (means remove image) or has value (means upload/change image)
      if (imageUrl === '' || imageUrl === null || imageUrl === undefined) {
        // Image removed
        api.success({
          message: 'Đã xóa ảnh!',
          description: 'Ảnh đã được xóa khỏi tin tức.',
          placement: 'topRight',
          duration: 3,
        });
      } else {
        // Image uploaded/changed
        api.success({
          message: 'Upload ảnh thành công!',
          description: 'Ảnh đã được chọn và sẵn sàng sử dụng.',
          placement: 'topRight',
          duration: 3,
        });
      }
    } catch (error) {
      console.error('Error handling image:', error);
      api.error({
        message: 'Lỗi xử lý ảnh!',
        description: 'Có lỗi xảy ra khi xử lý ảnh. Vui lòng thử lại.',
        placement: 'topRight',
        duration: 3,
      });
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const articleData = {
        articleCategoryId: values.articleCategoryId,
        articleStatusId: values.articleStatusId,
        title: values.title,
        content: values.content,
        picture: uploadedImageUrl
      };

      console.log('Creating article with data:', articleData);

      await AdminAPI.createArticle(articleData);
      
      api.success({
        message: 'Tạo tin tức thành công!',
        description: 'Tin tức đã được tạo và lưu vào hệ thống.',
        placement: 'topRight',
        duration: 3,
      });

      // Reset form and redirect
      form.resetFields();
      setUploadedImageUrl('');
      
      setTimeout(() => {
        navigate('/staff/article-management');
      }, 2000);

    } catch (error) {
      console.error('Error creating article:', error);

      let errorMessage = 'Có lỗi xảy ra khi tạo tin tức';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      api.error({
        message: 'Tạo tin tức thất bại!',
        description: errorMessage,
        placement: 'topRight',
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    const values = form.getFieldsValue();
    if (!values.title || !values.content) {
      api.warning({
        message: 'Thiếu thông tin!',
        description: 'Vui lòng nhập tiêu đề và nội dung để xem trước.',
        placement: 'topRight',
        duration: 3,
      });
      return;
    }
    
    // TODO: Implement preview modal
    api.info({
      message: 'Tính năng xem trước',
      description: 'Tính năng xem trước đang được phát triển.',
      placement: 'topRight',
      duration: 3,
    });
  };

  return (
    <Layout className="staff-layout">
      {contextHolder}
      <StaffSidebar collapsed={collapsed} onCollapse={setCollapsed} />
      
      <Layout className="staff-main-layout">
        <StaffHeader />
        
        <Layout className="staff-content-layout">
          <Content className="article-create-content">
            <div className="article-create-container">
              
              {/* Header Section */}
              <div className="article-create-header-section">
                <Space className="article-create-controls">
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/staff/article-management')}
                  >
                    Quay lại
                  </Button>
                  
                  <Title level={3} className="article-create-title">
                    <FileTextOutlined style={{ marginRight: 8, color: '#dc2626' }} />
                    Tạo Tin Tức Mới
                  </Title>
                </Space>
              </div>

              {/* Form Section */}
              <div className="article-create-form-section">
                <Card className="article-form-card">
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    requiredMark={false}
                    autoComplete="off"
                  >
                    <Row gutter={[24, 16]}>
                      
                      {/* Left Column */}
                      <Col span={16}>
                        <Form.Item
                          label={
                            <span style={{ fontWeight: 600, fontSize: '14px' }}>
                              Tiêu đề tin tức
                            </span>
                          }
                          name="title"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập tiêu đề tin tức!",
                            },
                            {
                              max: 200,
                              message: "Tiêu đề không được vượt quá 200 ký tự!",
                            },
                          ]}
                        >
                          <Input
                            placeholder="Nhập tiêu đề tin tức..."
                            size="large"
                            showCount
                            maxLength={200}
                          />
                        </Form.Item>

                        <Form.Item
                          label={
                            <span style={{ fontWeight: 600, fontSize: '14px' }}>
                              Nội dung tin tức
                            </span>
                          }
                          name="content"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập nội dung tin tức!",
                            },
                            {
                              min: 50,
                              message: "Nội dung phải có ít nhất 50 ký tự!",
                            },
                          ]}
                        >
                          <TextArea
                            placeholder="Nhập nội dung tin tức..."
                            rows={12}
                            showCount
                            maxLength={5000}
                          />
                        </Form.Item>
                      </Col>

                      {/* Right Column */}
                      <Col span={8}>
                        <Form.Item
                          label={
                            <span style={{ fontWeight: 600, fontSize: '14px' }}>
                              Danh mục
                            </span>
                          }
                          name="articleCategoryId"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn danh mục!",
                            },
                          ]}
                        >
                          <Select
                            placeholder="Chọn danh mục"
                            size="large"
                          >
                            {categories.map(category => (
                              <Option key={category.id} value={category.id}>
                                {category.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Form.Item
                          label={
                            <span style={{ fontWeight: 600, fontSize: '14px' }}>
                              Trạng thái
                            </span>
                          }
                          name="articleStatusId"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn trạng thái!",
                            },
                          ]}
                        >
                          <Select
                            placeholder="Chọn trạng thái"
                            size="large"
                          >
                            {statuses.map(status => (
                              <Option key={status.id} value={status.id}>
                                {status.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Divider />

                        <div style={{ marginBottom: 16 }}>
                          <Text strong style={{ fontSize: '14px' }}>
                            Ảnh đại diện
                          </Text>
                        </div>
                        
                        <ImageUpload
                          value={uploadedImageUrl}
                          onChange={handleImageUpload}
                          placeholder="Upload ảnh đại diện"
                          maxWidth={300}
                          maxHeight={200}
                        />
                      </Col>
                    </Row>

                    <Divider />

                    {/* Action Buttons */}
                    <Row justify="center" gutter={[16, 16]}>
                      <Col>
                        <Button
                          size="large"
                          icon={<EyeOutlined />}
                          onClick={handlePreview}
                        >
                          Xem trước
                        </Button>
                      </Col>
                      <Col>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={loading}
                          size="large"
                          icon={<SaveOutlined />}
                          style={{ minWidth: '150px' }}
                        >
                          Tạo tin tức
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

export default CreateArticlePage;
