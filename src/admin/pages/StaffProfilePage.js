import React, { useState, useEffect } from 'react';
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
  HeartOutlined,
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

        // Always start with localStorage data as fallback
        setUser(userInfo);

        // Try to get fresh data from API
        try {
          const userId = userInfo.UserId || userInfo.UserID || userInfo.id;
          
          if (userId) {
            const response = await UserAPI.getUserById(userId);
            
            if (response.status === 200 && response.data) {
              const userData = response.data.result || response.data;
              
              // Only update if we got valid data
              if (userData && (userData.FullName || userData.Email || userData.UserId || userData.UserID)) {
                setUser(userData);
                localStorage.setItem("userInfo", JSON.stringify(userData));
              }
            }
          }
        } catch (apiError) {
          console.error("API call failed, using localStorage data:", apiError);
          // Keep using localStorage data as fallback
        }        } catch (error) {
        console.error("Error in fetchUserProfile:", error);
        // Final fallback to stored userInfo
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
          const bloodTypeData = response.data.result || response.data;
          setBloodTypes(bloodTypeData);
        }
      } catch (error) {
        console.error("Error fetching blood types:", error);
        const fallbackBloodTypes = [
          { id: 1, name: 'A+' },
          { id: 2, name: 'A-' },
          { id: 3, name: 'B+' },
          { id: 4, name: 'B-' },
          { id: 5, name: 'AB+' },
          { id: 6, name: 'AB-' },
          { id: 7, name: 'O+' },
          { id: 8, name: 'O-' }
        ];
        setBloodTypes(fallbackBloodTypes);
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
        // Add some fallback genders
        const fallbackGenders = [
          { id: 1, name: 'Nam' },
          { id: 2, name: 'Nữ' },
          { id: 3, name: 'Khác' }
        ];
        setGenders(fallbackGenders);
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
        // Add some fallback occupations
        const fallbackOccupations = [
          { id: 1, name: 'Sinh viên' },
          { id: 2, name: 'Nhân viên văn phòng' },
          { id: 3, name: 'Giáo viên' },
          { id: 4, name: 'Bác sĩ' },
          { id: 5, name: 'Kỹ sư' }
        ];
        setOccupations(fallbackOccupations);
      }
    };

    fetchUserProfile();
    fetchBloodTypes();
    fetchGenders();
    fetchOccupations();
  }, [navigate]);

  const handleEditProfile = () => {
    if (!user) {
      return;
    }

    setEditMode(true);
  };

  // Initialize edit values when edit mode is enabled
  useEffect(() => {
    if (editMode && user && genders.length > 0 && bloodTypes.length > 0 && occupations.length > 0) {
      const genderIdValue = user.GenderId || user.GenderID || user.genderId;
      const bloodTypeIdValue = user.BloodTypeId || user.BloodTypeID || user.bloodTypeId;
      const occupationIdValue = user.OccupationId || user.OccupationID || user.occupationId;
      
      // Ensure IDs are numbers for proper matching
      const parsedGenderId = genderIdValue ? parseInt(genderIdValue) : null;
      const parsedBloodTypeId = bloodTypeIdValue ? parseInt(bloodTypeIdValue) : null;
      const parsedOccupationId = occupationIdValue ? parseInt(occupationIdValue) : null;
      
      setEditValues({
        fullName: user.fullName || user.FullName || user.name || user.username || '',
        phoneNumber: user.PhoneNumber || user.phoneNumber || '',
        address: user.Address || user.address || '',
        nationalID: user.NationalId || user.NationalID || user.nationalId || '',
        dateOfBirth: user.DateOfBirth || user.dateOfBirth || null,
        genderID: parsedGenderId,
        bloodTypeID: parsedBloodTypeId,
        occupationID: parsedOccupationId
      });
    }
  }, [editMode, user, genders, bloodTypes, occupations]);

  const handleSaveProfile = async () => {
    try {
      setEditLoading(true);
      
      // Check for validation errors
      const hasValidationErrors = Object.values(validationErrors).some(error => error !== null);
      if (hasValidationErrors) {
        message.error('Vui lòng sửa các lỗi trong biểu mẫu trước khi lưu');
        setEditLoading(false);
        return;
      }

      // Validate required fields
      if (editValues.nationalID && !/^\d{12}$/.test(editValues.nationalID)) {
        message.error('Số CCCD phải có đúng 12 chữ số');
        setEditLoading(false);
        return;
      }

      if (editValues.phoneNumber && !/^\d{10}$/.test(editValues.phoneNumber)) {
        message.error('Số điện thoại phải có đúng 10 chữ số');
        setEditLoading(false);
        return;
      }
        
      // Prepare the data for API - only include fields that have values
      const updateData = {};
      
      if (editValues.fullName?.trim()) {
        updateData.FullName = editValues.fullName.trim();
      }
      
      if (editValues.phoneNumber?.trim()) {
        updateData.PhoneNumber = editValues.phoneNumber.trim();
      }
      
      if (editValues.address?.trim()) {
        updateData.Address = editValues.address.trim();
      }
      
      if (editValues.nationalID?.trim()) {
        updateData.NationalID = editValues.nationalID.trim();
      }
      
      if (editValues.dateOfBirth) {
        updateData.DateOfBirth = editValues.dateOfBirth;
      }
      
      if (editValues.genderID !== null && editValues.genderID !== undefined) {
        updateData.GenderID = editValues.genderID;
      }
      
      if (editValues.bloodTypeID !== null && editValues.bloodTypeID !== undefined) {
        updateData.BloodTypeID = editValues.bloodTypeID;
      }
      
      if (editValues.occupationID !== null && editValues.occupationID !== undefined) {
        updateData.OccupationID = editValues.occupationID;
      }

// Call the update API  
      const userId = user.UserId || user.UserID || user.userId;
      
      if (!userId) {
        throw new Error("User ID not found");
      }
      
      const response = await UserAPI.updateDonor(userId, updateData);
      
      if (response.status === 200) {
        // Fetch fresh user data from API to ensure we have all fields
        try {
          const freshDataResponse = await UserAPI.getUserById(userId);
          if (freshDataResponse.status === 200 && freshDataResponse.data) {
            const freshUserData = freshDataResponse.data.result || freshDataResponse.data;
            
            // Update both state and localStorage with fresh data
            setUser(freshUserData);
            localStorage.setItem("userInfo", JSON.stringify(freshUserData));
          } else {
            // Fallback: carefully merge update data with existing user data
            const updatedUser = { ...user, ...updateData };
            setUser(updatedUser);
            localStorage.setItem("userInfo", JSON.stringify(updatedUser));
          }
        } catch (fetchError) {
          console.error('Failed to fetch fresh data after update:', fetchError);
          // Fallback: carefully merge update data with existing user data
          const updatedUser = { ...user, ...updateData };
          setUser(updatedUser);
          localStorage.setItem("userInfo", JSON.stringify(updatedUser));
        }
        
        setEditMode(false);
        setEditValues({});
        setValidationErrors({});
        
        api.success({
          message: 'Cập nhật thành công!',
          description: 'Thông tin cá nhân đã được cập nhật',
          placement: 'topRight',
          duration: 3,
        });
      }
    } catch (error) {
      console.error('Update profile error:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi cập nhật thông tin';
      if (error.response?.status === 400) {
        const backendMessage = error.response?.data?.message || error.response?.data?.title;
        errorMessage = backendMessage || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy người dùng. Vui lòng đăng nhập lại.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'; 
      }
      
      api.error({
        message: 'Cập nhật thất bại!',
        description: errorMessage,
        placement: 'topRight',
        duration: 5,
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
    // Clear previous validation error for this field
    setValidationErrors(prev => ({
      ...prev,
      [field]: null
    }));

    // Validate based on field type
    let validationError = null;
    
    if (field === 'nationalID') {
      // CCCD must be exactly 12 digits
      if (value && !/^\d{12}$/.test(value)) {
        validationError = 'Số CCCD phải có đúng 12 chữ số';
      }
    } else if (field === 'phoneNumber') {
      // Phone number must be exactly 10 digits
      if (value && !/^\d{10}$/.test(value)) {
        validationError = 'Số điện thoại phải có 10 chữ số';
      }
    }

    // Set validation error if any
    if (validationError) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: validationError
      }));
    }

    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getBloodTypeDisplay = (bloodTypeID) => {
    if (!bloodTypeID || bloodTypes.length === 0) {
      return 'N/A';
    }
    
    // Convert to number for comparison
    const numericID = parseInt(bloodTypeID);
    
    // Try to find with different field names and both string and number comparison
    const bloodType = bloodTypes.find(bt => 
      (bt.id && (bt.id === bloodTypeID || bt.id === numericID)) || 
      (bt.Id && (bt.Id === bloodTypeID || bt.Id === numericID)) ||
      (bt.ID && (bt.ID === bloodTypeID || bt.ID === numericID))
    );
    
    return bloodType ? (bloodType.name || bloodType.Name || bloodType.NAME) : 'N/A';
  };

  const getGenderDisplay = (genderID) => {
    if (!genderID || genders.length === 0) {
      return 'N/A';
    }
    
    // Convert to number for comparison
    const numericID = parseInt(genderID);
    
    // Try to find with different field names and both string and number comparison
    const gender = genders.find(g => 
      (g.id && (g.id === genderID || g.id === numericID)) || 
      (g.Id && (g.Id === genderID || g.Id === numericID)) ||
      (g.ID && (g.ID === genderID || g.ID === numericID))
    );
    
    return gender ? (gender.name || gender.Name || gender.NAME) : 'N/A';
  };

  const getOccupationDisplay = (occupationID) => {
    if (!occupationID || occupations.length === 0) {
      return 'N/A';
    }
    
    // Convert to number for comparison
    const numericID = parseInt(occupationID);
    
    // Try to find with different field names and both string and number comparison
    const occupation = occupations.find(o => 
      (o.id && (o.id === occupationID || o.id === numericID)) || 
      (o.Id && (o.Id === occupationID || o.Id === numericID)) ||
      (o.ID && (o.ID === occupationID || o.ID === numericID))
    );
    
    return occupation ? (occupation.name || occupation.Name || occupation.NAME) : 'N/A';
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
                              {(() => {
                                const displayName = user?.fullName || user?.FullName || user?.name || user?.username || 'N/A';
                                return displayName;
                              })()}
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
                                  placeholder="Nhập họ và tên"
                                />
                              </Col>

                              <Col span={12}>
                                <label>Số điện thoại *</label>
                                <div>
                                  <Input
                                    value={editValues.phoneNumber}
                                    onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                                    placeholder="Nhập số điện thoại (10 chữ số)"
                                    status={validationErrors.phoneNumber ? 'error' : ''}
                                    maxLength={10}
                                  />
                                  {validationErrors.phoneNumber && (
                                    <Text type="danger" style={{ fontSize: '12px' }}>
                                      {validationErrors.phoneNumber}
                                    </Text>
                                  )}
                                </div>
                              </Col>

                              <Col span={12}>
                                <label>Số CMND/CCCD *</label>
                                <div>
                                  <Input
                                    value={editValues.nationalID}
                                    onChange={(e) => handleFieldChange('nationalID', e.target.value)}
                                    placeholder="Nhập số CCCD (12 chữ số)"
                                    status={validationErrors.nationalID ? 'error' : ''}
                                    maxLength={12}
                                  />
                                  {validationErrors.nationalID && (
                                    <Text type="danger" style={{ fontSize: '12px' }}>
                                      {validationErrors.nationalID}
                                    </Text>
                                  )}
                                </div>
                              </Col>

                              <Col span={12}>
                                <label>Ngày sinh *</label>
                                <DatePicker
                                  value={editValues.dateOfBirth ? dayjs(editValues.dateOfBirth) : null}
                                  onChange={(date) => handleFieldChange('dateOfBirth', date?.format('YYYY-MM-DD'))}
                                  placeholder="Chọn ngày sinh"
                                  style={{ width: '100%' }}
                                  format="DD/MM/YYYY"
                                />
                              </Col>

                              <Col span={24}>
                                <label>Địa chỉ *</label>
                                <Input.TextArea
                                  value={editValues.address}
                                  onChange={(e) => handleFieldChange('address', e.target.value)}
                                  placeholder="Nhập địa chỉ"
                                  rows={2}
                                />
                              </Col>

                              <Col span={8}>
                                <label>Giới tính *</label>
                                <Select
                                  value={editValues.genderID}
                                  onChange={(value) => handleFieldChange('genderID', value)}
                                  placeholder="Chọn giới tính"
                                  style={{ width: '100%' }}
                                >
                                  {genders.map(gender => (
                                    <Option key={gender.id || gender.Id} value={gender.id || gender.Id}>
                                      {gender.name || gender.Name}
                                    </Option>
                                  ))}
                                </Select>
                              </Col>

                              <Col span={8}>
                                <label>Nhóm máu *</label>
                                <Select
                                  value={editValues.bloodTypeID}
                                  onChange={(value) => handleFieldChange('bloodTypeID', value)}
                                  placeholder="Chọn nhóm máu"
                                  style={{ width: '100%' }}
                                >
                                  {bloodTypes.map(bloodType => (
                                    <Option key={bloodType.id || bloodType.Id} value={bloodType.id || bloodType.Id}>
                                      {bloodType.name || bloodType.Name}
                                    </Option>
                                  ))}
                                </Select>
                              </Col>

                              <Col span={8}>
                                <label>Nghề nghiệp</label>
                                <Select
                                  value={editValues.occupationID}
                                  onChange={(value) => handleFieldChange('occupationID', value)}
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
                                {(() => {
                                  const email = user?.Email || user?.email || 'N/A';
                                  return email;
                                })()}
                              </Space>
                            </Descriptions.Item>

                            <Descriptions.Item label="Số điện thoại">
                              <Space>
                                <PhoneOutlined />
                                {user?.PhoneNumber || user?.phoneNumber || 'N/A'}
                              </Space>
                            </Descriptions.Item>

                            <Descriptions.Item label="Số CMND/CCCD">
                              <Space>
                                <IdcardOutlined />
                                {user?.NationalId || user?.NationalID || user?.nationalId || 'N/A'}
                              </Space>
                            </Descriptions.Item>

                            <Descriptions.Item label="Ngày sinh">
                              <Space>
                                <CalendarOutlined />
                                {formatDate(user?.DateOfBirth || user?.dateOfBirth)}
                              </Space>
                            </Descriptions.Item>

                            <Descriptions.Item label="Giới tính">
                              <TeamOutlined style={{ marginRight: 8 }} />
                              {genders.length > 0 ? getGenderDisplay(user?.GenderId || user?.GenderID || user?.genderId) : 'Đang tải...'}
                            </Descriptions.Item>

                            <Descriptions.Item label="Địa chỉ" span={2}>
                              <Space>
                                <EnvironmentOutlined />
                                {user?.Address || user?.address || 'N/A'}
                              </Space>
                            </Descriptions.Item>

                            <Descriptions.Item label="Nhóm máu">
                              <Space>
                                <HeartOutlined />
                                {bloodTypes.length > 0 ? getBloodTypeDisplay(user?.BloodTypeId || user?.BloodTypeID || user?.bloodTypeId) : 'Đang tải...'}
                              </Space>
                            </Descriptions.Item>

                            <Descriptions.Item label="Nghề nghiệp">
                              <Space>
                                <BankOutlined />
                                {occupations.length > 0 ? getOccupationDisplay(user?.OccupationId || user?.OccupationID || user?.occupationId) : 'Đang tải...'}
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