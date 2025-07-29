import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Spin, 
  Alert, 
  Typography, 
  Progress,
  Badge,
  Button,
  notification
} from 'antd';
import {
  UserOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  BankOutlined,
  TrophyOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import './DashboardPage.scss';

const { Title, Text } = Typography;

const DashboardTestPage = () => {
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  // Mock data for testing
  const mockSummary = {
    totalDonors: 1256,
    todayDonations: 18,
    totalBloodUnits: 3456,
    totalHospitals: 25
  };

  const mockBloodInventory = [
    { bloodType: 'A+', currentStock: 150, minimumLevel: 100 },
    { bloodType: 'A-', currentStock: 75, minimumLevel: 80 },
    { bloodType: 'B+', currentStock: 120, minimumLevel: 100 },
    { bloodType: 'B-', currentStock: 45, minimumLevel: 60 },
    { bloodType: 'AB+', currentStock: 80, minimumLevel: 70 },
    { bloodType: 'AB-', currentStock: 30, minimumLevel: 40 },
    { bloodType: 'O+', currentStock: 200, minimumLevel: 150 },
    { bloodType: 'O-', currentStock: 90, minimumLevel: 100 }
  ];

  const getBloodTypeColor = (bloodType) => {
    const colors = {
      'A+': '#ff4d4f',
      'A-': '#ff7875',
      'B+': '#52c41a',
      'B-': '#73d13d',
      'AB+': '#1890ff',
      'AB-': '#40a9ff',
      'O+': '#722ed1',
      'O-': '#9254de'
    };
    return colors[bloodType] || '#d9d9d9';
  };

  const handleRefresh = () => {
    setLoading(true);
    api.info({
      message: 'Đang cập nhật dữ liệu',
      description: 'Đây là phiên bản demo. Trong thực tế sẽ gọi API thực.',
      placement: 'topRight',
      duration: 2,
    });
    
    setTimeout(() => {
      setLoading(false);
      api.success({
        message: 'Cập nhật thành công',
        description: 'Dữ liệu dashboard đã được cập nhật.',
        placement: 'topRight',
        duration: 3,
      });
    }, 2000);
  };

  return (
    <div className="dashboard-page">
      {contextHolder}
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2}>
              <TrophyOutlined style={{ marginRight: 8 }} />
              Báo cáo thống kê
            </Title>
            <Text type="secondary">
              Tổng quan về hoạt động hiến máu và quản lý hệ thống (Demo)
            </Text>
          </div>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            Cập nhật
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-loading">
          <Spin size="large" />
          <Text>Đang tải dữ liệu dashboard...</Text>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <Row gutter={[16, 16]} className="summary-cards">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="Tổng người hiến máu"
                  value={mockSummary.totalDonors}
                  prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="Lượt hiến máu hôm nay"
                  value={mockSummary.todayDonations}
                  prefix={<HeartOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="Tổng đơn vị máu"
                  value={mockSummary.totalBloodUnits}
                  prefix={<MedicineBoxOutlined style={{ color: '#722ed1' }} />}
                  valueStyle={{ color: '#722ed1' }}
                  suffix="đơn vị"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="Bệnh viện liên kết"
                  value={mockSummary.totalHospitals}
                  prefix={<BankOutlined style={{ color: '#fa8c16' }} />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Blood Inventory */}
          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col span={24}>
              <Card title="Tình trạng kho máu" bordered={false}>
                <Row gutter={[16, 16]}>
                  {mockBloodInventory.map((item, index) => {
                    const percentage = (item.currentStock / item.minimumLevel) * 100;
                    let status = 'success';
                    let statusText = 'Đủ';
                    
                    if (percentage < 50) {
                      status = 'exception';
                      statusText = 'Thiếu nghiêm trọng';
                    } else if (percentage < 100) {
                      status = 'active';
                      statusText = 'Sắp hết';
                    }

                    return (
                      <Col xs={24} sm={12} md={8} lg={6} key={index}>
                        <Card size="small">
                          <div style={{ textAlign: 'center' }}>
                            <Badge 
                              color={getBloodTypeColor(item.bloodType)} 
                              text={<Text strong style={{ fontSize: 16 }}>{item.bloodType}</Text>}
                            />
                            <div style={{ margin: '12px 0' }}>
                              <Statistic 
                                value={item.currentStock} 
                                suffix="/ " 
                                style={{ display: 'inline' }}
                              />
                              <Text type="secondary">{item.minimumLevel} đơn vị</Text>
                            </div>
                            <Progress 
                              percent={Math.min(percentage, 100)} 
                              status={status}
                              format={() => statusText}
                              strokeColor={getBloodTypeColor(item.bloodType)}
                            />
                          </div>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </Card>
            </Col>
          </Row>

          {/* Demo Notice */}
          <Alert
            message="Đây là phiên bản demo"
            description="Dữ liệu hiển thị là dữ liệu mẫu. Khi tích hợp với API thực, tất cả các thống kê sẽ được cập nhật real-time từ cơ sở dữ liệu."
            type="info"
            showIcon
            style={{ marginTop: 24 }}
          />
        </>
      )}
    </div>
  );
};

export default DashboardTestPage;
