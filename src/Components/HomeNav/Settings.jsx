import React, { useContext, useEffect, useState } from "react";
import { Layout, message } from "antd";
import { apiRequest } from "../../utils/api";
import { AuthContext } from "../../AuthContext";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;

const SettingsPage = () => {
  const { user, loading, checkLogin, setUser } = useContext(AuthContext);
  const [profileDetails, setProfileDetails] = useState({
    name: "",
    email: "",
    contact: "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isProfileEditable, setIsProfileEditable] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setProfileDetails({
        name: user.name || "",
        email: user.email || "",
        contact: user.contact || "",
      });
    }
  }, [user]);

  useEffect(() => {
    const verifyLogin = async () => {
      const isLoggedIn = await checkLogin();
      if (!isLoggedIn) {
        navigate("/");
      }
    };

    verifyLogin();
  }, []);

  const handleProfileChange = (e) => {
    setProfileDetails({ ...profileDetails, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    try {
      const res = await apiRequest(
        "PATCH",
        `/api/auth/users/${user.id}/`,
        profileDetails,
        true
      );
      if (res.status === 200) {
        message.success("Profile updated successfully!");
        setUser({ ...user, ...profileDetails });
        setIsProfileEditable(false);
      } else {
        message.error("Failed to update profile.");
      }
    } catch (error) {
      message.error("An error occurred while updating profile.");
      console.error(error);
    }
  };

  const updatePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (!currentPassword || !newPassword || !confirmPassword) {
      message.error("Please fill in all password fields.");
      return;
    }

    if (newPassword === currentPassword) {
      message.error("New password cannot be the same as the current password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      message.error("New password and confirm password do not match.");
      return;
    }

    try {
      const res = await apiRequest(
        "POST",
        "/api/auth/password/reset/",
        {
          old_password: currentPassword,
          new_password: newPassword,
        },
        true
      );

      if (res.status === 200) {
        message.success("Password updated successfully!");
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const errorMessage = res.data?.detail || "Failed to update password. Please check your current password.";
        message.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error.data?.detail || "An error occurred while updating the password.";
      message.error(errorMessage);
      console.error(error);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content className="p-6 bg-gray-100">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-semibold mb-6 text-gray-800">
            Settings
          </h1>

          {/* Profile Details */}
          <section className="mb-8">
            <h2 className="text-xl font-medium mb-4 text-gray-700">
              Profile Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileDetails.name}
                  onChange={handleProfileChange}
                  className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="Enter your name"
                  disabled={!isProfileEditable}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileDetails.email}
                  onChange={handleProfileChange}
                  className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="Enter your email"
                  disabled={!isProfileEditable}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Contact
                </label>
                <input
                  type="text"
                  name="contact"
                  value={profileDetails.contact}
                  onChange={handleProfileChange}
                  className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="Enter your contact number"
                  disabled={!isProfileEditable}
                />
              </div>
              <div className="flex gap-2">
                {isProfileEditable ? (
                  <>
                    <button
                      onClick={saveProfile}
                      className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
                    >
                      Save Profile
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileEditable(false);
                        setProfileDetails({ name: user.name, email: user.email, contact: user.contact });
                      }}
                      className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsProfileEditable(true)}
                    className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Password Update */}
          <section>
            <h2 className="text-xl font-medium mb-4 text-gray-700">
              Change Password
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                />
              </div>
              <button
                onClick={updatePassword}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
              >
                Update Password
              </button>
            </div>
          </section>
        </div>
      </Content>
    </Layout>
  );
};

export default SettingsPage;
