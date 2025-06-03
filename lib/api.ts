import axios from "axios";

// Ensure the API URL is an absolute URL
const getApiURL = () => {
  let apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // If the URL doesn't start with http/https, it's likely a relative Railway URL
  if (!apiURL.startsWith("http")) {
    apiURL = `https://${apiURL}`;
  }

  return apiURL;
};

export const api = axios.create({
  baseURL: getApiURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
