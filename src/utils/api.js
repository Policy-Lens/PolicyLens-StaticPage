import axios from "axios";
import Cookies from "js-cookie";

// Environment variables for API configuration
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const BASE_URL_WS = import.meta.env.VITE_API_BASE_URL_WS || "ws://localhost:8000";
const BASE_HOST = import.meta.env.VITE_API_BASE_HOST || "localhost:8000";

const apiRequest = async (
  method,
  endpoint,
  body = null,
  requiresAuth = false,
  isMultipart = false
) => {
  try {
    const headers = {};

    if (requiresAuth) {
      const accessToken = Cookies.get("accessToken");
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers,
    };

    if (body) {
      if (body instanceof FormData) {
        config.data = body;
        // Don't set Content-Type - axios will set the correct boundary for multipart/form-data
      } else {
        config.data = body;
        if (!isMultipart) {
          headers["Content-Type"] = "application/json";
        }
      }
    }

    const response = await axios(config);
    return response;
  } catch (error) {
    if (error.response?.status === 401 && requiresAuth) {
      return handleTokenRefresh(method, endpoint, body, isMultipart);
    }
    throw error.response?.data || { message: "Something went wrong" };
  }
};

// Handle Token Refresh and Retry Original Request
const handleTokenRefresh = async (
  method,
  endpoint,
  body,
  isMultipart = false
) => {
  try {
    const refreshToken = Cookies.get("refreshToken");
    if (!refreshToken) {
      Cookies.remove("accessToken");
      throw { message: "No refresh token available. Please log in again." };
    }

    const refreshResponse = await axios.post(
      `${BASE_URL}/api/auth/token/refresh/`,
      { refresh: refreshToken }
    );

    const newAccessToken = refreshResponse.data.access;
    Cookies.set("accessToken", newAccessToken, {
      secure: true,
      sameSite: "Strict",
    });

    return apiRequest(method, endpoint, body, true, isMultipart);
  } catch (error) {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("role");
    throw { message: "Session expired. Please log in again." };
  }
};

export { apiRequest, BASE_URL, BASE_HOST,BASE_URL_WS };
