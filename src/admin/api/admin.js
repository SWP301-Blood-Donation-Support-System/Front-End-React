import axios from "axios";

const BASE_URL = "https://api-blooddonation.purintech.id.vn";

export const AdminAPI = {
  // Get all donation schedules
  getDonationSchedules: async () => {    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/DonationSchedule`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      
      return response;
    } catch (error) {
      console.error("Error fetching donation schedules:", error);
      throw error;
    }
  },

  // Get upcoming donation schedules
  getUpcomingDonationSchedules: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/DonationSchedule/upcoming`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching upcoming donation schedules:", error);
      throw error;
    }
  },

  // Get all donation registrations
  getDonationRegistrations: async () => {    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/DonationRegistration`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      
      return response;
    } catch (error) {
      console.error("Error fetching donation registrations:", error);
      throw error;
    }
  },

  // Get donation registrations by schedule ID
  getDonationRegistrationsBySchedule: async (scheduleId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/DonationRegistration?scheduleId=${scheduleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching donation registrations by schedule:", error);
      throw error;
    }
  },

  // Get specific donation schedule by ID
  getDonationScheduleById: async (scheduleId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/DonationSchedule/${scheduleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching donation schedule by ID:", error);
      throw error;
    }
  },

  // Get specific donation registration by ID
  getDonationRegistrationById: async (registrationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/DonationRegistration/registration/${registrationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching donation registration by ID:", error);
      throw error;
    }
  },

  // Update donation registration status
  updateRegistrationStatus: async (registrationId, statusId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`${BASE_URL}/api/DonationRegistration/registration-status`, {
        registrationId: registrationId,
        statusId: statusId
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error updating registration status:", error);
      throw error;
    }
  },

  // Update donation registration status (new endpoint for staff)
  updateDonationRegistrationStatus: async (registrationId, statusId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`${BASE_URL}/api/DonationRegistration/registration-status`, {
        registrationId: registrationId,
        statusId: statusId
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error updating donation registration status:", error);
      throw error;
    }
  },

  // Auto-update donor statuses for schedules that are "ĐÃ QUA" (not in upcoming list)
  autoUpdateExpiredScheduleDonors: async (upcomingDates) => {
    try {
      const token = localStorage.getItem("token");
      
      // Get all schedules and registrations
      const [schedulesResponse, registrationsResponse] = await Promise.all([
        AdminAPI.getDonationSchedules(),
        AdminAPI.getDonationRegistrations()
      ]);
      
      const allSchedules = schedulesResponse.data || [];
      const allRegistrations = registrationsResponse.data || [];
      
      // Find schedules that are "ĐÃ QUA" (not in upcoming dates)
      const expiredSchedules = allSchedules.filter(schedule => {
        const scheduleDate = schedule.scheduleDate;
        if (scheduleDate) {
          const dateStr = new Date(scheduleDate).toISOString().split('T')[0];
          return !upcomingDates.has(dateStr); // Not in upcoming = "ĐÃ QUA"
        }
        return false;
      });
      
      let totalUpdated = 0;
      
      // For each expired schedule, update donor statuses
      for (const schedule of expiredSchedules) {
        const scheduleId = schedule.scheduleId || schedule.ScheduleId || schedule.id || schedule.Id;
        
        // Get registrations for this expired schedule
        const scheduleRegistrations = allRegistrations.filter(reg => {
          const regScheduleId = reg.scheduleId || reg.ScheduleId || reg.ScheduleID;
          return regScheduleId == scheduleId;
        });
        
        // Find registrations with status id=1 (registered/pending)
        const pendingRegistrations = scheduleRegistrations.filter(reg => {
          const statusId = reg.RegistrationStatusID || reg.registrationStatusId || reg.RegistrationStatusId;
          return statusId == 1;
        });
        
        // Update each pending registration to status id=5 (Không xuất hiện)
        for (const reg of pendingRegistrations) {
          const registrationId = reg.registrationId || reg.RegistrationID || reg.id;
          try {
            await AdminAPI.updateDonationRegistrationStatus(registrationId, 5);
            totalUpdated++;
            console.log(`Updated registration ${registrationId} to "Không xuất hiện" status`);
          } catch (error) {
            console.error(`Failed to update registration ${registrationId}:`, error);
          }
        }
      }
      
      return {
        success: true,
        updatedCount: totalUpdated,
        expiredSchedulesCount: expiredSchedules.length,
        message: `Đã cập nhật ${totalUpdated} người hiến sang trạng thái "Không xuất hiện" cho ${expiredSchedules.length} lịch đã qua`
      };
    } catch (error) {
      console.error("Error auto-updating expired schedule donors:", error);
      throw error;
    }
  },

  // Create new donation schedule
  createDonationSchedule: async (scheduleData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${BASE_URL}/api/DonationSchedule`, scheduleData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error creating donation schedule:", error);
      throw error;
    }
  },

  // Delete donation schedule
  deleteDonationSchedule: async (scheduleId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${BASE_URL}/api/DonationSchedule/${scheduleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error deleting donation schedule:", error);
      throw error;
    }
  },



  // Get all donors (batch fetch for efficiency)
  getAllDonors: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/User`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching all donors:", error);
      throw error;
    }
  },

  // Get all time slots
  getTimeSlots: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/TimeSlot`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching time slots:", error);
      throw error;
    }
  },

  // Get registration statuses lookup
  getRegistrationStatuses: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/Lookup/registration-statuses`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching registration statuses:", error);
      throw error;
    }
  },

  // Get all donation records
  getDonationRecords: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/DonationRecord`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching donation records:", error);
      throw error;
    }
  },

  // Get donation record by ID
  getDonationRecordById: async (recordId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/DonationRecord/${recordId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching donation record by ID:", error);
      throw error;
    }
  },

  // Get donation types lookup
  getDonationTypes: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/Lookup/donation-types`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching donation types:", error);
      throw error;
    }
  },

  // Get blood test results lookup
  getBloodTestResults: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/Lookup/blood-test-results`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching blood test results:", error);
      throw error;
    }
  },

  // Create new donation record
  createDonationRecord: async (recordData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${BASE_URL}/api/DonationRecord`, recordData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // If donation record is created successfully, update registration status based on donation eligibility
      if (response.data && recordData.registrationId) {
        try {
          // If checkbox "Không thể hiến máu được" is checked, set status to "Không đủ điều kiện hiến" (id=1001)
          // Otherwise, set status to "Đã hoàn thành" (id=3)
          const statusId = recordData.cannotDonate ? 1001 : 3;
          const statusMessage = recordData.cannotDonate ? 
            "Registration status updated to 'Không đủ điều kiện hiến' successfully" : 
            "Registration status updated to 'Đã hoàn thành' successfully";
          
          // Call the API directly without using AdminAPI reference to avoid recursion
          await axios.put(`${BASE_URL}/api/DonationRegistration/registration-status`, {
            registrationId: recordData.registrationId,
            statusId: statusId
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log(statusMessage);
        } catch (statusUpdateError) {
          console.warn("Donation record created but failed to update registration status:", statusUpdateError);
          // Don't throw error here as the main operation (creating donation record) was successful
        }
      }

      return response;
    } catch (error) {
      console.error("Error creating donation record:", error);
      throw error;
    }
  },

  // Update donation record
  updateDonationRecord: async (recordId, recordData) => {
    try {
      const token = localStorage.getItem("token");
      
      // Add the donationRecordId to the request body as required by the API
      const requestBody = {
        ...recordData,
        donationRecordId: Number(recordId)
      };
      
      console.log(`Updating donation record ${recordId} with body:`, requestBody);
      
      const response = await axios.put(`${BASE_URL}/api/DonationRecord/${recordId}`, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // If donation record is updated successfully, update registration status based on donation eligibility
      if (response.data && recordData.registrationId) {
        try {
          // If checkbox "Không thể hiến máu được" is checked, set status to "Không đủ điều kiện hiến" (id=1001)
          // Otherwise, set status to "Đã hoàn thành" (id=3)
          const statusId = recordData.cannotDonate ? 1001 : 3;
          const statusMessage = recordData.cannotDonate ? 
            "Registration status updated to 'Không đủ điều kiện hiến' successfully" : 
            "Registration status updated to 'Đã hoàn thành' successfully";
          
          // Call the API directly without using AdminAPI reference to avoid recursion
          await axios.put(`${BASE_URL}/api/DonationRegistration/registration-status`, {
            registrationId: recordData.registrationId,
            statusId: statusId
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log(statusMessage);
        } catch (statusUpdateError) {
          console.warn("Donation record updated but failed to update registration status:", statusUpdateError);
          // Don't throw error here as the main operation (updating donation record) was successful
        }
      }

      return response;
    } catch (error) {
      console.error("Error updating donation record:", error);
      throw error;
    }
  },

  // Update donation record result (creates blood bag if result is 2 - "Máu đạt")
  updateDonationRecordResult: async (recordId, bloodTestResult) => {
    try {
      const token = localStorage.getItem("token");
      
      console.log(`Updating donation record result for record ${recordId} with result:`, bloodTestResult);
      
      // API expects just the integer value directly in the body
      const response = await axios.patch(
        `${BASE_URL}/api/DonationRecord/${recordId}/result`, 
        Number(bloodTestResult), // Send just the number, not an object
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response;
    } catch (error) {
      console.error("Error updating donation record result:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      throw error;
    }
  },

  // Get all donation registrations
  getDonationRegistrations: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/DonationRegistration`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching donation registrations:", error);
      throw error;
    }
  },

  // Get donor/user by ID (using User API for consistency)
  getDonorById: async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/User/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw error;
    }
  },

  // Get users by role ID
  getUsersByRole: async (roleId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/User/by-role/${roleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching users by role:", error);
      throw error;
    }
  },

  // Get all blood units
  getBloodUnits: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/BloodUnit`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching blood units:", error);
      throw error;
    }
  },

  // Get blood components lookup
  getBloodComponents: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/Lookup/blood-components`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching blood components:", error);
      throw error;
    }
  },

  // Get blood types lookup
  getBloodTypesLookup: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/Lookup/blood-types`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching blood types lookup:", error);
      throw error;
    }
  },

  // Get blood unit statuses lookup
  getBloodUnitStatuses: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/Lookup/blood-unit-statuses`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching blood unit statuses:", error);
      throw error;
    }
  },

  // Get genders lookup
  getGendersLookup: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/Lookup/genders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching genders lookup:", error);
      throw error;
    }
  },

  // Get occupations lookup
  getOccupationsLookup: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/Lookup/occupations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching occupations lookup:", error);
      throw error;
    }
  },

  // Get user by ID for admin purposes
  getUserById: async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/User/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw error;
    }
  },

  // Register new staff account (admin only)
  registerStaff: async (email, fullName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${BASE_URL}/api/User/register-staff`, {
        email: email,
        fullName: fullName
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error registering staff:", error);
      throw error;
    }
  },

  // Staff change password
  changeStaffPassword: async (currentPassword, newPassword) => {
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
      console.error("Error during staff change password:", error);
      throw error;
    }
  },

  // Update donor blood type (specifically for donation records)
  updateDonorBloodType: async (donorId, bloodTypeId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(`${BASE_URL}/api/User/donor/blood-type`, {
        donorId: donorId,
        bloodTypeId: bloodTypeId
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error updating donor blood type:", error);
      throw error;
    }
  },

  // Get donation availabilities lookup
  getDonationAvailabilities: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/Lookup/donation-availabilities`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching donation availabilities:", error);
      throw error;
    }
  },

  // ==== ARTICLE MANAGEMENT APIs ====
  
  // Create new article
  createArticle: async (articleData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${BASE_URL}/api/Articles`, articleData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error creating article:", error);
      throw error;
    }
  },

  // Update existing article
  updateArticle: async (articleId, articleData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`${BASE_URL}/api/Articles/${articleId}`, articleData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error updating article:", error);
      throw error;
    }
  },

  // Get article by ID
  getArticleById: async (articleId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/Articles/${articleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching article by ID:", error);
      throw error;
    }
  },

  // Get all articles with pagination
  getArticles: async (page = 1, pageSize = 10, categoryId = null, statusId = null) => {
    try {
      const token = localStorage.getItem("token");
      let url = `${BASE_URL}/api/Articles?page=${page}&pageSize=${pageSize}`;
      
      if (categoryId) {
        url += `&categoryId=${categoryId}`;
      }
      
      if (statusId) {
        url += `&statusId=${statusId}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching articles:", error);
      throw error;
    }
  },

  // Get article categories
  getArticleCategories: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/Lookup/article-categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching article categories:", error);
      throw error;
    }
  },

  // Get article statuses
  getArticleStatuses: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/Lookup/article-statuses`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching article statuses:", error);
      throw error;
    }
  },
};