import axios from 'axios';

// Base URL for the API - adjust this to match your backend URL
const API_BASE_URL = 'https://api-blooddonation.purintech.id.vn'; // Update this to your actual backend URL

// Create axios instance with default config
const hospitalApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
hospitalApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
hospitalApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const HospitalAPI = {
  // Get all hospitals
  getAllHospitals: async () => {
    try {
      const response = await hospitalApi.get('/api/Hospital');
      return response.data;
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      throw error;
    }
  },

  // Get hospital by ID
  getHospitalById: async (hospitalId) => {
    try {
      const response = await hospitalApi.get(`/api/Hospital/${hospitalId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching hospital by ID:', error);
      throw error;
    }
  },

  // Create new hospital
  createHospital: async (hospitalData) => {
    try {
      const response = await hospitalApi.post('/api/Hospital', hospitalData);
      return response.data;
    } catch (error) {
      console.error('Error creating hospital:', error);
      throw error;
    }
  },

  // Update hospital
  updateHospital: async (hospitalId, hospitalData) => {
    try {
      const response = await hospitalApi.put(`/api/Hospital/${hospitalId}`, hospitalData);
      return response.data;
    } catch (error) {
      console.error('Error updating hospital:', error);
      throw error;
    }
  },

  // Delete hospital
  deleteHospital: async (hospitalId) => {
    try {
      const response = await hospitalApi.delete(`/api/Hospital/${hospitalId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting hospital:', error);
      throw error;
    }
  },

  // Get hospital users
  getHospitalUsers: async (hospitalId) => {
    try {
      const response = await hospitalApi.get(`/api/Hospital/${hospitalId}/users`);
      return response.data;
    } catch (error) {
      console.error('Error fetching hospital users:', error);
      throw error;
    }
  },

  // Register hospital account
  registerHospitalAccount: async (accountData) => {
    try {
      const response = await hospitalApi.post('/api/User/register-hospital', accountData);
      return response.data;
    } catch (error) {
      console.error('Error registering hospital account:', error);
      throw error;
    }
  },

  // Create emergency blood request
  createBloodRequest: async (requestData) => {
    try {
      const response = await hospitalApi.post('/api/BloodRequest', requestData);
      return response.data;
    } catch (error) {
      console.error('Error creating blood request:', error);
      throw error;
    }
  },

  // Get urgency levels lookup
  getUrgencies: async () => {
    try {
      const response = await hospitalApi.get('/api/Lookup/urgencies');
      return response.data;
    } catch (error) {
      console.error('Error fetching urgencies:', error);
      throw error;
    }
  },

  // Get all blood requests
  getAllBloodRequests: async () => {
    try {
      const response = await hospitalApi.get('/api/BloodRequest');
      return response.data;
    } catch (error) {
      console.error('Error fetching blood requests:', error);
      throw error;
    }
  },

  // Get blood request by ID
  getBloodRequestById: async (requestId) => {
    try {
      const response = await hospitalApi.get(`/api/BloodRequest/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching blood request by ID:', error);
      throw error;
    }
  },

  // Get blood request statuses lookup
  getBloodRequestStatuses: async () => {
    try {
      const response = await hospitalApi.get('/api/Lookup/blood-request-statuses');
      return response.data;
    } catch (error) {
      console.error('Error fetching blood request statuses:', error);
      throw error;
    }
  },

  // Approve blood request
  approveBloodRequest: async (requestId, approverUserId) => {
    try {
      const response = await hospitalApi.patch(`/api/BloodRequest/${requestId}/approve`, approverUserId);
      return response.data;
    } catch (error) {
      console.error('Error approving blood request:', error);
      throw error;
    }
  },

  // Reject blood request
  rejectBloodRequest: async (requestId, rejectionData) => {
    try {
      const response = await hospitalApi.patch(`/api/BloodRequest/${requestId}/reject`, rejectionData);
      return response.data;
    } catch (error) {
      console.error('Error rejecting blood request:', error);
      throw error;
    }
  },

  // Get suggested blood units for a request
  getSuggestedBloodUnits: async (requestId) => {
    try {
      const response = await hospitalApi.get(`/api/BloodRequest/${requestId}/suggested-blood-unit-list`);
      return response.data;
    } catch (error) {
      console.error('Error fetching suggested blood units:', error);
      throw error;
    }
  },

  // Assign blood unit to request
  assignBloodUnitToRequest: async (unitId, requestId) => {
    try {
      const response = await hospitalApi.patch(`/api/BloodUnit/${unitId}/assign-to-request`, requestId);
      return response.data;
    } catch (error) {
      console.error('Error assigning blood unit to request:', error);
      throw error;
    }
  },

  // Get available blood units by blood type and component
  getAvailableBloodUnits: async (bloodTypeId, componentId) => {
    try {
      const response = await hospitalApi.get(`/api/BloodUnit?bloodTypeId=${bloodTypeId}&componentId=${componentId}&available=true`);
      return response.data;
    } catch (error) {
      console.error('Error fetching available blood units:', error);
      throw error;
    }
  },
}; 