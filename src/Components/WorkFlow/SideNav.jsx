import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  DashboardOutlined,
  TeamOutlined,
  EyeOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";

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

  useEffect(() => {
    if (collapsed) {
      document.body.classList.add("sidenav-collapsed");
    } else {
      document.body.classList.remove("sidenav-collapsed");
    }

    return () => {
      document.body.classList.remove("sidenav-collapsed");
    };
  }, [collapsed]);

  return (
    <div
      className={`bg-gray-50 shadow-md fixed top-0 left-0 h-screen transition-all duration-300 ${collapsed ? "w-16" : "w-56"
        }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-2 py-4 border-b border-gray-200">
        {/* Home Button */}
        <Link to="/" className="flex items-center gap-4">
          <span className="text-xl text-gray-600">
            <HomeOutlined />
          </span>
          {!collapsed && (
            <span className="text-lg font-semibold text-gray-700">Home</span>
          )}
        </Link>

        {/* Collapse Button */}
        <div
          className="cursor-pointer text-xl text-gray-600"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      </div>

      {/* Sidebar Menu */}
      <div className="mt-4 flex flex-col">
        <Link to="/projectinfo">
          <div
            className={`flex items-center px-2 py-3 cursor-pointer transition-all duration-200 rounded-md ${activeItem === "plc"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500"
              } ${collapsed ? "justify-center" : "gap-4"}`}
          >
            <span className="text-xl">
              <HomeOutlined />
            </span>
            {!collapsed && (
              <span className="text-sm md:text-base">Project Lifecycle</span>
            )}
          </div>
        </Link>

        <Link to="/projects/auditorsworkspace">
          <div
            className={`flex items-center px-2 py-3 cursor-pointer transition-all duration-200 rounded-md ${activeItem === "auditorsworkspace"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500"
              } ${collapsed ? "justify-center" : "gap-4"}`}
          >
            <span className="text-xl">
              <TeamOutlined />
            </span>
            {!collapsed && (
              <span className="text-sm md:text-base">Auditor Workspace</span>
            )}
          </div>
        </Link>

        <Link to="/projects/dashboard">
          <div
            className={`flex items-center px-2 py-3 cursor-pointer transition-all duration-200 rounded-md ${activeItem === "dashboard"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500"
              } ${collapsed ? "justify-center" : "gap-4"}`}
          >
            <span className="text-xl">
              <DashboardOutlined />
            </span>
            {!collapsed && (
              <span className="text-sm md:text-base">Project Dashboard</span>
            )}
          </div>
        </Link>

        <Link to="/projects/team">
          <div
            className={`flex items-center px-2 py-3 cursor-pointer transition-all duration-200 rounded-md ${activeItem === "team"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500"
              } ${collapsed ? "justify-center" : "gap-4"}`}
          >
            <span className="text-xl">
              <TeamOutlined />
            </span>
            {!collapsed && (
              <span className="text-sm md:text-base">Project Team</span>
            )}
          </div>
        </Link>

        <Link to="/projects/preview">
          <div
            className={`flex items-center px-2 py-3 cursor-pointer transition-all duration-200 rounded-md ${activeItem === "preview"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500"
              } ${collapsed ? "justify-center" : "gap-4"}`}
          >
            <span className="text-xl">
              <EyeOutlined />
            </span>
            {!collapsed && (
              <span className="text-sm md:text-base">Preview</span>
            )}
          </div>
        </Link>

        <Link to="/projects/documents">
          <div
            className={`flex items-center px-2 py-3 cursor-pointer transition-all duration-200 rounded-md ${activeItem === "documents"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500"
              } ${collapsed ? "justify-center" : "gap-4"}`}
          >
            <span className="text-xl">
              <FileTextOutlined />
            </span>
            {!collapsed && (
              <span className="text-sm md:text-base">Project Documents</span>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default SideNav;
