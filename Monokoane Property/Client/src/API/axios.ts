import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5153/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // adjust if you store it differently
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;