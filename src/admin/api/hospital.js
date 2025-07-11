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
}; 