import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = "https://backend.prolense.in";
// const BASE_URL = "http://localhost:8000";

const apiRequest = async (
  method,
  endpoint,
  body = null,
  requiresAuth = false
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
        // Do not set Content-Type header, let FormData handle it
      } else {
        config.data = body;
        headers["Content-Type"] = "application/json";
      }
    }

    const response = await axios(config);
    return response;
  } catch (error) {
    if (error.response?.status === 401 && requiresAuth) {
      return handleTokenRefresh(method, endpoint, body);
    }
    throw error.response?.data || { message: "Something went wrong" };
  }
};

// Handle Token Refresh and Retry Original Request
const handleTokenRefresh = async (method, endpoint, body) => {
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

    return apiRequest(method, endpoint, body, true);
  } catch (error) {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("role");
    throw { message: "Session expired. Please log in again." };
  }
};

export { apiRequest, BASE_URL };
