import React, { useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
      label: "Project Documents",
      icon: <FileText size={20} />,
      path: `/project/${projectid}/admindocuments`,
    },
  ];

  useEffect(() => {
    getProjectRole(projectid);
    console.log("sidenav");
  }, []);

  return (
    <div
      className={`bg-white border-r border-gray-200 fixed top-0 left-0 h-screen shadow-lg 
        transition-all duration-300 ease-in-out 
        ${collapsed ? "w-16" : "w-56"}
        flex flex-col`}
    >
      {/* Sidebar Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        {/* Home Button */}
        <div
          className="flex items-center gap-3 text-blue-600 cursor-pointer hover:text-blue-800 transition group"
          onClick={() => navigate("/dashboard")}
        >
          <Home
            size={20}
            className="shrink-0 text-black group-hover:text-blue-700 transition"
          />
          {!collapsed && (
            <span className="font-bold text-base whitespace-nowrap tracking-tight text-black">
              Home
            </span>
          )}
        </div>

        {/* Collapse Button */}
        <div
          className="cursor-pointer text-black hover:text-blue-600 transition rounded-full p-2 hover:bg-blue-50"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight size={20} className="shrink-0" />
          ) : (
            <ChevronLeft size={20} className="shrink-0" />
          )}
        </div>
      </div>

      {/* Sidebar Menu */}
      <nav className="mt-4 flex flex-col space-y-2 px-3 overflow-y-auto flex-grow">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group
              ${collapsed ? "justify-center" : "gap-3"} 
              text-black hover:bg-blue-100/50 
              active:scale-95 relative overflow-hidden`}
            onClick={() => navigate(item.path)}
          >
            {/* Subtle background effect */}
            <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>

            <span
              className={`shrink-0 ${
                !collapsed ? "group-hover:translate-x-1 transition" : ""
              }`}
            >
              {React.cloneElement(item.icon, {
                className: "text-black group-hover:text-blue-700 transition",
              })}
            </span>
            {!collapsed && (
              <span className="text-base font-medium whitespace-nowrap text-black group-hover:text-blue-900 transition">
                {item.label}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* User Profile & Project Role */}
      <div className="border-t border-gray-200 px-4 pt-4 pb-2">
        {/* User Profile */}
        <div className="flex items-center gap-3 mb-3">
          <UserCircle
            size={collapsed ? 24 : 32}
            className="text-blue-600 shrink-0"
          />
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          )}
        </div>

        {/* Project Role - Only show if admin */}
        {!collapsed && projectRole === "admin" && (
          <div className="mb-3 px-2">
            <p className="text-xs text-gray-500">Project Role:</p>
            <p className="text-sm font-medium text-blue-600 capitalize">
              {projectRole}
            </p>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={() => {
            handleLogout();
            navigate("/");
          }}
          className={`flex items-center w-full rounded-md hover:bg-red-50 transition-all duration-200 text-red-600 mb-3
            ${
              collapsed
                ? "justify-center p-2"
                : "px-3 py-2 border border-red-200"
            }`}
        >
          <LogOut size={collapsed ? 20 : 18} />
          {!collapsed && (
            <span className="ml-2 text-sm font-medium">Logout</span>
          )}
        </button>
      </div>

      {/* Optional: Footer */}
      {!collapsed && (
        <div className="border-t border-gray-200 p-3 text-center text-xs text-black/70">
          © 2024 Project Management
        </div>
      )}
    </div>
  );
};

export default SideNav;
