import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  Users,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const SideNav = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const {projectid} = useParams()
  return (
    <div
      className={`bg-white shadow-lg fixed top-0 left-0 h-screen transition-all duration-300 border-r ${collapsed ? "w-16" : "w-56"
        }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b">
        {/* Home Button */}
        <div
          className="flex items-center gap-3 text-blue-600 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <Home size={20} />
          {!collapsed && <span className="font-semibold text-base">Home</span>}
        </div>

        {/* Collapse Button */}
        <div
          className="cursor-pointer text-blue-600"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </div>
      </div>

      {/* Sidebar Menu */}
      <div className="mt-6 flex flex-col">
        <div
          className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${collapsed ? "justify-center" : "gap-3"
            }`}
          onClick={() => navigate(`/project/${projectid}/`)}
        >
          <LayoutDashboard size={22} />
          {!collapsed && <span className="text-base font-normal">Project Lifecycle</span>}
        </div>

        <div
          className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${collapsed ? "justify-center" : "gap-3"
            }`}
          onClick={() => navigate(`/project/${projectid}/auditorworkspace`)}
        >
          <Users size={22} />
          {!collapsed && <span className="text-base font-normal">Auditor Workspace</span>}
        </div>

        <div
          className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${collapsed ? "justify-center" : "gap-3"
            }`}
          onClick={() => navigate(`/project/${projectid}/admindashboard`)}
        >
          <LayoutDashboard size={22} />
          {!collapsed && <span className="text-base font-normal">Project Dashboard</span>}
        </div>

        <div
          className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${collapsed ? "justify-center" : "gap-3"
            }`}
          onClick={() => navigate(`/project/${projectid}/projectteam`)}
        >
          <Users size={22} />
          {!collapsed && <span className="text-base font-normal">Project Team</span>}
        </div>

        <div
          className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${collapsed ? "justify-center" : "gap-3"
            }`}
          onClick={() => navigate(`/project/${projectid}/adminpreview`)}
        >
          <Eye size={22} />
          {!collapsed && <span className="text-base font-normal">Preview</span>}
        </div>

        <div
          className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${collapsed ? "justify-center" : "gap-3"
            }`}
          onClick={() => navigate(`/project/${projectid}/admindocuments`)}
        >
          <FileText size={22} />
          {!collapsed && <span className="text-base font-normal">Project Documents</span>}
        </div>
      </div>
    </div>
  );
};

export default SideNav;
