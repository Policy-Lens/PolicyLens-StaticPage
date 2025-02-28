import React, { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../HomeNav/Sidebar";
import { useContext } from "react";
import { AuthContext } from "../../AuthContext";

const Projects = () => {
  const [activeItem, setActiveItem] = useState("projects");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("Company A");

  const companies = ["Company A", "Company B", "Company C", "Company D"];

  const handleCreateProject = () => {
    alert("Company created");
    setIsModalOpen(false);
  };

  const cards = [
    {
      companyName: "Company A",
      projectName: "Project A",
      createdDate: "25/11/2024",
      auditStatus: "Assigned",
      status: "Reviewed",
      logo: "https://via.placeholder.com/100x100.png?text=Logo+A",
      auditor: "John Smith",
    },
    {
      companyName: "Company B",
      projectName: "Project B",
      createdDate: "20/11/2024",
      auditStatus: "Not Assigned",
      status: "Needs Revision",
      logo: "https://via.placeholder.com/100x100.png?text=Logo+B",
      auditor: null,
    },
    {
      companyName: "Company C",
      projectName: "Project C",
      createdDate: "15/11/2024",
      auditStatus: "Assigned",
      status: "Approved",
      logo: "https://via.placeholder.com/100x100.png?text=Logo+C",
      auditor: "Emily Davis",
    },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar onToggle={setIsSidebarCollapsed} />
      <div
        className={`flex-1 p-0 bg-gray-100 transition-all ${isSidebarCollapsed ? "ml-16" : "ml-[220px]"}`}
        style={{ width: isSidebarCollapsed ? "calc(100% - 4rem)" : "calc(100% - 15rem)" }}
      >
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              {activeItem.charAt(0).toUpperCase() + activeItem.slice(1)}
            </h1>
            {user?.role === "consultant" && (
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
                onClick={() => setIsModalOpen(true)}
              >
                + Create Project
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {cards.map((card, index) => (
              <Link
                to="/projectinfo"
                key={index}
                className="bg-white shadow-md border border-gray-300 rounded-lg p-4 hover:shadow-lg"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <img
                      src={card.logo}
                      alt={`${card.companyName} Logo`}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {card.companyName}
                      </h2>
                      <h3 className="text-sm text-gray-500">
                        {card.projectName}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-700">Created Date:</span> {card.createdDate}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="font-semibold text-gray-700">Audit Status:</span> {card.auditStatus}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Create Project</h2>
            <input
              type="text"
              placeholder="Project Name"
              className="w-full border border-gray-300 p-2 rounded-md mb-4"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <select
              className="w-full border border-gray-300 p-2 rounded-md mb-4"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              {companies.map((company, index) => (
                <option key={index} value={company}>{company}</option>
              ))}
            </select>
            <button className="w-full bg-blue-600 text-white py-2 rounded-md mb-2" onClick={handleCreateProject}>Create</button>
            <button className="w-full bg-gray-400 text-white py-2 rounded-md" onClick={() => setIsModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
