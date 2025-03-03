import { useState } from "react";
import { BarChart3, CheckCircle, ClipboardList, Clock, MessageCircle, CalendarDays } from "lucide-react";
import SideNav from "../WorkFlow/SideNav";

const AdminDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const statsData = [
    { title: "New Users", count: 124, color: "bg-blue-500", icon: <CheckCircle className="text-white w-10 h-10" /> },
    { title: "Total Tasks", count: 120, color: "bg-green-500", icon: <ClipboardList className="text-white w-10 h-10" /> },
    { title: "Pending Tasks", count: 24, color: "bg-yellow-500", icon: <Clock className="text-white w-10 h-10" /> },
  ];

  const activities = [
    { text: "User #1234 registered", time: "1 hour ago" },
    { text: "Task #5678 is pending", time: "3 hours ago" },
    { text: "Project Milestone completed", time: "1 day ago" },
  ];

  const messages = [
    { sender: "John Doe", text: "Can you update the report?", time: "2 mins ago" },
    { sender: "Alice Smith", text: "Meeting at 3 PM confirmed.", time: "30 mins ago" },
    { sender: "Michael Brown", text: "Please check the new requirements.", time: "1 hour ago" },
  ];

  const deadlines = [
    { task: "Submit Quarterly Report", date: "Feb 10, 2025" },
    { task: "Client Proposal Submission", date: "Feb 12, 2025" },
    { task: "Code Review for Sprint 5", date: "Feb 15, 2025" },
  ];

  return (
    <div className="flex min-h-screen bg-blue-50 text-gray-800">
      {/* Main Content */}
      <div
        className="transition-all duration-300 p-8"
        style={{
          marginLeft: isSidebarCollapsed ? "80px" : "220px",
          flex: 1,
        }}
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold text-blue-900 mb-6">Admin Dashboard</h1>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {statsData.map((stat, index) => (
              <div key={index} className="flex items-center p-6 bg-white rounded-2xl shadow-lg border border-gray-200 transition transform hover:scale-105">
                <div className={`p-4 rounded-full ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-700">{stat.title}</h2>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{stat.count}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Task Progress */}
          <div className="mt-8 bg-white shadow-lg rounded-2xl border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <ClipboardList className="w-6 h-6 text-blue-600 mr-2" />
              Task Progress
            </h2>
            <div className="w-full bg-gray-200 rounded-full h-5">
              <div className="bg-green-500 h-5 rounded-full text-white text-sm font-semibold flex items-center justify-center" style={{ width: "80%" }}>
                80% Completed
              </div>
            </div>
          </div>

          {/* Recent Activity and Messages */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Recent Activity */}
            <div className="bg-white shadow-lg rounded-2xl border border-gray-200 p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <BarChart3 className="w-6 h-6 text-blue-600 mr-2" />
                Recent Activity
              </h2>
              <ul className="divide-y divide-gray-200">
                {activities.map((activity, index) => (
                  <li key={index} className="py-4 flex justify-between items-center hover:bg-blue-100 transition rounded-lg px-3">
                    <span className="text-gray-700">{activity.text}</span>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent Messages */}
            <div className="bg-white shadow-lg rounded-2xl border border-gray-200 p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <MessageCircle className="w-6 h-6 text-blue-600 mr-2" />
                Recent Messages
              </h2>
              <ul className="divide-y divide-gray-200">
                {messages.map((message, index) => (
                  <li key={index} className="py-4 flex justify-between items-center hover:bg-blue-100 transition rounded-lg px-3">
                    <div>
                      <p className="text-gray-900 font-medium">{message.sender}</p>
                      <p className="text-gray-700 text-sm">{message.text}</p>
                    </div>
                    <span className="text-sm text-gray-500">{message.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="mt-8 bg-white shadow-lg rounded-2xl border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <CalendarDays className="w-6 h-6 text-blue-600 mr-2" />
              Upcoming Deadlines
            </h2>
            <ul className="divide-y divide-gray-200">
              {deadlines.map((deadline, index) => (
                <li key={index} className="py-4 flex justify-between items-center hover:bg-blue-100 transition rounded-lg px-3">
                  <span className="text-gray-700">{deadline.task}</span>
                  <span className="text-sm text-gray-500">{deadline.date}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
