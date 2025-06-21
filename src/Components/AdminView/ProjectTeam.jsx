import React, { useContext, useEffect, useState } from "react";
import { apiRequest } from "../../utils/api";
import { ProjectContext } from "../../Context/ProjectContext";
import { useParams } from "react-router-dom";
import { Pointer } from "lucide-react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const ProjectTeamPage = () => {
  const [isEditing, setIsEditing] = useState(false);
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
      case "consultant admin":
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
      const companyId = project?.consultant_company?.id || project?.consultant_company_id;
      let endpoint = `/api/auth/users/?role=${role === "consultant admin" ? "consultant" : role}`;
      if (companyId) {
        endpoint += `&company_id=${companyId}`;
      }
      const res = await apiRequest(
        "GET",
        endpoint,
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
    <div className="p-6 bg-gray-50">
      <div className="w-full">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="bg-blue-600 rounded-lg p-2 mr-4 shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Project Team</h1>
              <p className="text-gray-600 mt-1">
                Manage the members of your project team
              </p>
            </div>
          </div>

          {!loading && members.length > 0 && !isEditing && (
            <button
              onClick={toggleEdit}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              Manage Team
            </button>
          )}
        </div>

        {loading ? (
          <div className="bg-white p-10 rounded-lg shadow-xl w-full flex flex-col items-center justify-center min-h-[300px]">
            <div className="relative w-24 h-24">
              <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-gray-200"></div>
              <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-l-indigo-500 border-t-indigo-500 border-r-transparent border-b-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-medium text-gray-700 mt-6 mb-2">
              Loading Team Members
            </h3>
            <p className="text-sm text-gray-500">
              Please wait while we fetch the project team information...
            </p>
          </div>
        ) : members.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-md w-full">
            {/* Table Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center mb-1">
                <h2 className="text-xl font-semibold text-gray-800 mr-2">
                  Team Members
                </h2>
                <span className="text-sm bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full">
                  {members.length}
                </span>
              </div>

              {isEditing && (
                <div className="flex gap-3 flex-wrap mt-4">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition flex items-center shadow-md"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add Member
                  </button>
                  <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition flex items-center shadow-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete Member
                  </button>
                  <button
                    onClick={toggleEdit}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition flex items-center shadow-md"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Table Grid Headers */}
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
              <div className="py-3 px-6 text-left font-medium text-gray-500">
                NAME
              </div>
              <div className="py-3 px-6 text-left font-medium text-gray-500">
                EMAIL
              </div>
              <div className="py-3 px-6 text-left font-medium text-gray-500">
                ROLE
              </div>
            </div>

            {/* Table Body */}
            <div className="bg-white divide-y divide-gray-200">
              {members.map((member, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="py-4 px-6 text-sm font-medium text-gray-900 truncate">
                    {member.name}
                  </div>
                  <div className="py-4 px-6 text-sm text-gray-500 truncate">
                    {member.email}
                  </div>
                  <div className="py-4 px-6">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        member.project_role === "consultant admin"
                          ? "bg-purple-100 text-purple-800"
                          : member.project_role === "consultant"
                          ? "bg-blue-100 text-blue-800"
                          : member.project_role === "auditor"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {member.project_role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-center w-full">
            <div className="flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-blue-500"
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
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                No Team Members Yet
              </h3>
              <p className="text-gray-600 max-w-md mb-8">
                Your project doesn't have any team members. Add team members to
                collaborate on this project.
              </p>
              <button
                onClick={toggleEdit}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-lg transition-all shadow-md flex items-center justify-center gap-2 hover:shadow-lg transform hover:scale-105 duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Team Members
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add Members</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedRole("");
                  setAdmins([]);
                  setConsultants([]);
                  setAuditors([]);
                  setUsers([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-5">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Role
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-gray-50 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    value={selectedRole}
                    onChange={(e) => {
                      setSelectedRole(e.target.value);
                      setSelectedUser("");
                      getUsers(e);
                    }}
                  >
                    <option value="">Select Role</option>
                    {/* <option value="consultant admin">Admin</option> */}
                    <option value="consultant">Consultant</option>
                    <option value="auditor">Auditor</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* User Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Member
                </label>
                <div className="relative">
                  <select
                    className={`w-full bg-gray-50 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${
                      !selectedRole || usersLoading
                        ? "opacity-60 cursor-not-allowed"
                        : ""
                    }`}
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
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                    {usersLoading ? (
                      <Spin
                        indicator={
                          <LoadingOutlined style={{ fontSize: 20 }} spin />
                        }
                      />
                    ) : (
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  className={`w-full py-3 rounded-lg font-semibold flex justify-center items-center transition shadow-md 
                    ${
                      !selectedUser || !selectedRole
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg"
                    }`}
                  onClick={handleAddMember}
                  disabled={!selectedUser || !selectedRole}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Member
                </button>

                <button
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md hover:shadow-lg flex justify-center items-center"
                  onClick={() => {
                    console.log("Final List of Added Members:", members);
                    handleFinishAdding();
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Done Adding Members
                </button>
              </div>
            </div>

            {/* Added Members Lists */}
            <div className="space-y-5 mt-8">
              {/* Admins List */}
              {admins.length > 0 && (
                <div className="rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 p-1">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="bg-purple-100 p-2 rounded-full mr-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-purple-700"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-purple-800">
                        Admins ({admins.length})
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {admins.map((member, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center p-3 bg-white shadow-sm rounded-lg border border-gray-100 hover:border-purple-200 transition"
                        >
                          <span className="font-medium text-gray-800 flex items-center">
                            <span className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 mr-3 flex items-center justify-center">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                            {member.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-sm">
                              {member.email}
                            </span>
                            <button
                              onClick={() => {
                                setAdmins(
                                  admins.filter(
                                    (admin) => admin.id !== member.id
                                  )
                                );
                              }}
                              className="text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 p-1"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Consultants List */}
              {consultants.length > 0 && (
                <div className="rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 p-1">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="bg-blue-100 p-2 rounded-full mr-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-blue-700"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-blue-800">
                        Consultants ({consultants.length})
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {consultants.map((member, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center p-3 bg-white shadow-sm rounded-lg border border-gray-100 hover:border-blue-200 transition"
                        >
                          <span className="font-medium text-gray-800 flex items-center">
                            <span className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 mr-3 flex items-center justify-center">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                            {member.name}
                          </span>
                          <div className="flex items-center gap-2">
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
                              className="text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 p-1"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Auditors List */}
              {auditors.length > 0 && (
                <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-1">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="bg-green-100 p-2 rounded-full mr-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-green-700"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-green-800">
                        Auditors ({auditors.length})
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {auditors.map((member, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center p-3 bg-white shadow-sm rounded-lg border border-gray-100 hover:border-green-200 transition"
                        >
                          <span className="font-medium text-gray-800 flex items-center">
                            <span className="h-8 w-8 rounded-full bg-green-100 text-green-700 mr-3 flex items-center justify-center">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                            {member.name}
                          </span>
                          <div className="flex items-center gap-2">
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
                              className="text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 p-1"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTeamPage;
