import axios from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // Unauthorized
      if (status === 401) {
        console.log("❌ 401 Unauthorized - clearing auth");
        Cookies.remove("token");
        localStorage.removeItem("user");

        // Only redirect if not already on login page
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }

      // Forbidden
      if (status === 403) {
        console.error("Access denied");
      }

      // Server error
      if (status >= 500) {
        console.error("Server error:", error.response.data);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
