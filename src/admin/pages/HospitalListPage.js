import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Table, 
  Card, 
  Typography, 
  Space, 
  Button, 
  Input, 
  Tag, 
  message, 
  Spin,
  Row,
  Col,
  Tooltip,
  Modal
} from 'antd';
import { 
  BankOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons';
import StaffSidebar from '../components/StaffSidebar';
import StaffHeader from '../components/StaffHeader';
import { HospitalAPI } from '../api/hospital';
import dayjs from 'dayjs';
import '../styles/hospital-list.scss';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

const HospitalListPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch hospitals data
  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const response = await HospitalAPI.getAllHospitals();
      console.log('Hospitals data:', response);
      
      // Handle the response based on the API structure
      const hospitalData = Array.isArray(response) ? response : response.data || [];
      setHospitals(hospitalData);
      setFilteredHospitals(hospitalData);
      
      message.success(`Đã tải ${hospitalData.length} bệnh viện thành công!`);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      message.error('Không thể tải danh sách bệnh viện. Vui lòng thử lại!');
      
      // Set empty arrays on error
      setHospitals([]);
      setFilteredHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter hospitals based on search text
  const handleSearch = (value) => {
    setSearchText(value);
    if (!value.trim()) {
      setFilteredHospitals(hospitals);
      return;
    }

    const filtered = hospitals.filter(hospital =>
      hospital.hospitalName?.toLowerCase().includes(value.toLowerCase()) ||
      hospital.hospitalAddress?.toLowerCase().includes(value.toLowerCase()) ||
      hospital.hospitalId?.toString().includes(value)
    );
    setFilteredHospitals(filtered);
  };

  // Show hospital details
  const showHospitalDetails = (hospital) => {
    setSelectedHospital(hospital);
    setDetailModalVisible(true);
  };

  // Handle hospital actions (edit, delete)
  const handleEdit = (hospital) => {
    message.info(`Chỉnh sửa bệnh viện: ${hospital.hospitalName}`);
    // TODO: Navigate to edit page or open edit modal
  };

  const handleDelete = (hospital) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa bệnh viện "${hospital.hospitalName}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await HospitalAPI.deleteHospital(hospital.hospitalId);
          message.success('Đã xóa bệnh viện thành công!');
          fetchHospitals(); // Refresh the list
        } catch (error) {
          message.error('Không thể xóa bệnh viện. Vui lòng thử lại!');
        }
      },
    });
  };

  // Table columns configuration
  const columns = [
    {
      title: 'ID',
      dataIndex: 'hospitalId',
      key: 'hospitalId',
      width: 80,
      sorter: (a, b) => a.hospitalId - b.hospitalId,
    },
    {
      title: 'Tên bệnh viện',
      dataIndex: 'hospitalName',
      key: 'hospitalName',
      ellipsis: {
        showTitle: false,
      },
      render: (name) => (
        <Tooltip placement="topLeft" title={name}>
          <Text strong>{name}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'hospitalAddress',
      key: 'hospitalAddress',
      ellipsis: {
        showTitle: false,
      },
      render: (address) => (
        <Tooltip placement="topLeft" title={address}>
          <Text type="secondary">{address}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => showHospitalDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Load data on component mount
  useEffect(() => {
    fetchHospitals();
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <StaffSidebar />
      <Layout>
        <StaffHeader />
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div className="hospital-list-page">
            {/* Page Header */}
            <div className="page-header">
              <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
                <Col>
                  <Space direction="vertical" size={0}>
                    <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                      <BankOutlined /> Danh sách bệnh viện
                    </Title>
                    <Text type="secondary">
                      Quản lý thông tin các bệnh viện trong hệ thống
                    </Text>
                  </Space>
                </Col>
              </Row>
            </div>

            {/* Search and Filter */}
            <Card style={{ marginBottom: '24px' }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Search
                    placeholder="Tìm kiếm theo tên, địa chỉ hoặc ID..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    size="large"
                    onSearch={handleSearch}
                    onChange={(e) => {
                      if (!e.target.value) {
                        handleSearch('');
                      }
                    }}
                    value={searchText}
                  />
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Text type="secondary">
                    Tổng số: <Text strong>{filteredHospitals.length}</Text> bệnh viện
                  </Text>
                </Col>
              </Row>
            </Card>

            {/* Hospital Table */}
            <Card>
              <Spin spinning={loading}>
                <Table
                  columns={columns}
                  dataSource={filteredHospitals.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                  rowKey="hospitalId"
                  pagination={false}
                  scroll={{ x: 1200 }}
                  size="middle"
                />
              </Spin>
            </Card>
            
            {/* Separate Pagination */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: '16px',
              padding: '16px 0',
              borderTop: '1px solid #f0f0f0',
              background: '#fafafa'
            }}>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Hiển thị {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredHospitals.length)} của {filteredHospitals.length} bệnh viện
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Số bản ghi mỗi trang:</span>
                <select 
                  value={pageSize} 
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    background: currentPage === 1 ? '#f5f5f5' : '#fff',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ««
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    background: currentPage === 1 ? '#f5f5f5' : '#fff',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ‹
                </button>
                
                <span style={{ fontSize: '14px', margin: '0 8px' }}>
                  Trang {currentPage} / {Math.ceil(filteredHospitals.length / pageSize)}
                </span>
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === Math.ceil(filteredHospitals.length / pageSize)}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    background: currentPage === Math.ceil(filteredHospitals.length / pageSize) ? '#f5f5f5' : '#fff',
                    cursor: currentPage === Math.ceil(filteredHospitals.length / pageSize) ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ›
                </button>
                <button
                  onClick={() => setCurrentPage(Math.ceil(filteredHospitals.length / pageSize))}
                  disabled={currentPage === Math.ceil(filteredHospitals.length / pageSize)}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    background: currentPage === Math.ceil(filteredHospitals.length / pageSize) ? '#f5f5f5' : '#fff',
                    cursor: currentPage === Math.ceil(filteredHospitals.length / pageSize) ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  »»
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Đến trang:</span>
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) => {
                    const page = Number(e.target.value);
                    if (page >= 1 && page <= Math.ceil(filteredHospitals.length / pageSize)) {
                      setCurrentPage(page);
                    }
                  }}
                  style={{
                    width: '60px',
                    padding: '4px 8px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    fontSize: '14px',
                    textAlign: 'center'
                  }}
                  min="1"
                  max={Math.ceil(filteredHospitals.length / pageSize)}
                />
              </div>
            </div>
          </div>
        </Content>
      </Layout>

      {/* Hospital Detail Modal */}
      <Modal
        title={
          <Space>
            <BankOutlined />
            <span>Chi tiết bệnh viện</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {selectedHospital && (
          <div style={{ padding: '16px 0' }}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Text strong>ID:</Text>
              </Col>
              <Col span={16}>
                <Text>{selectedHospital.hospitalId}</Text>
              </Col>
              
              <Col span={8}>
                <Text strong>Tên bệnh viện:</Text>
              </Col>
              <Col span={16}>
                <Text>{selectedHospital.hospitalName}</Text>
              </Col>
              
              <Col span={8}>
                <Text strong>Địa chỉ:</Text>
              </Col>
              <Col span={16}>
                <Text>{selectedHospital.hospitalAddress}</Text>
              </Col>
              
              <Col span={8}>
                <Text strong>Trạng thái:</Text>
              </Col>
              <Col span={16}>
                <Tag color={selectedHospital.isDeleted ? 'red' : 'green'}>
                  {selectedHospital.isDeleted ? 'Không hoạt động' : 'Hoạt động'}
                </Tag>
              </Col>
              
              <Col span={8}>
                <Text strong>Ngày tạo:</Text>
              </Col>
              <Col span={16}>
                <Text>
                  {selectedHospital.createdAt 
                    ? dayjs(selectedHospital.createdAt).format('DD/MM/YYYY HH:mm:ss')
                    : '-'
                  }
                </Text>
              </Col>
              
              <Col span={8}>
                <Text strong>Cập nhật lần cuối:</Text>
              </Col>
              <Col span={16}>
                <Text>
                  {selectedHospital.updatedAt 
                    ? dayjs(selectedHospital.updatedAt).format('DD/MM/YYYY HH:mm:ss')
                    : '-'
                  }
                </Text>
              </Col>

              {selectedHospital.users && selectedHospital.users.length > 0 && (
                <>
                  <Col span={8}>
                    <Text strong>Số người dùng:</Text>
                  </Col>
                  <Col span={16}>
                    <Text>{selectedHospital.users.length}</Text>
                  </Col>
                </>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default HospitalListPage; 