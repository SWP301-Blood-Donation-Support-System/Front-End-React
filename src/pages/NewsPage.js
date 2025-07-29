import React, { useState, useEffect } from "react";
import { Layout, Typography, Card, Row, Col, Button, Tag, Space, Spin, message } from "antd";
import {
  CalendarOutlined,
  ArrowRightOutlined,
  ReadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import ProfileWarning from "../components/ProfileWarning";
import Footer from "../components/Footer";
import { UserAPI } from "../api/User";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const NewsPage = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch both articles and categories
      const [articlesResponse, categoriesResponse] = await Promise.all([
        UserAPI.getArticles(currentPage, 6),
        UserAPI.getArticleCategories()
      ]);
      
      // Handle categories
      if (categoriesResponse.status === 200) {
        setCategories(categoriesResponse.data || []);
      }
      
      // Handle articles
      if (articlesResponse.status === 200) {
        const data = articlesResponse.data;
        console.log("API Response:", data); // Debug log
        
        // Handle different possible response structures
        let articlesArray = [];
        if (Array.isArray(data)) {
          articlesArray = data;
        } else if (data.result && Array.isArray(data.result)) {
          articlesArray = data.result;
        } else if (data.articles && Array.isArray(data.articles)) {
          articlesArray = data.articles;
        } else if (data.data && Array.isArray(data.data)) {
          articlesArray = data.data;
        } else {
          console.warn("Unexpected API response structure:", data);
          articlesArray = [];
        }
        
        setArticles(articlesArray);
        setTotalPages(data.totalPages || Math.ceil(articlesArray.length / 6) || 1);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Không thể tải tin tức. Vui lòng thử lại sau.");
      // Set empty array on error to prevent map error
      setArticles([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = (articleId) => {
    navigate(`/article/${articleId}`);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : `Danh mục ${categoryId}`;
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit", 
        year: "numeric"
      });
    } catch (error) {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <Layout className="news-page">
        <Header />
        <Navbar />
        <ProfileWarning />
        <Content style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <Spin size="large" />
        </Content>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout className="news-page">
      <Header />
      <Navbar />
      <ProfileWarning />

      <Content className="news-content">
        <div className="news-content-container">
          {/* Page Title */}
          <div className="page-title">
            <div className="page-title-icon">
              <ReadOutlined />
            </div>
            <Title level={1} className="page-title-heading">
              Tin Tức & Hoạt Động
            </Title>
            <Paragraph className="page-title-description">
              Cập nhật những tin tức mới nhất về hoạt động hiến máu và các chương trình tình nguyện.
            </Paragraph>
          </div>

          {/* Articles Grid */}
          <Row gutter={[24, 24]} className="news-grid">
            {Array.isArray(articles) && articles.length > 0 ? (
              articles.map((article) => (
                <Col xs={24} sm={12} lg={8} key={article.id || article.articleId}>
                  <Card
                    hoverable
                    className="news-card"
                    cover={
                      <div
                        className="news-card-cover"
                        style={{ 
                          backgroundImage: article.picture ? `url(${article.picture})` : `url(/images/vn_blog_1.png)`,
                          height: "200px",
                          backgroundSize: "cover",
                          backgroundPosition: "center"
                        }}
                      >
                        <div className="news-card-gradient" />
                      </div>
                    }
                    onClick={() => handleArticleClick(article.id || article.articleId)}
                  >
                    <div className="news-card-content">
                      <div className="news-card-meta">
                        <Tag icon={<CalendarOutlined />} color="blue">
                          {formatDate(article.createdAt || article.publishedDate || article.date)}
                        </Tag>
                        {article.articleCategoryId && (
                          <Tag color="red">{getCategoryName(article.articleCategoryId)}</Tag>
                        )}
                      </div>

                      <Title level={4} className="news-card-title" style={{ 
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: "50px"
                      }}>
                        {article.title}
                      </Title>

                      <Paragraph className="news-card-excerpt" style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical", 
                        overflow: "hidden",
                        minHeight: "60px"
                      }}>
                        {article.summary || article.excerpt || article.content?.substring(0, 150) + "..."}
                      </Paragraph>

                      <div className="news-card-actions">
                        <Button
                          type="link"
                          icon={<EyeOutlined />}
                          className="news-card-action"
                          style={{ padding: 0 }}
                        >
                          Đọc thêm
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))
            ) : (
              <Col span={24}>
                <div style={{ textAlign: "center", padding: "50px" }}>
                  <Title level={4}>Không có tin tức nào</Title>
                  <Paragraph>Hiện tại chưa có bài viết nào được đăng tải.</Paragraph>
                </div>
              </Col>
            )}
          </Row>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-section" style={{ textAlign: "center", marginTop: "40px" }}>
              <Space>
                <Button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Trang trước
                </Button>
                <span>Trang {currentPage} / {totalPages}</span>
                <Button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Trang sau
                </Button>
              </Space>
            </div>
          )}
        </div>
      </Content>

      <Footer />
    </Layout>
  );
};

export default NewsPage;
