import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://gateway:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
