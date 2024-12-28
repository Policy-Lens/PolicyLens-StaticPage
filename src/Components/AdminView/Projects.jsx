import React, { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../HomeNav/Sidebar"; // Adjust the path based on your folder structure

const Projects = () => {
  const [activeItem, setActiveItem] = useState("projects"); // Default active item set to "projects"

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
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      <div className="ml-52 w-full p-8">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {activeItem.charAt(0).toUpperCase() + activeItem.slice(1)}
          </h1>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700">
            + Create Project
          </button>
        </div>

        {/* Cards Section */}
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
                  <span className="font-semibold text-gray-700">
                    Created Date:
                  </span>{" "}
                  {card.createdDate}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  <span className="font-semibold text-gray-700">
                    Audit Status:
                  </span>{" "}
                  {card.auditStatus}
                </p>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm font-medium">
                  Status:{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-white ${card.status === "Reviewed"
                        ? "bg-blue-500"
                        : card.status === "Needs Revision"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                  >
                    {card.status}
                  </span>
                </p>
                {card.auditStatus === "Not Assigned" && (
                  <button className="text-purple-600 border border-purple-600 px-4 py-1 rounded-lg text-sm font-medium hover:bg-purple-600 hover:text-white">
                    Assign Auditor
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
