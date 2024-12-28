import React, { useState } from "react";
import { Layout } from "antd";
import Sidebar from "./Sidebar"; 

const { Content } = Layout;

const SettingsPage = () => {
    const [profileDetails, setProfileDetails] = useState({
        name: "",
        email: "",
    });
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleProfileChange = (e) => {
        setProfileDetails({ ...profileDetails, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const saveProfile = () => {
        console.log("Profile details saved:", profileDetails);
    };

    const updatePassword = () => {
        console.log("Password updated:", passwords);
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <Layout>
                <Content className="p-6 bg-gray-100">
                    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
                        <h1 className="text-2xl font-semibold mb-6 text-gray-800">Settings</h1>

                        {/* Profile Details */}
                        <section className="mb-8">
                            <h2 className="text-xl font-medium mb-4 text-gray-700">Profile Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={profileDetails.name}
                                        onChange={handleProfileChange}
                                        className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileDetails.email}
                                        onChange={handleProfileChange}
                                        className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter your email"
                                    />
                                </div>
                                <button
                                    onClick={saveProfile}
                                    className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
                                >
                                    Save Profile
                                </button>
                            </div>
                        </section>

                        {/* Password Update */}
                        <section>
                            <h2 className="text-xl font-medium mb-4 text-gray-700">Change Password</h2>
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
                                    <label className="block text-sm font-medium text-gray-600">New Password</label>
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
        </Layout>
    );
};

export default SettingsPage;
