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
    }
}