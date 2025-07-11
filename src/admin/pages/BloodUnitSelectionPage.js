import React, { useState, useEffect } from "react";
import { Layout, Table, Typography, Button, Card, message, Tag } from "antd";
import { ArrowLeftOutlined, SelectOutlined, StarOutlined } from "@ant-design/icons";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import dayjs from "dayjs";

import StaffSidebar from "../components/StaffSidebar";
import StaffHeader from "../components/StaffHeader";
import { HospitalAPI } from "../api/hospital";
import "../styles/donation-records.scss";

const { Content } = Layout;
const { Title, Text } = Typography;

const BloodUnitSelectionPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { requestId } = useParams();
  const location = useLocation();
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [bloodTypes, setBloodTypes] = useState({});
  const [bloodComponents, setBloodComponents] = useState({});
  const [suggestedBloodUnits, setSuggestedBloodUnits] = useState([]);

  useEffect(() => {
    if (location.state) {
      const { request, hospital, bloodTypes, bloodComponents } = location.state;
      setSelectedRequest(request);
      setHospital(hospital);
      setBloodTypes(bloodTypes);
      setBloodComponents(bloodComponents);
      
      fetchSuggestedBloodUnits(request.requestId);
    } else {
      navigate('/staff/approve-requests');
    }
  }, [requestId, location.state, navigate]);

  const fetchSuggestedBloodUnits = async (requestId) => {
    setLoading(true);
    try {
      const response = await HospitalAPI.getSuggestedBloodUnits(requestId);
      setSuggestedBloodUnits(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error("Error fetching suggested blood units:", error);
      message.error("Lỗi khi tải danh sách túi máu!");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBloodUnit = async (bloodUnit) => {
    try {
      await HospitalAPI.assignBloodUnitToRequest(
        bloodUnit.bloodUnitId, 
        selectedRequest.requestId
      );
      
      message.success(`Đã chọn túi máu #${bloodUnit.bloodUnitId}`);
      
      // Remove the selected unit from the list
      setSuggestedBloodUnits(prev => 
        prev.filter(unit => unit.bloodUnitId !== bloodUnit.bloodUnitId)
      );
      
    } catch (error) {
      console.error("Error selecting blood unit:", error);
      message.error("Lỗi khi chọn túi máu!");
    }
  };

  const handleBackToRequestDetail = () => {
    navigate(`/staff/approve-requests/request/${requestId}`, {
      state: { 
        request: selectedRequest,
        hospital,
        bloodTypes,
        bloodComponents
      }
    });
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    return dayjs(dateTime).format('DD/MM/YYYY');
  };

  const columns = [
    {
      title: 'ID Túi máu',
      dataIndex: 'bloodUnitId',
      key: 'bloodUnitId',
      render: (id) => <Text strong>#{id}</Text>,
    },
    {
      title: 'Nhóm máu',
      dataIndex: 'bloodTypeId',
      key: 'bloodTypeId',
      render: (typeId) => {
        const type = bloodTypes[typeId];
        return type ? <Tag color="red">{type.name}</Tag> : 'N/A';
      },
    },
    {
      title: 'Thành phần',
      dataIndex: 'componentId',
      key: 'componentId',
      render: (componentId) => {
        const component = bloodComponents[componentId];
        return component ? <Tag color="blue">{component.name}</Tag> : 'N/A';
      },
    },
    {
      title: 'Thể tích',
      dataIndex: 'volume',
      key: 'volume',
      render: (volume) => `${volume} ml`,
    },
    {
      title: 'Ngày thu thập',
      dataIndex: 'collectedDateTime',
      key: 'collectedDateTime',
      render: (dateTime) => formatDateTime(dateTime),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<SelectOutlined />}
          onClick={() => handleSelectBloodUnit(record)}
          size="small"
        >
          Chọn
        </Button>
      ),
    },
  ];

  if (!selectedRequest) {
    return (
      <Layout className="staff-layout">
        <StaffSidebar collapsed={collapsed} onCollapse={setCollapsed} />
        <Layout className="staff-main-layout">
          <StaffHeader />
          <Layout className="staff-content-layout">
            <Content className="donation-records-content">
              <div className="donation-records-container">
                <Card>
                  <p>Đang tải...</p>
                </Card>
              </div>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    );
  }

  return (
    <Layout className="staff-layout">
      <StaffSidebar
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      />
      <Layout className="staff-main-layout">
        <StaffHeader />
        <Layout className="staff-content-layout">
          <Content className="donation-records-content">
            <div className="donation-records-container">
              <div className="donation-records-header-section">
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBackToRequestDetail}
                  style={{ marginBottom: '16px' }}
                >
                  Quay lại
                </Button>
                <Title level={3} className="donation-records-title">
                  Chọn túi máu để cấp - Đơn #{selectedRequest.requestId}
                </Title>
              </div>

              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StarOutlined style={{ color: '#faad14' }} />
                    <Text strong>Túi máu được đề xuất</Text>
                  </div>
                }
              >
                <Table
                  columns={columns}
                  dataSource={suggestedBloodUnits}
                  rowKey="bloodUnitId"
                  loading={loading}
                  pagination={false}
                />
              </Card>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default BloodUnitSelectionPage; 