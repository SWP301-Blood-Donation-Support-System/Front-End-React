import React, { useState, useEffect } from "react";
import {
  Layout,
  Table,
  Tag,
  Space,
  Typography,
  Button,
  message,
  Card,
  Badge,
} from "antd";
import {
  BankOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import StaffSidebar from "../../components/StaffSidebar";
import StaffHeader from "../../components/StaffHeader";
import { AdminAPI } from "../../api/admin";
import { HospitalAPI } from "../../api/hospital";
import "../../styles/donation-records.scss";

const { Content } = Layout;
const { Text, Title } = Typography;

const ApproveRequestsPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Data states
  const [hospitals, setHospitals] = useState([]);
  const [hospitalAccounts, setHospitalAccounts] = useState([]);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [bloodRequestStatuses, setBloodRequestStatuses] = useState({});
  
  // Hospital summary data
  const [hospitalSummary, setHospitalSummary] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        hospitalsRes,
        hospitalAccountsRes,
        bloodRequestsRes,
        statusesRes,
      ] = await Promise.all([
        HospitalAPI.getAllHospitals(),
        AdminAPI.getUsersByRole(4), // Hospital accounts
        HospitalAPI.getAllBloodRequests(),
        HospitalAPI.getBloodRequestStatuses(),
      ]);

      // Process hospitals
      const hospitalsData = Array.isArray(hospitalsRes) ? hospitalsRes : hospitalsRes.data || [];
      setHospitals(hospitalsData);
      
      // Process hospital accounts  
      const accountsData = hospitalAccountsRes.data || [];
      setHospitalAccounts(accountsData);
      
      // Process blood requests
      const requestsData = Array.isArray(bloodRequestsRes) ? bloodRequestsRes : bloodRequestsRes.data || [];
      setBloodRequests(requestsData);
      
      // Process statuses
      const statusesData = Array.isArray(statusesRes) ? statusesRes : statusesRes.data || [];
      const statusesMap = {};
      statusesData.forEach(status => {
        statusesMap[status.id] = status;
      });
      setBloodRequestStatuses(statusesMap);
      
      // Create hospital summary with pending request counts
      createHospitalSummary(hospitalsData, accountsData, requestsData, statusesMap);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Lỗi khi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  const createHospitalSummary = (hospitalsData, accountsData, requestsData, statusesMap) => {
    // Find "Đang chờ duyệt" status ID
    const pendingStatusId = Object.keys(statusesMap).find(
      id => statusesMap[id].name === "Đang chờ duyệt"
    );
    
    // Create mapping of requestingStaffId to hospitalId
    const staffToHospitalMap = {};
    accountsData.forEach(account => {
      if (account.hospitalId) {
        staffToHospitalMap[account.userId] = account.hospitalId;
      }
    });
    
    // Group requests by hospital and count pending ones
    const hospitalRequestCounts = {};
    requestsData.forEach(request => {
      const hospitalId = staffToHospitalMap[request.requestingStaffId];
      if (hospitalId) {
        if (!hospitalRequestCounts[hospitalId]) {
          hospitalRequestCounts[hospitalId] = {
            total: 0,
            pending: 0,
          };
        }
        hospitalRequestCounts[hospitalId].total++;
        
        if (request.requestStatusId == pendingStatusId) {
          hospitalRequestCounts[hospitalId].pending++;
        }
      }
    });
    
    // Create summary data
    const summary = hospitalsData.map(hospital => ({
      ...hospital,
      totalRequests: hospitalRequestCounts[hospital.hospitalId]?.total || 0,
      pendingRequests: hospitalRequestCounts[hospital.hospitalId]?.pending || 0,
    })).filter(hospital => hospital.totalRequests > 0); // Only show hospitals with requests
    
    setHospitalSummary(summary);
  };

  const handleViewHospitalRequests = (hospital) => {
    // Navigate to hospital requests page
    navigate(`/staff/approve-requests/hospital/${hospital.hospitalId}`, {
      state: { hospital }
    });
  };

  // Hospital columns for the overview table
  const hospitalColumns = [
    {
      title: 'Tên bệnh viện',
      dataIndex: 'hospitalName',
      key: 'hospitalName',
      render: (text, record) => (
        <Space>
          <BankOutlined style={{ color: '#1890ff' }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'hospitalAddress',
      key: 'hospitalAddress',
      ellipsis: true,
    },
    {
      title: 'Tổng đơn',
      dataIndex: 'totalRequests',
      key: 'totalRequests',
      align: 'center',
      render: (count) => (
        <Badge count={count} showZero={true} style={{ backgroundColor: '#1890ff' }} />
      ),
    },
    {
      title: 'Chờ duyệt',
      dataIndex: 'pendingRequests',
      key: 'pendingRequests',
      align: 'center',
      render: (count) => (
        <Badge 
          count={count} 
          showZero={true}
          style={{ backgroundColor: count > 0 ? '#f5222d' : '#52c41a' }} 
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewHospitalRequests(record)}
          disabled={record.totalRequests === 0}
        >
          Xem đơn
        </Button>
      ),
    },
  ];

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
                <Title level={3} className="donation-records-title">
                  Duyệt Đơn Khẩn Cấp
                </Title>
              </div>

              <Card title="Danh sách bệnh viện có đơn khẩn cấp">
                <Table
                  columns={hospitalColumns}
                  dataSource={hospitalSummary}
                  rowKey="hospitalId"
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

export default ApproveRequestsPage; 
