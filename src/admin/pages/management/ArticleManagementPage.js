import React, { useState, useEffect, useCallback } from 'react';
import { 
  Layout,
  Table, 
  Tag, 
  Space, 
  Typography, 
  Select, 
  Button,
  message,
  Modal,
  Image,
  Tooltip
} from 'antd';
import { 
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FileTextOutlined,
  SendOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AdminAPI } from '../../api/admin';
import StaffSidebar from '../../components/StaffSidebar';
import StaffHeader from '../../components/StaffHeader';
import '../../styles/article-management.scss';

const { Content } = Layout;
const { Text, Title } = Typography;
const { Option } = Select;

const ArticleManagementPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [categories, setCategories] = useState({});
  const [statuses, setStatuses] = useState({});
  
  // Modal state
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewArticle, setPreviewArticle] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const navigate = useNavigate();

  const handleDeleteArticle = (article) => {
    setSelectedArticle(article);
    setDeleteModalVisible(true);
  };

  const confirmDeleteArticle = async () => {
    try {
      const response = await AdminAPI.deleteArticle(selectedArticle.articleId);
      if (response.status === 200 || response.status === 204) {
        message.success('Lưu trữ bài viết thành công!');
        setDeleteModalVisible(false);
        setSelectedArticle(null);
        fetchArticles(); // Refresh the articles list
      }
    } catch (error) {
      console.error('Error archiving article:', error);
      if (error.response?.status === 404) {
        message.error('Không tìm thấy bài viết để lưu trữ.');
      } else if (error.response?.status === 403) {
        message.error('Bạn không có quyền lưu trữ bài viết này.');
      } else if (error.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        message.error('Không thể lưu trữ bài viết. Vui lòng thử lại sau.');
      }
    }
  };

  const handlePublishArticle = (article) => {
    setSelectedArticle(article);
    setPublishModalVisible(true);
  };

  const confirmPublishArticle = async () => {
    try {
      const response = await AdminAPI.publishArticle(selectedArticle.articleId);
      if (response.status === 200 || response.status === 204) {
        message.success('Đăng bài viết thành công!');
        setPublishModalVisible(false);
        setSelectedArticle(null);
        fetchArticles(); // Refresh the articles list
      }
    } catch (error) {
      console.error('Error publishing article:', error);
      if (error.response?.status === 404) {
        message.error('Không tìm thấy bài viết để đăng.');
      } else if (error.response?.status === 403) {
        message.error('Bạn không có quyền đăng bài viết này.');
      } else if (error.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        message.error('Không thể đăng bài viết. Vui lòng thử lại sau.');
      }
    }
  };

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const categoryId = selectedCategory === 'all' ? null : selectedCategory;
      const statusId = selectedStatus === 'all' ? null : selectedStatus;
      
      const response = await AdminAPI.getArticles(1, 100, categoryId, statusId); // Get first 100 articles
      
      // Handle the new API response structure
      if (response.data && response.data.data) {
        // New structure: response.data.data contains the articles array
        const articlesData = Array.isArray(response.data.data) ? response.data.data : [];
        setArticles(articlesData);
      } else {
        // Fallback for old structure
        const articlesData = Array.isArray(response.data) ? response.data : [];
        setArticles(articlesData);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      message.error('Lỗi khi tải danh sách tin tức');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
    fetchStatuses();
  }, [fetchArticles]);

  const fetchCategories = async () => {
    try {
      const response = await AdminAPI.getArticleCategories();
      
      // Handle the new API response structure
      let categoriesData = [];
      if (response.data && response.data.data) {
        // New structure: response.data.data contains the categories array
        categoriesData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (response.data) {
        // Fallback for old structure
        categoriesData = Array.isArray(response.data) ? response.data : [];
      }
      
      const categoriesMap = {};
      categoriesData.forEach(category => {
        categoriesMap[category.id] = category;
      });
      setCategories(categoriesMap);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await AdminAPI.getArticleStatuses();
      
      // Handle the new API response structure
      let statusesData = [];
      if (response.data && response.data.data) {
        // New structure: response.data.data contains the statuses array
        statusesData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (response.data) {
        // Fallback for old structure
        statusesData = Array.isArray(response.data) ? response.data : [];
      }
      
      const statusesMap = {};
      statusesData.forEach(status => {
        statusesMap[status.id] = status;
      });
      setStatuses(statusesMap);
    } catch (error) {
      console.error('Error fetching statuses:', error);
    }
  };

  const handlePreview = (article) => {
    setPreviewArticle(article);
    setPreviewVisible(true);
  };

  const handleRefresh = () => {
    fetchArticles();
    message.success('Đã làm mới danh sách tin tức');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (statusName) => {
    const statusColors = {
      'Đã đăng': 'green',
      'Bản nháp': 'orange',
      'Chờ duyệt': 'blue',
      'Đã lưu trữ': 'red'
    };
    return statusColors[statusName] || 'default';
  };

  const getCategoryColor = (categoryName) => {
    const categoryColors = {
      'Tin tức': 'blue',
      'Sự kiện': 'green', 
      'Hoạt động': 'orange',
      'Công nghệ': 'purple',
      'Giáo dục': 'cyan'
    };
    return categoryColors[categoryName] || 'default';
  };

  const articleColumns = [
    {
      title: 'ID',
      dataIndex: 'articleId',
      key: 'articleId',
      width: '8%',
      render: (text) => (
        <span style={{ fontWeight: 'bold', color: '#dc2626' }}>
          #{text || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Ảnh',
      dataIndex: 'picture',
      key: 'picture',
      width: '10%',
      render: (imageUrl) => (
        imageUrl ? (
          <Image
            src={imageUrl}
            alt="Article"
            width={60}
            height={40}
            style={{ objectFit: 'cover', borderRadius: '4px' }}
            preview={{
              mask: <EyeOutlined style={{ color: 'white' }} />
            }}
          />
        ) : (
          <div style={{ 
            width: 60, 
            height: 40, 
            background: '#f5f5f5', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: '4px',
            color: '#999'
          }}>
            No Image
          </div>
        )
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: '25%',
      render: (text) => (
        <Tooltip title={text}>
          <span style={{ fontWeight: '500' }}>
            {text && text.length > 50 ? `${text.substring(0, 50)}...` : text || 'N/A'}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'articleCategoryId',
      key: 'articleCategoryId',
      width: '12%',
      render: (categoryId) => {
        const category = categories[categoryId];
        const displayName = category?.name || 'N/A';
        return (
          <Tag color={getCategoryColor(displayName)}>
            {displayName}
          </Tag>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'articleStatusId',
      key: 'articleStatusId',
      width: '12%',
      render: (statusId) => {
        const status = statuses[statusId];
        const displayName = status?.name || 'N/A';
        return (
          <Tag color={getStatusColor(displayName)}>
            {displayName}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '12%',
      render: (date) => (
        <span style={{ color: '#374151' }}>
          {formatDate(date)}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: '20%',
      render: (_, record) => {
        const isDraft = statuses[record.articleStatusId]?.name?.toLowerCase().includes('nháp') || 
                       statuses[record.articleStatusId]?.name?.toLowerCase().includes('draft');
        
        return (
          <Space size="small" wrap>
            <Tooltip title="Xem chi tiết">
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handlePreview(record)}
              />
            </Tooltip>
            
            {isDraft && (
              <Tooltip title="Đăng bài">
                <Button
                  size="small"
                  type="primary"
                  icon={<SendOutlined />}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                  onClick={() => handlePublishArticle(record)}
                />
              </Tooltip>
            )}
            
            <Tooltip title="Chỉnh sửa">
              <Button
                size="small"
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  navigate(`/staff/edit-article/${record.articleId}`);
                }}
              />
            </Tooltip>
            
            <Tooltip title="Lưu trữ">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteArticle(record)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <Layout className="staff-layout">
      <StaffSidebar
        collapsed={collapsed}
        onCollapse={value => setCollapsed(value)}
      />
      
      <Layout className="staff-main-layout">
        <StaffHeader />

        <Layout className="staff-content-layout">
          <Content className="article-management-content">
            <div className="article-management-container">
              
              {/* Header Section */}
              <div className="article-header-section">
                <Space className="article-controls">
                  <Title level={3} className="article-title">
                    <FileTextOutlined style={{ marginRight: 8, color: '#dc2626' }} />
                    Quản Lý Tin Tức
                  </Title>
                  
                  <div className="article-filters">
                    <Select
                      value={selectedCategory}
                      onChange={setSelectedCategory}
                      style={{ width: 150, marginRight: 12 }}
                      placeholder="Chọn danh mục"
                    >
                      <Option value="all">Tất cả danh mục</Option>
                      {Object.values(categories).map(category => (
                        <Option key={category.id} value={category.id}>
                          {category.name}
                        </Option>
                      ))}
                    </Select>

                    <Select
                      value={selectedStatus}
                      onChange={setSelectedStatus}
                      style={{ width: 150, marginRight: 12 }}
                      placeholder="Chọn trạng thái"
                    >
                      <Option value="all">Tất cả trạng thái</Option>
                      {Object.values(statuses).map(status => (
                        <Option key={status.id} value={status.id}>
                          {status.name}
                        </Option>
                      ))}
                    </Select>

                    <Button
                      icon={<ReloadOutlined />}
                      onClick={handleRefresh}
                      style={{ marginRight: 12 }}
                    >
                      Làm mới
                    </Button>

                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        navigate('/staff/create-article');
                      }}
                    >
                      Tạo tin tức mới
                    </Button>
                  </div>
                </Space>
              </div>

              {/* Table Section */}
              <div className="article-table-container">
                <Table
                  columns={articleColumns}
                  dataSource={articles}
                  rowKey={(record) => record.articleId || Math.random()}
                  loading={loading}
                  pagination={false}
                  size="large"
                  className="article-table"
                  scroll={{ x: 'max-content' }}
                />
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>

      {/* Preview Modal */}
      <Modal
        title="Chi tiết tin tức"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
        className="article-preview-modal"
      >
        {previewArticle && (
          <div className="article-preview-content">
            {previewArticle.picture && (
              <div style={{ marginBottom: 16, textAlign: 'center' }}>
                <Image
                  src={previewArticle.picture}
                  alt="Article"
                  style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'cover' }}
                />
              </div>
            )}
            
            <Title level={4}>{previewArticle.title}</Title>
            
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Tag color={getCategoryColor(categories[previewArticle.articleCategoryId]?.name)}>
                  {categories[previewArticle.articleCategoryId]?.name || 'N/A'}
                </Tag>
                <Tag color={getStatusColor(statuses[previewArticle.articleStatusId]?.name)}>
                  {statuses[previewArticle.articleStatusId]?.name || 'N/A'}
                </Tag>
              </Space>
            </div>
            
            <div style={{ 
              background: '#f5f5f5', 
              padding: 16, 
              borderRadius: 8,
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6
            }}>
              {previewArticle.content || 'Không có nội dung'}
            </div>
            
            <div style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
              <Text>Ngày tạo: {formatDate(previewArticle.createdAt)}</Text>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xác nhận lưu trữ bài viết"
        open={deleteModalVisible}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedArticle(null);
        }}
        footer={[
          <Button 
            key="cancel"
            onClick={() => {
              setDeleteModalVisible(false);
              setSelectedArticle(null);
            }}
          >
            Hủy
          </Button>,
          <Button 
            key="delete"
            type="primary"
            danger
            onClick={confirmDeleteArticle}
          >
            Lưu trữ
          </Button>
        ]}
      >
        <p>Bạn có chắc chắn muốn lưu trữ bài viết "{selectedArticle?.title}"?</p>
        <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
          Bài viết sẽ được chuyển sang trạng thái đã lưu trữ!
        </p>
      </Modal>

      {/* Publish Confirmation Modal */}
      <Modal
        title="Xác nhận đăng bài viết"
        open={publishModalVisible}
        onCancel={() => {
          setPublishModalVisible(false);
          setSelectedArticle(null);
        }}
        footer={[
          <Button 
            key="cancel"
            onClick={() => {
              setPublishModalVisible(false);
              setSelectedArticle(null);
            }}
          >
            Hủy
          </Button>,
          <Button 
            key="publish"
            type="primary"
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            onClick={confirmPublishArticle}
          >
            Đăng bài
          </Button>
        ]}
      >
        <p>Bạn có chắc chắn muốn đăng bài viết "{selectedArticle?.title}"?</p>
        <p style={{ color: '#52c41a', fontWeight: 'bold' }}>
          Bài viết sẽ được chuyển sang trạng thái "Đã đăng" và hiển thị công khai!
        </p>
      </Modal>
    </Layout>
  );
};

export default ArticleManagementPage;
