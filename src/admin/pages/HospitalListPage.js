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
      title: 'Trạng thái',
      dataIndex: 'isDeleted',
      key: 'isDeleted',
      width: 120,
      render: (isDeleted) => (
        <Tag color={isDeleted ? 'red' : 'green'}>
          {isDeleted ? 'Không hoạt động' : 'Hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 140,
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-',
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
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
                <Col>
                  <Space>
                    <Button
                      type="default"
                      icon={<ReloadOutlined />}
                      onClick={fetchHospitals}
                      loading={loading}
                    >
                      Làm mới
                    </Button>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => message.info('Tính năng thêm bệnh viện đang phát triển')}
                    >
                      Thêm bệnh viện
                    </Button>
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
                  dataSource={filteredHospitals}
                  rowKey="hospitalId"
                  pagination={{
                    total: filteredHospitals.length,
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} của ${total} bệnh viện`,
                  }}
                  scroll={{ x: 1200 }}
                  size="middle"
                />
              </Spin>
            </Card>
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