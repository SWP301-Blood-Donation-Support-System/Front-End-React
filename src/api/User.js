import axios from "axios";
export const UserAPI = {
    getAllUser: () => {
        const response = axios.get("https://localhost:7198/api/User")
        return response;
    },

    login: async (email, password) => {
        const response = await axios.post("https://localhost:7198/api/User/login",
            {
                email: email,
                passwordHash: password
            })
        console.log("hehehehehehehe", response);
        return response;
    },
    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
    },

    // Get detailed user profile information
    getUserProfile: async (userId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`https://localhost:7198/api/User/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    },

    // Update user profile information
    updateUserProfile: async (userId, profileData) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(`https://localhost:7198/api/User/${userId}`, profileData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response;
        } catch (error) {
            console.error("Error updating user profile:", error);
            throw error;
        }
    }
}