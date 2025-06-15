import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Avatar, 
  Typography, 
  Divider, 
  Tag, 
  Button, 
  Descriptions,
  Space,
  Spin,
  message,
  Layout
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  HeartOutlined,
  IdcardOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { UserAPI } from '../api/User';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const { Title, Text } = Typography;

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));

        if (!token || !userInfo) {
          message.error("Please login to view your profile");
          navigate('/login');
          return;
        }

        // You can create a new API function to get detailed user profile
        // For now, using the stored userInfo and extending it
        setUser(userInfo);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        message.error("Failed to load profile information");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getBloodTypeDisplay = (bloodTypeID) => {
    const bloodTypes = {
      1: 'A+',
      2: 'A-',
      3: 'B+',
      4: 'B-',
      5: 'AB+',
      6: 'AB-',
      7: 'O+',
      8: 'O-'
    };
    return bloodTypes[bloodTypeID] || 'Not specified';
  };

  const getGenderDisplay = (genderID) => {
    const genders = {
      1: 'Male',
      2: 'Female',
      3: 'Other'
    };
    return genders[genderID] || 'Not specified';
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-error">
        <Text type="danger">Failed to load user profile</Text>
      </div>
    );
  }

  return (
    <Layout>
      <Header />
      <Navbar />
      <div className="profile-page">
        <div className="profile-container">
          <Title level={2} className="profile-title">
            <UserOutlined /> My Profile
          </Title>

          <Row gutter={[24, 24]}>
            {/* Profile Header Card */}
            <Col span={24}>
              <Card className="profile-header-card">
                <div className="profile-header">                  <Avatar
                    size={120}
                    src={user.picture || "/images/huy1.png"} // Use Google profile picture if available
                    icon={<UserOutlined />}
                    className="profile-avatar"
                  />
                  <div className="profile-header-info">                    <Title level={3} className="profile-name">
                      {user.FullName || user.name || 'User Name'}
                    </Title>
                    <Text className="profile-username">@{user.UserName || user.email?.split('@')[0] || 'username'}</Text>
                    <div className="profile-tags">
                      <Tag color="red" icon={<HeartOutlined />}>
                        {user.DonationCount || 0} Donations
                      </Tag>
                      <Tag color="blue">
                        Blood Type: {getBloodTypeDisplay(user.BloodTypeID)}
                      </Tag>
                    </div>
                  </div>
                  <div className="profile-actions">
                    <Button type="primary" icon={<EditOutlined />}>
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Personal Information */}
            <Col xs={24} lg={12}>
              <Card title="Personal Information" className="profile-info-card">
                <Descriptions column={1} size="middle">                  <Descriptions.Item 
                    label={<span><UserOutlined /> Full Name</span>}
                  >
                    {user.FullName || user.name || 'Not specified'}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span><CalendarOutlined /> Date of Birth</span>}
                  >
                    {formatDate(user.DateOfBirth)}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span><TeamOutlined /> Gender</span>}
                  >
                    {getGenderDisplay(user.GenderID)}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span><IdcardOutlined /> National ID</span>}
                  >
                    {user.NationID || 'Not specified'}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span><EnvironmentOutlined /> Address</span>}
                  >
                    {user.Address || 'Not specified'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* Contact & Account Information */}
            <Col xs={24} lg={12}>
              <Card title="Contact & Account" className="profile-info-card">
                <Descriptions column={1} size="middle">
                  <Descriptions.Item 
                    label={<span><MailOutlined /> Email</span>}
                  >
                    {user.email || 'Not specified'}
                  </Descriptions.Item>                  <Descriptions.Item 
                    label={<span><UserOutlined /> Username</span>}
                  >
                    {user.UserName || user.email?.split('@')[0] || 'Not specified'}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span><PhoneOutlined /> Phone</span>}
                  >
                    {user.Phone || 'Not specified'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* Blood Donation History */}
            <Col span={24}>
              <Card title="Blood Donation History" className="profile-donation-card">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <div className="donation-stat">
                      <div className="stat-number">{user.DonationCount || 0}</div>
                      <div className="stat-label">Total Donations</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="donation-stat">
                      <div className="stat-number">{getBloodTypeDisplay(user.BloodTypeID)}</div>
                      <div className="stat-label">Blood Type</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="donation-stat">
                      <div className="stat-number">
                        {user.LastDonationDate ? formatDate(user.LastDonationDate) : 'Never'}
                      </div>
                      <div className="stat-label">Last Donation</div>
                    </div>
                  </Col>
                </Row>
                
                <Divider />
                
                <div className="donation-actions">
                  <Space>
                    <Button type="primary" size="large">
                      Schedule Donation
                    </Button>
                    <Button type="default" size="large">
                      View Donation History
                    </Button>
                  </Space>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default ProfilePage; 