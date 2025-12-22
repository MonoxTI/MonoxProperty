import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5153/api", // 🔴 adjust to your backend
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
