import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


const LoginPage = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const navigate = useNavigate()

    useEffect(() => {
        const authCall = async () => {
            try {
                const response = await axios.get("http://localhost:5000/auth", {
                    withCredentials: true,
                });
                console.log(response.data);
                if (response.data.status == "ok")
                    navigate("/dashboard")
            } catch (error) {
                console.log("Error fetching auth:", error);
            }
        };

        authCall();
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
            const response = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
                credentials: "include", // Ensures cookies are sent with the request
            });

            const data = await response.json();

            if (data.status == "ok") {
                setMessage("Login successful!");
                setErrors({});
                navigate("/dashboard")
            } else {
                setErrors({ server: data.message || "Login failed. Please try again." });
            }
        } catch (error) {
            console.error("Error during login:", error);
            setErrors({ server: "Something went wrong. Please try again later." });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
            <div className="bg-white p-10 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-blue-700">Login</h2>
                <p className="text-center text-gray-600 mt-2">Access your account</p>

                {message && <p className="text-green-600 text-center">{message}</p>}
                {errors.server && <p className="text-red-600 text-center">{errors.server}</p>}

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
