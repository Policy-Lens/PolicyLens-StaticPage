import React, { useContext, useEffect, useState } from "react";
import SideNav from "../WorkFlow/SideNav";
import { apiRequest } from "../../utils/api";
import { ProjectContext } from "../../Context/ProjectContext";

const ProjectTeamPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [collapsed, setCollapsed] = useState(false); // State for SideNav collapse
  const {project} = useContext(ProjectContext) 
  // const project = {
  //   name: "Project 1",
  //   team: [
  //     { role: "Consultant", name: "Consultant 1" },
  //     { role: "Consultant", name: "Consultant 2" },
  //     { role: "Auditor", name: "Auditor 1" },
  //     { role: "Auditor", name: "Auditor 2" },
  //   ],
  // };
  const [members,setMembers] = useState([]);
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };
  const getMembers = async()=>{
    const res = await apiRequest("GET", `/api/project/${project.id}/members/`, null, true);
    console.log(res);
    if(res.status==200){
setMembers(res.data)
    }
  }
  useEffect(() => {
    getMembers();
  },[]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <SideNav collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main content */}
      <div
        className={`p-10 bg-gray-100 transition-all duration-300 ${
          collapsed ? "ml-16" : "ml-56"
        } flex-1`}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Project Team</h1>
        <div className="bg-white p-4 rounded-lg shadow-xl w-full flex flex-col justify-between border border-gray-200 hover:shadow-2xl transition-shadow">
          {/* Project Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold mb-4 text-center border-b-2 pb-2 text-blue-600">
              {project.name}
            </h2>
            {/* Action Buttons */}
            <div className="flex gap-4">
              {!isEditing && (
                <button
                  onClick={toggleEdit}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                >
                  Edit
                </button>
              )}
              {isEditing && (
                <>
                  <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition">
                    Add Member
                  </button>
                  <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition">
                    Delete Member
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Team Members */}
          <div className="flex flex-col gap-3">
            {members.map((member, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-2 rounded-md shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-base font-medium text-gray-800">
                  {member.name}
                </span>
                <span className="text-base font-medium text-gray-800">
                  {member.email}
                </span>
                <span className="text-sm font-semibold text-gray-600">
                  {member.project_role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTeamPage;
