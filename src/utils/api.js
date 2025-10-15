import axios from "axios";
import Cookies from "js-cookie";

// Environment variables for API configuration
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8002";
const BASE_URL_WS = import.meta.env.VITE_API_BASE_URL_WS || "ws://localhost:8002";
const BASE_HOST = import.meta.env.VITE_API_BASE_HOST || "localhost:8002";

// API utility functions

const apiRequest = async (
  method,
  endpoint,
  body = null,
  requiresAuth = false,
  isMultipart = false,
  responseType = null,
  retryCount = 0
) => {
  const maxRetries = 2;
  
  try {
    const headers = {};

    if (requiresAuth) {
      const accessToken = Cookies.get("accessToken");
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      } else {
        console.warn("No access token found for authenticated request");
        throw new Error("Authentication required but no access token found");
      }
    }

    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers,
      timeout: 30000, // 30 second timeout
    };

    if (responseType) {
      config.responseType = responseType;
    }

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
    
    // For blob responses, return the data directly
    if (responseType === 'blob') {
      return response.data;
    }
    
    return response;
  } catch (error) {
    // Handle network errors with retry
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error') || error.message?.includes('ERR_NETWORK_CHANGED')) {
      if (retryCount < maxRetries) {
        console.warn(`Network error, retrying... (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return apiRequest(method, endpoint, body, requiresAuth, isMultipart, responseType, retryCount + 1);
      }
    }
    
    if (error.response?.status === 401 && requiresAuth) {
      return handleTokenRefresh(method, endpoint, body, isMultipart, responseType);
    }
    
    // For 204 No Content, return the response instead of throwing
    if (error.response?.status === 204) {
      return error.response;
    }
    
    // Create more detailed error object
    const errorDetails = {
      message: error.response?.data?.detail || error.response?.data?.message || error.message || "Something went wrong",
      status: error.response?.status,
      data: error.response?.data,
      url: `${BASE_URL}${endpoint}`,
      method: method,
      code: error.code
    };
    
    console.error("API Request Failed:", errorDetails);
    throw errorDetails;
  }
};

// Check if user is authenticated
const isAuthenticated = () => {
  const accessToken = Cookies.get("accessToken");
  const refreshToken = Cookies.get("refreshToken");
  return !!(accessToken || refreshToken);
};

// Clear authentication and redirect to login
const clearAuthAndRedirect = () => {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
  Cookies.remove("role");
  
  // Show user-friendly message
  console.warn("Authentication expired. Redirecting to login...");
  
  // Redirect to login page after a short delay
  setTimeout(() => {
    window.location.href = '/login';
  }, 1000);
};

// Handle Token Refresh and Retry Original Request
const handleTokenRefresh = async (
  method,
  endpoint,
  body,
  isMultipart = false,
  responseType = null
) => {
  try {
    const refreshToken = Cookies.get("refreshToken");
    if (!refreshToken) {
      console.error("No refresh token available");
      clearAuthAndRedirect();
      throw { message: "No refresh token available. Please log in again." };
    }

    console.log("Attempting to refresh token...");
    const refreshResponse = await axios.post(
      `${BASE_URL}/api/auth/token/refresh/`,
      { refresh: refreshToken }
    );

    const newAccessToken = refreshResponse.data.access;
    Cookies.set("accessToken", newAccessToken, {
      secure: true,
      sameSite: "Strict",
    });

    console.log("Token refreshed successfully, retrying original request");
    return apiRequest(method, endpoint, body, true, isMultipart, responseType);
  } catch (error) {
    console.error("Token refresh failed:", error);
    clearAuthAndRedirect();
    throw { message: "Session expired. Please log in again." };
  }
};

// Export all API utilities
export { apiRequest, BASE_URL, BASE_HOST, BASE_URL_WS, isAuthenticated, clearAuthAndRedirect };
