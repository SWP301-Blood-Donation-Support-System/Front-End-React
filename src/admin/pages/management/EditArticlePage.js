import React, { useState, useEffect, useCallback } from 'react';
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
  Spin
} from 'antd';
import { 
  FileTextOutlined, 
  SaveOutlined, 
  EyeOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminAPI } from '../../api/admin';
import StaffSidebar from '../../components/StaffSidebar';
import StaffHeader from '../../components/StaffHeader';
import ImageUpload from '../../components/ImageUpload';
import '../../styles/article-create.scss';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const EditArticlePage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [currentArticle, setCurrentArticle] = useState(null);
  const [api, contextHolder] = notification.useNotification();
  
  const navigate = useNavigate();
  const { articleId } = useParams();

  const fetchArticleData = useCallback(async () => {
    try {
      setPageLoading(true);
      console.log('Fetching article with ID:', articleId);
      
      const response = await AdminAPI.getArticleById(articleId);
      console.log('API Response:', response);
      
      // Handle the new API response structure - similar to other pages
      let articleData;
      if (response.data && response.data.data) {
        // New structure: response.data.data contains the article
        articleData = response.data.data;
      } else if (response.data) {
        // Fallback for old structure
        articleData = response.data;
      } else {
        throw new Error('No article data received');
      }
      
      console.log('Article Data:', articleData);
      console.log('Picture field value:', articleData.picture);
      console.log('Picture field type:', typeof articleData.picture);
      
      setCurrentArticle(articleData);
      
      // Handle picture URL - ensure it's a valid string
      const pictureUrl = articleData.picture && typeof articleData.picture === 'string' 
        ? articleData.picture 
        : '';
      
      console.log('Setting uploadedImageUrl to:', pictureUrl);
      setUploadedImageUrl(pictureUrl);
      
      // Populate form with existing data
      form.setFieldsValue({
        title: articleData.title,
        content: articleData.content,
        articleCategoryId: articleData.articleCategoryId,
        articleStatusId: articleData.articleStatusId
      });
      
      console.log('Form populated with:', {
        title: articleData.title,
        content: articleData.content,
        articleCategoryId: articleData.articleCategoryId,
        articleStatusId: articleData.articleStatusId,
        picture: pictureUrl
      });
      
    } catch (error) {
      console.error("Error fetching article:", error);
      api.error({
        message: 'Lỗi tải tin tức!',
        description: 'Không thể tải thông tin tin tức. Vui lòng thử lại.',
        placement: 'topRight',
        duration: 3,
      });
    } finally {
      setPageLoading(false);
    }
  }, [articleId, form, api]);

  useEffect(() => {
    if (articleId) {
      fetchArticleData();
      fetchCategories();
      fetchStatuses();
    }
  }, [articleId, fetchArticleData]);

  const fetchCategories = async () => {
    try {
      const response = await AdminAPI.getArticleCategories();
      // Handle the new API response structure
      let categoriesData = [];
      if (response.data && response.data.data) {
        categoriesData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (response.data) {
        categoriesData = Array.isArray(response.data) ? response.data : [];
      }
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await AdminAPI.getArticleStatuses();
      // Handle the new API response structure
      let statusesData = [];
      if (response.data && response.data.data) {
        statusesData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (response.data) {
        statusesData = Array.isArray(response.data) ? response.data : [];
      }
      setStatuses(statusesData);
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  const handleImageUpload = async (imageUrl) => {
    try {
      // Simply store the image URL for later use in updateArticle
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

      console.log('Updating article with data:', articleData);

      await AdminAPI.updateArticle(articleId, articleData);
      
      api.success({
        message: 'Cập nhật tin tức thành công!',
        description: 'Tin tức đã được cập nhật và lưu vào hệ thống.',
        placement: 'topRight',
        duration: 3,
      });

      // Navigate back to article management after a short delay
      setTimeout(() => {
        navigate('/staff/article-management');
      }, 1500);

    } catch (error) {
      console.error('Error updating article:', error);
      
      // Handle specific error messages
      let errorMessage = 'Có lỗi xảy ra khi cập nhật tin tức.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Không có quyền thực hiện thao tác này.';
      }
      
      api.error({
        message: 'Lỗi cập nhật tin tức!',
        description: errorMessage,
        placement: 'topRight',
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    const values = form.getFieldsValue();
    
    // Create preview object
    const previewData = {
      ...currentArticle,
      ...values,
      picture: uploadedImageUrl
    };
    
    // You can implement a preview modal here or navigate to a preview page
    console.log('Preview data:', previewData);
    
    api.info({
      message: 'Xem trước',
      description: 'Tính năng xem trước đang được phát triển.',
      placement: 'topRight',
      duration: 3,
    });
  };

  if (pageLoading) {
    return (
      <Layout className="staff-layout">
        <StaffSidebar
          collapsed={collapsed}
          onCollapse={value => setCollapsed(value)}
        />
        
        <Layout className="staff-main-layout">
          <StaffHeader />
          <Content style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '400px' 
          }}>
            <Spin size="large" />
          </Content>
        </Layout>
      </Layout>
    );
  }

  return (
    <Layout className="staff-layout">
      {contextHolder}
      <StaffSidebar
        collapsed={collapsed}
        onCollapse={value => setCollapsed(value)}
      />
      
      <Layout className="staff-main-layout">
        <StaffHeader />

        <Layout className="staff-content-layout">
          <Content className="article-create-content">
            <div className="article-create-container">
              
              {/* Header Section */}
              <div className="article-create-header">
                <Space className="article-create-controls">
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/staff/article-management')}
                    type="text"
                  >
                    Quay lại
                  </Button>
                  
                  <Title level={3} className="article-create-title">
                    <FileTextOutlined style={{ marginRight: 8, color: '#dc2626' }} />
                    Chỉnh Sửa Tin Tức #{articleId}
                  </Title>
                </Space>
              </div>

              <Divider />

              {/* Form Section */}
              <Row gutter={24}>
                <Col span={16}>
                  <Card title="Thông tin tin tức" className="article-form-card">
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={handleSubmit}
                      requiredMark={false}
                    >
                      <Form.Item
                        label="Tiêu đề tin tức"
                        name="title"
                        rules={[
                          { required: true, message: 'Vui lòng nhập tiêu đề tin tức!' },
                          { max: 200, message: 'Tiêu đề không được vượt quá 200 ký tự!' }
                        ]}
                      >
                        <Input 
                          placeholder="Nhập tiêu đề tin tức..."
                          showCount
                          maxLength={200}
                          size="large"
                        />
                      </Form.Item>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            label="Danh mục"
                            name="articleCategoryId"
                            rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                          >
                            <Select
                              placeholder="Chọn danh mục"
                              size="large"
                              loading={categories.length === 0}
                            >
                              {categories.map(category => (
                                <Option key={category.id} value={category.id}>
                                  {category.name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col span={12}>
                          <Form.Item
                            label="Trạng thái"
                            name="articleStatusId"
                            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                          >
                            <Select
                              placeholder="Chọn trạng thái"
                              size="large"
                              loading={statuses.length === 0}
                            >
                              {statuses.map(status => (
                                <Option key={status.id} value={status.id}>
                                  {status.name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item
                        label="Nội dung tin tức"
                        name="content"
                        rules={[
                          { required: true, message: 'Vui lòng nhập nội dung tin tức!' },
                          { min: 10, message: 'Nội dung phải có ít nhất 10 ký tự!' }
                        ]}
                      >
                        <TextArea
                          placeholder="Nhập nội dung tin tức..."
                          showCount
                          maxLength={5000}
                          rows={15}
                          style={{ resize: 'vertical' }}
                        />
                      </Form.Item>

                      {/* Action Buttons */}
                      <Form.Item>
                        <Space size="middle">
                          <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            loading={loading}
                            size="large"
                          >
                            Cập nhật tin tức
                          </Button>
                          
                          <Button
                            icon={<EyeOutlined />}
                            onClick={handlePreview}
                            size="large"
                          >
                            Xem trước
                          </Button>
                          
                          <Button
                            onClick={() => navigate('/staff/article-management')}
                            size="large"
                          >
                            Hủy
                          </Button>
                        </Space>
                      </Form.Item>
                    </Form>
                  </Card>
                </Col>

                <Col span={8}>
                  <Card title="Ảnh đại diện" className="article-image-card">
                    <ImageUpload 
                      value={uploadedImageUrl}
                      onChange={handleImageUpload}
                    />
                    
                    {uploadedImageUrl && (
                      <div style={{ marginTop: 16 }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Ảnh hiện tại đã được chọn
                        </Text>
                      </div>
                    )}
                  </Card>
                </Col>
              </Row>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default EditArticlePage;
