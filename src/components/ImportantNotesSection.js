import React from 'react';
import { Collapse, Button } from 'antd';
import { CaretRightOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Panel } = Collapse;

const ImportantNotesSection = () => {
  const navigate = useNavigate();

  const importantFAQs = [
    {
      key: '1',
      question: 'Ai có thể tham gia hiến máu?',
      answer: [
        'Người tham gia hiến máu phải đáp ứng các yêu cầu sau:',
        'Người đủ 18 tuổi đến 60 tuổi, có sức khỏe tốt',
        'Cân nặng nam ≥ 45kg, nữ ≥ 42kg',
        'Không nhiễm các bệnh lây truyền qua đường máu như: HIV, viêm gan B, viêm gan C, giang mai',
        'Không mắc các bệnh mãn tính như: tim mạch, huyết áp, hô hấp, thận, da dày, tâm thần kinh, rối loạn đông cầm máu...'
      ]
    },
    {
      key: '2',
      question: 'Ai là người không nên hiến máu?',
      answer: [
        'Những người không nên hiến máu bao gồm:',
        'Người bị nhiễm hoặc nghi ngờ nhiễm HIV/AIDS, viêm gan B, viêm gan C, giang mai',
        'Người có các hành vi nguy cơ cao: tiêm chích ma túy, quan hệ tình dục với người nhiễm hoặc nghi ngờ nhiễm HIV/AIDS, viêm gan, giang mai...',
        'Người mắc bệnh tim mạch, huyết áp, hô hấp, thận, dạ dày, tâm thần kinh, rối loạn đông cầm máu, bệnh hệ thống (lupus ban đỏ, xơ cứng bì...)',
        'Phụ nữ có thai hoặc đang cho con bú',
      ]
    },
    {
      key: '3',
      question: 'Máu của tôi sẽ được làm những xét nghiệm gì?',
      answer: [
        'Máu của bạn sẽ được làm các xét nghiệm sau:',
        'Xét nghiệm nhóm máu hệ ABO và Rh',
        'Xét nghiệm sàng lọc kháng thể bất thường',
        'Xét nghiệm sàng lọc HIV, viêm gan B, viêm gan C, giang mai',
        'Xét nghiệm xác định ALT (một chỉ số men gan)',
        'Nếu bạn hiến máu nhiều lần, định kỳ sẽ được kiểm tra tổng phân tích tế bào máu ngoại vi',
      ]
    }
  ];

  const renderAnswer = (answer) => {
    return (
      <div className="faq-answer">
        <p className="answer-intro">{answer[0]}</p>
        <ul className="answer-list">
          {answer.slice(1).map((point, i) => (
            <li key={i} className="answer-item">{point}</li>
          ))}
        </ul>
      </div>
    );
  };

  const handleViewMore = () => {
    navigate('/faq');
  };

  return (
    <section className="important-notes-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Lưu ý quan trọng</h2>
          <p className="section-subtitle">
            Những thông tin quan trọng bạn cần biết trước khi hiến máu
          </p>
        </div>

        <div className="faq-container">
          <Collapse
            className="faq-collapse"
            expandIcon={({ isActive }) => (
              <CaretRightOutlined rotate={isActive ? 90 : 0} />
            )}
            ghost
          >
            {importantFAQs.map((faq) => (
              <Panel 
                header={faq.question} 
                key={faq.key}
                className="faq-panel"
              >
                {renderAnswer(faq.answer)}
              </Panel>
            ))}
          </Collapse>
        </div>

        <div className="view-more-section">
          <Button
            type="primary"
            size="large"
            icon={<ArrowRightOutlined />}
            className="view-more-btn"
            onClick={handleViewMore}
          >
            Xem thêm
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ImportantNotesSection;
