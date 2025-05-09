import React, { useContext, useEffect, useState } from "react";
import SideNav from "../WorkFlow/SideNav";
import { apiRequest } from "../../utils/api";
import { ProjectContext } from "../../Context/ProjectContext";
import { useParams } from "react-router-dom";
import { Pointer } from "lucide-react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const ProjectTeamPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { project } = useContext(ProjectContext);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUser, setSelectedUser] = useState();
  const [addedMembers, setAddedMembers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const { projectid } = useParams();
  const roles = ["Consultant", "Auditor", "Manager"]; // Example roles
  const [users, setUsers] = useState([
    {
      id: 3,
      email: "mailto:a1@example.com",
      name: "a1",
      role: "auditor",
      contact: null,
    },
    {
      id: 4,
      email: "mailto:a2@example.com",
      name: "a2",
      role: "auditor",
      contact: null,
    },
  ]);
  const [admins, setAdmins] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [auditors, setAuditors] = useState([]);

  const memberOptions = [
    {
      id: 3,
      email: "a1@example.com",
      name: "a1",
      role: "auditor",
      contact: null,
    },
    {
      id: 4,
      email: "a2@example.com",
      name: "a2",
      role: "auditor",
      contact: null,
    },
  ];

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const getMembers = async () => {
    setLoading(true);
    try {
      const res = await apiRequest(
        "GET",
        `/api/project/${projectid}/members/`,
        null,
        true
      );
      if (res.status === 200) {
        setMembers(res.data);
        console.log(res.data);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser || !selectedRole) return;

    const user = JSON.parse(selectedUser);
    user.project_role = selectedRole;
    if (members.some((member) => member.id === user.id)) {
      alert("Already a member in this project");
      return;
    }
    switch (selectedRole) {
      case "admin":
        // Check if a user with the same id already exists
        if (
          !admins.some((admin) => admin.id === user.id) &&
          !consultants.some((consultant) => consultant.id === user.id)
        ) {
          setAdmins([...admins, user]);
        } else {
          alert("already added this member");
        }
        break;
      case "consultant":
        if (
          !consultants.some((consultant) => consultant.id === user.id) &&
          !admins.some((admin) => admin.id === user.id)
        ) {
          setConsultants([...consultants, user]);
        } else {
          alert("already added this member");
        }
        break;
      case "auditor":
        if (!auditors.some((auditor) => auditor.id === user.id)) {
          setAuditors([...auditors, user]);
        } else {
          alert("already added this member");
        }
        break;
      default:
        break;
    }
  };

  const handleFinishAdding = async () => {
    console.log(
      "Final members list:",
      admins.map((admin) => admin.id),
      consultants.map((consultant) => consultant.id),
      auditors.map((auditor) => auditor.id)
    );
    const res = await apiRequest(
      "POST",
      `/api/project/${projectid}/add-members/`,
      {
        admins: admins.map((admin) => admin.id),
        consultants: consultants.map((consultant) => consultant.id),
        auditors: auditors.map((auditor) => auditor.id),
      },
      true
    );
    if (res.status == 200) {
      getMembers();
    }
    setAdmins([]);
    setConsultants([]);
    setAuditors([]);
    setUsers([]);
    setIsModalOpen(false); // Close the modal after finalizing
  };

  const getUsers = async (e) => {
    const role = e.target.value;
    if (role === "") return;

    setUsersLoading(true);
    try {
      const res = await apiRequest(
        "GET",
        `/api/auth/users/?role=${role === "admin" ? "consultant" : role}`,
        null,
        true
      );
      console.log(res);
      if (res.status == 200) {
        setUsers(res.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    getMembers();
  }, []);

  return (
    <div className="flex min-h-screen">
      <SideNav collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        className={`p-10 bg-gray-100 transition-all duration-300 ${
          collapsed ? "ml-16" : "ml-56"
        } flex-1`}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Project Team</h1>

        {loading ? (
          <div className="bg-white p-10 rounded-lg shadow-xl w-full flex flex-col items-center justify-center min-h-[300px]">
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />}
              tip="Loading team members..."
              className="text-center"
            />
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg shadow-xl w-full flex flex-col justify-between border border-gray-200 hover:shadow-2xl transition-shadow">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold mb-4 text-center border-b-2 pb-2 text-blue-600">
                {project.name}
              </h2>
              <div className="flex gap-4">
                {!isEditing ? (
                  <button
                    onClick={toggleEdit}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                  >
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                    >
                      Add Member
                    </button>
                    <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition">
                      Delete Member
                    </button>
                  </>
                )}
              </div>
            </div>

            {members.length > 0 ? (
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
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700">
                  No team members yet
                </h3>
                <p className="mt-1 text-sm text-gray-500 max-w-md">
                  This project doesn't have any team members. Click "Edit" and
                  then "Add Member" to add people to this project.
                </p>
              </div>
            )}
          </div>
        )}
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
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px]">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Add Members
            </h2>

            {/* Role Selection */}
            <select
              className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setSelectedUser("");
                getUsers(e);
              }}
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="consultant">Consultant</option>
              <option value="auditor">Auditor</option>
              {/* <option value="company">Company</option> */}
            </select>

            {/* Name Selection */}
            <div className="relative">
              <select
                className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                disabled={!selectedRole || usersLoading}
              >
                <option value="">Select Name</option>
                {users.map((user) => (
                  <option value={JSON.stringify(user)} key={user.id}>
                    {user.name} - {user.email}
                  </option>
                ))}
              </select>
              {usersLoading && (
                <div className="absolute right-3 top-3">
                  <Spin
                    indicator={
                      <LoadingOutlined style={{ fontSize: 20 }} spin />
                    }
                  />
                </div>
              )}
            </div>

            {/* Add Member Button */}
            <button
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-md"
              onClick={handleAddMember}
              disabled={!selectedUser || !selectedRole}
            >
              + Add Member
            </button>

            {/* Done Adding Members Button */}
            <div>
              <button
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mt-4 shadow-md"
                onClick={() => {
                  console.log("Final List of Added Members:", members);
                  handleFinishAdding();
                }}
              >
                Done Adding Members
              </button>

              {/* Close Button */}
              <button
                className="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition mt-2 shadow-md"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedRole("");
                  setAdmins([]);
                  setConsultants([]);
                  setAuditors([]);
                  setUsers([]);
                }}
              >
                Close
              </button>
            </div>

            {/* List of Added Members */}
            {admins.length > 0 && (
              <div className="border border-gray-300 p-4 rounded-lg bg-gray-100 mt-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Added Admins
                </h3>
                <ul className="space-y-2">
                  {admins.map((member, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center p-2 bg-white shadow-sm rounded-lg border border-gray-200"
                    >
                      <span className="font-medium text-gray-800">
                        {member.name}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {member.email}
                      </span>
                      <button
                        onClick={() => {
                          setAdmins(
                            admins.filter((admin) => admin.id !== member.id)
                          );
                        }}
                        className="text-red-400 text-md"
                      >
                        <b>X</b>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {consultants.length > 0 && (
              <div className="border border-gray-300 p-4 rounded-lg bg-gray-100 mt-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Added Consultants
                </h3>
                <ul className="space-y-2">
                  {consultants.map((member, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center p-2 bg-white shadow-sm rounded-lg border border-gray-200"
                    >
                      <span className="font-medium text-gray-800">
                        {member.name}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {member.email}
                      </span>
                      <button
                        onClick={() => {
                          setConsultants(
                            consultants.filter(
                              (consultant) => consultant.id !== member.id
                            )
                          );
                        }}
                        className="text-red-400 text-md"
                      >
                        <b>X</b>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {auditors.length > 0 && (
              <div className="border border-gray-300 p-4 rounded-lg bg-gray-100 mt-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Added Auditors
                </h3>
                <ul className="space-y-2">
                  {auditors.map((member, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center p-2 bg-white shadow-sm rounded-lg border border-gray-200"
                    >
                      <span className="font-medium text-gray-800">
                        {member.name}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {member.email}
                      </span>
                      <button
                        onClick={() => {
                          setAuditors(
                            auditors.filter(
                              (auditor) => auditor.id !== member.id
                            )
                          );
                        }}
                        className="text-red-400 text-md"
                      >
                        <b>X</b>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTeamPage;
