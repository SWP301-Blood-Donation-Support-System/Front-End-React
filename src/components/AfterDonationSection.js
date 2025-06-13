import React from 'react';
import { Row, Col, Card } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const AfterDonationSection = () => {
  const shouldDoItems = [
    "Ăn nhẹ và uống nhiều nước (300-500ml) trước khi hiến máu.",
    "Để chặt miếng bông gòn cầm máu nơi kim chích 10 phút, giữ băng keo cá nhân trong 4-6 giờ.",
    "Nằm và ngồi nghỉ tại chỗ 10 phút sau khi hiến máu.",
    "Nằm nghỉ đầu thấp, kê chân cao nếu thấy chóng mặt, mệt, buồn nôn.",
    "Chườm lạnh (túi chườm chuyên dụng hoặc cho đá vào khăn) chườm vết chích nếu bị sưng, bầm tím."
  ];

  const shouldNotDoItems = [
    "Uống bia, rượu bia trước khi hiến máu.",
    "Lái xe đi xa, khuân vác, làm việc nặng hoặc luyện tập thể thao gắng sức trong ngày lấy máu."
  ];
  const warningMainPoint = "Nếu phát hiện chảy máu tại chỗ chích:";
  
  const warningSubPoints = [
    "Giơ tay cao.",
    "Lấy tay kia ấn nhẹ vào miếng bông hoặc băng dính.",
    "Liên hệ nhân viên y tế để được hỗ trợ khi cần thiết."
  ];

  return (
    <section className="after-donation-section">
      <div className="after-donation-container">
        <div className="section-header">
          <h2 className="section-title">Những lời khuyên trước và sau khi hiến máu</h2>
        </div>        <div className="advice-cards-container">
          {/* Main Featured Card - Should Do */}
          <div className="featured-card-wrapper">
            <Card className="advice-card featured-card should-do-card">
              <div className="card-header">
                <div className="icon-wrapper">
                  <CheckCircleOutlined className="card-icon should-do-icon" />
                </div>
                <div className="header-content">
                  <h3 className="card-title">Nên làm</h3>
                  <p className="card-subtitle">Những điều quan trọng cần thực hiện</p>
                </div>
              </div>
              <div className="card-content">
                <ul className="advice-list">
                  {shouldDoItems.map((item, index) => (
                    <li key={index} className="advice-item">
                      <span className="item-number">{index + 1}</span>
                      <span className="item-text">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="doctor-credit">
                  <div className="doctor-avatar">👨‍⚕️</div>
                  <div className="doctor-info">
                    <p className="doctor-name">Bác sĩ Ngô Văn Tân</p>
                    <p className="doctor-title">Trưởng khoa Khoa Tiếp nhận hiến máu</p>
                    <p className="hospital-name">Bệnh viện Truyền máu Huyết học</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Side Cards Container */}
          <div className="side-cards-container">
            {/* Should Not Do Card */}
            <Card className="advice-card side-card should-not-do-card">
              <div className="card-header">
                <div className="icon-wrapper">
                  <CloseCircleOutlined className="card-icon should-not-do-icon" />
                </div>
                <div className="header-content">
                  <h3 className="card-title">Không nên</h3>
                  <p className="card-subtitle">Tránh những hành động này</p>
                </div>
              </div>
              <div className="card-content">
                <ul className="advice-list">
                  {shouldNotDoItems.map((item, index) => (
                    <li key={index} className="advice-item">
                      <span className="item-icon">⚠️</span>
                      <span className="item-text">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="doctor-credit compact">
                  <p className="doctor-name">BS. Ngô Văn Tân</p>
                  <p className="hospital-name">BV Truyền máu Huyết học</p>
                </div>
              </div>
            </Card>

            {/* Warning Card */}
            <Card className="advice-card side-card warning-card elevated">
              <div className="card-header">
                <div className="icon-wrapper">
                  <ExclamationCircleOutlined className="card-icon warning-icon" />
                </div>
                <div className="header-content">
                  <h3 className="card-title">Lưu ý đặc biệt</h3>
                  <p className="card-subtitle">Khi có biến chứng</p>
                </div>
              </div>              <div className="card-content">
                <ul className="advice-list">
                  {/* Main Point */}
                  <li className="advice-item main-point">
                    <span className="item-icon">🩸</span>
                    <span className="item-text">{warningMainPoint}</span>
                  </li>
                  {/* Sub Points */}
                  {warningSubPoints.map((item, index) => (
                    <li key={index} className="advice-item sub-point">
                      <span className="item-icon">⭐</span>
                      <span className="item-text">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="doctor-credit compact">
                  <p className="doctor-name">BS. Ngô Văn Tân</p>
                  <p className="hospital-name">BV Truyền máu Huyết học</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AfterDonationSection;
