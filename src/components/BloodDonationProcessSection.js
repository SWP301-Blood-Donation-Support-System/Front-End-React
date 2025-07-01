import React from 'react';
import { Typography, Steps } from 'antd';

const { Title, Paragraph } = Typography;

const BloodDonationProcessSection = () => {
  const donationSteps = [
    {
      title: 'Đăng ký',
      description: 'Điền thông tin cá nhân và đặt lịch hẹn'
    },
    {
      title: 'Kiểm tra sức khỏe',
      description: 'Đo huyết áp, nhiệt độ, kiểm tra hemoglobin'
    },
    {
      title: 'Tư vấn',
      description: 'Trao đổi với bác sĩ về loại hiến máu phù hợp'
    },
    {
      title: 'Hiến máu',
      description: 'Thực hiện quy trình hiến máu an toàn'
    },
    {
      title: 'Nghỉ ngơi',
      description: 'Ăn nhẹ và nghỉ ngơi 15-30 phút'
    }
  ];

  return (
    <section className="process-section">
      <div className="container">
        <Title level={2} className="section-title">
          Quy Trình Hiến Máu
        </Title>
        <Paragraph className="process-subtitle">
          Quy trình hiến máu đơn giản, an toàn và được thực hiện bởi đội ngũ y tế chuyên nghiệp
        </Paragraph>
        
        <Steps
          current={-1}
          items={donationSteps}
          className="donation-steps"
          size="default"
          direction="horizontal"
        />
      </div>
    </section>
  );
};

export default BloodDonationProcessSection;
