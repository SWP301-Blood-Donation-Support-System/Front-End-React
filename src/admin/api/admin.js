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
      const response = await axios.get(`${BASE_URL}/api/DonationRegistration/${registrationId}`, {
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
      const response = await axios.put(`${BASE_URL}/api/DonationRegistration/${registrationId}/status`, {
        RegistrationStatusId: statusId
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

  // Get donor information by ID
  getDonorById: async (donorId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/User/${donorId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.error("Error fetching donor by ID:", error);
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
  }
}; 