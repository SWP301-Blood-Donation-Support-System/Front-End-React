import React, { useState, useEffect } from 'react';
import { Layout, Card, Form, Input, Button, Typography } from 'antd';
import { IdcardOutlined } from '@ant-design/icons';

const CheckinPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    console.log('CCCD entered:', values.cccd);
    
    try {
      // TODO: Add your checkin logic here
      // For now, just log the CCCD value
      setTimeout(() => {
        console.log('Processing CCCD:', values.cccd);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error during checkin:', error);
      setLoading(false);
    }
  };

  const containerStyle = {
    background: '#f8f9fa',
    position: 'relative',
    overflow: 'hidden'
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(185, 28, 28, 0.03) 100%)'
  };

  return (
    <Layout className="auth-page">
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 10
      }}>
        <img 
          src="/images/new-logo.png" 
          alt="Logo" 
          style={{
            height: '60px',
            width: 'auto'
          }}
        />
      </div>
      <div className="auth-container" style={containerStyle}>
        <div style={overlayStyle}></div>
        <Card className="auth-card" style={{ position: 'relative', zIndex: 1 }}>
          <div className="auth-header">
            <Typography.Title className="auth-title">
              Check-in
            </Typography.Title>
            <Typography.Text className="auth-subtitle">
              Vui lòng nhập số CCCD để check-in
            </Typography.Text>
          </div>

          <Form
            form={form}
            name="checkin"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            className="auth-form"
          >
            <Form.Item
              label="Nhập CCCD"
              name="cccd"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập số CCCD!'
                },
                {
                  pattern: /^[0-9]{12}$/,
                  message: 'CCCD phải gồm 12 chữ số!'
                }
              ]}
            >
              <Input
                className="auth-input-affix-wrapper"
                prefix={<IdcardOutlined />}
                placeholder="Nhập số CCCD (12 chữ số)"
                size="large"
                maxLength={12}
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
                className="auth-submit-btn"
              >
                Check-in
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default CheckinPage; 