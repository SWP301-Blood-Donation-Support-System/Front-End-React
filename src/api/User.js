import axios from "axios";

const BASE_URL = "https://api-blooddonation.purintech.id.vn";

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

export const UserAPI = {
    getAllUser: () => {
        const response = axios.get(`${BASE_URL}/api/User`)
        return response;
    },

    register: async (username, email, password) => {
        try {
            const response = await axios.post(`${BASE_URL}/api/User/registerDonor`, {
                username: username,
                email: email,
                passwordHash: password            });
            console.log("Registration response:", response);
            return response;
        } catch (error) {
            console.error("Error during registration:", error);
            throw error;
        }    },

    login: async (email, password) => {
        const response = await axios.post(`${BASE_URL}/api/User/login`, {
            email: email,
            passwordHash: password
        });
        return response;
    },
    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");    },

    // Update user profile information
    updateUserProfile: async (userId, profileData) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(`${BASE_URL}/api/User/updateDonor/${userId}`, profileData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }            });
            return response;        } catch (error) {
            console.error("Error updating user profile:", error);
            throw error;
        }
    },

    // Get blood types from backend
    getBloodTypes: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/Lookup/blood-types`);            return response;        } catch (error) {
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
    },    // Get occupations from backend
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
    getTimeSlots: async () => {        try {
            const response = await axios.get(`${BASE_URL}/api/TimeSlot`);
            return response;        } catch (error) {
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
    },    // Register donation appointment
    registerDonation: async (donationData) => {
        try {
            const token = localStorage.getItem("token");
            console.log("API Call - Token:", token);
            console.log("API Call - Donation Data:", donationData);
            
            const response = await axios.post(`${BASE_URL}/api/DonationRegistration/registerDonation`, donationData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log("Donation registration response:", response);
            console.log("Response status:", response.status);
            console.log("Response data:", response.data);
            return response;
        } catch (error) {
            console.error("Error registering donation:", error);
            console.error("Error response:", error.response);
            console.error("Error response data:", error.response?.data);
            console.error("Error response status:", error.response?.status);
            throw error;
        }

    },    // Get user's donation registrations
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

    // Get registration statuses from backend
    getRegistrationStatuses: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/Lookup/registration-statuses`);
            return response;
        } catch (error) {
            console.error("Error fetching registration statuses:", error);
            throw error;
        }

    },
}