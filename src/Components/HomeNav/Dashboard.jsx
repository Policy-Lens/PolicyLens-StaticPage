import { useState } from "react";
import Sidebar from "./Sidebar";

const DashboardPage = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const auditStats = {
        pending: 12,
        completed: 45,
        inProgress: 8,
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar onToggle={setIsSidebarCollapsed} />

            {/* Main Content */}
            <div
                className={`transition-all duration-300`}
                style={{
                    marginLeft: isSidebarCollapsed ? "80px" : "220px", // Adjust margin based on sidebar state
                    flex: 1,
                }}
            >
                <div className="max-w-6xl mx-auto p-6">
                    <h1 className="text-3xl font-semibold text-gray-800 mb-6">Dashboard</h1>

                    {/* Audit Stats Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Pending Audits */}
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h2 className="text-xl font-medium text-gray-700">Pending Audits</h2>
                            <p className="text-4xl font-bold text-blue-500 mt-4">
                                {auditStats.pending}
                            </p>
                        </div>

                        {/* Completed Audits */}
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h2 className="text-xl font-medium text-gray-700">Completed Audits</h2>
                            <p className="text-4xl font-bold text-green-500 mt-4">
                                {auditStats.completed}
                            </p>
                        </div>

                        {/* In-Progress Audits */}
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h2 className="text-xl font-medium text-gray-700">In-Progress Audits</h2>
                            <p className="text-4xl font-bold text-yellow-500 mt-4">
                                {auditStats.inProgress}
                            </p>
                        </div>
                    </div>

                    {/* Recent Activity Section */}
                    <div className="mt-10">
                        <h2 className="text-2xl font-medium text-gray-800 mb-4">Recent Activity</h2>
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <ul className="space-y-4">
                                <li className="flex items-center justify-between">
                                    <span className="text-gray-700">Audit #1234 completed</span>
                                    <span className="text-sm text-gray-500">2 hours ago</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className="text-gray-700">Audit #5678 is in progress</span>
                                    <span className="text-sm text-gray-500">5 hours ago</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className="text-gray-700">Audit #91011 pending approval</span>
                                    <span className="text-sm text-gray-500">1 day ago</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
