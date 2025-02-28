import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../HomeNav/Sidebar";
import { apiRequest } from "../../utils/api";
import { AuthContext } from "../../AuthContext";

const Projects = () => {
  const [activeItem, setActiveItem] = useState("projects");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [cards, setCards] = useState([]);
  const navigate = useNavigate();
  const { checkLogin } = useContext(AuthContext);
  const getProjects = async () => {
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
      
    }
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
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700">
              + Create Project
            </button>
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
                      alt={`${card?.companyName} Logo`}
                      className="w-12 h-12 rounded-full"
                    />
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
                  {/* <p className="text-sm text-gray-500 mt-2">
                    <span className="font-semibold text-gray-700">Audit Status:</span> {card.auditStatus}
                  </p> */}
                </div>
                {/* <div className="mt-4 flex justify-between items-center">
                  <p className="text-sm font-medium">
                    Status: <span
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
                </div> */}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
