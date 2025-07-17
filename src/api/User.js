import axios from "axios";

const BASE_URL = "https://api-blooddonation.purintech.id.vn";

// Configure axios defaults
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["Accept"] = "application/json";

export const UserAPI = {
  getAllUser: () => {
    const response = axios.get(`${BASE_URL}/api/User`);
    return response;
  },

  register: async (username, email, password) => {
    try {
      const payload = {
        email: email,
        passwordHash: password,
      };
      
      // Only include username if it's provided (for backward compatibility)
      if (username) {
        payload.username = username;
      }
      
      const response = await axios.post(`${BASE_URL}/api/User/register-donor`, payload);
      console.log("Registration response:", response);
      return response;
    } catch (error) {
      console.error("Error during registration:", error);
      throw error;
    }
  },

  login: async (email, password) => {
    const response = await axios.post(`${BASE_URL}/api/User/login`, {
      email: email,
      passwordHash: password,
    });
    return response;
  },

  // Forgot password - send reset email
  forgotPassword: async (email) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/User/forgot-password`, {
        email: email,
      });
      return response;
    } catch (error) {
      console.error("Error during forgot password:", error);
      throw error;
    }
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/User/reset-password`, {
        token: token,
        newPassword: newPassword,
      });
      return response;
    } catch (error) {
      console.error("Error during reset password:", error);
      throw error;
    }
  },

  // Change password for authenticated user
  changePassword: async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/api/User/change-password`,
        {
          currentPassword: currentPassword,
          newPassword: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error during change password:", error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    // Clear staff sidebar dropdown state on logout
    localStorage.removeItem("staffSidebar_openKeys");
  }, // Update donor information
  updateDonor: async (userId, profileData) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${BASE_URL}/api/User/donor/${userId}`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error updating donor:", error);
      throw error;
    }
  },

  // Get blood types from backend
  getBloodTypes: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/Lookup/blood-types`);
      return response;
    } catch (error) {
      console.error("Error fetching blood types:", error);
      throw error;
    }
  },

  // Get genders from backend
  getGenders: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/Lookup/genders`);
      return response;
    } catch (error) {
      console.error("Error fetching genders:", error);
      throw error;
    }
  }, // Get occupations from backend
  getOccupations: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/Lookup/occupations`);
      return response;
    } catch (error) {
      console.error("Error fetching occupations:", error);
      throw error;
    }
  },

  // Get time slots for donation booking
  getTimeSlots: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/TimeSlot`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get donation schedule for available dates
  getDonationSchedule: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/DonationSchedule`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  // Register donation appointment
  registerDonation: async (donationData) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${BASE_URL}/api/DonationRegistration`,
        donationData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error registering donation:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      throw error;
    }
  },
  // Get registration statuses from backend
  getRegistrationStatuses: async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/Lookup/registration-statuses`
      );
      return response;
    } catch (error) {
      console.error("Error fetching registration statuses:", error);
      throw error;
    }
  },

  // Cancel donation registration
  cancelDonationRegistration: async (registrationId, statusId = 3) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${BASE_URL}/api/DonationRegistration/cancel-registration`,
        {
          registrationId: registrationId,
          statusId: statusId, // Default to 3 for "Đã hủy" status
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error canceling donation registration:", error);
      throw error;
    }
  },

  // Get donation record by ID
  getDonationRecordById: async (recordId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/DonationRecord/${recordId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error fetching donation record by ID:", error);
      throw error;
    }
  },

  // Get donation types lookup
  getDonationTypes: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/Lookup/donation-types`);
      return response;
    } catch (error) {
      console.error("Error fetching donation types:", error);
      throw error;
    }
  },

  // Get blood test results lookup
  getBloodTestResults: async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/Lookup/blood-test-results`
      );
      return response;
    } catch (error) {
      console.error("Error fetching blood test results:", error);
      throw error;
    }
  },

  // API để lấy thông tin user theo ID (cho thông tin hiến máu)
  getUserById: async (Id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/User/${Id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw error;
    }
  }, // API để lấy certificate theo registration ID (trả về file)
  getCertificateByRegistrationId: async (registrationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/Certificate/generate/${registrationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
          },
          responseType: "blob", // Important: để nhận file blob
        }
      );
      return response;
    } catch (error) {
      console.error("Error fetching certificate by registration ID:", error);
      throw error;
    }
  },

  // Get user's donation registrations by donor ID
  getDonationRegistrationsByDonorId: async (donorId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/DonationRegistration/by-donor/${donorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response;
    } catch (error) {
      console.error(
        "Error fetching donation registrations by donor ID:",
        error
      );
      throw error;
    }
  },

  // Get user's donation records by donor ID
  getDonationRecordsByDonorId: async (donorId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/DonationRecord/user/${donorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error fetching donation records by donor ID:", error);
      throw error;
    }
  },  // Check-in donor using National ID (CCCD)
  checkinDonor: async (nationalId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${BASE_URL}/api/DonationRegistration/check-in`,
        {
          nationalId: nationalId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response;
    } catch (error) {
      console.error("Error during donor checkin:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      throw error;
    }
  },

  // Submit feedback for donation experience
  submitFeedback: async (feedbackInfo, registrationId) => {
    try {
      const token = localStorage.getItem("token");

      // Ensure registrationId is a number as per API requirement
      const regId = parseInt(registrationId, 10);
      
      console.log("Submitting feedback:", {
        feedbackInfo,
        registrationId: regId
      });

      const response = await axios.post(
        `${BASE_URL}/api/Feedback`,
        {
          feedbackInfo: feedbackInfo,
          registrationId: regId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Feedback submission response:", response);
      return response;
    } catch (error) {
      console.error("Error submitting feedback:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      throw error;
    }
  },

  // Get feedback by registration ID
  getFeedbackByRegistrationId: async (registrationId) => {
    try {
      const token = localStorage.getItem("token");
      
      // Ensure registrationId is a number as per API requirement
      const regId = parseInt(registrationId, 10);
      
      console.log("Fetching feedback for registration ID:", regId);

      const response = await axios.get(
        `${BASE_URL}/api/Feedback/registration/${regId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Get feedback response:", response);
      return response;
    } catch (error) {
      console.error("Error fetching feedback by registration ID:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      throw error;
    }
  },
};
