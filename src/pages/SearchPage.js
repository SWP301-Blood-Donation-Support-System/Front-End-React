import React, { useState } from 'react';
import { Layout, Typography, Card, Row, Col, Select, Table, Tag, Divider, Space } from 'antd';
import { SearchOutlined, HeartOutlined, UserOutlined, TeamOutlined, SafetyOutlined } from '@ant-design/icons';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const SearchPage = () => {
  const [selectedBloodType, setSelectedBloodType] = useState('');

  // Blood type compatibility data
  const bloodTypeInfo = {
    'A+': {
      canGiveTo: ['A+', 'AB+'],
      canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
      percentage: '34%',
      description: 'Nhóm máu A dương tính - phổ biến thứ hai tại Việt Nam'
    },
    'A-': {
      canGiveTo: ['A+', 'A-', 'AB+', 'AB-'],
      canReceiveFrom: ['A-', 'O-'],
      percentage: '6%',
      description: 'Nhóm máu A âm tính - tương đối hiếm'
    },
    'B+': {
      canGiveTo: ['B+', 'AB+'],
      canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
      percentage: '21%',
      description: 'Nhóm máu B dương tính'
    },
    'B-': {
      canGiveTo: ['B+', 'B-', 'AB+', 'AB-'],
      canReceiveFrom: ['B-', 'O-'],
      percentage: '2%',
      description: 'Nhóm máu B âm tính - hiếm'
    },
    'AB+': {
      canGiveTo: ['AB+'],
      canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      percentage: '5%',
      description: 'Nhóm máu AB dương tính - người nhận máu toàn năng'
    },
    'AB-': {
      canGiveTo: ['AB+', 'AB-'],
      canReceiveFrom: ['A-', 'B-', 'AB-', 'O-'],
      percentage: '1%',
      description: 'Nhóm máu AB âm tính - rất hiếm'
    },
    'O+': {
      canGiveTo: ['A+', 'B+', 'AB+', 'O+'],
      canReceiveFrom: ['O+', 'O-'],
      percentage: '30%',
      description: 'Nhóm máu O dương tính - phổ biến nhất'
    },
    'O-': {
      canGiveTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      canReceiveFrom: ['O-'],
      percentage: '1%',
      description: 'Nhóm máu O âm tính - người cho máu toàn năng'
    }
  };

  // Compatibility table data
  const compatibilityData = [
    {
      key: '1',
      bloodType: 'O-',
      canGiveTo: 'Tất cả nhóm máu',
      canReceiveFrom: 'Chỉ O-',
      note: 'Người cho máu toàn năng'
    },
    {
      key: '2',
      bloodType: 'O+',
      canGiveTo: 'A+, B+, AB+, O+',
      canReceiveFrom: 'O+, O-',
      note: 'Phổ biến nhất'
    },
    {
      key: '3',
      bloodType: 'A-',
      canGiveTo: 'A+, A-, AB+, AB-',
      canReceiveFrom: 'A-, O-',
      note: 'Tương đối hiếm'
    },
    {
      key: '4',
      bloodType: 'A+',
      canGiveTo: 'A+, AB+',
      canReceiveFrom: 'A+, A-, O+, O-',
      note: 'Phổ biến thứ hai'
    },
    {
      key: '5',
      bloodType: 'B-',
      canGiveTo: 'B+, B-, AB+, AB-',
      canReceiveFrom: 'B-, O-',
      note: 'Hiếm'
    },
    {
      key: '6',
      bloodType: 'B+',
      canGiveTo: 'B+, AB+',
      canReceiveFrom: 'B+, B-, O+, O-',
      note: 'Khá phổ biến'
    },
    {
      key: '7',
      bloodType: 'AB-',
      canGiveTo: 'AB+, AB-',
      canReceiveFrom: 'A-, B-, AB-, O-',
      note: 'Rất hiếm'
    },
    {
      key: '8',
      bloodType: 'AB+',
      canGiveTo: 'Chỉ AB+',
      canReceiveFrom: 'Tất cả nhóm máu',
      note: 'Người nhận máu toàn năng'
    }
  ];

  const columns = [
    {
      title: 'Nhóm máu',
      dataIndex: 'bloodType',
      key: 'bloodType',
      render: (text) => (
        <Tag color={text.includes('-') ? 'red' : 'blue'} style={{ fontSize: '14px', padding: '4px 8px' }}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Có thể cho',
      dataIndex: 'canGiveTo',
      key: 'canGiveTo',
    },
    {
      title: 'Có thể nhận từ',
      dataIndex: 'canReceiveFrom',
      key: 'canReceiveFrom',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
    },
  ];
  return (
    <Layout className="search-page">
      <Header />
      <Navbar />
        {/* Modern Header Section */}
      <div className="search-header">
        <div className="search-header-container">
          <div className="search-header-content">
            <div className="search-icon-wrapper">
              <SearchOutlined className="search-main-icon" />
            </div>            <div className="search-text-content">
              <Title level={2} className="search-header-title">
                Tra Cứu Nhóm Máu
              </Title>
              <Paragraph className="search-header-subtitle">
                Tìm hiểu về tính tương thích giữa các nhóm máu
              </Paragraph>
              {/* Thêm mini stats */}
              <div className="search-header-stats">
                <div className="stat-item">
                  <UserOutlined className="stat-icon" />
                  <span className="stat-text">8 nhóm máu</span>
                </div>
                <div className="stat-item">
                  <TeamOutlined className="stat-icon" />
                  <span className="stat-text">Tương thích đầy đủ</span>
                </div>
                <div className="stat-item">
                  <SafetyOutlined className="stat-icon" />
                  <span className="stat-text">Thông tin chính xác</span>
                </div>
              </div>
            </div>
          </div>
          <div className="search-decorative-elements">
            <div className="blood-drop-1">🩸</div>
            <div className="blood-drop-2">💉</div>
            <div className="blood-drop-3">🫀</div>
          </div>
        </div>
      </div>

      <Content style={{ 
        padding: '80px 20px',
        background: '#f8f9fa',
        minHeight: 'calc(100vh - 300px)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Blood Type Selector */}
          <Card
            style={{
              marginBottom: '40px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none'
            }}
            bodyStyle={{ padding: '40px' }}
          >            <Title level={3} style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
              <HeartOutlined style={{ color: '#dc2626', marginRight: '12px' }} />
              Tra Cứu Thông Tin Nhóm Máu
            </Title>
            
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <Space direction="vertical" size="large">
                <Text style={{ fontSize: '16px', color: '#666' }}>
                  Chọn nhóm máu để xem thông tin chi tiết:
                </Text>
                <Select
                  placeholder="Chọn nhóm máu"
                  size="large"
                  style={{ width: 200 }}
                  onChange={setSelectedBloodType}
                  value={selectedBloodType}
                >
                  {Object.keys(bloodTypeInfo).map(type => (
                    <Option key={type} value={type}>{type}</Option>
                  ))}
                </Select>
              </Space>
            </div>

            {selectedBloodType && (
              <Card 
                style={{ 
                  background: '#f8f9fa', 
                  border: '2px solid #dc2626', 
                  borderRadius: '8px' 
                }}
              >
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={8}>
                    <div style={{ textAlign: 'center' }}>
                      <Tag 
                        color="red" 
                        style={{ 
                          fontSize: '24px', 
                          padding: '12px 20px', 
                          borderRadius: '8px',
                          marginBottom: '16px'
                        }}
                      >
                        {selectedBloodType}
                      </Tag>
                      <div>
                        <Text strong style={{ fontSize: '18px' }}>
                          Tỷ lệ: {bloodTypeInfo[selectedBloodType].percentage}
                        </Text>
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <Text style={{ fontSize: '14px', color: '#666' }}>
                          {bloodTypeInfo[selectedBloodType].description}
                        </Text>
                      </div>
                    </div>
                  </Col>
                  
                  <Col xs={24} md={8}>
                    <div>
                      <Title level={5} style={{ color: '#52c41a', marginBottom: '12px' }}>
                        Có thể cho máu đến:
                      </Title>
                      <Space wrap>
                        {bloodTypeInfo[selectedBloodType].canGiveTo.map(type => (
                          <Tag key={type} color="green">{type}</Tag>
                        ))}
                      </Space>
                    </div>
                  </Col>
                  
                  <Col xs={24} md={8}>
                    <div>
                      <Title level={5} style={{ color: '#1890ff', marginBottom: '12px' }}>
                        Có thể nhận máu từ:
                      </Title>
                      <Space wrap>
                        {bloodTypeInfo[selectedBloodType].canReceiveFrom.map(type => (
                          <Tag key={type} color="blue">{type}</Tag>
                        ))}
                      </Space>
                    </div>
                  </Col>
                </Row>
              </Card>
            )}
          </Card>

          {/* Blood Type Overview */}
          <Row gutter={[24, 24]} style={{ marginBottom: '40px' }}>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span style={{ color: '#dc2626', fontSize: '18px', fontWeight: 'bold' }}>
                    Phân Loại Nhóm Máu
                  </span>
                }
                style={{
                  height: '100%',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: 'none'
                }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Title level={5}>Hệ ABO:</Title>
                    <Paragraph>
                      • <strong>Nhóm A:</strong> Có kháng nguyên A trên hồng cầu<br/>
                      • <strong>Nhóm B:</strong> Có kháng nguyên B trên hồng cầu<br/>
                      • <strong>Nhóm AB:</strong> Có cả kháng nguyên A và B<br/>
                      • <strong>Nhóm O:</strong> Không có kháng nguyên A và B
                    </Paragraph>
                  </div>
                  <Divider />
                  <div>
                    <Title level={5}>Hệ Rh:</Title>
                    <Paragraph>
                      • <strong>Rh dương (+):</strong> Có kháng nguyên Rh<br/>
                      • <strong>Rh âm (-):</strong> Không có kháng nguyên Rh
                    </Paragraph>
                  </div>
                </Space>
              </Card>
            </Col>
            
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span style={{ color: '#dc2626', fontSize: '18px', fontWeight: 'bold' }}>
                    Thống Kê Nhóm Máu Tại Việt Nam
                  </span>
                }
                style={{
                  height: '100%',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: 'none'
                }}
              >
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div style={{ textAlign: 'center', padding: '16px', background: '#f0f0f0', borderRadius: '8px' }}>
                      <Text strong style={{ fontSize: '24px', color: '#dc2626' }}>30%</Text>
                      <br/>
                      <Text>O+</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ textAlign: 'center', padding: '16px', background: '#f0f0f0', borderRadius: '8px' }}>
                      <Text strong style={{ fontSize: '24px', color: '#dc2626' }}>34%</Text>
                      <br/>
                      <Text>A+</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ textAlign: 'center', padding: '16px', background: '#f0f0f0', borderRadius: '8px' }}>
                      <Text strong style={{ fontSize: '24px', color: '#dc2626' }}>21%</Text>
                      <br/>
                      <Text>B+</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ textAlign: 'center', padding: '16px', background: '#f0f0f0', borderRadius: '8px' }}>
                      <Text strong style={{ fontSize: '24px', color: '#dc2626' }}>5%</Text>
                      <br/>
                      <Text>AB+</Text>
                    </div>
                  </Col>
                </Row>
                <Divider />
                <Paragraph style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
                  Các nhóm máu âm tính (Rh-) chiếm khoảng 10% dân số
                </Paragraph>
              </Card>
            </Col>
          </Row>

          {/* Compatibility Table */}
          <Card
            title={
              <span style={{ color: '#dc2626', fontSize: '18px', fontWeight: 'bold' }}>
                Bảng Tương Thích Nhóm Máu
              </span>
            }
            style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: 'none'
            }}
          >
            <Table
              columns={columns}
              dataSource={compatibilityData}
              pagination={false}
              scroll={{ x: true }}
              style={{ marginTop: '20px' }}
            />
            
            <Divider />
            
            <Row gutter={[24, 24]} style={{ marginTop: '30px' }}>
              <Col xs={24} md={12}>
                <Card size="small" style={{ background: '#fff2f0', border: '1px solid #ffccc7' }}>
                  <Title level={5} style={{ color: '#cf1322' }}>
                    ⚠️ Lưu ý quan trọng:
                  </Title>
                  <Paragraph style={{ margin: 0, fontSize: '14px' }}>
                    • Truyền sai nhóm máu có thể gây phản ứng nghiêm trọng<br/>
                    • Luôn kiểm tra kỹ nhóm máu trước khi truyền<br/>
                    • Người nhận Rh- không nên nhận máu Rh+
                  </Paragraph>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                  <Title level={5} style={{ color: '#52c41a' }}>
                    ✅ Nhóm máu đặc biệt:
                  </Title>
                  <Paragraph style={{ margin: 0, fontSize: '14px' }}>
                    • <strong>O-:</strong> Người cho máu toàn năng<br/>
                    • <strong>AB+:</strong> Người nhận máu toàn năng<br/>
                    • Nhóm máu âm tính rất quý hiếm
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </Card>
        </div>
      </Content>
      
      <Footer />
    </Layout>
  );
};

export default SearchPage;
