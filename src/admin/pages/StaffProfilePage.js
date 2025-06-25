import React, { useState, useEffect, useRef } from 'react';
import {
  Card, 
  Row, 
  Col, 
  Avatar, 
  Typography, 
  Button, 
  Descriptions,
  Space,
  Spin,
  message,
  notification,
  Layout,
  Input,
  Select,
  DatePicker,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  TeamOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { UserAPI } from '../../api/User';
import StaffHeader from '../components/StaffHeader';
import StaffNavbar from '../components/StaffNavbar';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Content } = Layout;
const { Option } = Select;

const StaffProfilePage = () => {
  const [api, contextHolder] = notification.useNotification();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [bloodTypes, setBloodTypes] = useState([]);
  const [genders, setGenders] = useState([]);
  const [occupations, setOccupations] = useState([]);
  const [editValues, setEditValues] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return dayjs(dateString).format('DD/MM/YYYY');
    } catch (error) {
      return 'N/A';
    }
  };

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

        setUser(userInfo);
      } catch (error) {
        console.error("Error loading user profile:", error);
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (userInfo) {
          setUser(userInfo);
        } else {
          message.error("Failed to load profile information");
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchBloodTypes = async () => {
      try {
        const response = await UserAPI.getBloodTypes();
        if (response.status === 200) {
          setBloodTypes(response.data.result || response.data);
        }
      } catch (error) {
        console.error("Error fetching blood types:", error);
        setBloodTypes([
          { id: 1, name: 'A+' },
          { id: 2, name: 'A-' },
          { id: 3, name: 'B+' },
          { id: 4, name: 'B-' },
          { id: 5, name: 'AB+' },
          { id: 6, name: 'AB-' },
          { id: 7, name: 'O+' },
          { id: 8, name: 'O-' }
        ]);
      }
    };

    const fetchGenders = async () => {
      try {
        const response = await UserAPI.getGenders();
        if (response.status === 200) {
          const genderData = response.data.result || response.data;
          setGenders(genderData);
        }
      } catch (error) {
        console.error("Error fetching genders:", error);
      }
    };

    const fetchOccupations = async () => {
      try {
        const response = await UserAPI.getOccupations();
        if (response.status === 200) {
          const occupationData = response.data.result || response.data;
          setOccupations(occupationData);
        }
      } catch (error) {
        console.error("Error fetching occupations:", error);
      }
    };

    fetchUserProfile();
    fetchBloodTypes();
    fetchGenders();
    fetchOccupations();
  }, [navigate]);

  const handleEditProfile = () => {
    setEditValues({
      fullName: user?.FullName || user?.name || '',
      phoneNumber: user?.PhoneNumber || '',
      address: user?.Address || '',
      dateOfBirth: user?.DateOfBirth ? dayjs(user.DateOfBirth) : null,
      genderId: user?.GenderId || user?.GenderID || '',
      bloodTypeId: user?.BloodTypeId || user?.BloodTypeID || '',
      occupationId: user?.OccupationId || user?.OccupationID || ''
    });
    setEditMode(true);
    setValidationErrors({});
  };

  const handleSaveProfile = async () => {
    try {
      setEditLoading(true);
      setValidationErrors({});

      const errors = {};
      if (!editValues.fullName?.trim()) errors.fullName = 'Họ tên không được để trống';
      if (!editValues.phoneNumber?.trim()) errors.phoneNumber = 'Số điện thoại không được để trống';
      if (!editValues.address?.trim()) errors.address = 'Địa chỉ không được để trống';
      if (!editValues.dateOfBirth) errors.dateOfBirth = 'Ngày sinh không được để trống';
      if (!editValues.genderId) errors.genderId = 'Giới tính không được để trống';
      if (!editValues.bloodTypeId) errors.bloodTypeId = 'Nhóm máu không được để trống';

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      const updateData = {
        FullName: editValues.fullName,
        PhoneNumber: editValues.phoneNumber,
        Address: editValues.address,
        DateOfBirth: editValues.dateOfBirth.format('YYYY-MM-DD'),
        GenderId: editValues.genderId,
        BloodTypeId: editValues.bloodTypeId,
        OccupationId: editValues.occupationId || null
      };

      const response = await UserAPI.updateUserProfile(updateData);
      
      if (response.status === 200) {
        const updatedUserInfo = { 
          ...user, 
          ...updateData,
          GenderID: updateData.GenderId,
          BloodTypeID: updateData.BloodTypeId,
          OccupationID: updateData.OccupationId
        };
        localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
        setUser(updatedUserInfo);
        
        setEditMode(false);
        api.success({
          message: 'Cập nhật thành công!',
          description: 'Thông tin cá nhân đã được cập nhật',
          placement: 'topRight',
          duration: 3,
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      api.error({
        message: 'Cập nhật thất bại!',
        description: 'Có lỗi xảy ra khi cập nhật thông tin',
        placement: 'topRight',
        duration: 3,
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditValues({});
    setValidationErrors({});
  };

  const handleFieldChange = (field, value) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const getBloodTypeDisplay = (bloodTypeID) => {
    const bloodType = bloodTypes.find(bt => bt.id === bloodTypeID || bt.Id === bloodTypeID);
    return bloodType ? bloodType.name || bloodType.Name : 'N/A';
  };

  const getGenderDisplay = (genderID) => {
    const gender = genders.find(g => g.id === genderID || g.Id === genderID);
    return gender ? gender.name || gender.Name : 'N/A';
  };

  const getOccupationDisplay = (occupationID) => {
    const occupation = occupations.find(o => o.id === occupationID || o.Id === occupationID);
    return occupation ? occupation.name || occupation.Name : 'N/A';
  };

  if (loading) {
    return (
      <Layout className="staff-layout">
        <Layout className="staff-main-layout">
          <StaffHeader />
          <Layout className="staff-content-layout">
            <StaffNavbar />
            <Content className="staff-content" style={{ padding: '0 48px' }}>
              <div style={{ textAlign: 'center', marginTop: '100px' }}>
                <Spin size="large" />
              </div>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout className="staff-layout">
        <Layout className="staff-main-layout">
          <StaffHeader />
          <Layout className="staff-content-layout">
            <StaffNavbar />
            <Content className="staff-content" style={{ padding: '0 48px' }}>
              <div style={{ textAlign: 'center', marginTop: '100px' }}>
                <Text type="danger">Failed to load user profile</Text>
              </div>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    );
  }

  return (
    <Layout className="staff-layout">
      {contextHolder}
      <Layout className="staff-main-layout">
        <StaffHeader />
        <Layout className="staff-content-layout">
          <StaffNavbar />
          <Content className="staff-content" style={{ padding: '0 48px' }}>
            <div className="profile-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <Title level={2} className="profile-title">
                <UserOutlined /> Hồ Sơ Nhân Viên
              </Title>

              <Row gutter={[24, 24]}>
                <Col span={24}>
                  <Card 
                    title="Thông Tin Cá Nhân"
                    extra={
                      !editMode ? (
                        <Button 
                          type="primary" 
                          icon={<EditOutlined />}
                          onClick={handleEditProfile}
                        >
                          Chỉnh Sửa
                        </Button>
                      ) : (
                        <Space>
                          <Button onClick={handleCancelEdit}>
                            Hủy
                          </Button>
                          <Button 
                            type="primary" 
                            loading={editLoading}
                            onClick={handleSaveProfile}
                          >
                            Lưu
                          </Button>
                        </Space>
                      )
                    }
                    className="profile-card"
                  >
                    <Row gutter={[24, 16]}>
                      <Col xs={24} md={8}>
                        <div className="profile-avatar-section">
                          <Avatar size={120} icon={<UserOutlined />} className="profile-avatar" />
                          <div className="profile-basic-info">
                            <Title level={4} className="profile-name">
                              {user?.FullName || user?.name || 'N/A'}
                            </Title>
                            <Text className="profile-role">
                              <TeamOutlined /> Nhân viên
                            </Text>
                          </div>
                        </div>
                      </Col>

                      <Col xs={24} md={16}>
                        {editMode ? (
                          <div className="profile-edit-form">
                            <Row gutter={[16, 16]}>
                              <Col span={12}>
                                <label>Họ và tên *</label>
                                <Input
                                  value={editValues.fullName}
                                  onChange={(e) => handleFieldChange('fullName', e.target.value)}
                                  status={validationErrors.fullName ? 'error' : ''}
                                  placeholder="Nhập họ và tên"
                                />
                                {validationErrors.fullName && (
                                  <Text type="danger" style={{ fontSize: '12px' }}>
                                    {validationErrors.fullName}
                                  </Text>
                                )}
                              </Col>

                              <Col span={12}>
                                <label>Số điện thoại *</label>
                                <Input
                                  value={editValues.phoneNumber}
                                  onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                                  status={validationErrors.phoneNumber ? 'error' : ''}
                                  placeholder="Nhập số điện thoại"
                                />
                                {validationErrors.phoneNumber && (
                                  <Text type="danger" style={{ fontSize: '12px' }}>
                                    {validationErrors.phoneNumber}
                                  </Text>
                                )}
                              </Col>

                              <Col span={24}>
                                <label>Địa chỉ *</label>
                                <Input
                                  value={editValues.address}
                                  onChange={(e) => handleFieldChange('address', e.target.value)}
                                  status={validationErrors.address ? 'error' : ''}
                                  placeholder="Nhập địa chỉ"
                                />
                                {validationErrors.address && (
                                  <Text type="danger" style={{ fontSize: '12px' }}>
                                    {validationErrors.address}
                                  </Text>
                                )}
                              </Col>

                              <Col span={8}>
                                <label>Ngày sinh *</label>
                                <DatePicker
                                  value={editValues.dateOfBirth}
                                  onChange={(date) => handleFieldChange('dateOfBirth', date)}
                                  status={validationErrors.dateOfBirth ? 'error' : ''}
                                  placeholder="Chọn ngày sinh"
                                  style={{ width: '100%' }}
                                  format="DD/MM/YYYY"
                                />
                                {validationErrors.dateOfBirth && (
                                  <Text type="danger" style={{ fontSize: '12px' }}>
                                    {validationErrors.dateOfBirth}
                                  </Text>
                                )}
                              </Col>

                              <Col span={8}>
                                <label>Giới tính *</label>
                                <Select
                                  value={editValues.genderId}
                                  onChange={(value) => handleFieldChange('genderId', value)}
                                  status={validationErrors.genderId ? 'error' : ''}
                                  placeholder="Chọn giới tính"
                                  style={{ width: '100%' }}
                                >
                                  {genders.map(gender => (
                                    <Option key={gender.id || gender.Id} value={gender.id || gender.Id}>
                                      {gender.name || gender.Name}
                                    </Option>
                                  ))}
                                </Select>
                                {validationErrors.genderId && (
                                  <Text type="danger" style={{ fontSize: '12px' }}>
                                    {validationErrors.genderId}
                                  </Text>
                                )}
                              </Col>

                              <Col span={8}>
                                <label>Nhóm máu *</label>
                                <Select
                                  value={editValues.bloodTypeId}
                                  onChange={(value) => handleFieldChange('bloodTypeId', value)}
                                  status={validationErrors.bloodTypeId ? 'error' : ''}
                                  placeholder="Chọn nhóm máu"
                                  style={{ width: '100%' }}
                                >
                                  {bloodTypes.map(bloodType => (
                                    <Option key={bloodType.id || bloodType.Id} value={bloodType.id || bloodType.Id}>
                                      {bloodType.name || bloodType.Name}
                                    </Option>
                                  ))}
                                </Select>
                                {validationErrors.bloodTypeId && (
                                  <Text type="danger" style={{ fontSize: '12px' }}>
                                    {validationErrors.bloodTypeId}
                                  </Text>
                                )}
                              </Col>

                              <Col span={12}>
                                <label>Nghề nghiệp</label>
                                <Select
                                  value={editValues.occupationId}
                                  onChange={(value) => handleFieldChange('occupationId', value)}
                                  placeholder="Chọn nghề nghiệp"
                                  style={{ width: '100%' }}
                                  allowClear
                                >
                                  {occupations.map(occupation => (
                                    <Option key={occupation.id || occupation.Id} value={occupation.id || occupation.Id}>
                                      {occupation.name || occupation.Name}
                                    </Option>
                                  ))}
                                </Select>
                              </Col>
                            </Row>
                          </div>
                        ) : (
                          <Descriptions column={2} className="profile-descriptions">
                            <Descriptions.Item label="Email" span={2}>
                              <Space>
                                <MailOutlined />
                                {user?.Email || user?.email || 'N/A'}
                              </Space>
                            </Descriptions.Item>

                            <Descriptions.Item label="Số điện thoại">
                              <Space>
                                <PhoneOutlined />
                                {user?.PhoneNumber || 'N/A'}
                              </Space>
                            </Descriptions.Item>

                            <Descriptions.Item label="Ngày sinh">
                              <Space>
                                <CalendarOutlined />
                                {formatDate(user?.DateOfBirth)}
                              </Space>
                            </Descriptions.Item>

                            <Descriptions.Item label="Địa chỉ" span={2}>
                              <Space>
                                <EnvironmentOutlined />
                                {user?.Address || 'N/A'}
                              </Space>
                            </Descriptions.Item>

                            <Descriptions.Item label="Giới tính">
                              <TeamOutlined style={{ marginRight: 8 }} />
                              {getGenderDisplay(user?.GenderId || user?.GenderID)}
                            </Descriptions.Item>

                            <Descriptions.Item label="Nhóm máu">
                              <IdcardOutlined style={{ marginRight: 8 }} />
                              {getBloodTypeDisplay(user?.BloodTypeId || user?.BloodTypeID)}
                            </Descriptions.Item>

                            <Descriptions.Item label="Nghề nghiệp" span={2}>
                              <Space>
                                <BankOutlined />
                                {getOccupationDisplay(user?.OccupationId || user?.OccupationID)}
                              </Space>
                            </Descriptions.Item>
                          </Descriptions>
                        )}
                      </Col>
                    </Row>
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

export default StaffProfilePage; 