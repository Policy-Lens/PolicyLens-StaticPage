import SideNav from "../WorkFlow/SideNav";
import React, { useContext, useEffect, useState } from "react";
import { Outlet, useNavigate, useParams, useLocation } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
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
} from "lucide-react";

const AdminLayout = () => {
  const { checkLogin } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const navigate = useNavigate();
  const { projectid } = useParams();
  const location = useLocation();

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
    "Ask for Help"
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
        className={`flex-1 flex flex-col transition-all duration-300 overflow-auto bg-gray-100 p-0 ${collapsed ? "ml-16" : "ml-56"
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
                    ${activeTab === tab
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
      </div>
    </div>
  );
};

export default AdminLayout;
