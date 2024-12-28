import React, { useState, useEffect } from "react";
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

const SideNav = () => {
  const [collapsed, setCollapsed] = useState(false); 
  const [activeItem, setActiveItem] = useState(""); 
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
    <div className="flex h-screen">
      <div
        className={`bg-gray-50 shadow-md h-full transition-all duration-300 ${collapsed ? "w-12" : "w-56"
          }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 cursor-pointer">
          {/* Home button */}
          <Link to="/" className="flex items-center gap-4 cursor-pointer">
            <span className="text-xl text-gray-600">
              <HomeOutlined />
            </span>
            {!collapsed && (
              <span className="text-lg font-semibold text-gray-700">Home</span>
            )}
          </Link>

          {/* Sidebar collapse button */}
          <div className="cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
            <span className="text-xl text-gray-600">
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>
          </div>
        </div>

        <div className="mt-4">
          {/* Sidebar items */}
          <Link to="/projectinfo">
            <div
              className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-all duration-200 rounded-md ${activeItem === "plc"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500"
                }`}
            >
              <span className="text-xl">
                <HomeOutlined />
              </span>
              {!collapsed && (
                <span className="text-sm md:text-base">Project Lifecycle</span>
              )}
            </div>
          </Link>

          {/* New Auditor Workspace Section */}
          <Link to="/projects/auditorsworkspace">
            <div
              className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-all duration-200 rounded-md ${activeItem === "auditorsworkspace"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500"
                }`}
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
              className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-all duration-200 rounded-md ${activeItem === "dashboard"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500"
                }`}
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
              className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-all duration-200 rounded-md ${activeItem === "team"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500"
                }`}
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
              className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-all duration-200 rounded-md ${activeItem === "preview"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500"
                }`}
            >
              <span className="text-xl">
                <EyeOutlined />
              </span>
              {!collapsed && <span className="text-sm md:text-base">Preview</span>}
            </div>
          </Link>

          <Link to="/projects/documents">
            <div
              className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-all duration-200 rounded-md ${activeItem === "documents"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500"
                }`}
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
    </div>

  );
};

export default SideNav;
