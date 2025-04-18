import React, { useContext, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  Users,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCircle,
} from "lucide-react";
import { ProjectContext } from "../../Context/ProjectContext";
import { AuthContext } from "../../AuthContext";

const SideNav = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectid } = useParams();
  const { projectRole, getProjectRole } = useContext(ProjectContext);
  const { user, handleLogout } = useContext(AuthContext);

  const menuItems = [
    {
      label: "Project Lifecycle",
      icon: <LayoutDashboard size={20} />,
      path: `/project/${projectid}/`,
    },
    {
      label: "Auditor Workspace",
      icon: <Users size={20} />,
      path: `/project/${projectid}/auditorworkspace`,
    },
    {
      label: "Project Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: `/project/${projectid}/admindashboard`,
    },
    {
      label: "Project Team",
      icon: <Users size={20} />,
      path: `/project/${projectid}/projectteam`,
    },
    {
      label: "Preview",
      icon: <Eye size={20} />,
      path: `/project/${projectid}/adminpreview`,
    },
    {
      label: "Internal Audit Process",
      icon: <FileText size={20} />,
      path: `/project/${projectid}/internalauditprocess`,
    },
  ];

  useEffect(() => {
    getProjectRole(projectid);
  }, []);

  // Check if a menu item is active
  const isActive = (path) => {
    // Special case for Project Lifecycle
    if (path === `/project/${projectid}/`) {
      return location.pathname === `/project/${projectid}/` ||
        location.pathname === `/project/${projectid}` ||
        // Also match top nav tabs pages
        location.pathname.includes('/questionbank') ||
        location.pathname.includes('/calender') ||
        location.pathname.includes('/myevidences') ||
        location.pathname.includes('/askforhelp') ||
        location.pathname.includes('/myreports');
    }

    // For other menu items, use exact match
    return location.pathname === path;
  };

  return (
    <div
      className={`bg-white border-r border-gray-200 fixed top-0 left-0 h-screen 
        transition-all duration-300 ease-in-out z-30
        ${collapsed ? "w-16" : "w-56"}
        flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.06)]`}
    >
      {/* Sidebar Header */}
      <div className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 py-4 flex items-center justify-between px-4">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/dashboard")}
        >
          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-md text-white">
            <Home size={18} className="shrink-0 transition-transform group-hover:scale-110" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-base text-gray-800 group-hover:text-blue-700 transition-colors">
              Home
            </span>
          )}
        </div>

        {/* Collapse Button */}
        <div
          className="cursor-pointer text-gray-500 hover:text-blue-700 transition-colors rounded-full p-1.5 hover:bg-blue-50"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight size={18} className="shrink-0" />
          ) : (
            <ChevronLeft size={18} className="shrink-0" />
          )}
        </div>
      </div>

      {/* Sidebar Menu */}
      <nav className="mt-2 flex flex-col space-y-1 px-2 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {menuItems.map((item, index) => {
          const active = isActive(item.path);
          return (
            <div
              key={index}
              className={`flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group
                ${collapsed ? "justify-center" : "gap-3"} 
                ${active
                  ? "bg-blue-100 text-blue-800"
                  : "text-gray-700 hover:bg-blue-50"} 
                active:scale-98 relative overflow-hidden`}
              onClick={() => navigate(item.path)}
            >
              <div className={`shrink-0 transition-transform duration-200 ${!collapsed && active ? "translate-x-0.5" : ""}`}>
                {React.cloneElement(item.icon, {
                  className: `${active ? "text-blue-700" : "text-gray-500 group-hover:text-blue-600"} transition-colors`,
                })}
              </div>

              {!collapsed && (
                <span className={`text-sm font-medium whitespace-nowrap transition-colors ${active ? "text-blue-800" : "text-gray-700 group-hover:text-blue-700"}`}>
                  {item.label}
                </span>
              )}

              {active && !collapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
              )}
            </div>
          );
        })}
      </nav>

      {/* User Profile & Project Role */}
      <div className="border-t border-gray-200 pt-3 pb-2 px-3">
        {/* User Profile */}
        <div className={`flex items-center gap-3 mb-3 p-2 rounded-lg bg-gray-50 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 overflow-hidden">
            <UserCircle size={collapsed ? 20 : 24} />
          </div>

          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {user?.name || "consultant 1"}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role || "Consultant"}
              </p>
            </div>
          )}
        </div>

        {/* Project Role - Only show if admin */}
        {!collapsed && projectRole === "admin" && (
          <div className="mb-3 px-2 py-1 bg-blue-50 rounded-md">
            <p className="text-xs text-gray-500">Project Role:</p>
            <p className="text-sm font-medium text-blue-700 capitalize">
              {projectRole || "Admin"}
            </p>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={() => {
            handleLogout();
            navigate("/");
          }}
          className={`flex items-center w-full rounded-lg hover:bg-red-50 transition-all duration-200 text-red-600 mb-2
            ${collapsed
              ? "justify-center p-2"
              : "px-3 py-2 border border-red-200 hover:border-red-300"
            }`}
        >
          <LogOut size={collapsed ? 20 : 18} className="shrink-0" />
          {!collapsed && (
            <span className="ml-2 text-sm font-medium">Logout</span>
          )}
        </button>
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-gray-200 p-2 text-center text-xs text-gray-500">
          © 2024 Project Management
        </div>
      )}
    </div>
  );
};

export default SideNav;
