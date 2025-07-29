import React, { useState, useEffect } from 'react';
import { 
  Layout,
  Table, 
  Button,
  message,
  Modal,
  Form,
  Input,
  Typography,
  Space,
  Card
} from 'antd';
import { 
  PlusOutlined,
  BellOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { AdminAPI } from '../../api/admin';
import StaffSidebar from '../../components/StaffSidebar';
import StaffHeader from '../../components/StaffHeader';

const { Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;

const NotificationManagementPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await AdminAPI.getNotifications();
      
      if (response.status === 200) {
        // Handle different response structures
        const notificationsData = Array.isArray(response.data) ? response.data : 
                                  Array.isArray(response.data?.data) ? response.data.data : [];
        setNotifications(notificationsData);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      message.error('Lỗi khi tải danh sách thông báo');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotification = async (values) => {
    try {
      const notificationData = {
        notificationTypeId: 0, // Based on the API schema
        subject: values.subject,
        message: values.message
      };

      const response = await AdminAPI.createNotification(notificationData);
      
      if (response.status === 200 || response.status === 201) {
        message.success('Tạo thông báo thành công!');
        setCreateModalVisible(false);
        form.resetFields();
        fetchNotifications(); // Refresh the list
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      message.error('Không thể tạo thông báo. Vui lòng thử lại sau.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRefresh = () => {
    fetchNotifications();
    message.success('Đã làm mới danh sách thông báo');
  };

  const notificationColumns = [
    {
      title: 'ID',
      dataIndex: 'notificationId',
      key: 'notificationId',
      width: '10%',
      render: (text) => (
        <span style={{ fontWeight: 'bold', color: '#dc2626' }}>
          #{text || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'subject',
      key: 'subject',
      width: '25%',
      render: (text) => (
        <span style={{ fontWeight: '500' }}>
          {text || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Nội dung',
      dataIndex: 'message',
      key: 'message',
      width: '40%',
      render: (text) => (
        <span>
          {text && text.length > 100 ? `${text.substring(0, 100)}...` : text || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '20%',
      render: (date) => (
        <span style={{ color: '#374151' }}>
          {formatDate(date)}
        </span>
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
          <Content style={{ padding: '24px', background: '#f0f2f5' }}>
            <Card>
              {/* Header Section */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '16px' 
                }}>
                  <Title level={3} style={{ margin: 0 }}>
                    <BellOutlined style={{ marginRight: 8, color: '#dc2626' }} />
                    Quản Lý Thông Báo
                  </Title>
                  
                  <Space>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={handleRefresh}
                    >
                      Làm mới
                    </Button>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setCreateModalVisible(true)}
                    >
                      Tạo thông báo mới
                    </Button>
                  </Space>
                </div>
              </div>

              {/* Table Section */}
              <Table
                columns={notificationColumns}
                dataSource={notifications}
                rowKey={(record) => record.notificationId || Math.random()}
                loading={loading}
                pagination={false}
                size="large"
              />
            </Card>
          </Content>
        </Layout>
      </Layout>

      {/* Create Notification Modal */}
      <Modal
        title="Tạo thông báo mới"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateNotification}
        >
          <Form.Item
            name="subject"
            label="Tiêu đề"
            rules={[
              { required: true, message: 'Vui lòng nhập tiêu đề thông báo!' },
              { max: 200, message: 'Tiêu đề không được vượt quá 200 ký tự!' }
            ]}
          >
            <Input 
              placeholder="Nhập tiêu đề thông báo"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="message"
            label="Nội dung"
            rules={[
              { required: true, message: 'Vui lòng nhập nội dung thông báo!' },
              { max: 1000, message: 'Nội dung không được vượt quá 1000 ký tự!' }
            ]}
          >
            <TextArea
              placeholder="Nhập nội dung thông báo"
              rows={6}
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button 
                onClick={() => {
                  setCreateModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Tạo thông báo
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default NotificationManagementPage;
