import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
  const [activeItem, setActiveItem] = React.useState("");
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("projects/dashboard")) {
      setActiveItem("dashboard");
    } else if (path.includes("projects/team")) {
      setActiveItem("team");
    } else if (path.includes("projects/preview")) {
      setActiveItem("preview");
    } else if (path.includes("projects/documents")) {
      setActiveItem("documents");
    } else if (path.includes("projects/auditorsworkspace")) {
      setActiveItem("auditorsworkspace");
    } else {
      setActiveItem("plc");
    }
  }, [location.pathname]);

  return (
    <div
      className={`bg-white shadow-lg fixed top-0 left-0 h-screen transition-all duration-300 border-r ${collapsed ? "w-16" : "w-56"
        }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b">
        {/* Home Button */}
        <Link to="/dashboard" className="flex items-center gap-3 text-blue-600">
          <Home size={20} />
          {!collapsed && <span className="font-semibold text-base">Home</span>}
        </Link>

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
        <Link to="/projectinfo">
          <div
            className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${activeItem === "plc"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              } ${collapsed ? "justify-center" : "gap-3"}`}
          >
            <LayoutDashboard size={22} />
            {!collapsed && <span className="text-base font-normal">Project Lifecycle</span>}
          </div>
        </Link>

        <Link to="/projects/auditorsworkspace">
          <div
            className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${activeItem === "auditorsworkspace"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              } ${collapsed ? "justify-center" : "gap-3"}`}
          >
            <Users size={22} />
            {!collapsed && <span className="text-base font-normal">Auditor Workspace</span>}
          </div>
        </Link>

        <Link to="/projects/dashboard">
          <div
            className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${activeItem === "dashboard"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              } ${collapsed ? "justify-center" : "gap-3"}`}
          >
            <LayoutDashboard size={22} />
            {!collapsed && <span className="text-base font-normal">Project Dashboard</span>}
          </div>
        </Link>

        <Link to="/projects/team">
          <div
            className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${activeItem === "team"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              } ${collapsed ? "justify-center" : "gap-3"}`}
          >
            <Users size={22} />
            {!collapsed && <span className="text-base font-normal">Project Team</span>}
          </div>
        </Link>

        <Link to="/projects/preview">
          <div
            className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${activeItem === "preview"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              } ${collapsed ? "justify-center" : "gap-3"}`}
          >
            <Eye size={22} />
            {!collapsed && <span className="text-base font-normal">Preview</span>}
          </div>
        </Link>

        <Link to="/projects/documents">
          <div
            className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${activeItem === "documents"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              } ${collapsed ? "justify-center" : "gap-3"}`}
          >
            <FileText size={22} />
            {!collapsed && <span className="text-base font-normal">Project Documents</span>}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default SideNav;
