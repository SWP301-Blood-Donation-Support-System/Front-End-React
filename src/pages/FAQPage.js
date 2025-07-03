import React from 'react';
import { Layout, Typography, Collapse } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import ProfileWarning from '../components/ProfileWarning';
import Footer from '../components/Footer';

const { Content } = Layout;
const { Title } = Typography;
const { Panel } = Collapse;

const FAQPage = () => {
  const faqData = [
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
    },
    {
      key: '4',
      question: 'Máu gồm những thành phần và chức năng gì?',
      answer: {
        intro: 'Máu gồm 2 phần chính: huyết tương và các tế bào máu.',
        sections: [
          {
            title: 'Các thành phần của máu:',
            items: [
              'Hồng cầu: Vận chuyển oxy từ phổi đến mô, chiếm 45%',
              'Bạch cầu: Bảo vệ cơ thể chống lại các tác nhân gây bệnh, chiếm 1%',
              'Tiểu cầu: Tham gia quá trình đông máu khi bị tổn thương, chiếm 1%',
              'Huyết tương: Thành phần dịch của máu, chiếm 53%'
            ]
          },
          {
            title: 'Chức năng của máu:',
            items: [
              'Vận chuyển oxy, dinh dưỡng đến các tế bào và đưa các chất thải ra khỏi tế bào',
              'Bảo vệ cơ thể khỏi các yếu tố gây bệnh',
              'Điều hòa thân nhiệt và cân bằng nội môi',
              'Cầm máu khi có tổn thương'
            ]
          }
        ]
      }
    },
    {
      key: '5',
      question: 'Tại sao lại có nhiều người cần phải được truyền máu?',
      answer: [
        'Có nhiều người cần truyền máu vì các lý do sau:',
        'Phẫu thuật lớn, đặc biệt là phẫu thuật tim, mạch máu, ghép tạng, chấn thương',
        'Tai nạn giao thông, tai nạn lao động, thảm họa gây mất máu nhiều',
        'Các bệnh lý gây mất máu như xuất huyết tiêu hóa, thai ngoài tử cung, vỡ tạng đặc...',
        'Các bệnh lý về máu như thiếu máu, giảm tiểu cầu, rối loạn đông máu, bệnh ung thư máu...',
        'Các bệnh lý sản khoa như băng huyết sau sinh, lọc máu, thay máu ở trẻ sơ sinh'
      ]
    },
    {
      key: '6',
      question: 'Nhu cầu máu điều trị ở nước ta hiện nay?',
      answer: [
        'Theo Tổ chức Y tế Thế giới, ước tính một quốc gia cần dự trữ lượng máu bằng 1-2% dân số',
        'Với dân số gần 100 triệu người, Việt Nam cần khoảng 2 triệu đơn vị máu mỗi năm',
        'Hiện nay lượng máu thu được trên toàn quốc chỉ đáp ứng khoảng 75% nhu cầu',
        'Tình trạng thiếu máu thường xảy ra vào dịp hè (tháng 6-8) và dịp Tết Nguyên đán',
        'Thành phần máu khan hiếm nhất là tiểu cầu, do thời gian bảo quản ngắn (chỉ 5 ngày)'
      ]
    },
    {
      key: '7',
      question: 'Tại sao khi tham gia hiến máu lại cần phải có giấy CMND?',
      answer: [
        'Khi tham gia hiến máu, bạn cần phải có giấy CMND/CCCD vì:',
        'Xác minh danh tính để đảm bảo người hiến máu đủ 18 tuổi',
        'Theo dõi lịch sử hiến máu, đảm bảo thời gian giữa hai lần hiến máu đủ an toàn',
        'Liên hệ khi cần thiết, ví dụ khi phát hiện bất thường trong xét nghiệm',
        'Quản lý thông tin người hiến máu trong hệ thống dữ liệu quốc gia',
        'Phòng ngừa các trường hợp người hiến máu có tình che giấu thông tin về tình trạng sức khỏe'
      ]
    },
    {
      key: '8',
      question: 'Hiến máu nhân đạo có hại đến sức khỏe không?',
      answer: [
        'Hiến máu nhân đạo không gây hại cho sức khỏe khi thực hiện đúng quy định. Ngược lại, hiến máu có thể mang lại nhiều lợi ích:',
        'Kích thích quá trình tạo máu mới, làm trẻ hóa tế bào máu',
        'Giảm nguy cơ bệnh tim mạch do giảm độ nhớt của máu',
        'Giảm lượng sắt dư thừa, làm giảm nguy cơ ung thư',
        'Được kiểm tra sức khỏe cơ bản và xét nghiệm máu miễn phí',
        'Được bổ sung dinh dưỡng qua quà tặng hiến máu'
      ]
    },
    {
      key: '9',
      question: 'Quyền lợi đối với người hiến máu tình nguyện?',
      answer: [
        'Quyền lợi và chế độ đối với người hiến máu tình nguyện theo Thông tư số 05/2017/TT-BYT Quy định giá tối đa và chi phí phục vụ cho việc xác định giá một đơn vị máu toàn phần, chế phẩm máu đạt tiêu chuẩn:',
        'Được khám và tư vấn sức khỏe miễn phí',
        'Được kiểm tra và thông báo kết quả các xét nghiệm máu (hoàn toàn bí mật): nhóm máu, HIV, virut viêm gan B, virut viêm gan C, giang mai, sốt rét. Trong trường hợp người hiến máu có nhiễm hoặc nghi ngờ các mầm bệnh này thì sẽ được Bác sỹ mời đến để tư vấn sức khỏe.',
        'Nhận giấy chứng nhận hiến máu tình nguyện',
        'Được cấp thẻ hiến máu tình nguyện, có giá trị sử dụng trong các trường hợp cần truyền máu',
        'Được hỗ trợ dinh dưỡng sau khi hiến máu',
        'Được ưu tiên trong việc tiếp cận dịch vụ y tế khi cần thiết'
      ]
    }
  ];

  const renderAnswer = (answer) => {
    if (Array.isArray(answer)) {
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
    } else if (typeof answer === 'object' && answer.sections) {
      return (
        <div className="faq-answer">
          <p className="answer-intro">{answer.intro}</p>
          {answer.sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="answer-section">
              <p className="answer-section-title">{section.title}</p>
              <ul className="answer-list">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="answer-item">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="faq-answer">
          <ul className="answer-list">
            <li className="answer-item">{answer}</li>
          </ul>
        </div>
      );
    }
  };

  return (
    <Layout className="faq-page">
      <Header />
      <Navbar />
      <ProfileWarning />
      
      <Content className="faq-content">
        <div className="faq-container">
          <div className="faq-header">
            <Title level={1} className="faq-title">
              ❓ Câu Hỏi Thường Gặp
            </Title>
            <p className="faq-subtitle">
              Tất cả những gì bạn cần biết về hiến máu
            </p>
          </div>

          <div className="faq-wrapper">
            <Collapse
              accordion
              ghost
              className="faq-collapse"
              expandIcon={({ isActive }) => (
                <CaretRightOutlined 
                  rotate={isActive ? 90 : 0} 
                  className="faq-expand-icon"
                />
              )}
            >
              {faqData.map((item, index) => (
                <Panel
                  header={
                    <div className="faq-question">
                      <span className="question-number">{index + 1}</span>
                      <span className="question-text">{item.question}</span>
                    </div>
                  }
                  key={item.key}
                  className="faq-panel"
                >
                  {renderAnswer(item.answer)}
                </Panel>
              ))}
            </Collapse>
          </div>
        </div>
      </Content>
      
      <Footer />
    </Layout>
  );
};

export default FAQPage;
