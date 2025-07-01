import React from 'react';
import { 
  IdcardOutlined, 
  SecurityScanOutlined, 
  FundOutlined, 
  StopOutlined, 
  HeartOutlined, 
  ExperimentOutlined,
  UserOutlined,
  CalendarOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';

const EligibilityCriteriaSection = () => {
  const criteriaData = [
    {
      icon: <IdcardOutlined />,
      title: 'Mang theo chứng minh nhân dân/hộ chiếu',
      description: 'Mang theo chứng minh nhân dân/hộ chiếu'
    },
    {
      icon: <SecurityScanOutlined />,
      title: 'Không mắc hoặc không có các hành vi nguy cơ lây nhiễm',
      description: 'Không mắc hoặc không có các hành vi nguy cơ lây nhiễm HIV, không nhiễm viêm gan B, viêm gan C, và các virus lây qua đường truyền máu'
    },
    {
      icon: <FundOutlined />,
      title: 'Cân nặng',
      description: 'Cân nặng: Nam > 45 kg Nữ ≥ 45 kg'
    },
    {
      icon: <StopOutlined />,
      title: 'Không nghiện ma túy, rượu bia',
      description: 'Không nghiện ma túy, rượu bia và các chất kích thích'
    },
    {
      icon: <HeartOutlined />,
      title: 'Không mắc các bệnh mãn tính',
      description: 'Không mắc các bệnh mãn tính hoặc cấp tính về tim mạch, huyết áp, hô hấp, da dày...'
    },
    {
      icon: <ExperimentOutlined />,
      title: 'Chỉ số huyết sắc tố (Hb)',
      description: 'Chỉ số huyết sắc tố (Hb) ≥120g/l (≥125g/l nếu hiến từ 350ml trở lên).'
    },
    {
      icon: <UserOutlined />,
      title: 'Độ tuổi',
      description: 'Người khỏe mạnh trong độ tuổi từ đủ 18 đến 60 tuổi'
    },
    {
      icon: <CalendarOutlined />,
      title: 'Thời gian tối thiểu giữa 2 lần hiến máu',
      description: 'Thời gian tối thiểu giữa 2 lần hiến máu là 12 tuần đối với cả Nam và Nữ'
    },
    {
      icon: <MedicineBoxOutlined />,
      title: 'Kết quả test nhanh âm tính',
      description: 'Kết quả test nhanh âm tính với kháng nguyên bề mặt của siêu vi B'
    }
  ];

  return (
    <section className="eligibility-criteria-section">
      <div className="container">
        <div className="criteria-header">
          <div className="criteria-title-card">
            <h2>Tiêu chuẩn tham gia hiến máu</h2>
            <span className="heart-icon">❤️</span>
          </div>
        </div>
        
        <div className="criteria-grid">
          {criteriaData.map((criteria, index) => (
            <div key={index} className="criteria-card">
              <div className="criteria-icon">
                {criteria.icon}
              </div>
              <div className="criteria-content">
                <p>{criteria.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EligibilityCriteriaSection;
