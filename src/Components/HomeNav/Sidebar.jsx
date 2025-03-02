import { useState, useContext } from "react";
import {
    Home,
    FolderKanban,
    Building,
    Users,
    FileText,
    MessageSquare,
    Settings,
    Menu,
    MenuSquare,
    LogOut,
    UserCircle,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Tooltip } from "antd";
import { AuthContext } from "../../AuthContext"; // Import AuthContext

const Sidebar = ({ onToggle }) => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const { user, handleLogout } = useContext(AuthContext); // Get user role and logout function
    const navigate = useNavigate();
    const menuItems = [
        { key: "dashboard", icon: <Home size={20} />, label: "Dashboard", path: "/dashboard" },
        { key: "projects", icon: <FolderKanban size={20} />, label: "Projects", path: "/projects" },
        { key: "company", icon: <Building size={20} />, label: "Company", path: "/company" },
        { key: "auditors", icon: <Users size={20} />, label: "Auditors", path: "/auditors" },
        { key: "documents", icon: <FileText size={20} />, label: "Documents", path: "/documents" },
        { key: "messages", icon: <MessageSquare size={20} />, label: "Messages", path: "/messaging" },
        { key: "settings", icon: <Settings size={20} />, label: "Settings", path: "/settings" },
    ];

    const handleToggle = () => {
        setCollapsed(!collapsed);
        onToggle(!collapsed);
    };

    return (
        <div style={{ display: "flex" }}>
            {/* Sidebar Container */}
            <div
                className="h-screen bg-white shadow-md flex flex-col justify-between transition-all duration-300"
                style={{
                    width: collapsed ? "80px" : "220px",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    zIndex: 1000,
                }}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                    <Link to="/dashboard" className="flex items-center gap-4">
                        <span className="text-xl text-blue-600">
                            <Home size={22} />
                        </span>
                        {!collapsed && (
                            <span className="text-lg font-semibold text-blue-800">Home</span>
                        )}
                    </Link>
                    <div className="cursor-pointer" onClick={handleToggle}>
                        <span className="text-xl text-blue-600">
                            {collapsed ? <MenuSquare size={22} /> : <Menu size={22} />}
                        </span>
                    </div>
                </div>

                {/* Menu Items */}
                <ul className="mt-4 flex-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const menuItem = (
                            <li
                                key={item.key}
                                className={`flex items-center px-4 py-3 rounded-md cursor-pointer transition-all duration-200 ${isActive ? "bg-blue-600 text-white" : "text-blue-700 hover:bg-blue-50"
                                    }`}
                            >
                                <Link to={item.path} className="flex items-center w-full">
                                    <span className="text-xl">{item.icon}</span>
                                    {!collapsed && (
                                        <span className="ml-3 text-sm font-medium">{item.label}</span>
                                    )}
                                </Link>
                            </li>
                        );

                        return collapsed ? (
                            <Tooltip key={item.key} title={item.label} placement="right">
                                {menuItem}
                            </Tooltip>
                        ) : (
                            menuItem
                        );
                    })}
                </ul>

                {/* User Profile & Logout */}
                <div className="border-t border-gray-200 p-4">
                    {/* User Profile */}
                    <div className="flex items-center gap-3 mb-4">
                        <UserCircle size={36} className="text-blue-600" />
                        {!collapsed && (
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{user?.name || "User"}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                            </div>
                        )}
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={()=>{handleLogout();navigate('/')}}
                        className="flex items-center w-full px-4 py-3 text-red-600 border border-red-600 rounded-md hover:bg-red-600 hover:text-white transition-all duration-200"
                    >
                        <LogOut size={20} />
                        {!collapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
