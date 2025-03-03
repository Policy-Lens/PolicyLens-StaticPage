import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import {
  BarChart3,
  CheckCircle,
  ClipboardList,
  Clock,
  Hourglass,
  MessageCircle,
  CalendarDays,
} from "lucide-react";
import Sidebar from "./Sidebar";

const DashboardPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user, loading, checkLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  // useEffect(() => {
  //     // if (!loading && !user) {
  //     //     navigate("/"); // Redirect to login if not authenticated
  //     // }
  //     const verifyLogin = async () => {
  //         const isLoggedIn = await checkLogin();
  //         if (!isLoggedIn) {
  //             navigate("/"); // Redirect to the dashboard if logged in
  //         }
  //     };

  //     verifyLogin();
  // }, []);

//   if (loading) return <p>Loading...</p>;

  const auditStats = [
    {
      title: "Pending Audits",
      count: 12,
      color: "bg-blue-500",
      icon: <Clock className="text-white w-8 h-8" />,
    },
    {
      title: "Completed Audits",
      count: 45,
      color: "bg-green-500",
      icon: <CheckCircle className="text-white w-8 h-8" />,
    },
    {
      title: "In-Progress Audits",
      count: 8,
      color: "bg-yellow-500",
      icon: <Hourglass className="text-white w-8 h-8" />,
    },
  ];

  const recentActivity = [
    { text: "Audit #1234 completed", time: "2 hours ago" },
    { text: "Audit #5678 is in progress", time: "5 hours ago" },
    { text: "Audit #91011 pending approval", time: "1 day ago" },
  ];

  const messages = [
    {
      sender: "John Doe",
      text: "Audit report needs review.",
      time: "10 mins ago",
    },
    {
      sender: "Alice Smith",
      text: "Meeting scheduled for audit discussion.",
      time: "1 hour ago",
    },
    {
      sender: "Michael Brown",
      text: "Please verify the compliance checklist.",
      time: "3 hours ago",
    },
  ];

  const deadlines = [
    { task: "Audit Report Submission", date: "Feb 10, 2025" },
    { task: "Compliance Review Meeting", date: "Feb 14, 2025" },
    { task: "Final Approval Deadline", date: "Feb 18, 2025" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      <Sidebar onToggle={setIsSidebarCollapsed} />
      <div
        className="transition-all duration-300 p-8"
        style={{ marginLeft: isSidebarCollapsed ? "80px" : "220px", flex: 1 }}
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Dashboard</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {auditStats.map((stat, index) => (
              <div
                key={index}
                className="flex items-center p-5 bg-white rounded-xl shadow-md border border-gray-300 transition-transform transform hover:scale-105"
              >
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-700">
                    {stat.title}
                  </h2>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stat.count}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-white shadow-md rounded-xl border border-gray-300 p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <ClipboardList className="w-6 h-6 text-blue-600 mr-2" /> Audit
              Progress
            </h2>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full text-white text-xs font-semibold flex items-center justify-center"
                style={{ width: "85%" }}
              >
                85% Completed
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div className="bg-white shadow-md rounded-xl border border-gray-300 p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <BarChart3 className="w-6 h-6 text-blue-600 mr-2" /> Recent
                Activity
              </h2>
              <ul className="divide-y divide-gray-200">
                {recentActivity.map((activity, index) => (
                  <li
                    key={index}
                    className="py-3 flex justify-between items-center hover:bg-gray-100 transition rounded-md px-3"
                  >
                    <span className="text-gray-700">{activity.text}</span>
                    <span className="text-sm text-gray-500">
                      {activity.time}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white shadow-md rounded-xl border border-gray-300 p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <MessageCircle className="w-6 h-6 text-blue-600 mr-2" /> Recent
                Messages
              </h2>
              <ul className="divide-y divide-gray-200">
                {messages.map((message, index) => (
                  <li
                    key={index}
                    className="py-3 flex justify-between items-center hover:bg-gray-100 transition rounded-md px-3"
                  >
                    <div>
                      <p className="text-gray-900 font-medium">
                        {message.sender}
                      </p>
                      <p className="text-gray-700 text-sm">{message.text}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {message.time}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-8 bg-white shadow-md rounded-xl border border-gray-300 p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <CalendarDays className="w-6 h-6 text-blue-600 mr-2" /> Upcoming
              Deadlines
            </h2>
            <ul className="divide-y divide-gray-200">
              {deadlines.map((deadline, index) => (
                <li
                  key={index}
                  className="py-3 flex justify-between items-center hover:bg-gray-100 transition rounded-md px-3"
                >
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

export default DashboardPage;
