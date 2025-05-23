import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

const Database = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={setIsSidebarCollapsed}
      />
      <div
        style={{ marginLeft: isSidebarCollapsed ? "80px" : "250px",height:"100vh",overflow:"hidden" }}
        className="flex-1 flex flex-col transition-all duration-300"
      >
          <div className="p-4">
            <h1 className="text-2xl font-semibold mb-2">Database</h1>

            <div className="mb-4">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <Link
                    to="/database/iso4217"
                    className={`${
                      location.pathname === "/database/iso4217"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
                  >
                    ISO4217
                  </Link>
                  <Link
                    to="/database/gics"
                    className={`${
                      location.pathname === "/database/gics"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
                  >
                    GICS
                  </Link>
                </nav>
              </div>
            </div>

            <div style={{height:"80vh"}} className="bg-white rounded-lg shadow">
              <Outlet />
            </div>
          </div>
        </div>
    </div>
  );
};

export default Database;
