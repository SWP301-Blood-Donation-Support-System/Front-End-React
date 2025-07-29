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
  Divider,
  Modal,
  Tag
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
  
  // Preview modal state
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  
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
      const statusesData = response.data || [];
      setStatuses(statusesData);
      
      // Set default status to "Bản nháp" (Draft)
      const draftStatus = statusesData.find(status => 
        status.name.toLowerCase().includes('nháp') || 
        status.name.toLowerCase().includes('draft')
      );
      
      if (draftStatus) {
        form.setFieldsValue({
          articleStatusId: draftStatus.id
        });
      }
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

    // Get category name
    const selectedCategory = categories.find(cat => cat.id === values.articleCategoryId);
    
    // Prepare preview data
    const previewArticle = {
      title: values.title,
      content: values.content,
      picture: uploadedImageUrl,
      articleCategoryId: values.articleCategoryId,
      categoryName: selectedCategory?.name || 'Chưa chọn danh mục',
      createdAt: new Date().toISOString(), // Current time for preview
    };

    setPreviewData(previewArticle);
    setPreviewVisible(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

                        {/* Hidden field for status - automatically set to draft */}
                        <Form.Item
                          name="articleStatusId"
                          style={{ display: 'none' }}
                        >
                          <Select />
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

      {/* Preview Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined style={{ color: '#1890ff' }} />
            <span>Xem trước bài viết</span>
          </Space>
        }
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Đóng
          </Button>
        ]}
        style={{ top: 20 }}
      >
        {previewData && (
          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {/* Article Header */}
            <div style={{ marginBottom: '20px' }}>
              <Space wrap style={{ marginBottom: '12px' }}>
                <Tag color="blue">
                  {formatDate(previewData.createdAt)}
                </Tag>
                <Tag color="red">{previewData.categoryName}</Tag>
              </Space>
              
              <Typography.Title level={2} style={{ margin: 0, fontSize: '24px', lineHeight: '1.3' }}>
                {previewData.title}
              </Typography.Title>
            </div>

            {/* Article Image */}
            {previewData.picture && (
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <img 
                  src={previewData.picture}
                  alt={previewData.title}
                  style={{ 
                    width: '100%', 
                    maxHeight: '300px', 
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              </div>
            )}

            {/* Article Content */}
            <div 
              style={{ 
                fontSize: '16px', 
                lineHeight: '1.8',
                color: '#333',
                whiteSpace: 'pre-wrap'
              }}
            >
              {previewData.content || "Nội dung bài viết không có sẵn."}
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default CreateArticlePage;
