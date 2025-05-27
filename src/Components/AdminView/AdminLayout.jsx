import SideNav from "../WorkFlow/SideNav";
import React, { useContext, useEffect, useState, useRef } from "react";
import { Outlet, useNavigate, useParams, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { AuthContext } from "../../AuthContext";
import { BASE_URL_WS } from "../../utils/api"; // Adjust the import path as necessary
import ChatRoom from "./ProjectTabs/ChatRoom";
import {
  Calendar,
  HelpCircle,
  Ticket,
  FileText,
  Shield,
  CheckCircle,
  Database,
  Library,
  FilesIcon,
  Files,
  MessageSquare,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AdminLayout = () => {
  const { checkLogin, user } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatTicketId, setChatTicketId] = useState(null);
  const navigate = useNavigate();
  const { projectid } = useParams();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const wsRef = useRef(null);

  // Function to connect to WebSocket
  const connectWebSocket = () => {
    const accessToken = Cookies.get("accessToken");

    if (!accessToken || !projectid) return;

    const ws = new WebSocket(
      `${BASE_URL_WS}/ws/notifications/${projectid}/?token=${accessToken}`
    );

    ws.onopen = () => {
      console.log("WebSocket Connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "notification") {
        handleNewNotification(data.data);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket Disconnected");
      // Try to reconnect after 5 seconds
      setTimeout(connectWebSocket, 5000);
    };

    wsRef.current = ws;
  };

  // Handle new notification
  const handleNewNotification = (notificationData) => {
    const newNotification = {
      id: Date.now(),
      ...notificationData,
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Remove notification after 5 seconds
    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((n) => n.id !== newNotification.id)
      );
    }, 5000);
  };

  // Updated handleNotificationClick
  const handleNotificationClick = (ticketId) => {
    setChatTicketId(ticketId);
    setIsChatModalOpen(true);
  };

  // Connect WebSocket when component mounts or project changes
  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [projectid]);

  // Check if current path is the Project Lifecycle page or any top nav tab page
  const isTopNavVisible =
    location.pathname === `/project/${projectid}/` ||
    location.pathname === `/project/${projectid}` ||
    location.pathname.includes("/questionbank") ||
    location.pathname.includes("/calender") ||
    location.pathname.includes("/myevidences") ||
    location.pathname.includes("/askforhelp") ||
    location.pathname.includes("/myreports") ||
    location.pathname.includes("/policylibrary");

  // Define tabs with their icons
  const tabIcons = {
    Workflow: <CheckCircle size={16} />,
    Calendar: <Calendar size={16} />,
    AskforHelp: <HelpCircle size={16} />,
    QuestionBank: <FileText size={16} />,
    MyEvidences: <Database size={16} />,
    MyReports: <Files size={16} />,
    PolicyLibrary: <Library size={16} />,
  };

  const tabs = [
    "Workflow",
    "Question Bank",
    "My Evidences",
    "My Reports",
    "Policy Library",
    "Calendar",
    "Ask for Help",
  ];

  useEffect(() => {
    // Set active tab based on current path
    const path = window.location.pathname;
    if (path.includes("questionbank")) setActiveTab("Question Bank");
    else if (path.includes("calender")) setActiveTab("Calendar");
    else if (path.includes("myevidences")) setActiveTab("My Evidences");
    else if (path.includes("askforhelp")) setActiveTab("Ask for Help");
    else if (path.includes("myreports")) setActiveTab("My Reports");
    else if (path.includes("policylibrary")) setActiveTab("Policy Library");
    else setActiveTab("Workflow");
  }, [window.location.pathname]);

  useEffect(() => {
    const verifyLogin = async () => {
      const isLoggedIn = await checkLogin();
      if (!isLoggedIn) {
        navigate("/");
      }
    };

    verifyLogin();
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);

    // Navigate to specific pages for each tab
    if (tab === "Question Bank") {
      navigate(`/project/${projectid}/questionbank`);
    } else if (tab === "Calendar") {
      navigate(`/project/${projectid}/calender`);
    } else if (tab === "My Evidences") {
      navigate(`/project/${projectid}/myevidences`);
    } else if (tab === "Ask for Help") {
      navigate(`/project/${projectid}/askforhelp`);
    } else if (tab === "My Reports") {
      navigate(`/project/${projectid}/myreports`);
    } else if (tab === "Policy Library") {
      navigate(`/project/${projectid}/policylibrary`);
    } else if (tab === "Workflow") {
      navigate(`/project/${projectid}`);
    }
    // Add other tab routes as needed
  };

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <SideNav collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 overflow-auto bg-gray-100 p-0 ${
          collapsed ? "ml-16" : "ml-56"
        }`}
      >
        {/* Project Tabs Navigation - Show on Project Lifecycle and all top nav tab pages */}
        {isTopNavVisible && (
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="flex justify-start space-x-4 px-6 py-3">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 
                    ${
                      activeTab === tab
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                  {tabIcons[tab.replaceAll(" ", "")] || null}
                  <span>{tab}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Outlet for rendered content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>

        {/* Notifications */}
        <div className="fixed bottom-4 right-4 space-y-2 z-50">
          <AnimatePresence>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 50, x: 0 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{
                  opacity: 0,
                  x: 500,
                  transition: {
                    duration: 0.5,
                    ease: [0.32, 0, 0.67, 0], // Easing function for smooth acceleration
                  },
                }}
                className="relative"
              >
                {" "}
                <motion.div
                  whileHover={{ scale: 1.02, x: -10 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    handleNotificationClick(notification.ticket_id)
                  }
                  className="bg-white rounded-lg shadow-lg p-4 max-w-md cursor-pointer hover:bg-gray-50 transition-colors duration-200 flex items-start"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare size={16} className="text-blue-500" />
                      <h4 className="font-medium text-gray-900">
                        New message in ticket #{notification.ticket_id}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      By {notification.sender.name}
                    </p>
                    <p className="text-sm text-gray-800">
                      {notification.content}
                    </p>
                    <p className="text-sm text-blue-400 underline">
                      click to open chat
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setNotifications((prev) =>
                        prev.filter((n) => n.id !== notification.id)
                      );
                    }}
                    className="ml-4 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </motion.button>
                </motion.div>
                {/* Loading bar */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 rounded-b-lg overflow-hidden">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="h-full bg-blue-500"
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Chat Modal */}
        {isChatModalOpen && (
          <ChatRoom
            ticket_id={chatTicketId}
            onClose={() => setIsChatModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminLayout;
