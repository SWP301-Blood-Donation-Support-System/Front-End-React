import React, { useState, useEffect } from 'react';
import { 
  Layout,
  Table, 
  Tag, 
  Space, 
  Typography, 
  Button,
  message,
  Tooltip,
  Card,
  Row,
  Col,
  Divider,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker
} from 'antd';
import dayjs from 'dayjs';
import { AdminAPI } from '../api/admin';
import StaffNavbar from '../components/StaffNavbar';
import StaffSidebar from '../components/StaffSidebar';
import StaffHeader from '../components/StaffHeader';
import '../styles/donation-records.scss';

const { Content } = Layout;
const { Text, Title } = Typography;
const { Option } = Select;

const DonationRecordsPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [donationRecords, setDonationRecords] = useState([]);
  const [uniqueUsers, setUniqueUsers] = useState([]); // List of unique users for first layer
  const [loading, setLoading] = useState(false);
  const [donors, setDonors] = useState({});
  const [donationTypes, setDonationTypes] = useState({});
  const [bloodTestResults, setBloodTestResults] = useState({});
  const [registrationUsers, setRegistrationUsers] = useState({}); // Cache for registration user data
  const [registrationStatuses, setRegistrationStatuses] = useState({}); // Cache for registration status data
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [form] = Form.useForm();
  
  // View state - for switching between user list, user records, and record details
  const [currentView, setCurrentView] = useState('users'); // 'users' | 'userRecords' | 'recordDetail'
  const [viewTitle, setViewTitle] = useState('Danh Sách Người Hiến Máu');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDonationRecords, setUserDonationRecords] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    fetchAllDonors();
    fetchDonationTypes();
    fetchBloodTestResults();
    fetchDonationRecords();
  }, []);

  const fetchAllDonors = async () => {
    try {
      const response = await AdminAPI.getAllDonors();
      const donorsData = response.data || [];
      
      const donorMap = {};
      donorsData.forEach(donor => {
        const id = donor.userId || donor.UserId || donor.UserID || donor.DonorID || donor.donorId || donor.DonorId || donor.id || donor.Id;
        donorMap[id] = {
          name: donor.fullName || donor.FullName || donor.username || donor.Username || donor.name || donor.Name || `User ${id}`,
          email: donor.email || donor.Email || ''
        };
      });
      
      setDonors(donorMap);
    } catch (error) {
      console.error('Error fetching donors:', error);
    }
  };

  const fetchDonationTypes = async () => {
    try {
      const response = await AdminAPI.getDonationTypes();
      const typesData = response.data || [];
      
      const typeMap = {};
      typesData.forEach(type => {
        const id = type.id || type.Id || type.donationTypeId;
        typeMap[id] = {
          name: type.name || type.Name || type.donationTypeName || `Type ${id}`,
          description: type.description || type.Description || ''
        };
      });
      
      setDonationTypes(typeMap);
    } catch (error) {
      console.error('Error fetching donation types:', error);
      // Fallback data if API fails
      setDonationTypes({
        1: { name: 'Hiến máu toàn phần', description: 'Whole blood donation' },
        2: { name: 'Hiến tiểu cầu', description: 'Platelet donation' },
        3: { name: 'Hiến huyết tương', description: 'Plasma donation' }
      });
    }
  };

  const fetchBloodTestResults = async () => {
    try {
      const response = await AdminAPI.getBloodTestResults();
      const resultsData = response.data || [];
      
      const resultsMap = {};
      resultsData.forEach(result => {
        const id = result.id || result.Id;
        resultsMap[id] = {
          name: result.name || result.Name || `Result ${id}`,
          description: result.description || result.Description || ''
        };
      });
      
      setBloodTestResults(resultsMap);
    } catch (error) {
      console.error('Error fetching blood test results:', error);
      // Fallback data if API fails
      setBloodTestResults({
        1: { name: 'Đang chờ xét nghiệm', description: 'This blood currently being tested' },
        2: { name: 'Máu đạt', description: '' },
        3: { name: 'Máu không đạt', description: '' },
        4: { name: 'Đã hủy', description: '' },
        5: { name: 'Không thể hiến máu', description: '' }
      });
    }
  };

  const fetchDonationRecords = async () => {
    setLoading(true);
    try {
      const response = await AdminAPI.getDonationRecords();
      const data = response.data || [];
      setDonationRecords(data);
      
      // Fetch user data for each registration
      await fetchUserDataForRegistrations(data);
    } catch (error) {
      console.error('Error fetching donation records:', error);
      message.error('Lỗi khi tải dữ liệu hồ sơ hiến máu');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDataForRegistrations = async (records) => {
    const userMap = {};
    const statusMap = {};
    const registrationIds = [...new Set(records.map(record => 
      record.registrationId || record.RegistrationId
    ).filter(Boolean))];

    try {
      // Fetch registration details for each unique registrationId
      const registrationPromises = registrationIds.map(async (regId) => {
        try {
          const response = await AdminAPI.getDonationRegistrationById(regId);
          const registration = response.data;
          
          // Store registration status
          const statusId = registration?.registrationStatusId || registration?.RegistrationStatusId || registration?.RegistrationStatusID;
          statusMap[regId] = statusId;
          
          if (registration && registration.donorId) {
            // Use donorId as userId and fetch donor details for username
            const userId = registration.donorId;
            
            try {
              const donorResponse = await AdminAPI.getDonorById(userId);
              const donor = donorResponse.data;
              const username = donor?.fullName || donor?.FullName || donor?.username || donor?.Username || donor?.name || donor?.Name || `User ${userId}`;
              const address = donor?.address || donor?.Address || 'Chưa cập nhật địa chỉ';
              
              userMap[regId] = { userId, username, address };
            } catch (donorError) {
              // If donor fetch fails, use donorId as both userId and username
              userMap[regId] = { userId, username: `User ${userId}`, address: 'Không thể tải địa chỉ' };
            }
          } else {
            userMap[regId] = { userId: 'N/A', username: 'N/A', address: 'N/A' };
          }
        } catch (error) {
          console.error(`Error fetching registration ${regId}:`, error);
          userMap[regId] = { userId: 'N/A', username: 'N/A', address: 'N/A' };
          statusMap[regId] = null;
        }
      });

      await Promise.all(registrationPromises);
      setRegistrationUsers(userMap);
      setRegistrationStatuses(statusMap);
      
      // Create unique users list for first layer
      createUniqueUsersList(userMap);
    } catch (error) {
      console.error('Error fetching user data for registrations:', error);
    }
  };

  const createUniqueUsersList = (userMap) => {
    const usersSet = new Map();
    
    Object.values(userMap).forEach(userData => {
      if (userData.userId !== 'N/A') {
        usersSet.set(userData.userId, {
          userId: userData.userId,
          username: userData.username,
          address: userData.address || 'Chưa cập nhật địa chỉ'
        });
      }
    });
    
    setUniqueUsers(Array.from(usersSet.values()));
  };

  // Layer 1 → Layer 2: View user's donation records
  const handleViewUserRecords = (user) => {
    setSelectedUser(user);
    
    // Filter donation records for this user
    const userRecords = donationRecords.filter(record => {
      const regId = record.registrationId || record.RegistrationId;
      const userData = registrationUsers[regId];
      return userData && userData.userId === user.userId;
    });
    
    setUserDonationRecords(userRecords);
    setCurrentView('userRecords');
    setViewTitle(`Hồ Sơ Hiến Máu - ${user.username}`);
    setCurrentPage(1);
  };

  // Layer 2 → Layer 3: View record details
  const handleViewRecordDetails = (record) => {
    setSelectedRecord(record);
    
    const recordId = record.donationRecordId || record.DonationRecordId || record.id || 'N/A';
    
    setCurrentView('recordDetail');
    setViewTitle(`Chi Tiết Hồ Sơ Hiến Máu - Mã ${recordId}`);
    setCurrentPage(1);
  };

  // Layer 3 → Layer 2: Back to user records
  const handleBackToUserRecords = () => {
    setCurrentView('userRecords');
    setViewTitle(`Hồ Sơ Hiến Máu - ${selectedUser?.username}`);
    setCurrentPage(1);
    setSelectedRecord(null);
    setIsEditMode(false);
    form.resetFields();
  };

  // Layer 2 → Layer 1: Back to users list
  const handleBackToUsers = () => {
    setCurrentView('users');
    setViewTitle('Danh Sách Người Hiến Máu');
    setCurrentPage(1);
    setSelectedUser(null);
    setUserDonationRecords([]);
    setSelectedRecord(null);
    setIsEditMode(false);
    form.resetFields();
  };

  const getDonorName = (donorId) => {
    const donor = donors[donorId];
    return donor ? donor.name : `Donor ${donorId}`;
  };

  const getDonationTypeName = (typeId) => {
    const type = donationTypes[typeId];
    return type ? type.name : `Type ${typeId}`;
  };

  const getBloodTestResultName = (resultId) => {
    const result = bloodTestResults[resultId];
    return result ? result.name : `Result ${resultId}`;
  };

  const handleEditMode = () => {
    setIsEditMode(true);
    
    // Calculate checkbox state based on both cannotDonate field and registration status
    const cannotDonateField = selectedRecord.cannotDonate || selectedRecord.CannotDonate || false;
    const registrationId = selectedRecord.registrationId || selectedRecord.RegistrationId;
    const registrationStatus = registrationStatuses[registrationId];
    const isStatusIneligible = registrationStatus === 1001; // "Không đủ điều kiện hiến"
    const shouldCheckCannotDonate = cannotDonateField || isStatusIneligible;
    
    // Pre-fill form with current record data
    form.setFieldsValue({
      donorTemperature: selectedRecord.donorTemperature || selectedRecord.DonorTemperature,
      donorBloodPressure: selectedRecord.donorBloodPressure || selectedRecord.DonorBloodPressure,
      donorWeight: selectedRecord.donorWeight || selectedRecord.DonorWeight,
      donationTypeId: selectedRecord.donationTypeId || selectedRecord.DonationTypeId,
      volumeDonated: selectedRecord.volumeDonated || selectedRecord.VolumeDonated,
      bloodTestResult: selectedRecord.bloodTestResult || selectedRecord.BloodTestResult,
      cannotDonate: shouldCheckCannotDonate,
      note: selectedRecord.note || selectedRecord.Note || ''
    });
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    form.resetFields();
  };

  const handleSaveEdit = async (values) => {
    setEditLoading(true);
    try {
      const recordId = selectedRecord.donationRecordId || selectedRecord.DonationRecordId || selectedRecord.id;
      const registrationId = selectedRecord.registrationId || selectedRecord.RegistrationId;
      
      // Validate required fields
      if (!recordId) {
        message.error('Không tìm thấy mã hồ sơ. Vui lòng thử lại.');
        return;
      }

      if (!registrationId) {
        message.error('Không tìm thấy mã đăng ký. Vui lòng thử lại.');
        return;
      }

      const updateData = {
        registrationId: registrationId,
        donationDateTime: selectedRecord.donationDateTime || selectedRecord.DonationDateTime,
        donorWeight: Number(values.donorWeight) || 0,
        donorTemperature: Number(values.donorTemperature) || 0,
        donorBloodPressure: values.donorBloodPressure || '',
        donationTypeId: Number(values.donationTypeId),
        volumeDonated: Number(values.volumeDonated) || 0,
        note: values.note || '',
        bloodTestResult: Number(values.bloodTestResult) || 0,
        cannotDonate: Boolean(values.cannotDonate)
      };

      console.log('Sending update request with recordId:', recordId, 'and data:', updateData);

      await AdminAPI.updateDonationRecord(recordId, updateData);
      message.success('Cập nhật hồ sơ hiến máu thành công!');
      
      // Update the selected record with new data
      setSelectedRecord({
        ...selectedRecord,
        ...updateData
      });
      
      // Refresh the donation records list
      await fetchDonationRecords();
      
      setIsEditMode(false);
      form.resetFields();
      
    } catch (error) {
      console.error('Error updating donation record:', error);
      message.error('Lỗi khi cập nhật hồ sơ hiến máu');
    } finally {
      setEditLoading(false);
    }
  };

  const getUserIdFromRegistration = (registrationId) => {
    const userData = registrationUsers[registrationId];
    return userData ? userData.userId : 'N/A';
  };

  const getUsernameFromRegistration = (registrationId) => {
    const userData = registrationUsers[registrationId];
    return userData ? userData.username : 'N/A';
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBloodPressure = (bp) => {
    if (!bp) return 'N/A';
    return bp;
  };

  const getBloodTestResultTag = (result) => {
    if (!result || result === null) {
      return <Tag color="default">Chưa có kết quả</Tag>;
    }
    
    // Get the name from lookup data
    const resultName = getBloodTestResultName(result);
    
    // Color coding based on result ID or name
    if (result === 1 || resultName.includes('Đang chờ')) {
      return <Tag color="orange">{resultName}</Tag>;
    } else if (result === 2 || resultName.includes('đạt') && !resultName.includes('không')) {
      return <Tag color="green">{resultName}</Tag>;
    } else if (result === 3 || resultName.includes('không đạt')) {
      return <Tag color="red">{resultName}</Tag>;
    } else if (result === 4 || resultName.includes('hủy')) {
      return <Tag color="gray">{resultName}</Tag>;
    } else if (result === 5 || resultName.includes('Không thể')) {
      return <Tag color="red">{resultName}</Tag>;
    } else {
      return <Tag color="blue">{resultName}</Tag>;
    }
  };

  // Pagination logic for all three layers
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    if (currentView === 'users') {
      return uniqueUsers.slice(startIndex, endIndex);
    } else if (currentView === 'userRecords') {
      return userDonationRecords.slice(startIndex, endIndex);
    } else {
      // For recordDetail view, we'll render the form instead of table data
      return [];
    }
  };

  const renderDetailForm = () => {
    if (!selectedRecord) return null;
    
    if (isEditMode) {
      return (
        <div className="donation-detail-form">
          <Card 
            title="CHỈNH SỬA HỒ SƠ HIẾN MÁU" 
            className="detail-form-card"
            extra={
              <Space>
                <Button onClick={handleCancelEdit}>Hủy</Button>
                <Button 
                  type="primary" 
                  loading={editLoading}
                  onClick={() => form.submit()}
                >
                  Lưu Thay Đổi
                </Button>
              </Space>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSaveEdit}
              requiredMark={false}
            >
              {/* Read-only fields */}
              <Row gutter={[24, 16]}>
                <Col span={8}>
                  <div className="form-field">
                    <label className="form-label">MÃ HỒ SƠ</label>
                    <div className="form-value">
                      {selectedRecord.donationRecordId || selectedRecord.DonationRecordId || 'N/A'}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="form-field">
                    <label className="form-label">MÃ ĐĂNG KÝ</label>
                    <div className="form-value">
                      {selectedRecord.registrationId || selectedRecord.RegistrationId || 'N/A'}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="form-field">
                    <label className="form-label">MÃ NGƯỜI DÙNG</label>
                    <div className="form-value">
                      {getUserIdFromRegistration(selectedRecord.registrationId || selectedRecord.RegistrationId)}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="form-field">
                    <label className="form-label">TÊN NGƯỜI DÙNG</label>
                    <div className="form-value">
                      {getUsernameFromRegistration(selectedRecord.registrationId || selectedRecord.RegistrationId)}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="form-field">
                    <label className="form-label">THỜI GIAN HIẾN MÁU</label>
                    <div className="form-value">
                      {formatDateTime(selectedRecord.donationDateTime || selectedRecord.DonationDateTime)}
                    </div>
                  </div>
                </Col>
              </Row>
              
              <Divider orientation="left">THÔNG TIN SỨC KHỎE</Divider>
              
              <Row gutter={[24, 16]}>
                <Col span={8}>
                  <Form.Item 
                    label="NHIỆT ĐỘ (°C)" 
                    name="donorTemperature"
                    rules={[{ required: true, message: 'Vui lòng nhập nhiệt độ!' }]}
                  >
                    <InputNumber 
                      style={{ width: '100%' }}
                      placeholder="Nhập nhiệt độ"
                      min={30}
                      max={45}
                      step={0.1}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item 
                    label="HUYẾT ÁP" 
                    name="donorBloodPressure"
                    rules={[{ required: true, message: 'Vui lòng nhập huyết áp!' }]}
                  >
                    <Input placeholder="Ví dụ: 120/80" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="CÂN NẶNG (kg)" name="donorWeight">
                    <InputNumber 
                      style={{ width: '100%' }}
                      placeholder="Nhập cân nặng"
                      min={0}
                      max={200}
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Divider orientation="left">THÔNG TIN HIẾN MÁU</Divider>
              
              <Row gutter={[24, 16]}>
                <Col span={8}>
                  <Form.Item
                    label="LOẠI HIẾN MÁU"
                    name="donationTypeId"
                    rules={[{ required: true, message: 'Vui lòng chọn loại hiến máu!' }]}
                  >
                    <Select placeholder="Chọn loại hiến máu">
                      {Object.entries(donationTypes).map(([id, type]) => (
                        <Option key={id} value={parseInt(id)}>
                          {type.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="THỂ TÍCH HIẾN (ml)"
                    name="volumeDonated"
                    rules={[{ required: true, message: 'Vui lòng nhập thể tích hiến!' }]}
                  >
                    <InputNumber 
                      style={{ width: '100%' }}
                      placeholder="Nhập thể tích hiến"
                      min={0}
                      max={1000}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item 
                    label="KHÔNG THỂ HIẾN MÁU ĐƯỢC" 
                    name="cannotDonate" 
                    valuePropName="checked"
                  >
                    <div style={{ height: '40px', display: 'flex', alignItems: 'center', paddingTop: '6px' }}>
                      <Checkbox>Không thể hiến máu được</Checkbox>
                    </div>
                  </Form.Item>
                </Col>
              </Row>
              
              <Divider orientation="left">KẾT LUẬN</Divider>
              
              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <Form.Item
                    label="KẾT QUẢ XÉT NGHIỆM"
                    name="bloodTestResult"
                    rules={[{ required: true, message: 'Vui lòng chọn kết quả xét nghiệm!' }]}
                  >
                    <Select placeholder="Chọn kết quả xét nghiệm">
                      {Object.entries(bloodTestResults).map(([id, result]) => (
                        <Option key={id} value={parseInt(id)}>
                          {result.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="GHI CHÚ" name="note">
                    <Input.TextArea 
                      rows={3}
                      placeholder="Nhập ghi chú (không bắt buộc)"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </div>
      );
    }
    
    // View mode (read-only)
    return (
      <div className="donation-detail-form">
        <Card 
          title="THÔNG TIN HỒ SƠ HIẾN MÁU" 
          className="detail-form-card"
          extra={
            <Button type="primary" onClick={handleEditMode}>
              Chỉnh Sửa
            </Button>
          }
        >
          <Row gutter={[24, 16]}>
            <Col span={8}>
              <div className="form-field">
                <label className="form-label">MÃ HỒ SƠ</label>
                <div className="form-value">
                  {selectedRecord.donationRecordId || selectedRecord.DonationRecordId || 'N/A'}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="form-field">
                <label className="form-label">MÃ ĐĂNG KÝ</label>
                <div className="form-value">
                  {selectedRecord.registrationId || selectedRecord.RegistrationId || 'N/A'}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="form-field">
                <label className="form-label">MÃ NGƯỜI DÙNG</label>
                <div className="form-value">
                  {getUserIdFromRegistration(selectedRecord.registrationId || selectedRecord.RegistrationId)}
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className="form-field">
                <label className="form-label">TÊN NGƯỜI DÙNG</label>
                <div className="form-value">
                  {getUsernameFromRegistration(selectedRecord.registrationId || selectedRecord.RegistrationId)}
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className="form-field">
                <label className="form-label">THỜI GIAN HIẾN MÁU</label>
                <div className="form-value">
                  {formatDateTime(selectedRecord.donationDateTime || selectedRecord.DonationDateTime)}
                </div>
              </div>
            </Col>
          </Row>
          
          <Divider orientation="left">THÔNG TIN SỨC KHỎE</Divider>
          
          <Row gutter={[24, 16]}>
            <Col span={8}>
              <div className="form-field">
                <label className="form-label">NHIỆT ĐỘ</label>
                <div className="form-value">
                  {selectedRecord.donorTemperature || selectedRecord.DonorTemperature || 'N/A'}
                  {selectedRecord.donorTemperature || selectedRecord.DonorTemperature ? ' °C' : ''}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="form-field">
                <label className="form-label">HUYẾT ÁP</label>
                <div className="form-value">
                  {formatBloodPressure(selectedRecord.donorBloodPressure || selectedRecord.DonorBloodPressure)}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="form-field">
                <label className="form-label">CÂN NẶNG</label>
                <div className="form-value">
                  {selectedRecord.donorWeight || selectedRecord.DonorWeight || 'N/A'}
                  {selectedRecord.donorWeight || selectedRecord.DonorWeight ? ' kg' : ''}
                </div>
              </div>
            </Col>
          </Row>
          
          <Divider orientation="left">THÔNG TIN HIẾN MÁU</Divider>
          
          <Row gutter={[24, 16]}>
            <Col span={8}>
              <div className="form-field">
                <label className="form-label">LOẠI HIẾN MÁU</label>
                <div className="form-value">
                  {getDonationTypeName(selectedRecord.donationTypeId || selectedRecord.DonationTypeId)}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="form-field">
                <label className="form-label">THỂ TÍCH HIẾN</label>
                <div className="form-value">
                  {selectedRecord.volumeDonated || selectedRecord.VolumeDonated || 'N/A'}
                  {selectedRecord.volumeDonated || selectedRecord.VolumeDonated ? ' ml' : ''}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="form-field">
                <label className="form-label">KHÔNG THỂ HIẾN MÁU ĐƯỢC</label>
                <div className="form-value">
                  <Checkbox 
                    checked={(() => {
                      // Check both cannotDonate field and registration status
                      const cannotDonateField = selectedRecord.cannotDonate || false;
                      const registrationId = selectedRecord.registrationId || selectedRecord.RegistrationId;
                      const registrationStatus = registrationStatuses[registrationId];
                      const isStatusIneligible = registrationStatus === 1001; // "Không đủ điều kiện hiến"
                      
                      return cannotDonateField || isStatusIneligible;
                    })()}
                    disabled
                  >
                    Không thể hiến máu được
                  </Checkbox>
                </div>
              </div>
            </Col>
          </Row>
          
          <Divider orientation="left">KẾT LUẬN</Divider>
          
          <Row gutter={[24, 16]}>
            <Col span={12}>
              <div className="form-field">
                <label className="form-label">KẾT QUẢ XÉT NGHIỆM</label>
                <div className="form-value">
                  {(() => {
                    // Check if donor cannot donate (checkbox is checked)
                    const cannotDonateField = selectedRecord.cannotDonate || false;
                    const registrationId = selectedRecord.registrationId || selectedRecord.RegistrationId;
                    const registrationStatus = registrationStatuses[registrationId];
                    const isStatusIneligible = registrationStatus === 1001; // "Không đủ điều kiện hiến"
                    const cannotDonate = cannotDonateField || isStatusIneligible;
                    
                    // If cannot donate, show "Không thể hiến máu" (id=5), otherwise show actual result
                    const displayResult = cannotDonate ? 5 : (selectedRecord.bloodTestResult || selectedRecord.BloodTestResult);
                    return getBloodTestResultTag(displayResult);
                  })()}
                </div>
              </div>
            </Col>
            <Col span={24}>
              <div className="form-field">
                <label className="form-label">GHI CHÚ</label>
                <div className="form-value">
                  {selectedRecord.note || selectedRecord.Note || 'Không có ghi chú'}
                </div>
              </div>
            </Col>
          </Row>
          
          <Divider orientation="left">THÔNG TIN HỆ THỐNG</Divider>
          
          <Row gutter={[24, 16]}>
            <Col span={12}>
              <div className="form-field">
                <label className="form-label">NGÀY TẠO</label>
                <div className="form-value">
                  {formatDateTime(selectedRecord.createdAt || selectedRecord.CreatedAt)}
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className="form-field">
                <label className="form-label">CẬP NHẬT LẦN CUỐI</label>
                <div className="form-value">
                  {formatDateTime(selectedRecord.updatedAt || selectedRecord.UpdatedAt)}
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    );
  };

  const getCurrentData = () => {
    if (currentView === 'users') return uniqueUsers;
    if (currentView === 'userRecords') return userDonationRecords;
    return [];
  };

  const currentData = getCurrentData();
  const totalPages = Math.ceil(currentData.length / pageSize);
  const startRecord = currentData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(currentPage * pageSize, currentData.length);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleGoToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Layer 1: User list columns
  const userColumns = [
    {
      title: 'Mã Người Hiến (UserID)',
      dataIndex: 'userId',
      key: 'userId',
      width: '25%',
      render: (text) => (
        <span style={{ fontWeight: 'bold', color: '#059669' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Tên Người Hiến (Username)',
      dataIndex: 'username',
      key: 'username',
      width: '35%',
      render: (text) => (
        <span style={{ fontWeight: '500', color: '#374151' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Địa Chỉ',
      dataIndex: 'address',
      key: 'address',
      width: '30%',
      render: (text) => (
        <span style={{ color: '#666' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Chi Tiết',
      key: 'actions',
      width: '10%',
      render: (_, user) => (
        <Button 
          type="link" 
          onClick={() => handleViewUserRecords(user)}
          style={{ padding: 0 }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  // Layer 2: User's donation records columns
  const userRecordColumns = [
    {
      title: 'Mã Hồ Sơ (DonationRecordID)',
      dataIndex: 'donationRecordId',
      key: 'donationRecordId',
      width: '15%',
      render: (_, record) => {
        const recordId = record.donationRecordId || record.DonationRecordId || record.id || 'N/A';
        return (
          <span style={{ fontWeight: 'bold', color: '#722ed1' }}>
            {recordId}
          </span>
        );
      },
    },
    {
      title: 'Mã Đăng Ký (RegistrationID)',
      dataIndex: 'registrationId',
      key: 'registrationId',
      width: '15%',
      render: (_, record) => {
        const registrationId = record.registrationId || record.RegistrationId || record.RegistrationID || 'N/A';
        return (
          <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
            {registrationId}
          </span>
        );
      },
    },
    {
      title: 'Thời Gian Hiến',
      dataIndex: 'donationDateTime',
      key: 'donationDateTime',
      width: '20%',
      render: (_, record) => {
        const dateTime = record.donationDateTime || record.DonationDateTime;
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', color: '#52c41a' }}>
              {formatDateTime(dateTime)}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Loại Hiến Máu',
      key: 'donationType',
      width: '15%',
      render: (_, record) => {
        const typeId = record.donationTypeId || record.DonationTypeId;
        const typeName = getDonationTypeName(typeId);
        return (
          <span style={{ fontWeight: 'bold', color: '#f5222d' }}>
            {typeName}
          </span>
        );
      },
    },
    {
      title: 'Kết Quả Xét Nghiệm',
      dataIndex: 'bloodTestResult',
      key: 'bloodTestResult',
      width: '15%',
      render: (_, record) => {
        // Check if donor cannot donate (same logic as detailed view)
        const cannotDonateField = record.cannotDonate || false;
        const registrationId = record.registrationId || record.RegistrationId;
        const registrationStatus = registrationStatuses[registrationId];
        const isStatusIneligible = registrationStatus === 1001; // "Không đủ điều kiện hiến"
        const cannotDonate = cannotDonateField || isStatusIneligible;
        
        // If cannot donate, show "Không thể hiến máu" (id=5), otherwise show actual result
        const displayResult = cannotDonate ? 5 : (record.bloodTestResult || record.BloodTestResult);
        
        return (
          <div style={{ textAlign: 'center' }}>
            {getBloodTestResultTag(displayResult)}
          </div>
        );
      },
    },
    {
      title: 'Xem Chi Tiết',
      key: 'actions',
      width: '20%',
      render: (_, record) => (
        <Button 
          type="link" 
          onClick={() => handleViewRecordDetails(record)}
          style={{ padding: 0 }}
        >
          Xem chi tiết
        </Button>
      ),
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
          <StaffNavbar />
          
          <Content className="donation-records-content">
            <div className="donation-records-container">
              <div className="donation-records-header-section">
                <Space className="donation-records-controls">
                  {currentView === 'userRecords' && (
                    <Button 
                      onClick={handleBackToUsers}
                      style={{ marginRight: 16 }}
                      icon={<span>←</span>}
                    >
                      Quay Lại
                    </Button>
                  )}
                  {currentView === 'recordDetail' && (
                    <Button 
                      onClick={handleBackToUserRecords}
                      style={{ marginRight: 16 }}
                      icon={<span>←</span>}
                    >
                      Quay Lại
                    </Button>
                  )}
                  <Title level={3} className="donation-records-title">
                    {viewTitle}
                  </Title>
                  {currentView === 'users' && (
                    <Button 
                      type="primary" 
                      onClick={fetchDonationRecords}
                      loading={loading}
                    >
                      Làm mới
                    </Button>
                  )}
                  <div style={{ fontSize: '14px', color: '#666', marginLeft: 'auto' }}>
                    <Text strong>
                      {currentView === 'users' && 'Tổng số người dùng:'}
                      {currentView === 'userRecords' && 'Tổng số hồ sơ:'}
                      {currentView === 'recordDetail' && 'Chi tiết hồ sơ:'}
                    </Text> {currentView === 'users' ? uniqueUsers.length : 
                            currentView === 'userRecords' ? userDonationRecords.length : '1'}
                  </div>
                </Space>
              </div>

              <div className="donation-records-table-container">
                {currentView === 'users' && (
                  <Table
                    columns={userColumns}
                    dataSource={uniqueUsers}
                    rowKey={(user) => user.userId}
                    loading={loading}
                    pagination={false}
                    size="large"
                    className="donation-records-wide-table"
                  />
                )}
                
                {currentView === 'userRecords' && (
                  <Table
                    columns={userRecordColumns}
                    dataSource={userDonationRecords}
                    rowKey={(record) => {
                      return record.donationRecordId || record.DonationRecordId || record.id || Math.random();
                    }}
                    loading={loading}
                    pagination={false}
                    size="large"
                    className="donation-records-wide-table"
                  />
                )}
                
                {currentView === 'recordDetail' && renderDetailForm()}
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default DonationRecordsPage; 