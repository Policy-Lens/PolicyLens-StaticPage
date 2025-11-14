import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { BookCheck, Building, Globe, Scale, FileText } from "lucide-react";

const Database = () => {
  const location = useLocation();

  const tabs = [
    { name: "Regulations", href: "/home/database/regulations", icon: Scale },
    { name: "ISO27001", href: "/home/database/iso27001", icon: BookCheck },
    { name: "ISO4217", href: "/home/database/iso4217", icon: Globe },
    { name: "GICS", href: "/home/database/gics", icon: Building },
    { name: "Policy Library Templates", href: "/home/database/policy-library-templates", icon: FileText },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Database</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage and explore regulations and industry standards.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <nav className="flex border-b border-slate-200">
          {tabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.name}
                to={tab.href}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors duration-200
                  ${
                    isActive
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
              >
                <tab.icon
                  size={16}
                  className={`${
                    isActive ? "text-blue-500" : "text-slate-400"
                  }`}
                />
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </nav>

        <div
          style={{ height: "calc(100vh - 200px)" }}
          className="overflow-y-auto"
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Database;
