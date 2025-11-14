import { useState, useContext } from "react";
import {
  Home,
  FolderKanban,
  Building,
  Users,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCircle,
  Library,
  Database,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import { useNotifications } from "../../Context/NotificationContext";
import React from "react";

const Sidebar = ({ onToggle }) => {
  const [collapsed, setCollapsed] = useState(true);
  const location = useLocation();
  const { user, handleLogout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  let menuItems = [
    {
      key: "dashboard",
      icon: <Home size={20} />,
      label: "Dashboard",
      path: "/home/dashboard",
    },
    {
      key: "projects",
      icon: <FolderKanban size={20} />,
      label: "Projects",
      path: "/home/projects",
    },
    {
      key: "company",
      icon: <Building size={20} />,
      label: "Company",
      path: "/home/company",
      roles: ["Admin", "Super Consultant"],
    },
    {
      key: "my-company",
      icon: <Building size={20} />,
      label: "My Company",
      path: user?.company?.id ? `/home/company/${user.company.id}` : "/home/dashboard",
      roles: ["Company"],
    },
    {
      key: "consultant-team",
      icon: <Users size={20} />,
      label: "Consultant Team",
      path: "/home/consultant-team",
      roles: ["Super Consultant", "Consultant"],
    },
    {
      key: "messages",
      icon: (
        <div className="relative">
          <MessageSquare size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
      ),
      label: "Messages",
      path: "/home/messaging",
    },
    {
      key: "database",
      icon: <Database size={20} />,
      label: "Database",
      path: "/home/database",
    },
    {
      key: "settings",
      icon: <Settings size={20} />,
      label: "Settings",
      path: "/home/settings",
    },
  ];

  // Conditionally filter the menu items based on the user's role
  if (!["Super Consultant", "consultant", "Consultant"].includes(user?.role)) {
    menuItems = menuItems.filter(item => item.key !== 'consultant-team');
  }

  // Add Question Library for Admin users
  if (user?.role === "Admin") {
    const policyLib = {
      key: "questionlibrary",
      icon: <Library size={20} />,
      label: "Question Library",
      path: "/home/questionlibrary",
    };
    menuItems.push(policyLib);
  }

  const handleToggle = () => {
    setCollapsed(!collapsed);
    onToggle(!collapsed);
  };

  // Check if a menu item is active
  const isActive = (path) => {
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
        <Link 
          to="/home/dashboard"
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-md text-white">
            <Home
              size={18}
              className="shrink-0 transition-transform group-hover:scale-110"
            />
          </div>
          {!collapsed && (
            <span className="font-semibold text-base text-gray-800 group-hover:text-blue-700 transition-colors">
              Home
            </span>
          )}
        </Link>

        {/* Collapse Button */}
        <div
          className="cursor-pointer text-gray-500 hover:text-blue-700 transition-colors rounded-full p-1.5 hover:bg-blue-50"
          onClick={handleToggle}
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
        {menuItems.map((item) => {
          if (item.roles && !item.roles.includes(user?.role)) {
            return null;
          }

          const active = isActive(item.path);
          return (
            <Link key={item.key} to={item.path}>
              <div
                className={`flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group
                  ${collapsed ? "justify-center" : "gap-3"} 
                  ${
                    active
                      ? "bg-blue-100 text-blue-800"
                      : "text-gray-700 hover:bg-blue-50"
                  } 
                  active:scale-98 relative overflow-hidden`}
              >
                <div
                  className={`shrink-0 transition-transform duration-200 ${
                    !collapsed && active ? "translate-x-0.5" : ""
                  }`}
                >
                  {React.cloneElement(item.icon, {
                    className: `${
                      active
                        ? "text-blue-700"
                        : "text-gray-500 group-hover:text-blue-600"
                    } transition-colors`,
                  })}
                </div>

                {!collapsed && (
                  <span
                    className={`text-sm font-medium whitespace-nowrap transition-colors ${
                      active
                        ? "text-blue-800"
                        : "text-gray-700 group-hover:text-blue-700"
                    }`}
                  >
                    {item.label}
                  </span>
                )}

                {active && !collapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="border-t border-gray-200 pt-3 pb-2 px-3">
        {/* User Profile */}
        <div
          className={`flex items-center gap-3 mb-3 p-2 rounded-lg bg-gray-50 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 overflow-hidden">
            <UserCircle size={collapsed ? 20 : 24} />
          </div>

          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role || "User"}
              </p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            handleLogout();
            navigate("/");
          }}
          className={`flex items-center w-full rounded-lg hover:bg-red-50 transition-all duration-200 text-red-600 mb-2
            ${
              collapsed
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

export default Sidebar;