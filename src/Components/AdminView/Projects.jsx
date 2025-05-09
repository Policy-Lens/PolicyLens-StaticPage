import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../HomeNav/Sidebar";
import { apiRequest } from "../../utils/api";
import { AuthContext } from "../../AuthContext";
import { ProjectContext } from "../../Context/ProjectContext";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const Projects = () => {
  const [activeItem, setActiveItem] = useState("projects");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [loading, setLoading] = useState(true);

  const [companies, setCompanies] = useState([]);

  const { setProject } = useContext(ProjectContext);

  const handleCreateProject = async () => {
    const res = await apiRequest(
      "POST",
      "/api/project/create/",
      { name: projectName, company_id: selectedCompany },
      true
    );
    if (res.status == 201) {
      console.log(res.data.message);
      setIsModalOpen(false);
    } else {
      setIsModalOpen(false);
      alert("Something went wrong");
      return;
    }

    getProjects();
  };

  const [cards, setCards] = useState([]);
  const navigate = useNavigate();
  const { checkLogin, user } = useContext(AuthContext);
  const getProjects = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("GET", "/api/project/list/", null, true);
      console.log(res);
      if (res.status == 200) {
        setCards(res.data);
      }
    } catch (error) {
      if (error.message === "Session expired. Please log in again.") {
        navigate("/");
      }
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getCompanies = async () => {
    const res = await apiRequest("GET", "/api/auth/companies/", null, true);
    console.log(res);
    if (res.status == 200) {
      setCompanies(res.data);
    }
    setSelectedCompany(res.data[0].id);
  };
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
  useEffect(() => {
    // const verifyLogin = async () => {
    //   const isLoggedIn = await checkLogin();
    //   if (!isLoggedIn) {
    //     navigate("/"); // Redirect to login
    //   }
    // };

    // verifyLogin();
    getProjects();
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar onToggle={setIsSidebarCollapsed} />
      <div
        className={`flex-1 p-0 bg-gray-100 transition-all ${
          isSidebarCollapsed ? "ml-16" : "ml-[220px]"
        }`}
        style={{
          width: isSidebarCollapsed
            ? "calc(100% - 4rem)"
            : "calc(100% - 15rem)",
        }}
      >
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              {activeItem.charAt(0).toUpperCase() + activeItem.slice(1)}
            </h1>
            {user?.role === "Super Consultant" && (
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
                onClick={() => {
                  setIsModalOpen(true);
                  getCompanies();
                }}
              >
                + Create Project
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />}
                tip="Loading projects..."
                className="text-center"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {cards.length > 0 ? (
                cards.map((card, index) => (
                  <Link
                    to={`/project/${card.id}`}
                    onClick={() => {
                      setProject(card);
                    }}
                    key={index}
                    className="bg-white shadow-md border border-gray-300 rounded-lg p-4 hover:shadow-lg"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        {card.logo ? (
                          <img
                            src={card.logo}
                            alt={`${card?.companyName} Logo`}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 shadow-sm">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-7 w-7 text-blue-600"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                              <line x1="12" y1="11" x2="12" y2="17"></line>
                              <line x1="9" y1="14" x2="15" y2="14"></line>
                            </svg>
                          </div>
                        )}
                        <div>
                          <h2 className="text-lg font-semibold text-gray-800">
                            {card.company.name}
                          </h2>
                          <h3 className="text-sm text-gray-500">{card.name}</h3>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold text-gray-700">
                          Created Date :
                        </span>{" "}
                        {formatDate(card.created_at)}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    No projects found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating your first project.
                  </p>
                  {user?.role === "Super Consultant" && (
                    <button
                      onClick={() => {
                        setIsModalOpen(true);
                        getCompanies();
                      }}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Create Project
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
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
                <option key={index} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            <button
              className="w-full bg-blue-600 text-white py-2 rounded-md mb-2"
              onClick={handleCreateProject}
            >
              Create
            </button>
            <button
              className="w-full bg-gray-400 text-white py-2 rounded-md"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
