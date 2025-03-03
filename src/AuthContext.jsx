import { createContext, useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { apiRequest } from "./utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // const response = await axios.get("http://localhost:5000/auth", {
        //     withCredentials: true, // This ensures cookies are sent
        // });
        // if (response.data.status === "ok") {
        //     setUser(response.data.data); // Set the username
        // } else {
        //     setUser(null);
        // }
        
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // checkAuth();
  }, []);

  useEffect(() => {
    // const role = Cookies.get("role"); // Read role from cookies
    // if (role) {
    //   setUser({ role }); 
    // }
    // checkLogin()
  }, []);

  const handleLogout = () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("role");
  };

  const checkLogin = async () => {
    console.log("Checking login...");

    setLoading(true);
    const access = Cookies.get("accessToken");
    // console.log("Access Token:", access);

    try {
      if (access) {
        const res = await apiRequest(
          "GET",
          "/api/auth/token/verify/",
          null,
          true
        );
        if(res.status==200){
          // console.log(res)
          setUser(res.data.user)
        }
        // console.log("API Response:", res); // Debugging

        if (res && res.detail !== "Token is invalid or expired") {
          // Adjust this check based on what your backend returns when the token is invalid
          // console.log("Token is valid");
          setLoading(false);
          return true;
        }
    }
    } catch (error) {
      console.error("API Error:", error); // Debugging
    }
    
    handleLogout();
    console.log("Token is invalid or missing");
    setLoading(false);
    return false;
  };

  const login = async (data) => {
    console.log(data);
    const res = await apiRequest("POST", "/api/auth/login/", data);
    return res
  };
  // const signup = async (data)=>{
  //     return await apiRequest('POST','/api/auth/login/',data)
  // }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, checkLogin,handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
