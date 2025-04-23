import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
// import {checkLogin} from '../AuthContext'
import { AuthContext } from "../AuthContext";
import { apiRequest } from "../utils/api";
import { Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const { checkLogin, setUser } = useContext(AuthContext);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isEyeOpen, setIsEyeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // const authCall = async () => {
    //     try {
    //         const response = await axios.get("http://localhost:5000/auth", {
    //             withCredentials: true,
    //         });
    //         console.log(response.data);
    //         if (response.data.status == "ok")
    //             navigate("/dashboard")
    //     } catch (error) {
    //         console.log("Error fetching auth:", error);
    //     }
    // };
    const verifyLogin = async () => {
      const isLoggedIn = await checkLogin();
      if (isLoggedIn) {
        navigate("/dashboard"); // Redirect to the dashboard if logged in
      }
    };

    verifyLogin();
    // authCall();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // const response = await fetch("http://localhost:5000/login", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify(formData),
      //     credentials: "include", // Ensures cookies are sent with the request
      // });

      // const data = await response.json();

      // if (data.status == "ok") {
      //     setMessage("Login successful!");
      //     setErrors({});
      //     navigate("/dashboard")
      // } else {
      //     setErrors({ server: data.message || "Login failed. Please try again." });
      // }
      const res = await apiRequest("POST", "/api/auth/login/", {
        email: formData.username,
        password: formData.password,
      });
      if (res.status == 200) {
        console.log(res);
        Cookies.set("accessToken", res.data.access, {
          secure: true,
          sameSite: "Strict",
        });
        Cookies.set("refreshToken", res.data.refresh, {
          secure: true,
          sameSite: "Strict",
        });
        Cookies.set("role", res.data.user.role, {
          secure: true,
          sameSite: "Strict",
        });
        setUser(res.data.user);
        setMessage("Login successful!");
        setErrors({});

        // Set loading state to true after successful login
        setIsLoading(true);

        // Use setTimeout to delay navigation, allowing the loading indicator to be displayed
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error("Error during login:", error.error);
      setErrors({ server: error.error });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="bg-white p-10 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-blue-700">Login</h2>
        <p className="text-center text-gray-600 mt-2">Access your account</p>

        {message && <p className="text-green-600 text-center">{message}</p>}
        {errors.server && (
          <p className="text-red-600 text-center">{errors.server}</p>
        )}

        {/* Loading indicator - shown only when isLoading is true */}
        {isLoading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
            <p className="text-center text-gray-600 mt-2">Loading dashboard...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative w-full">
              <input
                type={isEyeOpen ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full p-3 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                onClick={() => setIsEyeOpen(!isEyeOpen)}
              >
                {isEyeOpen ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
