import React, { useState, useEffect } from "react";
import {
  Layout,
  Typography,
  Row,
  Col,
  Card,
  Button,
  Form,
  Radio,
  Checkbox,
  Input,
  message,
  Steps,
  Divider,
} from "antd";
import {
  HeartOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { UserAPI } from "../api/User";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import ProfileWarning from "../components/ProfileWarning";
import Footer from "../components/Footer";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { TextArea } = Input;

const EligibilityFormPage = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [isEligible, setIsEligible] = useState(null);
  const [userEligibleDate, setUserEligibleDate] = useState(null);
  const [daysLeft, setDaysLeft] = useState(0);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const navigate = useNavigate();
  const [donationRegistrations, setDonationRegistrations] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const location = useLocation();
  const bookingData = location.state?.bookingData; // Function to fetch user eligibility data from API
  const fetchUserEligibilityData = async () => {
    try {
      // Get userId from localStorage
      const user = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!user || !token) {
        console.log("No user or token found in localStorage");
        return;
      }

      const userData = JSON.parse(user);
      const userId =
        userData.UserID ||
        userData.UserId ||
        userData.id ||
        userData.userId ||
        userData.Id;

      if (!userId) {
        console.log("No userId found in user data");
        return;
      }

      console.log("Fetching eligibility data for userId:", userId); // Call API to get latest user data
      const response = await UserAPI.getUserById(userId);
      console.log("API response for eligibility check:", response);
      console.log("API response data:", response?.data);

      if (response && response.data) {
        const userData = response.data;
        console.log("Complete user data from API:", userData);
        console.log("lastDonationDate:", userData.lastDonationDate);
        console.log(
          "nextEligibleDonationDate:",
          userData.nextEligibleDonationDate
        );
        console.log(
          "NextEligibleDonationDate:",
          userData.NextEligibleDonationDate
        );

        const eligibleDate =
          userData.nextEligibleDonationDate ||
          userData.NextEligibleDonationDate;

        if (eligibleDate) {
          console.log("Found eligible date from API:", eligibleDate);
          setUserEligibleDate(eligibleDate);

          const currentDate = new Date();
          const nextEligibleDate = new Date(eligibleDate);

          // Đặt giờ về 0:0:0 để so sánh chỉ ngày
          currentDate.setHours(0, 0, 0, 0);
          nextEligibleDate.setHours(0, 0, 0, 0);

          const timeDiff = nextEligibleDate - currentDate;
          const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
          setDaysLeft(daysDiff > 0 ? daysDiff : 0);

          console.log("Current date:", currentDate);
          console.log("Next eligible date:", nextEligibleDate);
          console.log("Days left:", daysDiff);
        } else {
          console.log(
            "No eligible date found from API, user can donate anytime"
          );
          setUserEligibleDate(null);
          setDaysLeft(0);
        }
      } else {
        console.log("No response from API, fallback to localStorage");
        // Fallback to localStorage if API fails
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (userInfo) {
          const eligibleDate =
            userInfo.nextEligibleDonationDate ||
            userInfo.NextEligibleDonationDate;
          if (eligibleDate) {
            setUserEligibleDate(eligibleDate);
            const currentDate = new Date();
            const nextEligibleDate = new Date(eligibleDate);
            currentDate.setHours(0, 0, 0, 0);
            nextEligibleDate.setHours(0, 0, 0, 0);
            const timeDiff = nextEligibleDate - currentDate;
            const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            setDaysLeft(daysDiff > 0 ? daysDiff : 0);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user eligibility data from API:", error);
      // Fallback to localStorage if API call fails
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (userInfo) {
          const eligibleDate =
            userInfo.nextEligibleDonationDate ||
            userInfo.NextEligibleDonationDate;
          if (eligibleDate) {
            setUserEligibleDate(eligibleDate);
            const currentDate = new Date();
            const nextEligibleDate = new Date(eligibleDate);
            currentDate.setHours(0, 0, 0, 0);
            nextEligibleDate.setHours(0, 0, 0, 0);
            const timeDiff = nextEligibleDate - currentDate;
            const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            setDaysLeft(daysDiff > 0 ? daysDiff : 0);
          }
        }
      } catch (fallbackError) {
        console.error("Error in fallback to localStorage:", fallbackError);
      }
    }
  };
  // Function to fetch user's donation registrations for "Đang chờ hiến" status only
  const fetchUserDonationRegistrations = async () => {
    try {
      setLoadingRegistrations(true);

      // Get userId from localStorage
      const user = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!user || !token) {
        console.log("No user or token found in localStorage");
        return;
      }

      const userData = JSON.parse(user);
      const userId =
        userData.UserID ||
        userData.UserId ||
        userData.id ||
        userData.userId ||
        userData.Id;

      if (!userId) {
        console.log("No userId found in user data");
        return;
      }

      console.log("Fetching donation registrations for userId:", userId);

      // Fetch both donation registrations and time slots in parallel
      const [
        registrationsResponse,
        timeSlotsResponse,
        donationScheduleResponse,
      ] = await Promise.all([
        UserAPI.getDonationRegistrationsByDonorId(userId),
        UserAPI.getTimeSlots(),
        UserAPI.getDonationSchedule(),
      ]);

      console.log("Donation registrations response:", registrationsResponse);
      console.log("Time slots response:", timeSlotsResponse);
      console.log("Donation schedule response:", donationScheduleResponse);

      if (registrationsResponse && registrationsResponse.data) {
        // Filter registrations to show only "Đang chờ hiến" status
        const waitingRegistrations = registrationsResponse.data.filter(
          (registration) => registration.registrationStatusId === 1 // "Đang chờ hiến" - Confirmed/Waiting for donation
        );

        // Create time slots lookup map
        const timeSlotsMap = {};
        if (timeSlotsResponse && timeSlotsResponse.data) {
          timeSlotsResponse.data.forEach((timeSlot) => {
            timeSlotsMap[timeSlot.timeSlotId] = timeSlot;
          });
        }

        // Create donation schedule lookup map
        const donationScheduleMap = {};
        if (donationScheduleResponse && donationScheduleResponse.data) {
          donationScheduleResponse.data.forEach((schedule) => {
            donationScheduleMap[schedule.scheduleId] = schedule;
          });
        }

        // Map the registrations with their time slot and schedule details
        const mappedRegistrations = waitingRegistrations.map(
          (registration) => ({
            ...registration,
            timeSlotDetails: timeSlotsMap[registration.timeSlotId] || null,
            scheduleDetails:
              donationScheduleMap[registration.scheduleId] || null,
          })
        );

        setDonationRegistrations(mappedRegistrations);
        console.log(
          "Mapped waiting donation registrations:",
          mappedRegistrations
        );
      }
    } catch (error) {
      console.error("Error fetching user donation registrations:", error);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  // Scroll to top when component mounts and check if bookingData exists
  useEffect(() => {
    console.log("=== EligibilityFormPage mounted ===");

    // Check if this is view-only mode
    if (location.state?.viewOnly) {
      setIsViewOnly(true);
    }

    // Check if there's booking data, if not redirect to booking page
    if (!bookingData) {
      message.warning(
        "Vui lòng điền thông tin đặt lịch trước khi tiến hành kiểm tra điều kiện hiến máu."
      );
      navigate("/booking");
      return;
    }

    // Restore preserved eligibility data if coming back from confirmation page
    const preservedEligibilityData = location.state?.preservedEligibilityData;
    if (preservedEligibilityData) {
      form.setFieldsValue(preservedEligibilityData);

      // Preserve validation states from previous session
      if (preservedEligibilityData.userEligibleDate) {
        setUserEligibleDate(preservedEligibilityData.userEligibleDate);
      }
      if (preservedEligibilityData.daysLeft !== undefined) {
        setDaysLeft(preservedEligibilityData.daysLeft);
      }
      if (preservedEligibilityData.hasExistingRegistrations !== undefined) {
        // You might need to set donation registrations state if available
        // This is to preserve the state for validation
      }
    }

    window.scrollTo(0, 0);

    // Only fetch fresh data if not in view-only mode or no preserved data
    if (!location.state?.viewOnly || !preservedEligibilityData) {
      fetchUserEligibilityData();
      fetchUserDonationRegistrations();
    }
  }, [navigate, bookingData, form, location.state]);

  // Eligibility questions data
  const eligibilityQuestions = [
    {
      id: 1,
      title: "Anh/chị từng hiến máu chưa?",
      type: "radio",
      options: [
        { label: "Có", value: "yes" },
        { label: "Không", value: "no" },
      ],
      key: "previousDonation",
    },
    {
      id: 2,
      title: "Hiện tại, anh/ chị có mắc bệnh gì nào không?",
      type: "radio",
      options: [
        { label: "Có", value: "yes" },
        { label: "Không", value: "no" },
      ],
      key: "currentIllness",
    },
    {
      id: 3,
      title:
        "Trước đây, anh/chị có từng mắc một trong các bệnh: viêm gan siêu vi B, C, HIV, váy đỏ, phi đại tiền liệt tuyến, sốc phản vệ, tai biến mạch máu não, nhồi máu cơ tim, lupus ban đỏ, động kinh, ung thư, được cấy ghép mô tạng?",
      type: "checkbox",
      options: [
        { label: "Có", value: "yes" },
        { label: "Không", value: "no" },
        { label: "Bệnh khác", value: "other" },
      ],
      key: "seriousDiseases",
      textField: "seriousDiseasesDetails",
    },
    {
      id: 4,
      title: "Trong 12 tháng gần đây, anh/chị có:",
      type: "checkbox_multiple",
      options: [
        {
          label:
            "Khỏi bệnh sau khi mắc một trong các bệnh: sốt rét, giang mai, lao, viêm não-màng não, uốn ván, phẫu thuật ngoại khoa?",
          value: "recovered_diseases",
        },
        {
          label: "Được truyền máu hoặc các chế phẩm máu?",
          value: "blood_transfusion",
        },
        {
          label: "Tiêm Vắc-xin?",
          value: "vaccination",
        },
        {
          label: "Không",
          value: "none",
        },
      ],
      key: "last12Months",
    },
    {
      id: 5,
      title: "Trong 06 tháng gần đây, anh/chị có:",
      type: "checkbox_multiple",
      options: [
        {
          label:
            "Khỏi bệnh sau khi mắc một trong các bệnh: thương hàn, nhiễm trùng máu, bị rắn cắn, viêm tắc động mạch, viêm tắc tĩnh mạch, viêm tụy, viêm túy xương?",
          value: "recovered_6months",
        },
        {
          label: "Sút cân nhanh không rõ nguyên nhân?",
          value: "weight_loss",
        },
        {
          label: "Nổi hạch kéo dài?",
          value: "prolonged_swelling",
        },
        {
          label:
            "Thực hiện thủ thuật y tế xâm lấn (chữa răng, châm cứu, lăn kim, nội soi...)?",
          value: "medical_procedures",
        },
        {
          label: "Xăm, xỏ lỗ tai, lỗ mũi hoặc các vị trí khác trên cơ thể?",
          value: "tattoo_piercing",
        },
        {
          label: "Sử dụng ma túy?",
          value: "drug_use",
        },
        {
          label:
            "Tiếp xúc trực tiếp với máu, dịch tiết của người khác hoặc bị thương bởi kim tiêm?",
          value: "blood_contact",
        },
        {
          label: "Sinh sống chung với người nhiễm bệnh Viêm gan siêu vi B?",
          value: "hepatitis_contact",
        },
        {
          label:
            "Quan hệ tình dục với người nhiễm viêm gan siêu vi B, C, HIV, giang mai hoặc người có nguy cơ nhiễm viêm gan siêu vi B, C, HIV, giang mai?",
          value: "sexual_contact_risk",
        },
        {
          label: "Quan hệ tình dục với người cùng giới?",
          value: "same_sex_contact",
        },
        {
          label: "Không",
          value: "none",
        },
      ],
      key: "last6Months",
    },
    {
      id: 6,
      title: "Trong 01 tháng gần đây, anh/chị có:",
      type: "checkbox_multiple",
      options: [
        {
          label:
            "Khỏi bệnh sau khi mắc bệnh viêm đường tiết niệu, viêm da nhiễm trùng, viêm phế quản, viêm phổi, sởi, ho gà, quai bị, sốt xuất huyết, kiết lỵ, tả, Rubella?",
          value: "recovered_1month",
        },
        {
          label:
            "Đi vào vùng có dịch bệnh trư hành (sốt rét, sốt xuất huyết, Zika...)?",
          value: "epidemic_area",
        },
        {
          label: "Không",
          value: "none",
        },
      ],
      key: "last1Month",
    },
    {
      id: 7,
      title: "Trong 14 ngày gần đây, anh/chị có:",
      type: "checkbox_multiple",
      options: [
        {
          label: "Bị cúm, cảm lạnh, ho, nhức đầu, sốt, đau họng?",
          value: "flu_symptoms",
        },
        {
          label: "Không",
          value: "none",
        },
        {
          label: "Khác (cụ thể)",
          value: "other",
        },
      ],
      key: "last14Days",
      textField: "last14DaysDetails",
    },
    {
      id: 8,
      title: "Trong 07 ngày gần đây, anh/chị có:",
      type: "checkbox_multiple",
      options: [
        {
          label: "Dùng thuốc kháng sinh, kháng viêm, Aspirin, Corticoid?",
          value: "medication",
        },
        {
          label: "Không",
          value: "none",
        },
        {
          label: "Khác (cụ thể)",
          value: "other",
        },
      ],
      key: "last7Days",
      textField: "last7DaysDetails",
    },
    {
      id: 9,
      title: "Câu hỏi dành cho phụ nữ:",
      type: "checkbox_multiple",
      options: [
        {
          label: "Hiện chị đang mang thai hoặc nuôi con dưới 12 tháng tuổi?",
          value: "pregnant_nursing",
        },
        {
          label:
            "Chấm dứt thai kỳ trong 12 tháng gần đây (sẩy thai, phá thai, thai ngoài tử cung)?",
          value: "pregnancy_termination",
        },
        {
          label: "Không",
          value: "none",
        },
      ],
      key: "femaleQuestions",
    },
  ];

  const steps = [
    {
      title: "Thông tin",
      description: "Kiểm tra điều kiện hiến máu",
    },
    {
      title: "Kết quả",
      description: "Xem kết quả đánh giá",
    },
  ];
  const checkEligibility = (formData) => {
    console.log("=== CHECKING ELIGIBILITY ===");
    console.log("Form data received:", formData);

    // Eligibility rules based on responses
    const ineligibleConditions = [
      // Question 3: Serious diseases - if user selects "yes"
      formData.seriousDiseases?.includes("yes"),

      // Question 4: Recent diseases/procedures in last 12 months
      formData.last12Months?.includes("recovered_diseases") ||
        formData.last12Months?.includes("blood_transfusion"),

      // Question 5: Issues in last 6 months
      formData.last6Months?.includes("recovered_6months") ||
        formData.last6Months?.includes("weight_loss") ||
        formData.last6Months?.includes("prolonged_swelling") ||
        formData.last6Months?.includes("drug_use") ||
        formData.last6Months?.includes("hepatitis_contact") ||
        formData.last6Months?.includes("sexual_contact_risk"),

      // Question 6: Recent illnesses in last month
      formData.last1Month?.includes("recovered_1month") ||
        formData.last1Month?.includes("epidemic_area"),

      // Question 7: Recent symptoms in last 14 days
      formData.last14Days?.includes("flu_symptoms"),

      // Question 8: Recent medication in last 7 days
      formData.last7Days?.includes("medication"),

      // Question 9: Pregnancy related
      formData.femaleQuestions?.includes("pregnant_nursing") ||
        formData.femaleQuestions?.includes("pregnancy_termination"),
    ];

    console.log("Ineligible conditions:", ineligibleConditions);
    const hasIneligibleCondition = ineligibleConditions.some(
      (condition) => condition === true
    );
    console.log("Has ineligible condition:", hasIneligibleCondition);
    const result = !hasIneligibleCondition;
    console.log("Final eligibility result:", result);

    return result;
  };
  const handleFormSubmit = async (values) => {
    console.log("=== ELIGIBILITY CHECK ===");
    console.log("Form values received:", values);
    console.log("User eligible date:", userEligibleDate);
    console.log("Days left:", daysLeft);

    // First check form eligibility
    const formEligible = checkEligibility(values);
    console.log("Form eligible result:", formEligible);
    console.log("Detailed values check:");
    console.log("- seriousDiseases:", values.seriousDiseases);
    console.log("- last12Months:", values.last12Months);
    console.log("- last6Months:", values.last6Months);
    console.log("- last1Month:", values.last1Month);
    console.log("- last14Days:", values.last14Days);
    console.log("- last7Days:", values.last7Days);
    console.log("- femaleQuestions:", values.femaleQuestions);

    // Then check if user is eligible based on donation date
    let isEligibleByDate = true;
    if (userEligibleDate) {
      const currentDate = new Date();
      const nextEligibleDate = new Date(userEligibleDate);

      // Đặt giờ về 0:0:0 để so sánh chỉ ngày
      currentDate.setHours(0, 0, 0, 0);
      nextEligibleDate.setHours(0, 0, 0, 0);

      isEligibleByDate = nextEligibleDate <= currentDate;
      console.log("Current date (normalized):", currentDate);
      console.log("Next eligible date (normalized):", nextEligibleDate);
      console.log("Is eligible by date:", isEligibleByDate);
    }

    if (formEligible && isEligibleByDate) {
      console.log("✓ User is eligible - proceeding to confirmation page");
      // Nếu đủ điều kiện, chuyển đến trang xác nhận
      navigate("/confirmation", {
        state: {
          bookingData: bookingData,
          eligibilityData: {
            ...values,
            // Add validation context for ConfirmationPage
            userEligibleDate: userEligibleDate,
            daysLeft: daysLeft,
            hasExistingRegistrations: donationRegistrations.length > 0,
          },
        },
      });
    } else if (!formEligible) {
      console.log("✗ User failed form eligibility");
      // Still navigate to confirmation page but with failure data
      navigate("/confirmation", {
        state: {
          bookingData: bookingData,
          eligibilityData: {
            ...values,
            userEligibleDate: userEligibleDate,
            daysLeft: daysLeft,
            hasExistingRegistrations: donationRegistrations.length > 0,
          },
        },
      });
    } else if (!isEligibleByDate) {
      console.log("✗ User not eligible by date - need to wait");
      // Still navigate to confirmation page but with date failure data
      navigate("/confirmation", {
        state: {
          bookingData: bookingData,
          eligibilityData: {
            ...values,
            userEligibleDate: userEligibleDate,
            daysLeft: daysLeft,
            hasExistingRegistrations: donationRegistrations.length > 0,
          },
        },
      });
    }
  };

  const handleFormError = (errorInfo) => {
    // Find the first field with error and scroll to it
    const firstErrorField = errorInfo.errorFields[0];
    if (firstErrorField) {
      const fieldName = firstErrorField.name[0];

      // Find the question number for this field
      const question = eligibilityQuestions.find(
        (q) => q.key === fieldName || q.textField === fieldName
      );
      if (question) {
        const questionElement = document.getElementById(
          `question-${question.id}`
        );
        if (questionElement) {
          questionElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          // Add visual highlight
          questionElement.style.boxShadow = "0 0 0 3px rgba(220, 38, 38, 0.2)";
          setTimeout(() => {
            questionElement.style.boxShadow = "";
          }, 3000);
        }
      }
    }

    message.error("Vui lòng kiểm tra và điền đầy đủ thông tin bắt buộc!");
  };
  const handleBackToBooking = () => {
    // Pass back the booking data to preserve form values
    navigate("/booking", { state: { preservedBookingData: bookingData } });
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case "radio":
        return (
          <Form.Item
            name={question.key}
            rules={[{ required: true, message: "Vui lòng chọn một lựa chọn!" }]}
          >
            <Radio.Group className="eligibility-radio-group">
              {question.options.map((option) => (
                <Radio
                  key={option.value}
                  value={option.value}
                  className="eligibility-radio"
                >
                  {option.label}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        );

      case "radio_with_text":
        return (
          <>
            <Form.Item
              name={question.key}
              rules={[
                { required: true, message: "Vui lòng chọn một lựa chọn!" },
              ]}
            >
              <Radio.Group className="eligibility-radio-group">
                {question.options.map((option) => (
                  <Radio
                    key={option.value}
                    value={option.value}
                    className="eligibility-radio"
                  >
                    {option.label}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues[question.key] !== currentValues[question.key]
              }
            >
              {({ getFieldValue }) =>
                getFieldValue(question.key) === "yes" ? (
                  <Form.Item
                    name={question.textField}
                    rules={[
                      { required: true, message: "Vui lòng mô tả chi tiết!" },
                    ]}
                  >
                    <TextArea
                      rows={3}
                      placeholder="Vui lòng mô tả chi tiết..."
                      className="eligibility-textarea"
                    />
                  </Form.Item>
                ) : null
              }
            </Form.Item>
          </>
        );
      case "checkbox":
        return (
          <>
            <Form.Item
              name={question.key}
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ít nhất một lựa chọn!",
                },
              ]}
            >
              <Checkbox.Group
                className="eligibility-checkbox-group"
                onChange={(checkedValues) => {
                  // Nếu chọn "none" (Không) hoặc "no"
                  if (
                    checkedValues.includes("none") ||
                    checkedValues.includes("no")
                  ) {
                    // Chỉ giữ lại "none" hoặc "no", bỏ các option khác
                    const noneValue = checkedValues.find(
                      (val) => val === "none" || val === "no"
                    );
                    form.setFieldsValue({ [question.key]: [noneValue] });
                  } else {
                    // Nếu chọn option khác mà có "none" hoặc "no", thì bỏ "none"/"no"
                    const filteredValues = checkedValues.filter(
                      (val) => val !== "none" && val !== "no"
                    );
                    form.setFieldsValue({ [question.key]: filteredValues });
                  }
                }}
              >
                {question.options.map((option) => (
                  <Checkbox
                    key={option.value}
                    value={option.value}
                    className="eligibility-checkbox"
                  >
                    {option.label}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </Form.Item>
            {question.textField && (
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues[question.key] !== currentValues[question.key]
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue(question.key)?.includes("other") ? (
                    <Form.Item
                      name={question.textField}
                      rules={[
                        { required: true, message: "Vui lòng mô tả chi tiết!" },
                      ]}
                    >
                      <TextArea
                        rows={3}
                        placeholder="Vui lòng mô tả chi tiết..."
                        className="eligibility-textarea"
                      />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
            )}
          </>
        );
      case "checkbox_multiple":
        return (
          <>
            <Form.Item
              name={question.key}
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ít nhất một lựa chọn!",
                },
              ]}
            >
              <Checkbox.Group
                className="eligibility-checkbox-group"
                onChange={(checkedValues) => {
                  // Nếu chọn "none" (Không) hoặc "no"
                  if (
                    checkedValues.includes("none") ||
                    checkedValues.includes("no")
                  ) {
                    // Chỉ giữ lại "none" hoặc "no", bỏ các option khác
                    const noneValue = checkedValues.find(
                      (val) => val === "none" || val === "no"
                    );
                    form.setFieldsValue({ [question.key]: [noneValue] });
                  } else {
                    // Nếu chọn option khác mà có "none" hoặc "no", thì bỏ "none"/"no"
                    const filteredValues = checkedValues.filter(
                      (val) => val !== "none" && val !== "no"
                    );
                    form.setFieldsValue({ [question.key]: filteredValues });
                  }
                }}
              >
                <div className="checkbox-options">
                  {question.options.map((option) => (
                    <Checkbox
                      key={option.value}
                      value={option.value}
                      className="eligibility-checkbox"
                    >
                      {option.label}
                    </Checkbox>
                  ))}
                </div>
              </Checkbox.Group>
            </Form.Item>
            {question.textField && (
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues[question.key] !== currentValues[question.key]
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue(question.key)?.includes("other") ? (
                    <Form.Item
                      name={question.textField}
                      rules={[
                        { required: true, message: "Vui lòng mô tả chi tiết!" },
                      ]}
                    >
                      <TextArea
                        rows={3}
                        placeholder="Vui lòng mô tả chi tiết..."
                        className="eligibility-textarea"
                      />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
            )}
          </>
        );

      default:
        return null;
    }
  };
  const renderEligibilityForm = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={isViewOnly ? () => {} : handleFormSubmit}
      onFinishFailed={handleFormError}
      className={`eligibility-form ${isViewOnly ? "view-only" : ""}`}
      disabled={isViewOnly}
    >
      <div className="eligibility-questions">
        {eligibilityQuestions.map((question, index) => (
          <Card
            key={question.id}
            id={`question-${question.id}`}
            className="question-card"
            bordered={false}
          >
            <div className="question-header">
              <Text className="question-number">{index + 1}.</Text>
              <Title level={5} className="question-title">
                {question.title}
              </Title>
            </div>
            <div className="question-content">{renderQuestion(question)}</div>
          </Card>
        ))}
      </div>{" "}
      <div className="form-actions">
        {!isViewOnly && (
          <Button
            type="default"
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={handleBackToBooking}
            className="back-button"
          >
            Quay về
          </Button>
        )}{" "}
        <Button
          type={isViewOnly ? "default" : "primary"}
          htmlType={isViewOnly ? "button" : "submit"}
          size="large"
          className={
            isViewOnly ? "back-to-confirmation-button" : "submit-button"
          }
          icon={isViewOnly ? <ArrowLeftOutlined /> : <CheckCircleOutlined />}
          onClick={
            isViewOnly
              ? () => {
                  window.scrollTo(0, 0);

                  // Get preserved data or current state
                  const preservedData =
                    location.state?.preservedEligibilityData;
                  const currentFormData = form.getFieldsValue();

                  navigate("/confirmation", {
                    state: {
                      bookingData: bookingData,
                      eligibilityData: {
                        ...currentFormData,
                        // Preserve validation context - use preserved data if available, otherwise current state
                        userEligibleDate:
                          preservedData?.userEligibleDate || userEligibleDate,
                        daysLeft:
                          preservedData?.daysLeft !== undefined
                            ? preservedData.daysLeft
                            : daysLeft,
                        hasExistingRegistrations:
                          preservedData?.hasExistingRegistrations !== undefined
                            ? preservedData.hasExistingRegistrations
                            : donationRegistrations.length > 0,
                      },
                    },
                  });
                }
              : undefined
          }
          disabled={false}
          style={
            isViewOnly
              ? {
                  backgroundColor: "#fff",
                  borderColor: "#dc2626",
                  color: "#dc2626",
                  pointerEvents: "auto",
                }
              : undefined
          }
        >
          {isViewOnly ? "Quay lại trang xác nhận" : "Tiếp tục"}
        </Button>
      </div>
    </Form>
  );
  const renderResult = () => (
    <div className="eligibility-result">
      <Card
        className={`result-card ${
          isEligible === true ? "eligible" : "not-eligible"
        }`}
        bordered={false}
      >
        <div className="result-content">
          {isEligible === true ? (
            <>
              <div className="result-icon eligible">
                <CheckCircleOutlined />
              </div>
              <Title level={3} className="result-title">
                🎉 Đăng ký hiến máu thành công!
              </Title>
              <Paragraph className="result-description">
                Cảm ơn bạn đã đăng ký hiến máu! Chúng tôi đã ghi nhận thông tin
                của bạn và sẽ liên hệ trong vòng 24h để xác nhận lịch hẹn.
              </Paragraph>{" "}
              <div className="result-actions">
                <Button
                  type="primary"
                  size="large"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    navigate("/booking", { state: { bookingComplete: true } });
                  }}
                  className="proceed-button"
                >
                  {" "}
                  Quay về trang chủ
                </Button>
                <Button
                  type="default"
                  size="large"
                  onClick={() => {
                    setIsViewOnly(true);
                    setCurrentStep(0);
                  }}
                  className="review-button"
                >
                  Xem lại câu trả lời
                </Button>
              </div>
            </>
          ) : isEligible === "already_registered" ? (
            <>
              <div className="result-icon not-eligible">
                <ExclamationCircleOutlined />
              </div>{" "}
              <Title level={3} className="result-title">
                ⚠️ Bạn chưa thể hiến máu lúc này!
              </Title>
              <Paragraph className="result-description">
                🩸 Để đảm bảo sức khỏe, bạn cần nghỉ ngơi ít nhất{" "}
                <strong>12-16 tuần</strong> giữa các lần hiến máu.
                <br />
                <br />
                📅 <strong>Thông tin hiến máu:</strong>
                <br />
                {daysLeft > 0 ? (
                  <>
                    • Bạn có thể hiến máu trở lại sau:{" "}
                    <strong style={{ color: "#ff4d4f" }}>
                      {daysLeft} ngày nữa
                    </strong>
                    <br />• Ngày có thể hiến máu tiếp theo:{" "}
                    <strong>
                      {userEligibleDate
                        ? new Date(userEligibleDate).toLocaleDateString("vi-VN")
                        : "Chưa xác định"}
                    </strong>
                  </>
                ) : (
                  "• Vui lòng liên hệ hotline để được tư vấn: <strong>1900-xxxx</strong>"
                )}
                <br />
                <br />
                💙{" "}
                <em>Cảm ơn bạn đã quan tâm đến hoạt động hiến máu nhân đạo!</em>
              </Paragraph>{" "}
              <div className="result-actions">
                <Button
                  type="primary"
                  size="large"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    navigate("/");
                  }}
                  className="back-button"
                  icon={<ArrowLeftOutlined />}
                >
                  Quay về trang chủ
                </Button>{" "}
              </div>
            </>
          ) : isEligible === "already_registered_api" ? (
            <>
              <div className="result-icon not-eligible">
                <ExclamationCircleOutlined />
              </div>
              <Title level={3} className="result-title">
                ⚠️ Bạn đã đăng ký lịch hiến máu gần đây rồi!
              </Title>
              <Paragraph className="result-description">
                🩸 Vui lòng đợi tới ngày hiến hoặc huỷ lịch hiện tại để đăng ký
                lại.
                <br />
                <br />
                📅{" "}
                <strong>Thông tin về lịch hiến máu đã đăng ký của bạn:</strong>
                <br />
                {loadingRegistrations ? (
                  <div
                    style={{
                      textAlign: "center",
                      margin: "15px 0",
                      color: "#666",
                    }}
                  >
                    Đang tải thông tin...
                  </div>
                ) : donationRegistrations.length > 0 ? (
                  <div style={{ marginTop: "10px" }}>
                    {donationRegistrations.map((registration, index) => (
                      <div
                        key={registration.registrationId || index}
                        style={{
                          backgroundColor: "#f0f9ff",
                          padding: "12px",
                          borderRadius: "6px",
                          margin: "8px 0",
                          border: "1px solid #bfdbfe",
                          borderLeft: "4px solid #3b82f6",
                        }}
                      >
                        <div style={{ marginBottom: "5px" }}>
                          📅 <strong>Ngày hiến máu:</strong>{" "}
                          <span style={{ color: "#1f2937", fontWeight: "600" }}>
                            {registration.scheduleDetails?.scheduleDate
                              ? new Date(
                                  registration.scheduleDetails.scheduleDate
                                ).toLocaleDateString("vi-VN")
                              : "Chưa xác định"}
                          </span>
                        </div>
                        <div style={{ marginBottom: "5px" }}>
                          ⏰ <strong>Thời gian bắt đầu:</strong>{" "}
                          <span style={{ color: "#1f2937", fontWeight: "600" }}>
                            {registration.timeSlotDetails?.startTime
                              ? registration.timeSlotDetails.startTime.substring(
                                  0,
                                  5
                                )
                              : "Chưa xác định"}
                          </span>
                        </div>
                        <div>
                          🕐 <strong>Thời gian kết thúc:</strong>{" "}
                          <span style={{ color: "#1f2937", fontWeight: "600" }}>
                            {registration.timeSlotDetails?.endTime
                              ? registration.timeSlotDetails.endTime.substring(
                                  0,
                                  5
                                )
                              : "Chưa xác định"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      margin: "15px 0",
                      color: "#666",
                    }}
                  >
                    Không có lịch hiến máu đang chờ.
                  </div>
                )}
                <br />
                <br />
                💙{" "}
                <em>Cảm ơn bạn đã quan tâm đến hoạt động hiến máu nhân đạo!</em>
              </Paragraph>{" "}
              <div className="result-actions">
                <Button
                  type="primary"
                  size="large"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    navigate("/");
                  }}
                  className="back-button"
                  icon={<ArrowLeftOutlined />}
                >
                  Quay về trang chủ
                </Button>
              </div>
            </>
          ) : isEligible === "error" ? (
            <>
              <div className="result-icon not-eligible">
                <ExclamationCircleOutlined />
              </div>
              <Title level={3} className="result-title">
                Có lỗi xảy ra khi đăng ký
              </Title>
              <Paragraph className="result-description">
                Rất tiếc, hệ thống gặp lỗi khi xử lý đăng ký của bạn. Vui lòng
                thử lại sau hoặc liên hệ với chúng tôi để được hỗ trợ.
              </Paragraph>
              <div className="result-actions">
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate("/booking")}
                  className="back-button"
                  icon={<ArrowLeftOutlined />}
                >
                  Quay về trang đặt lịch
                </Button>
                <Button
                  type="default"
                  size="large"
                  onClick={() => setCurrentStep(0)}
                  className="review-button"
                >
                  Thử lại
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="result-icon not-eligible">
                <ExclamationCircleOutlined />
              </div>
              <Title level={3} className="result-title">
                Rất tiếc, hiện tại bạn chưa đủ điều kiện hiến máu
              </Title>
              <Paragraph className="result-description">
                Dựa trên thông tin bạn cung cấp, bạn hiện chưa đáp ứng một số
                tiêu chí để hiến máu. Vui lòng tham khảo ý kiến bác sĩ hoặc liên
                hệ với chúng tôi để được tư vấn thêm.
              </Paragraph>
              <div className="result-actions">
                <Button
                  type="primary"
                  size="large"
                  onClick={handleBackToBooking}
                  className="back-button"
                  icon={<ArrowLeftOutlined />}
                >
                  {" "}
                  Quay về trang đặt lịch
                </Button>
                <Button
                  type="default"
                  size="large"
                  onClick={() => {
                    setIsViewOnly(true);
                    setCurrentStep(0);
                  }}
                  className="review-button"
                >
                  Xem lại câu trả lời
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );

  return (
    <Layout className="eligibility-layout">
      <Header />
      <Navbar />
      <ProfileWarning />

      <Content className="eligibility-content">
        <div className="container">
          <div className="eligibility-header">
            <Title level={1} className="page-title">
              <HeartOutlined /> Phiếu đăng ký hiến máu
            </Title>
            <Paragraph className="page-description">
              Vui lòng trả lời các câu hỏi dưới đây để kiểm tra điều kiện hiến
              máu của bạn.
            </Paragraph>
          </div>

          <Row justify="center">
            <Col xs={24} lg={20} xl={16}>
              <div className="eligibility-steps">
                <Steps
                  current={currentStep}
                  items={steps}
                  className="custom-steps"
                />
              </div>

              <Divider />

              <div className="eligibility-main">
                {currentStep === 0 ? renderEligibilityForm() : renderResult()}
              </div>
            </Col>
          </Row>
        </div>
      </Content>

      <Footer />
    </Layout>
  );
};

export default EligibilityFormPage;
