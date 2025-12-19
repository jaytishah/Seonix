import api from "./api";
import Cookies from "js-cookie";

const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    if (response.data.data.token) {
      Cookies.set("token", response.data.data.token, { expires: 30 });
    }
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    if (response.data.data.token) {
      Cookies.set("token", response.data.data.token, { expires: 30 });
    }
    return response.data;
  },

  // Logout user
  logout: async () => {
    await api.post("/auth/logout");
    Cookies.remove("token");
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Update profile
  updateProfile: async (userData) => {
    const response = await api.put("/auth/profile", userData);
    return response.data;
  },

  // Change password
  changePassword: async (passwords) => {
    const response = await api.put("/auth/change-password", passwords);
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!Cookies.get("token");
  },
};

export default authService;
