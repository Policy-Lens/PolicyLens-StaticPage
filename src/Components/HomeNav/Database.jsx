import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const Database = () => {
  const location = useLocation();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-2">Database</h1>

      <div className="mb-4">
        <nav className="-mb-px flex space-x-8">
          <Link
            to="/home/database/regulations"
            className={`${
              location.pathname === "/home/database/regulations"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
          >
            Regulations
          </Link>
          <Link
            to="/home/database/iso27001"
            className={`${
              location.pathname === "/home/database/iso27001"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
          >
            ISO27001
          </Link>
          <Link
            to="/home/database/iso4217"
            className={`${
              location.pathname === "/home/database/iso4217"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
          >
            ISO4217
          </Link>
          <Link
            to="/home/database/gics"
            className={`${
              location.pathname === "/home/database/gics"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
          >
            GICS
          </Link>
        </nav>
      </div>

      <div style={{ height: "80vh" }} className="bg-white rounded-lg shadow">
        <Outlet />
      </div>
    </div>
  );
};

export default Database;
