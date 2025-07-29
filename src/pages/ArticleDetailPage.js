import React, { useState, useEffect } from "react";
import { 
  Layout, 
  Typography, 
  Card, 
  Button, 
  Tag, 
  Spin, 
  message,
  Space
} from "antd";
import {
  CalendarOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import ProfileWarning from "../components/ProfileWarning";
import Footer from "../components/Footer";
import { UserAPI } from "../api/User";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const ArticleDetailPage = () => {
  const [article, setArticle] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const { articleId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await UserAPI.getArticleById(articleId);
      console.log("Article API Response:", response.data);
      
      if (response.status === 200) {
        // Handle different response structures
        const articleData = response.data.data || response.data;
        console.log("Processed article data:", articleData);
        setArticle(articleData);

        // Fetch category name if available
        if (articleData.articleCategoryId) {
          fetchCategoryName(articleData.articleCategoryId);
        }
      }
    } catch (error) {
      console.error("Error fetching article:", error);
      message.error("Không thể tải bài viết. Vui lòng thử lại sau.");
      navigate("/news");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryName = async (categoryId) => {
    try {
      const response = await UserAPI.getArticleCategories();
      if (response.status === 200) {
        const categories = response.data || [];
        const category = categories.find(cat => cat.id === categoryId);
        setCategoryName(category ? category.name : `Danh mục ${categoryId}`);
      }
    } catch (error) {
      console.error("Error fetching category:", error);
      setCategoryName(`Danh mục ${categoryId}`);
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (error) {
      return "N/A";
    }
  };

  const handleBackToNews = () => {
    navigate("/news");
  };

  if (loading) {
    return (
      <Layout className="article-detail-page">
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

  if (!article) {
    return (
      <Layout className="article-detail-page">
        <Header />
        <Navbar />
        <ProfileWarning />
        <Content style={{ textAlign: "center", padding: "50px" }}>
          <Title level={3}>Không tìm thấy bài viết</Title>
          <Button type="primary" onClick={handleBackToNews}>
            Quay lại trang tin tức
          </Button>
        </Content>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout className="article-detail-page">
      <Header />
      <Navbar />
      <ProfileWarning />

      <Content className="article-detail-content">
        <div className="article-detail-container" style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
          {/* Back Button */}
          <div style={{ marginBottom: "20px" }}>
            <Button 
              type="link" 
              icon={<ArrowLeftOutlined />}
              onClick={handleBackToNews}
              style={{ padding: 0, fontWeight: "500" }}
            >
              Quay lại tin tức
            </Button>
          </div>

          {/* Article Header */}
          <Card className="article-header" style={{ marginBottom: "20px" }}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Article Meta */}
              <div className="article-meta">
                <Space wrap>
                  <Tag icon={<CalendarOutlined />} color="blue">
                    {formatDate(article.createdAt)}
                  </Tag>
                  {categoryName && (
                    <Tag color="red">{categoryName}</Tag>
                  )}
                </Space>
              </div>

              {/* Article Title */}
              <Title level={1} style={{ margin: 0, fontSize: "28px", lineHeight: "1.3" }}>
                {article.title}
              </Title>

              {/* Article Summary */}
              {article.summary && (
                <Paragraph style={{ 
                  fontSize: "16px", 
                  color: "#666", 
                  fontStyle: "italic",
                  margin: 0
                }}>
                  {article.summary}
                </Paragraph>
              )}
            </Space>
          </Card>

          {/* Article Image */}
          {article.picture && (
            <div style={{ marginBottom: "30px", textAlign: "center" }}>
              <img 
                src={article.picture}
                alt={article.title}
                style={{ 
                  width: "100%", 
                  maxHeight: "400px", 
                  objectFit: "cover",
                  borderRadius: "8px"
                }}
              />
            </div>
          )}

          {/* Article Content */}
          <Card className="article-content">
            <div 
              style={{ 
                fontSize: "16px", 
                lineHeight: "1.8",
                color: "#333",
                whiteSpace: "pre-wrap"
              }}
              dangerouslySetInnerHTML={{ 
                __html: article.content || "Nội dung bài viết không có sẵn." 
              }}
            />
          </Card>

          {/* Back to News Button */}
          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <Button 
              type="primary" 
              size="large"
              onClick={handleBackToNews}
              style={{
                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                padding: "0 30px"
              }}
            >
              Quay lại trang tin tức
            </Button>
          </div>
        </div>
      </Content>

      <Footer />
    </Layout>
  );
};

export default ArticleDetailPage;
