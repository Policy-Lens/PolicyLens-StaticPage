import React, { useState } from "react";
import Sidebar from "./Sidebar";

const MessagingPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar onToggle={setIsSidebarCollapsed} />

      {/* Messaging Content */}
      <div
        className="p-6 transition-all duration-300"
        style={{ marginLeft: isSidebarCollapsed ? "80px" : "240px" }}
      >
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Messages</h1>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-gray-600">You have no new messages.</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-500 transition">
            Create New Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;
