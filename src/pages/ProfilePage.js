import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  Row,
  Col,
  Avatar,
  Typography,
  Tag,
  Button,
  Descriptions,
  Space,
  Spin,
  message,
  notification,
  Layout,
  Input,
  Select,
  DatePicker,
  Alert,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  HeartOutlined,
  IdcardOutlined,
  TeamOutlined,
  BankOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { UserAPI } from "../api/User";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

const ProfilePage = () => {
  const [api, contextHolder] = notification.useNotification();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [bloodTypes, setBloodTypes] = useState([]);
  const [genders, setGenders] = useState([]);
  const [occupations, setOccupations] = useState([]);
  const [showUpdateRequired, setShowUpdateRequired] = useState(false);
  const [editValues, setEditValues] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const notificationShown = useRef(false);

  // Handle login notification from navigation state
  useEffect(() => {
    if (location.state?.loginNotification && !notificationShown.current) {
      notificationShown.current = true;

      api.success({
        message: location.state.loginNotification.message,
        description: location.state.loginNotification.description,
        placement: "topRight",
        duration: 3,
      });

      // Clear the notification from state to prevent showing it again
      navigate(location.pathname + location.search, {
        state: { ...location.state, loginNotification: null },
        replace: true,
      });
    }
  }, [
    location.state?.loginNotification,
    api,
    navigate,
    location.pathname,
    location.search,
  ]);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return dayjs(dateString).format("DD/MM/YYYY");
    } catch (error) {
      return "N/A";
    }
  };

  const isProfileComplete = (userProfile) => {
    if (!userProfile) return false;

    const requiredFields = [
      userProfile.FullName || userProfile.name,
      userProfile.PhoneNumber,
      userProfile.Address,
      userProfile.DateOfBirth,
      userProfile.GenderId || userProfile.GenderID,
      userProfile.BloodTypeId || userProfile.BloodTypeID,
    ];

    return requiredFields.every((field) => field != null && field !== "");
  };

  useEffect(() => {
    // Check if user was redirected here for profile update
    const urlParams = new URLSearchParams(location.search);
    const updateRequired = urlParams.get("updateRequired");

    if (updateRequired === "true") {
      setShowUpdateRequired(true);
      // Show immediate notification
      message.warning({
        content:
          "Vui lòng cập nhật thông tin cá nhân để có thể đăng ký hiến máu!",
        duration: 5,
        style: { marginTop: "20px" },
      });
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));

        if (!token || !userInfo) {
          message.error("Please login to view your profile");
          navigate("/login");
          return;
        }

        // Use stored userInfo from localStorage instead of API call
        setUser(userInfo);
      } catch (error) {
        console.error("Error loading user profile:", error);
        // Fallback to stored userInfo
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (userInfo) {
          setUser(userInfo);
        } else {
          message.error("Failed to load profile information");
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchBloodTypes = async () => {
      try {
        const response = await UserAPI.getBloodTypes();
        if (response.status === 200) {
          setBloodTypes(response.data.result || response.data);
        }
      } catch (error) {
        console.error("Error fetching blood types:", error);
        // Fallback to hardcoded values if API fails
        setBloodTypes([
          { id: 1, name: "A+" },
          { id: 2, name: "A-" },
          { id: 3, name: "B+" },
          { id: 4, name: "B-" },
          { id: 5, name: "AB+" },
          { id: 6, name: "AB-" },
          { id: 7, name: "O+" },
          { id: 8, name: "O-" },
        ]);
      }
    };

    const fetchGenders = async () => {
      try {
        const response = await UserAPI.getGenders();
        if (response.status === 200) {
          const genderData = response.data.result || response.data;
          setGenders(genderData);
        }
      } catch (error) {
        console.error("Error fetching genders:", error);
      }
    };

    const fetchOccupations = async () => {
      try {
        const response = await UserAPI.getOccupations();
        if (response.status === 200) {
          const occupationData = response.data.result || response.data;
          setOccupations(occupationData);
        }
      } catch (error) {
        console.error("Error fetching occupations:", error);
      }
    };

    fetchUserProfile();
    fetchBloodTypes();
    fetchGenders();
    fetchOccupations();
  }, [navigate, location]);

  const handleEditProfile = useCallback(() => {
    // Check if user data is available before proceeding
    if (!user) {
      console.warn("User data not available yet, cannot enable edit mode");
      return;
    }

    setEditMode(true);
  }, [user]);

  // Auto-enable edit mode when user data is loaded and update is required
  useEffect(() => {
    if (user && showUpdateRequired && !isProfileComplete(user)) {
      // Auto-enable edit mode after user data is loaded only if profile is incomplete
      const timer = setTimeout(() => {
        handleEditProfile();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, showUpdateRequired, handleEditProfile]);
  // Initialize edit values when edit mode is enabled
  useEffect(() => {
    if (
      editMode &&
      user &&
      genders.length > 0 &&
      bloodTypes.length > 0 &&
      occupations.length > 0
    ) {
      const genderIdValue = user.GenderId || user.GenderID;
      const bloodTypeIdValue = user.BloodTypeId || user.BloodTypeID;
      const occupationIdValue = user.OccupationId || user.OccupationID;

      // Ensure IDs are numbers for proper matching
      const parsedGenderId = genderIdValue ? parseInt(genderIdValue) : null;
      const parsedBloodTypeId = bloodTypeIdValue
        ? parseInt(bloodTypeIdValue)
        : null;
      const parsedOccupationId = occupationIdValue
        ? parseInt(occupationIdValue)
        : null;

      setEditValues({
        fullName: user.FullName || user.name || "",
        email: user.Email || user.email || "",
        phoneNumber: user.PhoneNumber || "",
        address: user.Address || "",
        nationalID: user.NationalId || user.NationalID || "",
        dateOfBirth: user.DateOfBirth || null,
        genderID: parsedGenderId,
        bloodTypeID: parsedBloodTypeId,
        occupationID: parsedOccupationId,
      });
    }
  }, [editMode, user, genders, bloodTypes, occupations]);
  const handleSaveProfile = async () => {
    try {
      setEditLoading(true);

      // Comprehensive validation for all fields
      const fieldsToValidate = [
        "fullName",
        "phoneNumber",
        "address",
        "dateOfBirth",
        "genderID",
        "bloodTypeID",
        "nationalID",
      ];

      const newValidationErrors = {};
      let hasErrors = false;

      // Validate each field
      fieldsToValidate.forEach((field) => {
        const value = editValues[field];
        const error = validateField(field, value);
        if (error) {
          newValidationErrors[field] = error;
          hasErrors = true;
        }
      });

      // Update validation errors state
      setValidationErrors(newValidationErrors);

      // Check for existing validation errors
      const hasExistingValidationErrors = Object.values(validationErrors).some(
        (error) => error !== null
      );

      if (hasErrors || hasExistingValidationErrors) {
        api.error({
          message: "Thiếu thông tin bắt buộc!",
          description: "Vui lòng cập nhật đầy đủ thông tin để được hiến máu!",
          placement: "topRight",
          duration: 4,
        });
        setEditLoading(false);
        return;
      }

      // Additional validation for required fields being empty
      const requiredFields = [
        { field: "fullName", label: "Họ và tên" },
        { field: "phoneNumber", label: "Số điện thoại" },
        { field: "address", label: "Địa chỉ" },
        { field: "dateOfBirth", label: "Ngày sinh" },
        { field: "genderID", label: "Giới tính" },
        { field: "bloodTypeID", label: "Nhóm máu" },
        { field: "nationalID", label: "Số CCCD" },
      ];

      const missingFields = requiredFields.filter(
        ({ field }) => !editValues[field] || editValues[field] === ""
      );

      if (missingFields.length > 0) {
        const missingFieldNames = missingFields
          .map(({ label }) => label)
          .join(", ");
        api.warning({
          message: "Thiếu thông tin bắt buộc!",
          description: `Bạn phải cập nhật đầy đủ thông tin: ${missingFieldNames}`,
          placement: "topRight",
          duration: 5,
        });
        setEditLoading(false);
        return;
      }

      // Prepare the data for API
      const updateData = {
        FullName: editValues.fullName,
        Email: editValues.email,
        PhoneNumber: editValues.phoneNumber,
        Address: editValues.address,
        NationalID: editValues.nationalID,
        DateOfBirth: editValues.dateOfBirth,
        GenderID: editValues.genderID,
        BloodTypeID: editValues.bloodTypeID,
        OccupationID: editValues.occupationID,
      }; // Call the update API
      const userId = user.UserId || user.UserID;

      if (!userId) {
        throw new Error("User ID not found");
      }

      const response = await UserAPI.updateDonor(userId, updateData);

      if (response.status === 200) {
        // Update the local user state
        const updatedUser = { ...user, ...updateData };
        setUser(updatedUser);
        // Update localStorage as well
        localStorage.setItem("userInfo", JSON.stringify(updatedUser));

        setEditMode(false);
        setEditValues({});
        setValidationErrors({});

        // Show appropriate success notification based on profile completeness
        if (isProfileComplete(updatedUser)) {
          api.success({
            message: "Cập nhật hồ sơ thành công!",
            description:
              "Hồ sơ đã được cập nhật thành công! Bây giờ bạn có thể đăng ký hiến máu.",
            placement: "topRight",
            duration: 4,
          });
          // Clear the update required flag only when profile is complete
          setShowUpdateRequired(false);

          // Update URL to remove updateRequired parameter
          const url = new URL(window.location);
          url.searchParams.delete("updateRequired");
          window.history.replaceState({}, "", url);
        } else {
          api.success({
            message: "Cập nhật hồ sơ thành công!",
            description:
              "Hồ sơ đã được cập nhật thành công! Vui lòng hoàn thiện thông tin còn lại.",
            placement: "topRight",
            duration: 4,
          });
        }

        // Dispatch custom event to notify ProfileWarning component
        window.dispatchEvent(
          new CustomEvent("profileUpdated", {
            detail: {
              user: updatedUser,
              isComplete: isProfileComplete(updatedUser),
            },
          })
        );
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        message.error(error.response.data.message);
      } else {
        message.error("Failed to update profile. Please try again.");
      }
    } finally {
      setEditLoading(false);
    }
  };
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditValues({});
    setValidationErrors({});
  };
  const validateField = (field, value) => {
    let validationError = null;

    // Check for required fields first
    const requiredFields = [
      "fullName",
      "phoneNumber",
      "address",
      "dateOfBirth",
      "genderID",
      "bloodTypeID",
      "nationalID",
    ];
    if (requiredFields.includes(field) && (!value || value === "")) {
      validationError = "Bạn phải cập nhật đầy đủ thông tin";
    }
    // Specific field validations for fields with content
    else if (field === "fullName" && value) {
      if (value.trim().length < 2) {
        validationError = "Họ và tên phải có ít nhất 2 ký tự";
      } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value.trim())) {
        validationError = "Họ và tên chỉ được chứa chữ cái và khoảng trắng";
      }
    } else if (field === "nationalID" && value) {
      if (!/^\d{12}$/.test(value)) {
        validationError = "Số CCCD phải có đúng 12 chữ số";
      }
    } else if (field === "phoneNumber" && value) {
      if (!/^\d{10}$/.test(value)) {
        validationError = "Số điện thoại phải có đúng 10 chữ số";
      } else if (!value.startsWith("0")) {
        validationError = "Số điện thoại phải bắt đầu bằng số 0";
      }
    } else if (field === "address" && value) {
      if (value.trim().length < 3) {
        validationError = "Địa chỉ phải có ít nhất 3 ký tự";
      }
    } else if (field === "dateOfBirth" && value) {
      const birthDate = dayjs(value);
      const currentDate = dayjs();
      const age = currentDate.diff(birthDate, "year");

      if (age < 18) {
        validationError = "Bạn phải từ 18 tuổi trở lên để hiến máu";
      } else if (age > 100) {
        validationError = "Ngày sinh không hợp lệ";
      }
    }

    return validationError;
  };

  const handleFieldChange = (field, value) => {
    // Clear previous validation error for this field
    setValidationErrors((prev) => ({
      ...prev,
      [field]: null,
    }));

    // Validate the field
    const validationError = validateField(field, value);

    // Set validation error if any
    if (validationError) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: validationError,
      }));
    }

    setEditValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Helper functions for display
  const getBloodTypeDisplay = (bloodTypeID) => {
    const bloodTypeIdValue =
      bloodTypeID || user?.BloodTypeId || user?.BloodTypeID;

    if (!bloodTypeIdValue || bloodTypes.length === 0)
      return "Chưa có thông tin";

    const bloodType = bloodTypes.find(
      (bt) => bt.id === bloodTypeIdValue || bt.id === parseInt(bloodTypeIdValue)
    );
    return bloodType ? bloodType.name : "Chưa có thông tin";
  };

  const getGenderDisplay = (genderID) => {
    const genderIdValue = genderID || user?.GenderId || user?.GenderID;

    if (!genderIdValue || genders.length === 0) return "Chưa có thông tin";

    const gender = genders.find(
      (g) => g.id === genderIdValue || g.id === parseInt(genderIdValue)
    );
    return gender ? gender.name : "Chưa có thông tin";
  };

  const getOccupationDisplay = (occupationID) => {
    const occupationIdValue =
      occupationID || user?.OccupationId || user?.OccupationID;

    if (!occupationIdValue || occupations.length === 0)
      return "Chưa có thông tin";

    const occupation = occupations.find(
      (o) => o.id === occupationIdValue || o.id === parseInt(occupationIdValue)
    );
    return occupation ? occupation.name : "Chưa có thông tin";
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-error">
        <Text type="danger">Failed to load user profile</Text>
      </div>
    );
  }

  return (
    <Layout>
      {contextHolder}
      <Header />
      <Navbar />
      <div className="profile-page">
        <div className="profile-container">
          <Title level={2} className="profile-title">
            <UserOutlined /> Hồ Sơ Cá Nhân
          </Title>

          {/* Update Required Alert */}
          {(showUpdateRequired || !isProfileComplete(user)) &&
            user &&
            !isProfileComplete(user) && (
              <Alert
                message="Cập nhật thông tin cá nhân cần thiết"
                description="Để có thể đăng ký hiến máu, vui lòng cập nhật đầy đủ thông tin cá nhân của bạn bao gồm: họ tên, số điện thoại, địa chỉ, ngày sinh, giới tính và nhóm máu."
                type="warning"
                icon={<ExclamationCircleOutlined />}
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

          <Row gutter={[24, 24]}>
            {/* Profile Header Card */}
            <Col span={24}>
              <Card className="profile-header-card">
                <div className="profile-header">
                  {" "}
                  <Avatar
                    size={120}
                    src={user.picture} // Use Google profile picture if available
                    icon={<UserOutlined />}
                    className="profile-avatar"
                  />
                  <div className="profile-header-info">
                    {" "}
                    <Title level={3} className="profile-name">
                      {user.FullName || user.name || "Người hiến máu"}
                    </Title>
                    {/* Username display is hidden as it's no longer used */}
                    <div className="profile-tags">
                      <Tag color="blue">
                        Nhóm máu: {getBloodTypeDisplay(user.BloodTypeID)}
                      </Tag>
                    </div>
                  </div>
                  <div className="profile-actions">
                    {!editMode ? (
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={handleEditProfile}
                      >
                        Chỉnh sửa
                      </Button>
                    ) : (
                      <Space>
                        <Button onClick={handleCancelEdit}>Huỷ</Button>
                        <Button
                          type="primary"
                          loading={editLoading}
                          onClick={handleSaveProfile}
                        >
                          Lưu Thay Đổi
                        </Button>
                      </Space>
                    )}
                  </div>
                </div>
              </Card>
            </Col>

            {/* Personal Information */}
            <Col xs={24} lg={12}>
              <Card title="Thông Tin Cá Nhân" className="profile-info-card">
                <Descriptions column={1} size="middle">
                  {" "}
                  <Descriptions.Item
                    label={
                      <span>
                        <UserOutlined /> Họ và Tên
                      </span>
                    }
                  >
                    {!editMode ? (
                      user.FullName || user.name || "Chưa có thông tin"
                    ) : (
                      <div>
                        <Input
                          value={editValues.fullName || ""}
                          onChange={(e) =>
                            handleFieldChange("fullName", e.target.value)
                          }
                          placeholder="Nhập họ và tên"
                          status={validationErrors.fullName ? "error" : ""}
                        />
                        {validationErrors.fullName && (
                          <Text type="danger" style={{ fontSize: "12px" }}>
                            {validationErrors.fullName}
                          </Text>
                        )}
                      </div>
                    )}{" "}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <span>
                        <CalendarOutlined /> Ngày Sinh
                      </span>
                    }
                  >
                    {!editMode ? (
                      user.DateOfBirth ? (
                        dayjs(user.DateOfBirth).format("DD/MM/YYYY")
                      ) : (
                        "Chưa có thông tin"
                      )
                    ) : (
                      <div>
                        <DatePicker
                          value={
                            editValues.dateOfBirth
                              ? dayjs(editValues.dateOfBirth)
                              : null
                          }
                          onChange={(date) =>
                            handleFieldChange(
                              "dateOfBirth",
                              date ? date.format("YYYY-MM-DD") : null
                            )
                          }
                          placeholder="Chọn ngày sinh"
                          style={{ width: "100%" }}
                          format="DD/MM/YYYY"
                          status={validationErrors.dateOfBirth ? "error" : ""}
                        />
                        {validationErrors.dateOfBirth && (
                          <Text type="danger" style={{ fontSize: "12px" }}>
                            {validationErrors.dateOfBirth}
                          </Text>
                        )}
                      </div>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <span>
                        <TeamOutlined /> Giới Tính
                      </span>
                    }
                  >
                    {!editMode ? (
                      getGenderDisplay(user.GenderId || user.GenderID)
                    ) : genders.length > 0 ? (
                      <div>
                        <Select
                          key={`gender-select-${genders.length}-${editValues.genderID}`}
                          value={editValues.genderID}
                          onChange={(value) =>
                            handleFieldChange("genderID", value)
                          }
                          placeholder="Chọn giới tính"
                          style={{ width: "100%" }}
                          status={validationErrors.genderID ? "error" : ""}
                        >
                          {genders.map((gender) => (
                            <Option key={gender.id} value={gender.id}>
                              {gender.name}
                            </Option>
                          ))}
                        </Select>
                        {validationErrors.genderID && (
                          <Text type="danger" style={{ fontSize: "12px" }}>
                            {validationErrors.genderID}
                          </Text>
                        )}
                      </div>
                    ) : (
                      <Select
                        placeholder="Loading genders..."
                        disabled
                        style={{ width: "100%" }}
                      />
                    )}
                  </Descriptions.Item>{" "}
                  <Descriptions.Item
                    label={
                      <span>
                        <IdcardOutlined /> Số CMND/CCCD
                      </span>
                    }
                  >
                    {!editMode ? (
                      user.NationalId || user.NationalID || "Chưa có thông tin"
                    ) : (
                      <div>
                        <Input
                          value={editValues.nationalID || ""}
                          onChange={(e) =>
                            handleFieldChange("nationalID", e.target.value)
                          }
                          placeholder="Nhập số CCCD (12 chữ số)"
                          status={validationErrors.nationalID ? "error" : ""}
                          maxLength={12}
                        />
                        {validationErrors.nationalID && (
                          <Text type="danger" style={{ fontSize: "12px" }}>
                            {validationErrors.nationalID}
                          </Text>
                        )}
                      </div>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <span>
                        <EnvironmentOutlined /> Địa Chỉ
                      </span>
                    }
                  >
                    {!editMode ? (
                      user.Address || "Chưa có thông tin"
                    ) : (
                      <div>
                        <Input.TextArea
                          value={editValues.address || ""}
                          onChange={(e) =>
                            handleFieldChange("address", e.target.value)
                          }
                          placeholder="Nhập địa chỉ"
                          rows={2}
                          status={validationErrors.address ? "error" : ""}
                        />
                        {validationErrors.address && (
                          <Text type="danger" style={{ fontSize: "12px" }}>
                            {validationErrors.address}
                          </Text>
                        )}
                      </div>
                    )}{" "}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <span>
                        <BankOutlined /> Nghề Nghiệp
                      </span>
                    }
                  >
                    {!editMode ? (
                      getOccupationDisplay(
                        user.OccupationId || user.OccupationID
                      )
                    ) : occupations.length > 0 ? (
                      <div>
                        <Select
                          key={`occupation-select-${occupations.length}-${editValues.occupationID}`}
                          value={editValues.occupationID}
                          onChange={(value) =>
                            handleFieldChange("occupationID", value)
                          }
                          placeholder="Chọn nghề nghiệp"
                          style={{ width: "100%" }}
                          status={validationErrors.occupationID ? "error" : ""}
                        >
                          {occupations.map((occupation) => (
                            <Option key={occupation.id} value={occupation.id}>
                              {occupation.name}
                            </Option>
                          ))}
                        </Select>
                        {validationErrors.occupationID && (
                          <Text type="danger" style={{ fontSize: "12px" }}>
                            {validationErrors.occupationID}
                          </Text>
                        )}
                      </div>
                    ) : (
                      <Select
                        placeholder="Loading occupations..."
                        disabled
                        style={{ width: "100%" }}
                      />
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <span>
                        <HeartOutlined /> Nhóm Máu
                      </span>
                    }
                  >
                    {!editMode ? (
                      getBloodTypeDisplay(user.BloodTypeId || user.BloodTypeID)
                    ) : bloodTypes.length > 0 ? (
                      <div>
                        <Select
                          key={`bloodtype-select-${bloodTypes.length}-${editValues.bloodTypeID}`}
                          value={editValues.bloodTypeID}
                          onChange={(value) =>
                            handleFieldChange("bloodTypeID", value)
                          }
                          placeholder="Chọn nhóm máu"
                          style={{ width: "100%" }}
                          status={validationErrors.bloodTypeID ? "error" : ""}
                        >
                          {bloodTypes.map((bloodType) => (
                            <Option key={bloodType.id} value={bloodType.id}>
                              {bloodType.name}
                            </Option>
                          ))}
                        </Select>
                        {validationErrors.bloodTypeID && (
                          <Text type="danger" style={{ fontSize: "12px" }}>
                            {validationErrors.bloodTypeID}
                          </Text>
                        )}
                      </div>
                    ) : (
                      <Select
                        placeholder="Loading blood types..."
                        disabled
                        style={{ width: "100%" }}
                      />
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* Contact & Account Information */}
            <Col xs={24} lg={12}>
              <Card title="Thông Tin Liên Hệ" className="profile-info-card">
                <Descriptions column={1} size="middle">
                  {" "}
                  <Descriptions.Item
                    label={
                      <span>
                        <MailOutlined /> Email
                      </span>
                    }
                  >
                    <span style={{ color: editMode ? "#999" : "inherit" }}>
                      {user.Email || user.email || "Chưa có thông tin"}
                    </span>
                    {editMode && (
                      <Text
                        type="secondary"
                        style={{ fontSize: "12px", marginLeft: "8px" }}
                      >
                        (Không thể chỉnh sửa)
                      </Text>
                    )}
                  </Descriptions.Item>
                  {/* Username field is hidden as it's no longer used */}
                  <Descriptions.Item
                    label={
                      <span>
                        <PhoneOutlined /> Số Điện Thoại
                      </span>
                    }
                  >
                    {!editMode ? (
                      user.PhoneNumber || "Chưa có thông tin"
                    ) : (
                      <div>
                        <Input
                          value={editValues.phoneNumber || ""}
                          onChange={(e) =>
                            handleFieldChange("phoneNumber", e.target.value)
                          }
                          placeholder="Nhập số điện thoại (10 chữ số)"
                          status={validationErrors.phoneNumber ? "error" : ""}
                          maxLength={10}
                        />
                        {validationErrors.phoneNumber && (
                          <Text type="danger" style={{ fontSize: "12px" }}>
                            {validationErrors.phoneNumber}
                          </Text>
                        )}
                      </div>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      <Footer />
    </Layout>
  );
};

export default ProfilePage;
