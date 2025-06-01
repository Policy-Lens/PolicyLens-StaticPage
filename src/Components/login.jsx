import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
// import {checkLogin} from '../AuthContext'
import { AuthContext } from "../AuthContext";
import { apiRequest, BASE_URL_WS } from "../utils/api";
import { Eye, EyeOff } from "lucide-react";
import { useNotifications } from "../Context/NotificationContext";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const { checkLogin, setUser } = useContext(AuthContext);
  const { connectWebSocket, cleanupWebSocket } = useNotifications();
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
        navigate("/home/dashboard"); // Redirect to the dashboard if logged in
      } else {
        // Cleanup WebSocket if no valid token found
        cleanupWebSocket();
      }
    };

    verifyLogin();
    // authCall();
  }, [checkLogin, navigate, cleanupWebSocket]);

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
      setIsLoading(true);

      const res = await apiRequest("POST", "/api/auth/login/", {
        email: formData.username,
        password: formData.password,
      });

      if (res.status == 200) {
        // Set cookies
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

        // Set user and initialize WebSocket
        setUser(res.data.user);
        connectWebSocket(); // Initialize WebSocket after successful login

        setMessage("Login successful!");
        setErrors({});

        // Navigate after successful login
        setTimeout(() => {
          navigate("/home/dashboard");
        }, 1500);
      }
    } catch (error) {
      console.error("Error during login:", error.error);
      setErrors({ server: error.error });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="bg-white p-10 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-blue-700">Login</h2>
        <p className="text-center text-gray-600 mt-2">Access your account</p>

        {message && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-3 flex items-center animate-fade-in transform transition duration-300 ease-in-out">
            <svg
              className="w-5 h-5 text-green-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            <p className="text-green-700">{message}</p>
          </div>
        )}
        {errors.server && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3 flex items-center animate-fade-in transform transition duration-300 ease-in-out">
            <svg
              className="w-5 h-5 text-red-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <p className="text-red-700">{errors.server}</p>
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
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
