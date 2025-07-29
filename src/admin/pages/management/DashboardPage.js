import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Alert,
  Typography,
  Progress,
  Tabs,
  Layout,
} from "antd";
import {
  UserOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  BankOutlined,
  AlertOutlined,
  TrophyOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { DashboardAPI } from "../../api/dashboard";
import StaffSidebar from "../../components/StaffSidebar";
import StaffHeader from "../../components/StaffHeader";
import "../../../styles/pages/DashboardPage.scss";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Content } = Layout;

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dashboard data states
  const [summary, setSummary] = useState({});
  const [donorStats, setDonorStats] = useState({});
  const [bloodInventory, setBloodInventory] = useState([]);
  const [donationActivity, setDonationActivity] = useState({});
  const [bloodRequests, setBloodRequests] = useState({});
  const [hospitalActivity, setHospitalActivity] = useState({});
  const [systemHealth, setSystemHealth] = useState({});

  useEffect(() => {
    fetchAllDashboardData();
  }, []);

  const fetchAllDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard APIs in parallel
      const [
        summaryRes,
        donorStatsRes,
        bloodInventoryRes,
        donationActivityRes,
        bloodRequestsRes,
        hospitalActivityRes,
        systemHealthRes,
      ] = await Promise.all([
        DashboardAPI.getSummary(),
        DashboardAPI.getDonorStatistics(),
        DashboardAPI.getBloodInventoryStatistics(),
        DashboardAPI.getDonationActivityStatistics(),
        DashboardAPI.getBloodRequestStatistics(),
        DashboardAPI.getHospitalActivityStatistics(),
        DashboardAPI.getSystemHealth(),
      ]);

      setSummary(summaryRes.data || {});
      setDonorStats(donorStatsRes.data || {});
      setBloodInventory(bloodInventoryRes.data || []);
      setDonationActivity(donationActivityRes.data || {});
      setBloodRequests(bloodRequestsRes.data || {});
      setHospitalActivity(hospitalActivityRes.data || {});
      setSystemHealth(systemHealthRes.data || {});
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const getBloodTypeColor = (bloodType) => {
    const colors = {
      "A+": "#ff4d4f",
      "A-": "#ff7875",
      "B+": "#52c41a",
      "B-": "#73d13d",
      "AB+": "#1890ff",
      "AB-": "#40a9ff",
      "O+": "#722ed1",
      "O-": "#9254de",
    };
    return colors[bloodType] || "#d9d9d9";
  };

  // Map blood type IDs to blood type names
  const getBloodTypeName = (bloodTypeId) => {
    const bloodTypeMap = {
      1: "A+",
      2: "A-",
      3: "B+",
      4: "B-",
      5: "AB+",
      6: "AB-",
      7: "O+",
      8: "O-",
      1001: "Unknown",
    };
    return bloodTypeMap[bloodTypeId] || "Unknown";
  };

  // Convert donorsByBloodType object to array for rendering
  const getBloodTypeDistribution = () => {
    if (!donorStats.donorsByBloodType) return [];

    return Object.entries(donorStats.donorsByBloodType).map(
      ([bloodTypeId, count]) => ({
        bloodType: getBloodTypeName(bloodTypeId),
        count: count,
      })
    );
  };

  // Convert unitsByBloodType object to array for rendering
  const getBloodInventoryDistribution = () => {
    if (!bloodInventory.unitsByBloodType) return [];

    return Object.entries(bloodInventory.unitsByBloodType).map(
      ([bloodTypeId, units]) => ({
        bloodType: getBloodTypeName(bloodTypeId),
        units: units,
        bloodTypeId: bloodTypeId,
      })
    );
  };

  // Convert unitsByComponent object to array for rendering
  const getComponentDistribution = () => {
    if (!bloodInventory.unitsByComponent) return [];

    const componentMap = {
      1: "Toàn phần",
      2: "Hồng cầu",
      3: "Tiểu cầu",
      4: "Huyết tương",
    };

    return Object.entries(bloodInventory.unitsByComponent).map(
      ([componentId, units]) => ({
        component: componentMap[componentId] || `Component ${componentId}`,
        units: units,
        componentId: componentId,
      })
    );
  };

  // Convert donationsByType object to array for rendering
  const getDonationTypeDistribution = () => {
    if (!donationActivity.donationsByType) return [];

    const typeMap = {
      1: "Toàn phần",
      2: "Hồng cầu",
      3: "Tiểu cầu",
      4: "Huyết tương",
    };

    return Object.entries(donationActivity.donationsByType).map(
      ([typeId, count]) => ({
        type: typeMap[typeId] || `Loại ${typeId}`,
        count: count,
        typeId: typeId,
      })
    );
  };

  // Format date for recent donations
  const formatDonationDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Convert unitsByStatus object to array for rendering
  const getStatusDistribution = () => {
    if (!bloodInventory.unitsByStatus) return [];

    const statusMap = {
      1: "Có sẵn",
      2: "Đã phân bổ",
      3: "Đã sử dụng",
      4: "Không sử dụng được",
    };

    const statusColors = {
      1: "#52c41a",
      2: "#1890ff",
      3: "#722ed1",
      4: "#ff4d4f",
    };

    return Object.entries(bloodInventory.unitsByStatus).map(
      ([statusId, units]) => ({
        status: statusMap[statusId] || `Status ${statusId}`,
        units: units,
        statusId: statusId,
        color: statusColors[statusId] || "#d9d9d9",
      })
    );
  };

  // Convert requestsByUrgency object to array for rendering
  const getUrgencyDistribution = () => {
    if (!bloodRequests.requestsByUrgency) return [];
    
    const urgencyMap = {
      1: 'Khẩn cấp',
      2: 'Cao',
      3: 'Trung bình',
      4: 'Thấp'
    };
    
    const urgencyColors = {
      1: '#ff4d4f',
      2: '#fa8c16',
      3: '#1890ff',
      4: '#52c41a'
    };
    
    return Object.entries(bloodRequests.requestsByUrgency).map(([urgencyId, count]) => ({
      urgency: urgencyMap[urgencyId] || `Mức độ ${urgencyId}`,
      count: count,
      urgencyId: urgencyId,
      color: urgencyColors[urgencyId] || '#d9d9d9'
    }));
  };

  // Convert requestsByBloodType object to array for rendering
  const getRequestBloodTypeDistribution = () => {
    if (!bloodRequests.requestsByBloodType) return [];
    
    return Object.entries(bloodRequests.requestsByBloodType).map(([bloodTypeId, count]) => ({
      bloodType: getBloodTypeName(bloodTypeId),
      count: count,
      bloodTypeId: bloodTypeId
    }));
  };

  // Convert hospitalFulfillmentRates object to array for rendering
  const getHospitalFulfillmentRates = () => {
    if (!hospitalActivity.hospitalFulfillmentRates) return [];
    
    return Object.values(hospitalActivity.hospitalFulfillmentRates);
  };

  // Convert usersByRole object to array for rendering
  const getUsersByRoleDistribution = () => {
    if (!systemHealth.usersByRole) return [];
    
    const roleMap = {
      1: 'Quản trị viên',
      2: 'Nhân viên',
      3: 'Người hiến máu',
      4: 'Bệnh viện'
    };
    
    const roleColors = {
      1: '#ff4d4f',
      2: '#fa8c16',
      3: '#1890ff',
      4: '#52c41a'
    };
    
    return Object.entries(systemHealth.usersByRole).map(([roleId, count]) => ({
      role: roleMap[roleId] || `Role ${roleId}`,
      count: count,
      roleId: roleId,
      color: roleColors[roleId] || '#d9d9d9'
    }));
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <StaffSidebar />
        <Layout>
          <StaffHeader />
          <Content style={{ padding: "24px" }}>
            <div className="dashboard-loading">
              <Spin size="large" />
              <Text>Đang tải dữ liệu dashboard...</Text>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <StaffSidebar />
        <Layout>
          <StaffHeader />
          <Content style={{ padding: "24px" }}>
            <Alert
              message="Lỗi tải dữ liệu"
              description={error}
              type="error"
              showIcon
              action={<button onClick={fetchAllDashboardData}>Thử lại</button>}
            />
          </Content>
        </Layout>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <StaffSidebar />
      <Layout>
        <StaffHeader />
        <Content style={{ padding: "24px" }}>
          <div className="dashboard-page">
      <div className="dashboard-header">
        <Title level={2}>
          <TrophyOutlined style={{ marginRight: 8 }} />
          Báo cáo thống kê
        </Title>
        <Text type="secondary">
          Tổng quan về hoạt động hiến máu và quản lý hệ thống
        </Text>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} className="summary-cards">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Tổng người hiến máu"
              value={summary.totalDonors || 0}
              prefix={<UserOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Lượt hiến hoàn thành tháng này"
              value={summary.completedDonationsThisMonth || 0}
              prefix={<HeartOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Đơn vị máu có sẵn"
              value={summary.availableBloodUnits || 0}
              prefix={<MedicineBoxOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1" }}
              suffix="đơn vị"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Yêu cầu chờ xử lý"
              value={summary.pendingRequests || 0}
              prefix={<BankOutlined style={{ color: "#fa8c16" }} />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Additional Summary Info */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Người hiến đủ điều kiện"
              value={summary.eligibleDonors || 0}
              prefix={<UserOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Lịch hiến đã đặt"
              value={summary.scheduledDonations || 0}
              prefix={<CalendarOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Tổng thể tích máu (ml)"
              value={summary.totalBloodVolumeAvailable || 0}
              prefix={<MedicineBoxOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1" }}
              suffix="ml"
            />
          </Card>
        </Col>
      </Row>

      {/* Detailed Statistics */}
      <div className="dashboard-content">
        <Tabs defaultActiveKey="1" type="card">
          {/* Donor Statistics */}
          <TabPane tab="Thống kê người hiến" key="1">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="Thống kê người hiến máu" bordered={false}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="Người hiến mới tháng này"
                        value={donorStats.newDonorsThisMonth || 0}
                        prefix={<UserOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Người hiến đủ điều kiện"
                        value={donorStats.eligibleDonors || 0}
                        prefix={<TeamOutlined />}
                      />
                    </Col>
                  </Row>
                  <div style={{ marginTop: 16 }}>
                    <Text strong>Tổng số người hiến: </Text>
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: "#1890ff",
                      }}
                    >
                      {donorStats.totalDonors || 0}
                    </Text>
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Phân bố theo nhóm máu" bordered={false}>
                  {getBloodTypeDistribution().length > 0 ? (
                    getBloodTypeDistribution().map((item, index) => (
                      <div key={index} style={{ marginBottom: 12 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <Text>{item.bloodType}</Text>
                          <Text strong>{item.count} người</Text>
                        </div>
                        <Progress
                          percent={
                            donorStats.totalDonors > 0
                              ? (item.count / donorStats.totalDonors) * 100
                              : 0
                          }
                          strokeColor={getBloodTypeColor(item.bloodType)}
                          showInfo={false}
                        />
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <Text type="secondary">
                        Chưa có dữ liệu phân bố nhóm máu
                      </Text>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Blood Inventory */}
          <TabPane tab="Đơn vị máu" key="2">
            <Row gutter={[16, 16]}>
              {/* Summary Cards */}
              <Col span={24}>
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Tổng số đơn vị"
                        value={bloodInventory.totalUnits || 0}
                        prefix={
                          <MedicineBoxOutlined style={{ color: "#1890ff" }} />
                        }
                        valueStyle={{ color: "#1890ff" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Đơn vị có sẵn"
                        value={bloodInventory.availableUnits || 0}
                        prefix={
                          <MedicineBoxOutlined style={{ color: "#52c41a" }} />
                        }
                        valueStyle={{ color: "#52c41a" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Đã phân bổ"
                        value={bloodInventory.assignedUnits || 0}
                        prefix={
                          <MedicineBoxOutlined style={{ color: "#722ed1" }} />
                        }
                        valueStyle={{ color: "#722ed1" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Hết hạn/Không dùng được"
                        value={
                          (bloodInventory.expiredUnits || 0) +
                          (bloodInventory.unusableUnits || 0)
                        }
                        prefix={<AlertOutlined style={{ color: "#ff4d4f" }} />}
                        valueStyle={{ color: "#ff4d4f" }}
                      />
                    </Card>
                  </Col>
                </Row>
              </Col>

              {/* Blood Type Distribution */}
              <Col xs={24} lg={8}>
                <Card title="Phân bố theo nhóm máu" bordered={false}>
                  {getBloodInventoryDistribution().length > 0 ? (
                    getBloodInventoryDistribution().map((item, index) => (
                      <div key={index} style={{ marginBottom: 12 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <Text>{item.bloodType}</Text>
                          <Text strong>{item.units} đơn vị</Text>
                        </div>
                        <Progress
                          percent={
                            bloodInventory.totalUnits > 0
                              ? (item.units / bloodInventory.totalUnits) * 100
                              : 0
                          }
                          strokeColor={getBloodTypeColor(item.bloodType)}
                          showInfo={false}
                        />
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <Text type="secondary">
                        Chưa có dữ liệu phân bố nhóm máu
                      </Text>
                    </div>
                  )}
                </Card>
              </Col>

              {/* Component Distribution */}
              <Col xs={24} lg={8}>
                <Card title="Phân bố theo thành phần" bordered={false}>
                  {getComponentDistribution().length > 0 ? (
                    getComponentDistribution().map((item, index) => (
                      <div key={index} style={{ marginBottom: 12 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <Text>{item.component}</Text>
                          <Text strong>{item.units} đơn vị</Text>
                        </div>
                        <Progress
                          percent={
                            bloodInventory.totalUnits > 0
                              ? (item.units / bloodInventory.totalUnits) * 100
                              : 0
                          }
                          strokeColor="#1890ff"
                          showInfo={false}
                        />
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <Text type="secondary">
                        Chưa có dữ liệu phân bố thành phần
                      </Text>
                    </div>
                  )}
                </Card>
              </Col>

              {/* Status Distribution */}
              <Col xs={24} lg={8}>
                <Card title="Phân bố theo trạng thái" bordered={false}>
                  {getStatusDistribution().length > 0 ? (
                    getStatusDistribution().map((item, index) => (
                      <div key={index} style={{ marginBottom: 12 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <Text>{item.status}</Text>
                          <Text strong>{item.units} đơn vị</Text>
                        </div>
                        <Progress
                          percent={
                            bloodInventory.totalUnits > 0
                              ? (item.units / bloodInventory.totalUnits) * 100
                              : 0
                          }
                          strokeColor={item.color}
                          showInfo={false}
                        />
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <Text type="secondary">
                        Chưa có dữ liệu phân bố trạng thái
                      </Text>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Donation Activity */}
          <TabPane tab="Hoạt động hiến máu" key="3">
            <Row gutter={[16, 16]}>
              {/* Summary Statistics */}
              <Col span={24}>
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Tổng lượt hiến"
                        value={donationActivity.totalDonations || 0}
                        prefix={<HeartOutlined style={{ color: "#1890ff" }} />}
                        valueStyle={{ color: "#1890ff" }}
                        suffix="lượt"
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Đã hoàn thành"
                        value={donationActivity.completedDonations || 0}
                        prefix={
                          <MedicineBoxOutlined style={{ color: "#52c41a" }} />
                        }
                        valueStyle={{ color: "#52c41a" }}
                        suffix="lượt"
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Đã lên lịch"
                        value={donationActivity.scheduledDonations || 0}
                        prefix={
                          <CalendarOutlined style={{ color: "#722ed1" }} />
                        }
                        valueStyle={{ color: "#722ed1" }}
                        suffix="lịch hẹn"
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Tỷ lệ thành công"
                        value={donationActivity.successRate || 0}
                        prefix={<TrophyOutlined style={{ color: "#fa8c16" }} />}
                        valueStyle={{ color: "#fa8c16" }}
                        suffix="%"
                        precision={1}
                      />
                    </Card>
                  </Col>
                </Row>
              </Col>

              {/* Volume Collected */}
              <Col xs={24} lg={8}>
                <Card title="Thể tích máu thu được" bordered={false}>
                  <Statistic
                    title="Tổng thể tích"
                    value={donationActivity.totalVolumeCollected || 0}
                    suffix="ml"
                    valueStyle={{ color: "#722ed1", fontSize: 28 }}
                  />
                </Card>
              </Col>

              {/* Donation Type Distribution */}
              <Col xs={24} lg={8}>
                <Card title="Phân bố theo loại hiến" bordered={false}>
                  {getDonationTypeDistribution().length > 0 ? (
                    getDonationTypeDistribution().map((item, index) => (
                      <div key={index} style={{ marginBottom: 12 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <Text>{item.type}</Text>
                          <Text strong>{item.count} lượt</Text>
                        </div>
                        <Progress
                          percent={
                            donationActivity.totalDonations > 0
                              ? (item.count / donationActivity.totalDonations) *
                                100
                              : 0
                          }
                          strokeColor="#1890ff"
                          showInfo={false}
                        />
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <Text type="secondary">
                        Chưa có dữ liệu phân bố loại hiến
                      </Text>
                    </div>
                  )}
                </Card>
              </Col>

              {/* Recent Donations */}
              <Col xs={24} lg={8}>
                <Card title="Lượt hiến gần đây" bordered={false}>
                  {donationActivity.recentDonations &&
                  Array.isArray(donationActivity.recentDonations) &&
                  donationActivity.recentDonations.length > 0 ? (
                    <div style={{ maxHeight: 300, overflowY: "auto" }}>
                      {donationActivity.recentDonations
                        .slice(0, 5)
                        .map((donation, index) => (
                          <div
                            key={donation.recordId}
                            style={{
                              marginBottom: 12,
                              padding: 8,
                              backgroundColor: "#f8f9fa",
                              borderRadius: 4,
                              border: "1px solid #e9ecef",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: 4,
                              }}
                            >
                              <Text strong>
                                {donation.donorName || "Người hiến"}
                              </Text>
                              <Text style={{ fontSize: 12, color: "#666" }}>
                                {formatDonationDate(donation.donationDateTime)}
                              </Text>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Text type="secondary">
                                {donation.bloodTypeName}
                              </Text>
                              <Text
                                style={{ color: "#722ed1", fontWeight: "bold" }}
                              >
                                {donation.volume}ml
                              </Text>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <Text type="secondary">
                        Chưa có dữ liệu lượt hiến gần đây
                      </Text>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Blood Requests */}
          <TabPane tab="Yêu cầu máu" key="4">
            <Row gutter={[16, 16]}>
              {/* Summary Statistics */}
              <Col span={24}>
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Tổng yêu cầu"
                        value={bloodRequests.totalRequests || 0}
                        prefix={<MedicineBoxOutlined style={{ color: "#1890ff" }} />}
                        valueStyle={{ color: "#1890ff" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Chờ xử lý"
                        value={bloodRequests.pendingRequests || 0}
                        prefix={<AlertOutlined style={{ color: "#fa8c16" }} />}
                        valueStyle={{ color: "#fa8c16" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Đã phê duyệt"
                        value={bloodRequests.approvedRequests || 0}
                        prefix={<MedicineBoxOutlined style={{ color: "#722ed1" }} />}
                        valueStyle={{ color: "#722ed1" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Đã hoàn thành"
                        value={bloodRequests.completedRequests || 0}
                        prefix={<MedicineBoxOutlined style={{ color: "#52c41a" }} />}
                        valueStyle={{ color: "#52c41a" }}
                      />
                    </Card>
                  </Col>
                </Row>
              </Col>

              {/* Volume Statistics */}
              <Col xs={24} lg={8}>
                <Card title="Thể tích yêu cầu" bordered={false}>
                  <Statistic
                    title="Tổng thể tích yêu cầu"
                    value={bloodRequests.totalVolumeRequested || 0}
                    suffix="ml"
                    valueStyle={{ color: "#1890ff", fontSize: 20 }}
                  />
                  <Statistic
                    title="Chưa đáp ứng"
                    value={bloodRequests.totalVolumeUnfulfilled || 0}
                    suffix="ml"
                    valueStyle={{ color: "#ff4d4f", fontSize: 20 }}
                    style={{ marginTop: 16 }}
                  />
                  <div style={{ marginTop: 16 }}>
                    <Text type="secondary">
                      Tỷ lệ đáp ứng: {bloodRequests.fulfillmentRate 
                        ? Math.round(bloodRequests.fulfillmentRate * 100) / 100 
                        : 0}%
                    </Text>
                  </div>
                </Card>
              </Col>

              {/* Urgency Distribution */}
              <Col xs={24} lg={8}>
                <Card title="Phân bố theo mức độ khẩn cấp" bordered={false}>
                  {getUrgencyDistribution().length > 0 ? (
                    getUrgencyDistribution().map((item, index) => (
                      <div key={index} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text>{item.urgency}</Text>
                          <Text strong>{item.count} yêu cầu</Text>
                        </div>
                        <Progress 
                          percent={bloodRequests.totalRequests > 0 ? (item.count / bloodRequests.totalRequests) * 100 : 0} 
                          strokeColor={item.color}
                          showInfo={false}
                        />
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <Text type="secondary">Chưa có dữ liệu phân bố mức độ khẩn cấp</Text>
                    </div>
                  )}
                </Card>
              </Col>

              {/* Blood Type Distribution */}
              <Col xs={24} lg={8}>
                <Card title="Phân bố theo nhóm máu" bordered={false}>
                  {getRequestBloodTypeDistribution().length > 0 ? (
                    getRequestBloodTypeDistribution().map((item, index) => (
                      <div key={index} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text>{item.bloodType}</Text>
                          <Text strong>{item.count} yêu cầu</Text>
                        </div>
                        <Progress 
                          percent={bloodRequests.totalRequests > 0 ? (item.count / bloodRequests.totalRequests) * 100 : 0} 
                          strokeColor={getBloodTypeColor(item.bloodType)}
                          showInfo={false}
                        />
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <Text type="secondary">Chưa có dữ liệu phân bố nhóm máu</Text>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Hospital Activity */}
          <TabPane tab="Hoạt động bệnh viện" key="5">
            <Row gutter={[16, 16]}>
              {/* Summary Statistics */}
              <Col span={24}>
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col xs={24} sm={12} md={8}>
                    <Card>
                      <Statistic
                        title="Tổng số bệnh viện"
                        value={hospitalActivity.totalHospitals || 0}
                        prefix={<BankOutlined style={{ color: "#1890ff" }} />}
                        valueStyle={{ color: "#1890ff" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Card>
                      <Statistic
                        title="Bệnh viện đang hoạt động"
                        value={hospitalActivity.activeHospitals || 0}
                        prefix={<BankOutlined style={{ color: "#52c41a" }} />}
                        valueStyle={{ color: "#52c41a" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Card>
                      <Statistic
                        title="Tỷ lệ hoạt động"
                        value={hospitalActivity.totalHospitals > 0 
                          ? Math.round((hospitalActivity.activeHospitals / hospitalActivity.totalHospitals) * 100)
                          : 0}
                        suffix="%"
                        prefix={<TrophyOutlined style={{ color: "#fa8c16" }} />}
                        valueStyle={{ color: "#fa8c16" }}
                      />
                    </Card>
                  </Col>
                </Row>
              </Col>

              {/* Top Requesting Hospitals */}
              <Col xs={24} lg={12}>
                <Card title="Top bệnh viện yêu cầu nhiều nhất" bordered={false}>
                  {hospitalActivity.topRequestingHospitals &&
                  Array.isArray(hospitalActivity.topRequestingHospitals) &&
                  hospitalActivity.topRequestingHospitals.length > 0 ? (
                    hospitalActivity.topRequestingHospitals.map(
                      (hospital, index) => (
                        <div
                          key={hospital.hospitalId}
                          style={{
                            marginBottom: 16,
                            padding: 12,
                            backgroundColor: index < 3 ? "#f6ffed" : "#fafafa",
                            borderRadius: 6,
                            border: `1px solid ${index < 3 ? "#b7eb8f" : "#d9d9d9"}`,
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <Text strong style={{ color: "#001529" }}>
                              {index + 1}. {hospital.hospitalName}
                            </Text>
                            <Text style={{ fontSize: 12, color: "#666" }}>
                              ID: {hospital.hospitalId}
                            </Text>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <Text type="secondary">Số yêu cầu:</Text>
                            <Text strong style={{ color: "#1890ff" }}>
                              {hospital.requestCount} yêu cầu
                            </Text>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Text type="secondary">Thể tích yêu cầu:</Text>
                            <Text strong style={{ color: "#722ed1" }}>
                              {hospital.totalVolumeRequested} ml
                            </Text>
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <Text type="secondary">Chưa có dữ liệu bệnh viện</Text>
                    </div>
                  )}
                </Card>
              </Col>

              {/* Hospital Fulfillment Rates */}
              <Col xs={24} lg={12}>
                <Card title="Tỷ lệ đáp ứng theo bệnh viện" bordered={false}>
                  {getHospitalFulfillmentRates().length > 0 ? (
                    <div style={{ maxHeight: 400, overflowY: "auto" }}>
                      {getHospitalFulfillmentRates().map((hospital, index) => (
                        <div
                          key={hospital.hospitalId}
                          style={{
                            marginBottom: 16,
                            padding: 12,
                            backgroundColor: "#f8f9fa",
                            borderRadius: 6,
                            border: "1px solid #e9ecef",
                          }}
                        >
                          <div style={{ marginBottom: 8 }}>
                            <Text strong style={{ color: "#001529" }}>
                              {hospital.hospitalName}
                            </Text>
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <Text type="secondary">Tổng yêu cầu:</Text>
                              <Text>{hospital.totalRequests}</Text>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <Text type="secondary">Đã đáp ứng:</Text>
                              <Text style={{ color: "#52c41a" }}>{hospital.fulfilledRequests}</Text>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                              <Text type="secondary">Chưa đáp ứng:</Text>
                              <Text style={{ color: "#ff4d4f" }}>{hospital.unfulfilledRequests}</Text>
                            </div>
                          </div>
                          <div>
                            <Text strong>Tỷ lệ đáp ứng: </Text>
                            <Text strong style={{ 
                              color: hospital.fulfillmentRate >= 80 ? "#52c41a" : 
                                     hospital.fulfillmentRate >= 60 ? "#fa8c16" : "#ff4d4f"
                            }}>
                              {hospital.fulfillmentRate}%
                            </Text>
                            <Progress 
                              percent={hospital.fulfillmentRate} 
                              strokeColor={
                                hospital.fulfillmentRate >= 80 ? "#52c41a" : 
                                hospital.fulfillmentRate >= 60 ? "#fa8c16" : "#ff4d4f"
                              }
                              showInfo={false}
                              style={{ marginTop: 4 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <Text type="secondary">Chưa có dữ liệu tỷ lệ đáp ứng</Text>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* System Health */}
          <TabPane tab="Tình trạng hệ thống" key="6">
            <Row gutter={[16, 16]}>
              {/* Active Users */}
              <Col xs={24} lg={12}>
                <Card title="Người dùng hoạt động" bordered={false}>
                  <Statistic
                    title="Người dùng hoạt động 30 ngày qua"
                    value={systemHealth.activeUsersLast30Days || 0}
                    prefix={<UserOutlined style={{ color: "#52c41a" }} />}
                    valueStyle={{ color: "#52c41a", fontSize: 28 }}
                    suffix="người dùng"
                  />
                  <div style={{ marginTop: 16 }}>
                    <Text type="secondary">
                      Cập nhật thời gian thực từ hệ thống
                    </Text>
                  </div>
                </Card>
              </Col>

              {/* Users by Role Distribution */}
              <Col xs={24} lg={12}>
                <Card title="Phân bố người dùng theo vai trò" bordered={false}>
                  {getUsersByRoleDistribution().length > 0 ? (
                    getUsersByRoleDistribution().map((item, index) => (
                      <div key={index} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text>{item.role}</Text>
                          <Text strong>{item.count} người</Text>
                        </div>
                        <Progress 
                          percent={systemHealth.activeUsersLast30Days > 0 ? (item.count / systemHealth.activeUsersLast30Days) * 100 : 0} 
                          strokeColor={item.color}
                          showInfo={false}
                        />
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <Text type="secondary">Chưa có dữ liệu phân bố vai trò</Text>
                    </div>
                  )}
                </Card>
              </Col>

              {/* System Summary */}
              <Col span={24}>
                <Card title="Thông tin hệ thống" bordered={false}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                      <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <Text strong style={{ display: 'block', marginBottom: 8, color: "#1890ff" }}>
                         Tổng số Quản trị viên
                        </Text>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: "#ff4d4f" }}>
                          {systemHealth.usersByRole ? (systemHealth.usersByRole[1] || 0) : 0}
                        </Text>
                      </div>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <Text strong style={{ display: 'block', marginBottom: 8, color: "#1890ff" }}>
                          Tổng số nhân viên
                        </Text>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: "#fa8c16" }}>
                          {systemHealth.usersByRole ? (systemHealth.usersByRole[2] || 0) : 0}
                        </Text>
                      </div>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <Text strong style={{ display: 'block', marginBottom: 8, color: "#1890ff" }}>
                          Tổng số người hiến máu    
                        </Text>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: "#1890ff" }}>
                          {systemHealth.usersByRole ? (systemHealth.usersByRole[3] || 0) : 0}
                        </Text>
                      </div>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <Text strong style={{ display: 'block', marginBottom: 8, color: "#1890ff" }}>
                          Tổng số bệnh viện
                        </Text>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: "#52c41a" }}>
                          {systemHealth.usersByRole ? (systemHealth.usersByRole[4] || 0) : 0}
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </div>
    </div>
          </Content>
        </Layout>
      </Layout>
    );
  };

  export default DashboardPage;
