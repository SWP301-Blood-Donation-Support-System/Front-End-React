import React, { useState, useEffect } from "react";
import {
  Layout,
  Table,
  Tag,
  Space,
  Typography,
  Button,
  message,
  notification,
  Card,
  Row,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Select,
  Modal,
} from "antd";
import { AdminAPI } from "../api/admin";

import StaffSidebar from "../components/StaffSidebar";
import StaffHeader from "../components/StaffHeader";
import "../styles/donation-records.scss";

const { Content } = Layout;
const { Text, Title } = Typography;
const { Option } = Select;

const DonationRecordsPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [donationRecords, setDonationRecords] = useState([]);
  const [uniqueUsers, setUniqueUsers] = useState([]); // List of unique users for first layer
  const [loading, setLoading] = useState(false);
  const [donationTypes, setDonationTypes] = useState({});
  const [bloodTestResults, setBloodTestResults] = useState({});
  const [bloodTypes, setBloodTypes] = useState({});
  const [registrationUsers, setRegistrationUsers] = useState({}); // Cache for registration user data
  const [registrationStatuses, setRegistrationStatuses] = useState({}); // Cache for registration status data
  const [scheduleData, setScheduleData] = useState({}); // Cache for schedule data
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [pendingFormValues, setPendingFormValues] = useState(null);
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();

  // View state - for switching between user list, user records, and record details
  const [currentView, setCurrentView] = useState("users"); // 'users' | 'userRecords' | 'recordDetail'
  const [viewTitle, setViewTitle] = useState("Hồ Sơ Người Hiến Máu");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDonationRecords, setUserDonationRecords] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchDonationTypes(),
        fetchBloodTestResults(),
        fetchBloodTypes(),
        fetchDonationRecords(),
      ]);
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDonationTypes = async () => {
    try {
      const response = await AdminAPI.getDonationTypes();
      const typesData = response.data || [];

      const typeMap = {};
      typesData.forEach((type) => {
        const id = type.id || type.Id || type.donationTypeId;
        typeMap[id] = {
          name: type.name || type.Name || type.donationTypeName || `Type ${id}`,
          description: type.description || type.Description || "",
        };
      });

      setDonationTypes(typeMap);
    } catch (error) {
      console.error("Error fetching donation types:", error);
      // Fallback data if API fails
      setDonationTypes({
        1: { name: "Hiến máu toàn phần", description: "Whole blood donation" },
        2: { name: "Hiến tiểu cầu", description: "Platelet donation" },
        3: { name: "Hiến huyết tương", description: "Plasma donation" },
      });
    }
  };

  const fetchBloodTestResults = async () => {
    try {
      const response = await AdminAPI.getBloodTestResults();
      const resultsData = response.data || [];

      const resultsMap = {};
      resultsData.forEach((result) => {
        const id = result.id || result.Id;
        resultsMap[id] = {
          name: result.name || result.Name || `Result ${id}`,
          description: result.description || result.Description || "",
        };
      });

      setBloodTestResults(resultsMap);
    } catch (error) {
      console.error("Error fetching blood test results:", error);
      // Fallback data if API fails
      setBloodTestResults({
        1: {
          name: "Đang chờ xét nghiệm",
          description: "This blood currently being tested",
        },
        2: { name: "Máu đạt", description: "" },
        3: { name: "Máu không đạt", description: "" },
        4: { name: "Đã hủy", description: "" },
        5: { name: "Không thể hiến máu", description: "" },
      });
    }
  };

  const fetchBloodTypes = async () => {
    try {
      const response = await AdminAPI.getBloodTypesLookup();
      const typesData = response.data || [];

      const typesMap = {};
      typesData.forEach((type) => {
        const id = type.id || type.Id;
        typesMap[id] = {
          name: type.name || type.Name || `Type ${id}`,
          description: type.description || type.Description || "",
        };
      });

      setBloodTypes(typesMap);
    } catch (error) {
      console.error("Error fetching blood types:", error);
      // Fallback data if API fails
      setBloodTypes({
        1: { name: "A+", description: "" },
        2: { name: "A-", description: "" },
        3: { name: "B+", description: "" },
        4: { name: "B-", description: "" },
        5: { name: "AB+", description: "" },
        6: { name: "AB-", description: "" },
        7: { name: "O+", description: "" },
        8: { name: "O-", description: "" },
      });
    }
  };

  const fetchDonationRecords = async () => {
    setLoading(true);
    try {
      const response = await AdminAPI.getDonationRecords();
      const data = response.data || [];
      setDonationRecords(data);

      // Fetch user data for each registration
      await fetchUserDataForRegistrations(data);
    } catch (error) {
      console.error("Error fetching donation records:", error);
      message.error("Lỗi khi tải dữ liệu hồ sơ hiến máu");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDataForRegistrations = async (records) => {
    const userMap = {};
    const statusMap = {};
    const scheduleMap = {};
    const registrationIds = [
      ...new Set(
        records
          .map((record) => record.registrationId || record.RegistrationId)
          .filter(Boolean)
      ),
    ];

    try {
      // Fetch all schedules once to lookup schedule dates
      const schedulesResponse = await AdminAPI.getDonationSchedules();
      const allSchedules = schedulesResponse.data || [];

      // Fetch registration details for each unique registrationId
      const registrationPromises = registrationIds.map(async (regId) => {
        try {
          const response = await AdminAPI.getDonationRegistrationById(regId);
          const registration = response.data;

          // Store registration status
          const statusId =
            registration?.registrationStatusId ||
            registration?.RegistrationStatusId ||
            registration?.RegistrationStatusID;
          statusMap[regId] = statusId;

          // Find the schedule for this registration to get the correct date
          const scheduleId =
            registration?.scheduleId ||
            registration?.ScheduleId ||
            registration?.ScheduleID;
          const schedule = allSchedules.find(
            (s) => (s.scheduleId || s.ScheduleId || s.id) === scheduleId
          );
          if (schedule) {
            scheduleMap[regId] = {
              scheduleDate: schedule.scheduleDate,
              scheduleId: scheduleId,
            };
          }

          if (registration && registration.donorId) {
            // Use donorId as userId and fetch donor details for username
            const userId = registration.donorId;

            try {
              const donorResponse = await AdminAPI.getDonorById(userId);
              const donor = donorResponse.data;
              const username =
                donor?.fullName ||
                donor?.FullName ||
                donor?.username ||
                donor?.Username ||
                donor?.name ||
                donor?.Name ||
                `User ${userId}`;
              const address =
                donor?.address || donor?.Address || "Chưa cập nhật địa chỉ";
              const bloodTypeId =
                donor?.bloodTypeId ||
                donor?.BloodTypeId ||
                donor?.bloodType ||
                donor?.BloodType;

              userMap[regId] = { userId, username, address, bloodTypeId };
            } catch (donorError) {
              // If donor fetch fails, use donorId as both userId and username
              userMap[regId] = {
                userId,
                username: `User ${userId}`,
                address: "Không thể tải địa chỉ",
                bloodTypeId: null,
              };
            }
          } else {
            userMap[regId] = {
              userId: "N/A",
              username: "N/A",
              address: "N/A",
              bloodTypeId: null,
            };
          }
        } catch (error) {
          console.error(`Error fetching registration ${regId}:`, error);
          userMap[regId] = {
            userId: "N/A",
            username: "N/A",
            address: "N/A",
            bloodTypeId: null,
          };
          statusMap[regId] = null;
        }
      });

      await Promise.all(registrationPromises);
      setRegistrationUsers(userMap);
      setRegistrationStatuses(statusMap);
      setScheduleData(scheduleMap);

      // Create unique users list for first layer
      createUniqueUsersList(userMap);
    } catch (error) {
      console.error("Error fetching user data for registrations:", error);
    }
  };

  const createUniqueUsersList = (userMap) => {
    const usersSet = new Map();

    Object.values(userMap).forEach((userData) => {
      if (userData.userId !== "N/A") {
        usersSet.set(userData.userId, {
          userId: userData.userId,
          username: userData.username,
          address: userData.address || "Chưa cập nhật địa chỉ",
          bloodTypeId: userData.bloodTypeId,
        });
      }
    });

    setUniqueUsers(Array.from(usersSet.values()));
  };

  // Layer 1 → Layer 2: View user's donation records
  const handleViewUserRecords = (user) => {
    setSelectedUser(user);

    // Filter donation records for this user
    const userRecords = donationRecords.filter((record) => {
      const regId = record.registrationId || record.RegistrationId;
      const userData = registrationUsers[regId];
      return userData && userData.userId === user.userId;
    });

    setUserDonationRecords(userRecords);
    setCurrentView("userRecords");
    setViewTitle(`Hồ Sơ Hiến Máu - ${user.username}`);
    setCurrentPage(1);
  };

  // Layer 2 → Layer 3: View record details
  const handleViewRecordDetails = (record) => {
    setSelectedRecord(record);

    const recordId =
      record.donationRecordId || record.DonationRecordId || record.id || "N/A";

    setCurrentView("recordDetail");
    setViewTitle(`Chi Tiết Hồ Sơ Hiến Máu - Mã ${recordId}`);
    setCurrentPage(1);
  };

  // Layer 3 → Layer 2: Back to user records
  const handleBackToUserRecords = () => {
    setCurrentView("userRecords");
    setViewTitle(`Hồ Sơ Hiến Máu - ${selectedUser?.username}`);
    setCurrentPage(1);
    setSelectedRecord(null);
    setIsEditMode(false);
    form.resetFields();
  };

  // Layer 2 → Layer 1: Back to users list
  const handleBackToUsers = () => {
    setCurrentView("users");
    setViewTitle("Hồ Sơ Người Hiến Máu");
    setCurrentPage(1);
    setSelectedUser(null);
    setUserDonationRecords([]);
    setSelectedRecord(null);
    setIsEditMode(false);
    form.resetFields();
  };

  const getDonationTypeName = (typeId) => {
    const type = donationTypes[typeId];
    return type ? type.name : `Type ${typeId}`;
  };

  const getBloodTestResultName = (resultId) => {
    const result = bloodTestResults[resultId];
    return result ? result.name : `Result ${resultId}`;
  };

  const handleEditMode = () => {
    setIsEditMode(true);

    // Calculate checkbox state based on both cannotDonate field and registration status
    const cannotDonateField =
      selectedRecord.cannotDonate || selectedRecord.CannotDonate || false;
    const registrationId =
      selectedRecord.registrationId || selectedRecord.RegistrationId;
    const registrationStatus = registrationStatuses[registrationId];
    const isStatusIneligible = registrationStatus === 1001; // "Không đủ điều kiện hiến"
    const shouldCheckCannotDonate = cannotDonateField || isStatusIneligible;

    // Get donor's current blood type from registration user data
    const userData = registrationUsers[registrationId];
    const currentBloodTypeId = userData?.bloodTypeId;

    // Calculate the correct blood test result to display in edit form
    // Same logic as in view mode - if cannot donate, show "Không thể hiến máu" (id=5)
    const actualBloodTestResult =
      selectedRecord.bloodTestResult || selectedRecord.BloodTestResult;
    const displayBloodTestResult = shouldCheckCannotDonate
      ? 5
      : actualBloodTestResult;

    // Pre-fill form with current record data
    form.setFieldsValue({
      donorTemperature:
        selectedRecord.donorTemperature || selectedRecord.DonorTemperature,
      donorBloodPressure:
        selectedRecord.donorBloodPressure || selectedRecord.DonorBloodPressure,
      donorWeight: selectedRecord.donorWeight || selectedRecord.DonorWeight,
      donorHeight: selectedRecord.donorHeight || selectedRecord.DonorHeight,
      donorHeartRate: selectedRecord.donorHeartRate || selectedRecord.DonorHeartRate,
      donationTypeId:
        selectedRecord.donationTypeId || selectedRecord.DonationTypeId,
      volumeDonated:
        selectedRecord.volumeDonated || selectedRecord.VolumeDonated,
      bloodTestResult: displayBloodTestResult, // Use the display result, not the raw value
      donorBloodType: currentBloodTypeId, // Set current blood type
      cannotDonate: shouldCheckCannotDonate,
      note: selectedRecord.note || selectedRecord.Note || "",
    });
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    form.resetFields();
  };

  const handleSaveEdit = async (values) => {
    console.log("=== handleSaveEdit START ===");
    // Get current user data to check blood type
    const registrationId = selectedRecord.registrationId || selectedRecord.RegistrationId;
    const userData = registrationUsers[registrationId];
    
    // Check if blood test result is "Máu đạt" (ID = 2) but blood type is not available
    const newBloodTestResult = Number(values.bloodTestResult);
    const selectedBloodType = values.donorBloodType;
    const currentBloodTypeId = userData?.bloodTypeId;
    
    // Determine final blood type that will be used
    const finalBloodTypeId = selectedBloodType || currentBloodTypeId;
    
    console.log("handleSaveEdit validation:", {
      newBloodTestResult,
      selectedBloodType,
      currentBloodTypeId,
      finalBloodTypeId,
      userData,
      bloodTypes
    });
    
    // Check if blood type is "Chưa biết" - ID 1001 or name contains "Chưa biết"
    const isUnknownBloodType = finalBloodTypeId === 1001 ||
                               bloodTypes[finalBloodTypeId]?.name?.includes("Chưa biết") || 
                               bloodTypes[finalBloodTypeId]?.name?.includes("Unknown") ||
                               bloodTypes[finalBloodTypeId]?.name?.includes("unknown");
    
    // If blood test result is "Máu đạt" but no blood type is available OR blood type is "Chưa biết"
    if (newBloodTestResult === 2 && (!finalBloodTypeId || isUnknownBloodType)) {
      console.log("handleSaveEdit validation FAILED - stopping");
      api.error({
        message: "Lỗi xác thực!",
        description: "Không thể lưu với kết quả xét nghiệm 'Máu đạt' khi nhóm máu chưa được xác định. Vui lòng cập nhật nhóm máu trước.",
        placement: "topRight",
        duration: 5,
      });
      return; // Stop execution - do not save
    }
    
    console.log("handleSaveEdit validation PASSED");
    
    // Store the form values and show confirmation modal
    setPendingFormValues(values);
    setConfirmModalVisible(true);
  };

  const handleConfirmSave = async () => {
    console.log("=== handleConfirmSave START ===");
    setEditLoading(true);
    setConfirmModalVisible(false);

    try {
      const values = pendingFormValues;
      console.log("Form values:", values);
      const recordId =
        selectedRecord.donationRecordId ||
        selectedRecord.DonationRecordId ||
        selectedRecord.id;
      const registrationId =
        selectedRecord.registrationId || selectedRecord.RegistrationId;

      console.log("IDs:", { recordId, registrationId });

      // Validate required fields
      if (!recordId) {
        message.error("Không tìm thấy mã hồ sơ. Vui lòng thử lại.");
        return;
      }

      if (!registrationId) {
        message.error("Không tìm thấy mã đăng ký. Vui lòng thử lại.");
        return;
      }

      // Double-check validation: if blood test result is "Máu đạt" but no blood type available
      const userData = registrationUsers[registrationId];
      const bloodTestResultValue = Number(values.bloodTestResult);
      const selectedBloodType = values.donorBloodType;
      const currentBloodTypeId = userData?.bloodTypeId;
      const finalBloodTypeId = selectedBloodType || currentBloodTypeId;
      
      console.log("Validation check:", {
        bloodTestResultValue,
        selectedBloodType,
        currentBloodTypeId,
        finalBloodTypeId,
        userData
      });
      
      if (bloodTestResultValue === 2 && !finalBloodTypeId) {
        console.log("Validation failed - stopping save");
        message.error("Không thể lưu với kết quả xét nghiệm 'Máu đạt' khi nhóm máu chưa được xác định.");
        return; // Stop execution - do not save to database
      }
      
      console.log("Validation passed - proceeding with save");

      const updateData = {
        registrationId: registrationId,
        donationDateTime:
          selectedRecord.donationDateTime || selectedRecord.DonationDateTime,
        donorWeight: Number(values.donorWeight) || 0,
        donorTemperature: Number(values.donorTemperature) || 0,
        donorBloodPressure: values.donorBloodPressure || "",
        donorHeight: Number(values.donorHeight) || 0,
        donorHeartRate: Number(values.donorHeartRate) || 0,
        donationTypeId: Number(values.donationTypeId),
        volumeDonated: Number(values.volumeDonated) || 0,
        note: values.note || "",
        bloodTestResult: Number(values.bloodTestResult) || 0,
        cannotDonate: Boolean(values.cannotDonate),
      };

      console.log(
        "Sending update request with recordId:",
        recordId,
        "and data:",
        updateData
      );

      // Check blood test result values
      const oldBloodTestResult =
        selectedRecord.bloodTestResult || selectedRecord.BloodTestResult;
      const newBloodTestResult = Number(values.bloodTestResult);

      console.log("Blood test result check:", {
        oldResult: oldBloodTestResult,
        newResult: newBloodTestResult,
        oldType: typeof oldBloodTestResult,
        newType: typeof newBloodTestResult,
      });

      // Only create blood bag if:
      // 1. Old result was "Đang chờ" (1) and new result is "Máu đạt" (2) - first time approval
      // 2. This ensures only ONE blood bag is created per donation record
      const shouldCreateBloodBag =
        Number(oldBloodTestResult) === 1 && newBloodTestResult === 2;
      console.log("Should create blood bag:", shouldCreateBloodBag);
      
      // Additional check: If trying to change TO "Máu đạt" but already WAS "Máu đạt" before
      const isReactivatingBloodResult = Number(oldBloodTestResult) === 2 && newBloodTestResult === 2;
      if (isReactivatingBloodResult) {
        console.log("Warning: Blood test result is already 'Máu đạt' - no blood bag will be created to prevent duplicates");
      }

      // Update the donation record first
      await AdminAPI.updateDonationRecord(recordId, updateData);

      // If blood type is selected, update donor's blood type FIRST (before creating blood bag)
      if (values.donorBloodType) {
        const donorId = getUserIdFromRegistration(registrationId);
        if (donorId && donorId !== "N/A") {
          try {
            await AdminAPI.updateDonorBloodType(
              Number(donorId),
              Number(values.donorBloodType)
            );
            console.log("Blood type updated successfully");

            // Update local state immediately so BloodBag creation uses correct blood type
            setRegistrationUsers((prev) => ({
              ...prev,
              [registrationId]: {
                ...prev[registrationId],
                bloodTypeId: Number(values.donorBloodType),
              },
            }));
          } catch (bloodTypeError) {
            console.error("Error updating blood type:", bloodTypeError);
            api.warning({
              message: "Cảnh báo!",
              description:
                "Hồ sơ đã được cập nhật nhưng có lỗi khi cập nhật nhóm máu",
              placement: "topRight",
              duration: 4,
            });
            return; // Don't create blood bag if blood type update failed
          }
        }
      }

      // If blood test result changed from "Đang chờ" to "Máu đạt", create blood bag AFTER blood type is updated
      let bloodBagCreated = false;
      if (shouldCreateBloodBag) {
        try {
          console.log(
            "Creating blood bag for record:",
            recordId,
            "with result:",
            newBloodTestResult
          );
          await AdminAPI.updateDonationRecordResult(
            recordId,
            newBloodTestResult
          );
          console.log("Blood bag created successfully");
          bloodBagCreated = true;
        } catch (bloodBagError) {
          console.error("Error creating blood bag:", bloodBagError);
          console.error(
            "Blood bag error details:",
            bloodBagError.response?.data
          );
          
          // Check if the error is specifically about unknown blood type
          const errorMessage = bloodBagError.response?.data?.message || '';
          if (errorMessage.includes('chưa biết') || errorMessage.includes('Chưa biết')) {
            api.error({
              message: "Lỗi tạo túi máu!",
              description: "Không thể tạo túi máu khi nhóm máu chưa biết. Vui lòng cập nhật nhóm máu trước.",
              placement: "topRight",
              duration: 4,
            });
          } else if (errorMessage.includes('already exists') || errorMessage.includes('đã tồn tại') || 
                     errorMessage.includes('duplicate') || errorMessage.includes('trùng lặp')) {
            api.warning({
              message: "Cảnh báo!",
              description: "Túi máu đã tồn tại cho hồ sơ này. Mỗi lần hiến máu chỉ tạo được 1 túi máu.",
              placement: "topRight",
              duration: 4,
            });
            // Consider this as successful since the blood bag exists
            bloodBagCreated = true;
          } else {
            api.warning({
              message: "Cảnh báo!",
              description: "Hồ sơ đã được cập nhật nhưng có lỗi khi tạo túi máu tự động",
              placement: "topRight",
              duration: 4,
            });
          }
        }
      }

      // Show success message only if no critical errors occurred
      if (!shouldCreateBloodBag || bloodBagCreated) {
        let successMessage = "Hồ sơ hiến máu đã được cập nhật thành công!";
        let successDuration = 3;

        if (shouldCreateBloodBag && bloodBagCreated) {
          successMessage =
            "Hồ sơ hiến máu đã được cập nhật và túi máu đã được tạo tự động!";
          successDuration = 4;
        } else if (isReactivatingBloodResult) {
          successMessage = 
            "Hồ sơ hiến máu đã được cập nhật thành công! (Túi máu đã tồn tại từ trước)";
          successDuration = 4;
        }

        api.success({
          message: "Cập nhật hồ sơ thành công!",
          description: successMessage,
          placement: "topRight",
          duration: successDuration,
        });
      }

      // Update the selected record with new data
      setSelectedRecord({
        ...selectedRecord,
        ...updateData,
      });

      // Refresh the donation records list
      await fetchDonationRecords();

      setIsEditMode(false);
      form.resetFields();
      setPendingFormValues(null);
    } catch (error) {
      console.error("Error updating donation record:", error);
      message.error("Lỗi khi cập nhật hồ sơ hiến máu");
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelConfirm = () => {
    setConfirmModalVisible(false);
    setPendingFormValues(null);
  };

  const getUserIdFromRegistration = (registrationId) => {
    const userData = registrationUsers[registrationId];
    return userData ? userData.userId : "N/A";
  };

  const getUsernameFromRegistration = (registrationId) => {
    const userData = registrationUsers[registrationId];
    return userData ? userData.username : "N/A";
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    return new Date(dateTime).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatBloodPressure = (bp) => {
    if (!bp) return "N/A";
    return bp;
  };

  const getBloodTestResultTag = (result) => {
    if (!result || result === null) {
      return <Tag color="default">Chưa có kết quả</Tag>;
    }

    // Get the name from lookup data
    const resultName = getBloodTestResultName(result);

    // Color coding based on result ID or name
    if (result === 1 || resultName.includes("Đang chờ")) {
      return <Tag color="orange">{resultName}</Tag>;
    } else if (
      result === 2 ||
      (resultName.includes("đạt") && !resultName.includes("không"))
    ) {
      return <Tag color="green">{resultName}</Tag>;
    } else if (result === 3 || resultName.includes("không đạt")) {
      return <Tag color="red">{resultName}</Tag>;
    } else if (result === 4 || resultName.includes("hủy")) {
      return <Tag color="gray">{resultName}</Tag>;
    } else if (result === 5 || resultName.includes("Không thể")) {
      return <Tag color="red">{resultName}</Tag>;
    } else {
      return <Tag color="blue">{resultName}</Tag>;
    }
  };

  // Pagination logic for all three layers
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    if (currentView === "users") {
      return uniqueUsers.slice(startIndex, endIndex);
    } else if (currentView === "userRecords") {
      return userDonationRecords.slice(startIndex, endIndex);
    } else {
      // For recordDetail view, we'll render the form instead of table data
      return [];
    }
  };

  const renderDetailForm = () => {
    if (!selectedRecord) return null;

    if (isEditMode) {
      return (
        <div className="donation-detail-form">
          <Card
            title="CHỈNH SỬA HỒ SƠ HIẾN MÁU"
            className="detail-form-card"
            extra={
              <Space>
                <Button onClick={handleCancelEdit}>Hủy</Button>
                <Button
                  type="primary"
                  loading={editLoading}
                  onClick={() => form.submit()}
                >
                  Lưu Thay Đổi
                </Button>
              </Space>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSaveEdit}
              requiredMark={false}
            >
              {/* Read-only fields */}
              <Row gutter={[24, 16]}>
                <Col span={8}>
                  <div className="form-field">
                    <label className="form-label">MÃ HỒ SƠ</label>
                    <div className="form-value">
                      {selectedRecord.donationRecordId ||
                        selectedRecord.DonationRecordId ||
                        "N/A"}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="form-field">
                    <label className="form-label">MÃ ĐĂNG KÝ</label>
                    <div className="form-value">
                      {selectedRecord.registrationId ||
                        selectedRecord.RegistrationId ||
                        "N/A"}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="form-field">
                    <label className="form-label">MÃ NGƯỜI DÙNG</label>
                    <div className="form-value">
                      {getUserIdFromRegistration(
                        selectedRecord.registrationId ||
                          selectedRecord.RegistrationId
                      )}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="form-field">
                    <label className="form-label">TÊN NGƯỜI DÙNG</label>
                    <div className="form-value">
                      {getUsernameFromRegistration(
                        selectedRecord.registrationId ||
                          selectedRecord.RegistrationId
                      )}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="form-field">
                    <label className="form-label">NGÀY HIẾN MÁU</label>
                    <div className="form-value">
                      {(() => {
                        const registrationId =
                          selectedRecord.registrationId ||
                          selectedRecord.RegistrationId;
                        const scheduleInfo = scheduleData[registrationId];

                        // Use schedule date if available, otherwise fall back to stored donation date
                        let displayDate;
                        if (scheduleInfo && scheduleInfo.scheduleDate) {
                          // Use the schedule date from the donation schedule
                          displayDate = scheduleInfo.scheduleDate;
                        } else {
                          // Fall back to stored donationDateTime
                          displayDate =
                            selectedRecord.donationDateTime ||
                            selectedRecord.DonationDateTime;
                        }

                        return formatDateTime(displayDate);
                      })()}
                    </div>
                  </div>
                </Col>
              </Row>

              <Divider orientation="left">THÔNG TIN SỨC KHỎE</Divider>

              <Row gutter={[24, 16]}>
                <Col span={8}>
                  <Form.Item
                    label="NHIỆT ĐỘ (°C)"
                    name="donorTemperature"
                    rules={[
                      { required: true, message: "Vui lòng nhập nhiệt độ!" },
                      {
                        validator: (_, value) => {
                          if (value !== null && value !== undefined) {
                            if (value < 35) {
                              return Promise.reject(new Error('Nhiệt độ tối thiểu là 35°C'));
                            }
                            if (value > 40) {
                              return Promise.reject(new Error('Nhiệt độ tối đa là 40°C'));
                            }
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Nhập nhiệt độ"
                      min={35}
                      max={40}
                      step={0.1}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="HUYẾT ÁP"
                    name="donorBloodPressure"
                    rules={[
                      { required: true, message: "Vui lòng nhập huyết áp!" },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          
                          // Check if value contains "/" character
                          if (!value.includes('/')) {
                            return Promise.reject(new Error('Huyết áp phải có định dạng "tâm thu/tâm trương" (ví dụ: 120/80)'));
                          }
                          
                          const parts = value.split('/');
                          if (parts.length !== 2) {
                            return Promise.reject(new Error('Huyết áp phải có định dạng "tâm thu/tâm trương" (ví dụ: 120/80)'));
                          }
                          
                          const systolic = parseInt(parts[0].trim());
                          const diastolic = parseInt(parts[1].trim());
                          
                          // Check if both parts are valid numbers
                          if (isNaN(systolic) || isNaN(diastolic)) {
                            return Promise.reject(new Error('Huyết áp phải là số (ví dụ: 120/80)'));
                          }
                          
                          // Validate systolic pressure (110-133)
                          if (systolic < 110 || systolic > 133) {
                            return Promise.reject(new Error('Huyết áp tâm thu phải từ 110 đến 133'));
                          }
                          
                          // Validate diastolic pressure (70-81)
                          if (diastolic < 70 || diastolic > 81) {
                            return Promise.reject(new Error('Huyết áp tâm trương phải từ 70 đến 81'));
                          }
                          
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <Input placeholder="Ví dụ: 120/80" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item 
                    label="CÂN NẶNG (kg)" 
                    name="donorWeight"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (value !== null && value !== undefined) {
                            if (value < 42) {
                              return Promise.reject(new Error('Cân nặng tối thiểu là 42kg'));
                            }
                            if (value > 200) {
                              return Promise.reject(new Error('Cân nặng tối đa là 200kg'));
                            }
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Nhập cân nặng"
                      min={42}
                      max={200}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <Form.Item 
                    label="CHIỀU CAO (cm)" 
                    name="donorHeight"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (value !== null && value !== undefined) {
                            if (value < 100) {
                              return Promise.reject(new Error('Chiều cao tối thiểu là 100cm'));
                            }
                            if (value > 300) {
                              return Promise.reject(new Error('Chiều cao tối đa là 300cm'));
                            }
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Nhập chiều cao"
                      min={100}
                      max={300}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item 
                    label="NHỊP TIM (bpm)" 
                    name="donorHeartRate"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (value !== null && value !== undefined) {
                            if (value < 60) {
                              return Promise.reject(new Error('Nhịp tim tối thiểu là 60 bpm'));
                            }
                            if (value > 90) {
                              return Promise.reject(new Error('Nhịp tim tối đa là 90 bpm'));
                            }
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Nhập nhịp tim"
                      min={60}
                      max={90}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">THÔNG TIN HIẾN MÁU</Divider>

              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <Form.Item
                    label="LOẠI HIẾN MÁU"
                    name="donationTypeId"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn loại hiến máu!",
                      },
                    ]}
                  >
                    <Select placeholder="Chọn loại hiến máu">
                      {Object.entries(donationTypes).map(([id, type]) => (
                        <Option key={id} value={parseInt(id)}>
                          {type.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="THỂ TÍCH HIẾN (ml)"
                    name="volumeDonated"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập thể tích hiến!",
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Nhập thể tích hiến"
                      min={0}
                      max={500}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">KẾT LUẬN</Divider>

              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <Form.Item
                    label="KẾT QUẢ XÉT NGHIỆM"
                    name="bloodTestResult"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn kết quả xét nghiệm!",
                      },
                    ]}
                  >
                    <Select placeholder="Chọn kết quả xét nghiệm">
                      {Object.entries(bloodTestResults).map(([id, result]) => (
                        <Option key={id} value={parseInt(id)}>
                          {result.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="NHÓM MÁU" name="donorBloodType">
                    <Select placeholder="Chọn nhóm máu">
                      {Object.entries(bloodTypes).map(([id, type]) => (
                        <Option key={id} value={parseInt(id)}>
                          {type.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="GHI CHÚ" name="note">
                    <Input.TextArea
                      rows={3}
                      placeholder="Nhập ghi chú (không bắt buộc)"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </div>
      );
    }

    // View mode (read-only)
    return (
      <div className="donation-detail-form">
        <Card
          title="THÔNG TIN HỒ SƠ HIẾN MÁU"
          className="detail-form-card"
          extra={
            <Button type="primary" onClick={handleEditMode}>
              Chỉnh Sửa
            </Button>
          }
        >
          <Row gutter={[24, 16]}>
            <Col span={8}>
              <div className="form-field">
                <label className="form-label">MÃ HỒ SƠ</label>
                <div className="form-value">
                  {selectedRecord.donationRecordId ||
                    selectedRecord.DonationRecordId ||
                    "N/A"}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="form-field">
                <label className="form-label">MÃ ĐĂNG KÝ</label>
                <div className="form-value">
                  {selectedRecord.registrationId ||
                    selectedRecord.RegistrationId ||
                    "N/A"}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="form-field">
                <label className="form-label">MÃ NGƯỜI DÙNG</label>
                <div className="form-value">
                  {getUserIdFromRegistration(
                    selectedRecord.registrationId ||
                      selectedRecord.RegistrationId
                  )}
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className="form-field">
                <label className="form-label">TÊN NGƯỜI DÙNG</label>
                <div className="form-value">
                  {getUsernameFromRegistration(
                    selectedRecord.registrationId ||
                      selectedRecord.RegistrationId
                  )}
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className="form-field">
                <label className="form-label">NGÀY HIẾN MÁU</label>
                <div className="form-value">
                  {(() => {
                    const registrationId =
                      selectedRecord.registrationId ||
                      selectedRecord.RegistrationId;
                    const scheduleInfo = scheduleData[registrationId];

                    // Use schedule date if available, otherwise fall back to stored donation date
                    let displayDate;
                    if (scheduleInfo && scheduleInfo.scheduleDate) {
                      // Use the schedule date from the donation schedule
                      displayDate = scheduleInfo.scheduleDate;
                    } else {
                      // Fall back to stored donationDateTime
                      displayDate =
                        selectedRecord.donationDateTime ||
                        selectedRecord.DonationDateTime;
                    }

                    return formatDateTime(displayDate);
                  })()}
                </div>
              </div>
            </Col>
          </Row>

          <Divider orientation="left">THÔNG TIN SỨC KHỎE</Divider>

          <Row gutter={[24, 16]}>
            <Col span={8}>
              <div className="form-field">
                <label className="form-label">NHIỆT ĐỘ</label>
                <div className="form-value">
                  {selectedRecord.donorTemperature ||
                    selectedRecord.DonorTemperature ||
                    "N/A"}
                  {selectedRecord.donorTemperature ||
                  selectedRecord.DonorTemperature
                    ? " °C"
                    : ""}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="form-field">
                <label className="form-label">HUYẾT ÁP</label>
                <div className="form-value">
                  {formatBloodPressure(
                    selectedRecord.donorBloodPressure ||
                      selectedRecord.DonorBloodPressure
                  )}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="form-field">
                <label className="form-label">CÂN NẶNG</label>
                <div className="form-value">
                  {selectedRecord.donorWeight ||
                    selectedRecord.DonorWeight ||
                    "N/A"}
                  {selectedRecord.donorWeight || selectedRecord.DonorWeight
                    ? " kg"
                    : ""}
                </div>
              </div>
            </Col>
          </Row>

          <Row gutter={[24, 16]}>
            <Col span={12}>
              <div className="form-field">
                <label className="form-label">CHIỀU CAO</label>
                <div className="form-value">
                  {selectedRecord.donorHeight ||
                    selectedRecord.DonorHeight ||
                    "N/A"}
                  {selectedRecord.donorHeight || selectedRecord.DonorHeight
                    ? " cm"
                    : ""}
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className="form-field">
                <label className="form-label">NHỊP TIM</label>
                <div className="form-value">
                  {selectedRecord.donorHeartRate ||
                    selectedRecord.DonorHeartRate ||
                    "N/A"}
                  {selectedRecord.donorHeartRate || selectedRecord.DonorHeartRate
                    ? " bpm"
                    : ""}
                </div>
              </div>
            </Col>
          </Row>

          <Divider orientation="left">THÔNG TIN HIẾN MÁU</Divider>

          <Row gutter={[24, 16]}>
            <Col span={12}>
              <div className="form-field">
                <label className="form-label">LOẠI HIẾN MÁU</label>
                <div className="form-value">
                  {getDonationTypeName(
                    selectedRecord.donationTypeId ||
                      selectedRecord.DonationTypeId
                  )}
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className="form-field">
                <label className="form-label">THỂ TÍCH HIẾN</label>
                <div className="form-value">
                  {selectedRecord.volumeDonated ||
                    selectedRecord.VolumeDonated ||
                    "N/A"}
                  {selectedRecord.volumeDonated || selectedRecord.VolumeDonated
                    ? " ml"
                    : ""}
                </div>
              </div>
            </Col>
          </Row>

          <Divider orientation="left">KẾT LUẬN</Divider>

          <Row gutter={[24, 16]}>
            <Col span={12}>
              <div className="form-field">
                <label className="form-label">KẾT QUẢ XÉT NGHIỆM</label>
                <div className="form-value">
                  {(() => {
                    // Check if donor cannot donate (checkbox is checked)
                    const cannotDonateField =
                      selectedRecord.cannotDonate || false;
                    const registrationId =
                      selectedRecord.registrationId ||
                      selectedRecord.RegistrationId;
                    const registrationStatus =
                      registrationStatuses[registrationId];
                    const isStatusIneligible = registrationStatus === 1001; // "Không đủ điều kiện hiến"
                    const cannotDonate =
                      cannotDonateField || isStatusIneligible;

                    // If cannot donate, show "Không thể hiến máu" (id=5), otherwise show actual result
                    const displayResult = cannotDonate
                      ? 5
                      : selectedRecord.bloodTestResult ||
                        selectedRecord.BloodTestResult;
                    return getBloodTestResultTag(displayResult);
                  })()}
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className="form-field">
                <label className="form-label">NHÓM MÁU</label>
                <div className="form-value">
                  {(() => {
                    const registrationId =
                      selectedRecord.registrationId ||
                      selectedRecord.RegistrationId;
                    const userData = registrationUsers[registrationId];
                    const bloodTypeId = userData?.bloodTypeId;

                    if (bloodTypeId && bloodTypes[bloodTypeId]) {
                      return (
                        <Tag
                          color="blue"
                          style={{ fontSize: "14px", padding: "4px 8px" }}
                        >
                          {bloodTypes[bloodTypeId].name}
                        </Tag>
                      );
                    }
                    return <span style={{ color: "#999" }}>Chưa xác định</span>;
                  })()}
                </div>
              </div>
            </Col>
            <Col span={24}>
              <div className="form-field">
                <label className="form-label">GHI CHÚ</label>
                <div className="form-value">
                  {selectedRecord.note ||
                    selectedRecord.Note ||
                    "Không có ghi chú"}
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    );
  };

  const getCurrentData = () => {
    if (currentView === "users") return uniqueUsers;
    if (currentView === "userRecords") return userDonationRecords;
    return [];
  };

  const currentData = getCurrentData();
  const totalPages = Math.ceil(currentData.length / pageSize);
  const startRecord =
    currentData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(currentPage * pageSize, currentData.length);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleGoToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Layer 1: User list columns
  const userColumns = [
    {
      title: "Mã Người Hiến (DonorID)",
      dataIndex: "userId",
      key: "userId",
      width: "25%",
      render: (text) => (
        <span style={{ fontWeight: "bold", color: "#059669" }}>{text}</span>
      ),
    },
    {
      title: "Tên Người Hiến",
      dataIndex: "username",
      key: "username",
      width: "35%",
      render: (text) => (
        <span style={{ fontWeight: "500", color: "#374151" }}>{text}</span>
      ),
    },
    {
      title: "Chi Tiết",
      key: "actions",
      width: "10%",
      render: (_, user) => (
        <Button
          type="link"
          onClick={() => handleViewUserRecords(user)}
          style={{ padding: 0 }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  // Layer 2: User's donation records columns
  const userRecordColumns = [
    {
      title: "Mã Hồ Sơ (DonationRecordID)",
      dataIndex: "donationRecordId",
      key: "donationRecordId",
      width: "15%",
      render: (_, record) => {
        const recordId =
          record.donationRecordId ||
          record.DonationRecordId ||
          record.id ||
          "N/A";
        return (
          <span style={{ fontWeight: "bold", color: "#722ed1" }}>
            {recordId}
          </span>
        );
      },
    },
    {
      title: "Mã Đăng Ký (RegistrationID)",
      dataIndex: "registrationId",
      key: "registrationId",
      width: "15%",
      render: (_, record) => {
        const registrationId =
          record.registrationId ||
          record.RegistrationId ||
          record.RegistrationID ||
          "N/A";
        return (
          <span style={{ fontWeight: "bold", color: "#1890ff" }}>
            {registrationId}
          </span>
        );
      },
    },
    {
      title: "Ngày hiến máu",
      dataIndex: "donationDateTime",
      key: "donationDateTime",
      width: "20%",
      render: (_, record) => {
        const registrationId = record.registrationId || record.RegistrationId;
        const scheduleInfo = scheduleData[registrationId];

        // Use schedule date if available, otherwise fall back to stored donation date
        let displayDate;
        if (scheduleInfo && scheduleInfo.scheduleDate) {
          // Use the schedule date from the donation schedule
          displayDate = scheduleInfo.scheduleDate;
        } else {
          // Fall back to stored donationDateTime
          displayDate = record.donationDateTime || record.DonationDateTime;
        }

        return (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: "bold", color: "#52c41a" }}>
              {formatDateTime(displayDate)}
            </div>
          </div>
        );
      },
    },
    {
      title: "Loại Hiến Máu",
      key: "donationType",
      width: "15%",
      render: (_, record) => {
        const typeId = record.donationTypeId || record.DonationTypeId;
        const typeName = getDonationTypeName(typeId);
        return (
          <span style={{ fontWeight: "bold", color: "#f5222d" }}>
            {typeName}
          </span>
        );
      },
    },
    {
      title: "Kết Quả Xét Nghiệm",
      dataIndex: "bloodTestResult",
      key: "bloodTestResult",
      width: "15%",
      render: (_, record) => {
        // Check if donor cannot donate (same logic as detailed view)
        const cannotDonateField = record.cannotDonate || false;
        const registrationId = record.registrationId || record.RegistrationId;
        const registrationStatus = registrationStatuses[registrationId];
        const isStatusIneligible = registrationStatus === 1001; // "Không đủ điều kiện hiến"
        const cannotDonate = cannotDonateField || isStatusIneligible;

        // If cannot donate, show "Không thể hiến máu" (id=5), otherwise show actual result
        const displayResult = cannotDonate
          ? 5
          : record.bloodTestResult || record.BloodTestResult;

        return (
          <div style={{ textAlign: "center" }}>
            {getBloodTestResultTag(displayResult)}
          </div>
        );
      },
    },
    {
      title: "Xem Chi Tiết",
      key: "actions",
      width: "20%",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => handleViewRecordDetails(record)}
          style={{ padding: 0 }}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <Layout className="staff-layout">
      {contextHolder}
      <StaffSidebar
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      />

      <Layout className="staff-main-layout">
        <StaffHeader />

        <Layout className="staff-content-layout">
          <Content className="donation-records-content">
            <div className="donation-records-container">
              <div className="donation-records-header-section">
                <Space className="donation-records-controls">
                  {currentView === "userRecords" && (
                    <Button
                      onClick={handleBackToUsers}
                      style={{ marginRight: 16 }}
                      icon={<span>←</span>}
                    >
                      Quay Lại
                    </Button>
                  )}
                  {currentView === "recordDetail" && (
                    <Button
                      onClick={handleBackToUserRecords}
                      style={{ marginRight: 16 }}
                      icon={<span>←</span>}
                    >
                      Quay Lại
                    </Button>
                  )}
                  <Title level={3} className="donation-records-title">
                    {viewTitle}
                  </Title>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      marginLeft: "auto",
                    }}
                  >
                    <Text strong>
                      {currentView === "users" && "Tổng số hồ sơ:"}
                      {currentView === "userRecords" && "Tổng số hồ sơ:"}
                      {currentView === "recordDetail" && "Chi tiết hồ sơ:"}
                    </Text>{" "}
                    {currentView === "users"
                      ? uniqueUsers.length
                      : currentView === "userRecords"
                      ? userDonationRecords.length
                      : "1"}
                  </div>
                </Space>
              </div>

              <div className="donation-records-table-container">
                {currentView === "users" && (
                  <>
                    <Table
                      columns={userColumns}
                      dataSource={getPaginatedData()}
                      rowKey={(user) => user.userId}
                      loading={loading}
                      pagination={false}
                      size="large"
                      className="donation-records-wide-table"
                    />

                    {/* Custom Pagination Controls */}
                    {currentData.length > 0 && (
                      <div className="donation-records-pagination">
                        <div className="pagination-info">
                          <Text>
                            Hiển thị {startRecord}-{endRecord} của{" "}
                            {currentData.length} người dùng
                          </Text>
                        </div>

                        <div className="pagination-controls">
                          <Space>
                            <Text>Số bản ghi mỗi trang:</Text>
                            <Select
                              value={pageSize}
                              onChange={handlePageSizeChange}
                              style={{ width: 80 }}
                            >
                              <Option value={5}>5</Option>
                              <Option value={8}>8</Option>
                              <Option value={10}>10</Option>
                              <Option value={20}>20</Option>
                              <Option value={50}>50</Option>
                            </Select>
                          </Space>

                          <div className="pagination-buttons">
                            <Button
                              disabled={currentPage === 1}
                              onClick={() => handlePageChange(1)}
                            >
                              ❮❮
                            </Button>
                            <Button
                              disabled={currentPage === 1}
                              onClick={() => handlePageChange(currentPage - 1)}
                            >
                              ❮
                            </Button>

                            {/* Page numbers */}
                            {Array.from(
                              { length: Math.min(5, totalPages) },
                              (_, i) => {
                                const pageStart = Math.max(
                                  1,
                                  Math.min(currentPage - 2, totalPages - 4)
                                );
                                const pageNum = pageStart + i;

                                if (pageNum <= totalPages) {
                                  return (
                                    <Button
                                      key={pageNum}
                                      type={
                                        currentPage === pageNum
                                          ? "primary"
                                          : "default"
                                      }
                                      onClick={() => handlePageChange(pageNum)}
                                    >
                                      {pageNum}
                                    </Button>
                                  );
                                }
                                return null;
                              }
                            )}

                            <Button
                              disabled={currentPage === totalPages}
                              onClick={() => handlePageChange(currentPage + 1)}
                            >
                              ❯
                            </Button>
                            <Button
                              disabled={currentPage === totalPages}
                              onClick={() => handlePageChange(totalPages)}
                            >
                              ❯❯
                            </Button>
                          </div>

                          <div className="goto-page">
                            <Text>Đến trang:</Text>
                            <InputNumber
                              min={1}
                              max={totalPages}
                              value={currentPage}
                              onChange={(value) =>
                                value && handleGoToPage(value)
                              }
                              style={{ width: 60, marginLeft: 8 }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {currentView === "userRecords" && (
                  <>
                    <Table
                      columns={userRecordColumns}
                      dataSource={getPaginatedData()}
                      rowKey={(record) => {
                        return (
                          record.donationRecordId ||
                          record.DonationRecordId ||
                          record.id ||
                          Math.random()
                        );
                      }}
                      loading={loading}
                      pagination={false}
                      size="large"
                      className="donation-records-wide-table"
                    />

                    {/* Custom Pagination Controls */}
                    {currentData.length > 0 && (
                      <div className="donation-records-pagination">
                        <div className="pagination-info">
                          <Text>
                            Hiển thị {startRecord}-{endRecord} của{" "}
                            {currentData.length} hồ sơ
                          </Text>
                        </div>

                        <div className="pagination-controls">
                          <Space>
                            <Text>Số bản ghi mỗi trang:</Text>
                            <Select
                              value={pageSize}
                              onChange={handlePageSizeChange}
                              style={{ width: 80 }}
                            >
                              <Option value={5}>5</Option>
                              <Option value={8}>8</Option>
                              <Option value={10}>10</Option>
                              <Option value={20}>20</Option>
                              <Option value={50}>50</Option>
                            </Select>
                          </Space>

                          <div className="pagination-buttons">
                            <Button
                              disabled={currentPage === 1}
                              onClick={() => handlePageChange(1)}
                            >
                              ❮❮
                            </Button>
                            <Button
                              disabled={currentPage === 1}
                              onClick={() => handlePageChange(currentPage - 1)}
                            >
                              ❮
                            </Button>

                            {/* Page numbers */}
                            {Array.from(
                              { length: Math.min(5, totalPages) },
                              (_, i) => {
                                const pageStart = Math.max(
                                  1,
                                  Math.min(currentPage - 2, totalPages - 4)
                                );
                                const pageNum = pageStart + i;

                                if (pageNum <= totalPages) {
                                  return (
                                    <Button
                                      key={pageNum}
                                      type={
                                        currentPage === pageNum
                                          ? "primary"
                                          : "default"
                                      }
                                      onClick={() => handlePageChange(pageNum)}
                                    >
                                      {pageNum}
                                    </Button>
                                  );
                                }
                                return null;
                              }
                            )}

                            <Button
                              disabled={currentPage === totalPages}
                              onClick={() => handlePageChange(currentPage + 1)}
                            >
                              ❯
                            </Button>
                            <Button
                              disabled={currentPage === totalPages}
                              onClick={() => handlePageChange(totalPages)}
                            >
                              ❯❯
                            </Button>
                          </div>

                          <div className="goto-page">
                            <Text>Đến trang:</Text>
                            <InputNumber
                              min={1}
                              max={totalPages}
                              value={currentPage}
                              onChange={(value) =>
                                value && handleGoToPage(value)
                              }
                              style={{ width: 60, marginLeft: 8 }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {currentView === "recordDetail" && renderDetailForm()}
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>

      {/* Confirmation Modal */}
      <Modal
        title="Xác nhận thay đổi"
        open={confirmModalVisible}
        onOk={handleConfirmSave}
        onCancel={handleCancelConfirm}
        okText="Xác nhận"
        cancelText="Huỷ"
        loading={editLoading}
      >
        <p>Bạn đã kiểm tra kỹ thông tin đã được chỉnh sửa chưa?</p>
      </Modal>
    </Layout>
  );
};

export default DonationRecordsPage;
