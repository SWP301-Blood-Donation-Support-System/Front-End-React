import axios from "axios";

const BASE_URL = "https://api-blooddonation.purintech.id.vn";

export const DashboardAPI = {
  // GET /api/Dashboard/summary - Dashboard summary
  getSummary: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/Dashboard/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      throw error;
    }
  },

  // GET /api/Dashboard/donor-statistics - Donor statistics
  getDonorStatistics: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/Dashboard/donor-statistics`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error("Error fetching donor statistics:", error);
      throw error;
    }
  },

  // GET /api/Dashboard/blood-inventory-statistics - Blood inventory statistics
  getBloodInventoryStatistics: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/Dashboard/blood-inventory-statistics`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error("Error fetching blood inventory statistics:", error);
      throw error;
    }
  },

  // GET /api/Dashboard/donation-activity-statistics - Donation activity statistics
  getDonationActivityStatistics: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/Dashboard/donation-activity-statistics`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error("Error fetching donation activity statistics:", error);
      throw error;
    }
  },

  // GET /api/Dashboard/blood-request-statistics - Blood request statistics
  getBloodRequestStatistics: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/Dashboard/blood-request-statistics`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error("Error fetching blood request statistics:", error);
      throw error;
    }
  },

  // GET /api/Dashboard/hospital-activity-statistics - Hospital activity statistics
  getHospitalActivityStatistics: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/Dashboard/hospital-activity-statistics`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error("Error fetching hospital activity statistics:", error);
      throw error;
    }
  },

  // GET /api/Dashboard/system-health - System health statistics
  getSystemHealth: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/Dashboard/system-health`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error("Error fetching system health:", error);
      throw error;
    }
  },

  // Additional helper methods for dashboard functionality

  // Refresh all dashboard data
  refreshAllData: async () => {
    try {
      const [
        summary,
        donorStats,
        bloodInventory,
        donationActivity,
        bloodRequests,
        hospitalActivity,
        systemHealth
      ] = await Promise.all([
        DashboardAPI.getSummary(),
        DashboardAPI.getDonorStatistics(),
        DashboardAPI.getBloodInventoryStatistics(),
        DashboardAPI.getDonationActivityStatistics(),
        DashboardAPI.getBloodRequestStatistics(),
        DashboardAPI.getHospitalActivityStatistics(),
        DashboardAPI.getSystemHealth()
      ]);

      return {
        summary: summary.data,
        donorStats: donorStats.data,
        bloodInventory: bloodInventory.data,
        donationActivity: donationActivity.data,
        bloodRequests: bloodRequests.data,
        hospitalActivity: hospitalActivity.data,
        systemHealth: systemHealth.data
      };
    } catch (error) {
      console.error("Error refreshing all dashboard data:", error);
      throw error;
    }
  },

  // Get dashboard data for specific date range (if API supports it)
  getDashboardDataByDateRange: async (startDate, endDate) => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await axios.get(`${BASE_URL}/api/Dashboard/summary?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error("Error fetching dashboard data by date range:", error);
      throw error;
    }
  },

  // Export dashboard data (if API supports it)
  exportDashboardData: async (format = 'excel') => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/Dashboard/export?format=${format}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error("Error exporting dashboard data:", error);
      throw error;
    }
  }
};
