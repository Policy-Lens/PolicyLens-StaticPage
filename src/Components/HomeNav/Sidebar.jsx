import React, { useState } from "react";
import {
    HomeOutlined,
    ProjectOutlined,
    BankOutlined,
    TeamOutlined,
    FileTextOutlined,
    MessageOutlined,
    SettingOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false); // Sidebar collapse state
    const location = useLocation();

    const menuItems = [
        { key: "dashboard", icon: <HomeOutlined />, label: "Dashboard", path: "/" },
        { key: "projects", icon: <ProjectOutlined />, label: "Projects", path: "/projects" },
        { key: "company", icon: <BankOutlined />, label: "Company", path: "/company" },
        { key: "auditors", icon: <TeamOutlined />, label: "Auditors", path: "/auditors" },
        { key: "documents", icon: <FileTextOutlined />, label: "Documents", path: "/documents" },
        { key: "messages", icon: <MessageOutlined />, label: "Messages", path: "/messaging" },
        { key: "settings", icon: <SettingOutlined />, label: "Settings", path: "/settings" },
    ];

    return (
        <div
            className={`h-screen bg-white shadow-md transition-all duration-300`}
            style={{
                width: collapsed ? "80px" : "220px", // Maintain original width when expanded
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: 1000,
            }}
        >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                {/* Home Button */}
                <Link to="/" className="flex items-center gap-4">
                    <span className="text-xl text-gray-600">
                        <HomeOutlined />
                    </span>
                    {!collapsed && <span className="text-lg font-semibold text-gray-800">Home</span>}
                </Link>

                {/* Toggle Button */}
                <div
                    className="cursor-pointer"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <span className="text-xl text-gray-600">
                        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    </span>
                </div>
            </div>

            {/* Menu Items */}
            <ul className="mt-4">
                {menuItems.map((item) => (
                    <li
                        key={item.key}
                        className={`flex items-center px-4 py-3 rounded-md cursor-pointer transition-all duration-200 ${location.pathname === item.path
                                ? "bg-blue-600 text-white"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        <Link to={item.path} className="flex items-center w-full">
                            <span className="text-xl">{item.icon}</span>
                            {!collapsed && (
                                <span className="ml-3 text-sm font-medium">{item.label}</span>
                            )}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
