import React from "react";
import SideNav from "../WorkFlow/SideNav"; // Assuming SideNav is in the same directory

const AdminDashboard = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <SideNav />

      {/* Main Content Area */}
      <div className="flex-1 p-6 bg-gray-100">
        {/* Dashboard Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stat Card 1 */}
          <div className="bg-gray-50 shadow-md rounded-lg p-6 border border-gray-200">
            <h2 className="text-gray-600 font-medium">Total Users</h2>
            <p className="text-3xl font-bold text-gray-800 mt-2">1,234</p>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-gray-50 shadow-md rounded-lg p-6 border border-gray-200">
            <h2 className="text-gray-600 font-medium">Active Projects</h2>
            <p className="text-3xl font-bold text-gray-800 mt-2">56</p>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-gray-50 shadow-md rounded-lg p-6 border border-gray-200">
            <h2 className="text-gray-600 font-medium">Pending Tasks</h2>
            <p className="text-3xl font-bold text-gray-800 mt-2">8</p>
          </div>

          {/* Stat Card 4 */}
          <div className="bg-gray-50 shadow-md rounded-lg p-6 border border-gray-200">
            <h2 className="text-gray-600 font-medium">Revenue</h2>
            <p className="text-3xl font-bold text-gray-800 mt-2">$12,345</p>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition">
              Add User
            </button>
            <button className="bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition">
              Create Project
            </button>
            <button className="bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition">
              Assign Task
            </button>
            <button className="bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition">
              Generate Report
            </button>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Activity</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="text-gray-600 font-medium p-2">Activity</th>
                <th className="text-gray-600 font-medium p-2">User</th>
                <th className="text-gray-600 font-medium p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2">Created a new project</td>
                <td className="p-2">John Doe</td>
                <td className="p-2">Dec 20, 2024</td>
              </tr>
              <tr className="border-t">
                <td className="p-2">Completed a task</td>
                <td className="p-2">Jane Smith</td>
                <td className="p-2">Dec 21, 2024</td>
              </tr>
              <tr className="border-t">
                <td className="p-2">Added a new user</td>
                <td className="p-2">Alice Brown</td>
                <td className="p-2">Dec 22, 2024</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
