import React, { useContext, useEffect, useState } from "react";
import SideNav from "../WorkFlow/SideNav";
import { apiRequest } from "../../utils/api";
import { ProjectContext } from "../../Context/ProjectContext";
import { useParams } from "react-router-dom";

const ProjectTeamPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { project } = useContext(ProjectContext);
  const [members, setMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedMember,setSelectedMember] = useState();
  const [addedMembers, setAddedMembers] = useState([]);
  const {projectid} = useParams()
  const roles = ["Consultant", "Auditor", "Manager"]; // Example roles

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const getMembers = async () => {
    const res = await apiRequest("GET", `/api/project/${projectid}/members/`, null, true);
    if (res.status === 200) {
      setMembers(res.data);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberName || !selectedRole) return;
    const res = await apiRequest("POST", `/api/project/${projectid}/members/`, {
      name: newMemberName,
      role: selectedRole
    }, true);

    const removeMember = (index) => {
      setAddedMembers(addedMembers.filter((_, i) => i !== index));
    };



    if (res.status === 201) {
      setMembers([...members, res.data]);
      setIsModalOpen(false);
      setNewMemberName("");
      setSelectedRole("");
    }
  };

  
  useEffect(() => {
    getMembers();
  }, []);

  return (
    <div className="flex min-h-screen">
      <SideNav collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`p-10 bg-gray-100 transition-all duration-300 ${collapsed ? "ml-16" : "ml-56"} flex-1`}>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Project Team</h1>
        <div className="bg-white p-4 rounded-lg shadow-xl w-full flex flex-col justify-between border border-gray-200 hover:shadow-2xl transition-shadow">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold mb-4 text-center border-b-2 pb-2 text-blue-600">
              {project.name}
            </h2>
            <div className="flex gap-4">
              {!isEditing ? (
                <button onClick={toggleEdit} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
                  Edit
                </button>
              ) : (
                <>
                  <button onClick={() => setIsModalOpen(true)} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition">
                    Add Member
                  </button>
                  <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition">
                    Delete Member
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {members.map((member, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 rounded-md shadow-sm hover:shadow-md transition-shadow">
                <span className="text-base font-medium text-gray-800">{member.name}</span>
                <span className="text-base font-medium text-gray-800">{member.email}</span>
                <span className="text-sm font-semibold text-gray-600">{member.project_role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {/* {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add Team Member</h2>
            <input
              type="text"
              placeholder="Member Name"
              className="w-full border border-gray-300 p-2 rounded-md mb-4"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
            />
            <select
              className="w-full border border-gray-300 p-2 rounded-md mb-4"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">Select Role</option>
              {roles.map((role, index) => (
                <option key={index} value={role}>{role}</option>
              ))}
            </select>
            <button className="w-full bg-blue-600 text-white py-2 rounded-md mb-2" onClick={handleAddMember}>
              Add
            </button>
            <button className="w-full bg-gray-400 text-white py-2 rounded-md" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )} */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add Members</h2>
            <input
              type="text"
              placeholder="Enter Member Name"
              className="w-full border border-gray-300 p-2 rounded-md mb-4"
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
            />
            <button
              className="w-full bg-green-600 text-white py-2 rounded-md mb-2"
              onClick={handleAddMember}
            >
              + Add Member
            </button>
            {addedMembers.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Added Members:</h3>
                <ul>
                  {addedMembers.map((member, index) => (
                    <li key={index} className="flex justify-between items-center p-2 border-b">
                      {member}
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => removeMember(index)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button className="w-full bg-gray-400 text-white py-2 rounded-md" onClick={() => setIsModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTeamPage;
