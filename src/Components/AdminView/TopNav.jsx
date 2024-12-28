import React, { useState } from "react";
import {
  HomeOutlined,
  DashboardOutlined,
  TeamOutlined,
  EyeOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const TopNavBar = () => {
  const [activeItem, setActiveItem] = useState("plc"); 

  const navItems = [
    { key: "plc", label: "Project Lifecycle (PLC)", icon: <HomeOutlined /> },
    {
      key: "dashboard",
      label: "Project Dashboard",
      icon: <DashboardOutlined />,
    },
    { key: "team", label: "Project Team", icon: <TeamOutlined /> },
    { key: "preview", label: "Preview", icon: <EyeOutlined /> },
    {
      key: "documents",
      label: "Project Documents",
      icon: <FileTextOutlined />,
    },
  ];

  return (
    <div className="w-full bg-gray-50 shadow-md">
      <div className="flex justify-between items-center px-8 py-3">
        {navItems.map((item) => (
          <div
            key={item.key}
            onClick={() => setActiveItem(item.key)} 
            className={`flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer transition-all duration-200 
              ${
                activeItem === item.key
                  ? "bg-gray-100 text-blue-600 font-semibold shadow-sm"
                  : "text-gray-500 hover:text-blue-600 hover:bg-gray-100"
              }`}
          >
            <span className="text-base">{item.icon}</span>
            <span className="text-sm md:text-base">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopNavBar;
