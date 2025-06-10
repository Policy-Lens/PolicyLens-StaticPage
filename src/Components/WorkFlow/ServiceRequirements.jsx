import React, { useState, useContext, useEffect } from "react";
import {
  Button,
  Modal,
  Input,
  Upload,
  message,
  Spin,
  Dropdown,
  Select,
  DatePicker,
} from "antd";
import {
  PaperClipOutlined,
  FileTextOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { ProjectContext } from "../../Context/ProjectContext";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import InteractiveIsoClause from "../Common/InteractiveIsoClause";
const { TextArea } = Input;
const { Option } = Select;
import { apiRequest, BASE_URL } from "../../utils/api";
function ServiceRequirements() {
  const [fileList, setFileList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAssignTaskVisible, setIsAssignTaskVisible] = useState(false);
  const [description, setDescription] = useState("");
  const [isAssignedUser, setIsAssignedUser] = useState(false);
  const { projectid } = useParams();
  const {
    addStepData,
    getStepData,
    getStepId,
    projectRole,
    checkStepAuth,
    assignStep,
    getStepAssignment,
    getMembers,
  } = useContext(ProjectContext);
  const [serviceRequirementsData, setServiceRequirementsData] = useState([]);
  const [stepId, setStepId] = useState(null);
  const [oldFilesNeeded, setOldFilesNeeded] = useState([]);
  const [removedOldFiles, setRemovedOldFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stepStatus, setStepStatus] = useState("pending");
  const [taskAssignment, setTaskAssignment] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDeadline, setTaskDeadline] = useState(null);
  const [taskReferences, setTaskReferences] = useState("");
  const [associatedIsoClause, setAssociatedIsoClause] = useState(null);
  const [process, setProcess] = useState("core");

  // Needs More Info Modal states
  const [isNeedsMoreInfoModalVisible, setIsNeedsMoreInfoModalVisible] = useState(false);
  const [moreInfoComment, setMoreInfoComment] = useState("");
  const [moreInfoFileList, setMoreInfoFileList] = useState([]);

  const antIcon = <LoadingOutlined style={{ fontSize: 40 }} spin />;

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleRemoveFile = (fileUrl) => {
    setOldFilesNeeded((prev) => prev.filter((file) => file !== fileUrl));
    setRemovedOldFiles((prev) => [...prev, fileUrl]);
  };

  const handleRestoreFile = (fileUrl) => {
    setRemovedOldFiles((prev) => prev.filter((file) => file !== fileUrl));
    setOldFilesNeeded((prev) => [...prev, fileUrl]);
  };

  const checkAssignedUser = async (step_id) => {
    const isAuthorized = await checkStepAuth(step_id);
    setIsAssignedUser(isAuthorized);
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      message.warning("Please provide a description.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("field_name", "Service Requirements");
    formData.append("text_data", description);

    // Append old files array as JSON string
    formData.append("old_files", JSON.stringify(oldFilesNeeded));

    // Append new files
    fileList.forEach((file) => {
      formData.append("files", file.originFileObj || file);
    });

    try {
      const response = await addStepData(stepId, formData);
      if (response.status === 201) {
        message.success("Service requirements submitted successfully!");
        setIsModalVisible(false);
        setDescription("");
        setFileList([]);
        setOldFilesNeeded([]);
        setRemovedOldFiles([]);
        await get_step_data(stepId);
      } else {
        message.error("Failed to submit service requirements.");
      }
    } catch (error) {
      message.error("Failed to submit service requirements.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract filename from path
  const getFileName = (filePath) => {
    return filePath.split("/").pop();
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Helper function to create a viewer URL instead of direct download
  const getViewerUrl = (filePath) => {
    // Extract file extension
    const extension = filePath.split(".").pop().toLowerCase();

    // For PDFs, use PDF viewer
    if (extension === "pdf") {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(
        `${BASE_URL}${filePath}`
      )}&embedded=true`;
    }

    // For images, use direct URL (browsers will display these)
    if (["jpg", "jpeg", "png", "gif", "bmp", "svg"].includes(extension)) {
      return `${BASE_URL}${filePath}`;
    }

    // For other file types, use Google Docs viewer
    return `https://docs.google.com/viewer?url=${encodeURIComponent(
      `${BASE_URL}${filePath}`
    )}&embedded=true`;
  };

  const getTaskAssignment = async (step_id) => {
    try {
      const assignmentData = await getStepAssignment(step_id);
      if (assignmentData.status === 200 && assignmentData.data.length > 0) {
        setTaskAssignment(assignmentData.data[0]);
      } else {
        setTaskAssignment(null);
      }
    } catch (error) {
      console.error("Error fetching task assignment:", error);
      setTaskAssignment(null);
    }
  };

  const get_step_id = async () => {
    setLoading(true);
    try {
      const response = await getStepId(projectid, 1);
      if (response) {
        // Debug: Log the entire response to see what we're getting
        console.log("API Response:", response);
        console.log("Associated ISO Clause:", response.associated_iso_clause);
        console.log("Process:", response.process);

        // Update step ID and status from the response
        setStepId(response.plc_step_id);
        setStepStatus(response.status);
        setAssociatedIsoClause(response.associated_iso_clause);
        setProcess(response.process || "core");
        // Call other functions with the plc_step_id
        await get_step_data(response.plc_step_id);
        await checkAssignedUser(response.plc_step_id);
        await getTaskAssignment(response.plc_step_id);
      }
    } catch (error) {
      console.error("Error fetching step ID:", error);
      message.error("Failed to load service requirements data.");
    } finally {
      setLoading(false);
    }
  };

  const get_members = async () => {
    const res = await getMembers(projectid);
    setMembers(res);
  };

  const handleAssignTask = async () => {
    await get_members();
    setIsAssignTaskVisible(true);
  };

  const handleAssignTaskClose = () => {
    setIsAssignTaskVisible(false);
  };

  // Needs More Info Modal handlers
  const handleNeedsMoreInfoSubmit = async () => {
    if (!moreInfoComment.trim()) {
      message.warning("Please provide a comment.");
      return;
    }

    try {
      // Here you would typically send the comment and files to your API
      // For now, we'll just show a success message
      message.success("More information request submitted successfully!");
      setIsNeedsMoreInfoModalVisible(false);
      setMoreInfoComment("");
      setMoreInfoFileList([]);
    } catch (error) {
      message.error("Failed to submit more information request.");
      console.error(error);
    }
  };

  const handleMoreInfoFileChange = ({ fileList: newFileList }) => {
    setMoreInfoFileList(newFileList);
  };

  const handleNeedsMoreInfoClose = () => {
    setIsNeedsMoreInfoModalVisible(false);
    setMoreInfoComment("");
    setMoreInfoFileList([]);
  };

  const get_step_data = async (step_id) => {
    try {
      const stepData = await getStepData(step_id);
      setServiceRequirementsData(stepData || []);

      // If there's existing data, set it for editing
      if (stepData && stepData.length > 0) {
        const latestData = stepData[0];
        setDescription(latestData.text_data);

        // Initialize old files from existing documents
        const existingFiles = latestData.documents.map((doc) => doc.file);
        setOldFilesNeeded(existingFiles);
        setRemovedOldFiles([]);
      }
    } catch (error) {
      console.error("Error fetching step data:", error);
    }
  };

  const updateStepStatus = async (newStatus) => {
    try {
      const response = await apiRequest(
        "PUT",
        `/api/plc/plc_step/${stepId}/update-status/`,
        {
          status: newStatus,
        },
        true
      );

      if (response.status === 200) {
        setStepStatus(newStatus);
        message.success("Status updated successfully");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error("Failed to update status");
    }
  };

  const updateProcess = async (newProcess) => {
    try {
      const response = await apiRequest(
        "PATCH",
        `/api/plc/plc_step/${stepId}/update/`,
        {
          core_or_noncore: newProcess,
        },
        true
      );

      if (response.status === 200) {
        setProcess(newProcess);
        message.success("Process updated successfully");
      }
    } catch (error) {
      console.error("Error updating process:", error);
      message.error("Failed to update process");
    }
  };

  const handleSubmitAssignment = async () => {
    if (selectedTeamMembers.length === 0) {
      message.warning("Please select at least one team member.");
      return;
    }

    if (!taskDescription.trim()) {
      message.warning("Please provide a task description.");
      return;
    }

    if (!taskDeadline) {
      message.warning("Please select a deadline.");
      return;
    }

    const assignmentData = {
      assigned_to: selectedTeamMembers,
      description: taskDescription,
      deadline: taskDeadline.format("YYYY-MM-DD"),
      references: taskReferences,
    };

    try {
      const result = await assignStep(stepId, assignmentData);

      if (result) {
        message.success("Task assigned successfully!");
        setIsAssignTaskVisible(false);

        // Reset form fields
        setSelectedTeamMembers([]);
        setTaskDescription("");
        setTaskDeadline(null);
        setTaskReferences("");

        // Refresh task assignment data
        await getTaskAssignment(stepId);
      } else {
        message.error("Failed to assign task.");
      }
    } catch (error) {
      message.error("Failed to assign task.");
      console.error(error);
    }
  };

  useEffect(() => {
    get_step_id();
  }, []);

  // Service Requirements Card Component
  const ServiceRequirementsCard = ({ data, onUpdateClick, assignedUser, taskAssignment }) => {
    if (!data || data.length === 0) {
      return (
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md border border-gray-100 p-6 flex flex-col items-center justify-center min-h-[300px]">
          <div className="text-center max-w-md mx-auto">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FileTextOutlined style={{ fontSize: '32px', color: '#3b82f6' }} />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">No Service Requirements Yet</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Service requirements help define project scope and deliverables. Add your first requirement to begin.
            </p>
            {assignedUser && (
              <Button
                type="primary"
                className="bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200 font-medium h-10 px-6"
                onClick={onUpdateClick}
              >
                <span className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>Add Requirements</span>
                </span>
              </Button>
            )}
          </div>
        </div>
      );
    }

    const latestData = data[0];

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Top status indicator */}
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

        <div className="grid md:grid-cols-3 divide-x divide-gray-100">
          {/* Main content - takes up 2/3 of space */}
          <div className="md:col-span-2 p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Service Requirements</h2>
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Last updated: {formatDate(latestData.created_at)}
                </p>
              </div>

              {/* Status badge */}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stepStatus === "completed"
                ? "bg-green-100 text-green-800"
                : stepStatus === "in_progress"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
                }`}>
                {stepStatus === "completed"
                  ? "Completed"
                  : stepStatus === "in_progress"
                    ? "In Progress"
                    : "Pending"}
              </span>
            </div>

            {/* Description section - simplified to match the screenshot */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 uppercase mb-3">Description</h3>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[120px] border border-gray-100">
                <p className="text-gray-700 whitespace-pre-wrap">{latestData.text_data}</p>
              </div>
            </div>

            {/* Interactive elements section - New addition */}
            <div className="mb-6 space-y-4">
              {/* Activity Timeline - Innovative addition */}
              <div className="border-l-2 border-blue-200 pl-4 space-y-3 mb-4 relative">
                <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-0"></div>

                <div className="flex items-start">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Created by</p>
                    <p className="text-sm font-medium">{latestData.created_by?.name || "System"}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(latestData.created_at)}
                  </span>
                </div>

                {latestData.updated_at && latestData.updated_at !== latestData.created_at && (
                  <>
                    <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-[7px] top-16"></div>
                    <div className="flex items-start">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Updated by</p>
                        <p className="text-sm font-medium">{latestData.updated_by?.name || "System"}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(latestData.updated_at)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Tags/Categories - Innovative addition */}
            {latestData.categories && latestData.categories.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {latestData.categories.map((category, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action button at bottom - Aligned with screenshot */}
            {assignedUser && (
              <div className="mt-auto">
                <Button
                  type="primary"
                  onClick={onUpdateClick}
                  className="bg-blue-600 hover:bg-blue-700 px-5 py-2 h-auto font-medium text-sm"
                >
                  Update Requirements
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar - takes up 1/3 of space */}
          <div className="md:col-span-1 bg-gray-50">
            {/* Documents section */}
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documents
              </h3>

              {latestData.documents && latestData.documents.length > 0 ? (
                <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                  {latestData.documents.map((doc, index) => (
                    <a
                      key={index}
                      href={getViewerUrl(doc.file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 rounded-md hover:bg-white transition-colors group border border-transparent hover:border-blue-100 hover:shadow-sm"
                    >
                      <div className="w-8 h-8 flex-shrink-0 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center mr-3">
                        <FileTextOutlined />
                      </div>
                      <div className="overflow-hidden flex-1">
                        <p className="font-medium text-sm text-gray-800 truncate group-hover:text-blue-600">
                          {doc.file.split('/').pop()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Added: {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No documents attached
                </div>
              )}
            </div>

            {/* Task Assignment section */}
            {taskAssignment && (
              <div className="p-6">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Assignment
                </h3>

                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 space-y-3">
                  <div>
                    <h4 className="text-xs text-gray-500 mb-1">Assigned To</h4>
                    <div className="flex flex-wrap gap-1">
                      {taskAssignment.assigned_to_names && Array.isArray(taskAssignment.assigned_to_names) ? (
                        taskAssignment.assigned_to_names.map((name, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {name}
                          </span>
                        ))
                      ) : taskAssignment.assigned_to && Array.isArray(taskAssignment.assigned_to) ? (
                        taskAssignment.assigned_to.map((user, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {user.name || user.email || 'Unknown'}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-600">Not specified</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs text-gray-500 mb-1">Deadline</h4>
                    <p className="text-sm font-medium flex items-center text-gray-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(taskAssignment.deadline)}
                    </p>
                  </div>

                  {taskAssignment.description && (
                    <div>
                      <h4 className="text-xs text-gray-500 mb-1">Description</h4>
                      <p className="text-sm text-gray-800">{taskAssignment.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CSS for custom scrollbar */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}</style>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Move heading above for better space management */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Service Requirements</h1>
        <div className="flex space-x-3">
          {/* Send for Review button - only for consultant admin */}
          {projectRole === "consultant admin" && (
            <Button
              type="default"
              onClick={() => {
                // Static implementation - just show a success message
                message.success("Step sent for review successfully!");
              }}
              className="bg-green-600 hover:bg-green-700 text-white border-green-600"
            >
              Send for Review
            </Button>
          )}

          {/* Review buttons - only for Company */}
          {projectRole === "company" && (
            <>
              <Button
                type="default"
                onClick={() => {
                  message.success("Step accepted successfully!");
                }}
                className="bg-green-600 hover:bg-green-700 text-white border-green-600"
              >
                Accept
              </Button>
              <Button
                type="default"
                onClick={() => {
                  message.success("Step rejected successfully!");
                }}
                className="bg-red-600 hover:bg-red-700 text-white border-red-600"
              >
                Reject
              </Button>
              <Button
                type="default"
                onClick={() => {
                  setIsNeedsMoreInfoModalVisible(true);
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600"
              >
                Needs More Info
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          {/* Status badge */}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stepStatus === "completed"
            ? "bg-green-100 text-green-800"
            : stepStatus === "in_progress"
              ? "bg-blue-100 text-blue-800"
              : "bg-yellow-100 text-yellow-800"
            }`}>
            {stepStatus === "completed"
              ? "Completed"
              : stepStatus === "in_progress"
                ? "In Progress"
                : "Pending"}
          </span>
          {/* ISO Clause badge */}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            ISO: <InteractiveIsoClause isoClause={associatedIsoClause} />
          </span>
        </div>
        <div className="flex items-center space-x-3">
          {/* Show Assign Task button only for consultant admin */}
          {projectRole === "consultant admin" && (
            <Button
              type="default"
              onClick={handleAssignTask}
              className="flex items-center"
            >
              Assign Task
            </Button>
          )}

          {/* Process Update Dropdown for Admin */}
          {projectRole === "consultant admin" && (
            <Select
              value={process}
              onChange={updateProcess}
              style={{ width: 120 }}
            >
              <Option value="core">Core</Option>
              <Option value="non core">Non Core</Option>
            </Select>
          )}

          {/* Status Update Dropdown for Admin */}
          {projectRole === "consultant admin" && (
            <Select
              value={stepStatus}
              onChange={updateStepStatus}
              style={{ width: 140 }}
            >
              <Option value="pending">Pending</Option>
              <Option value="in_progress">In Progress</Option>
              <Option value="completed">Completed</Option>
            </Select>
          )}

          {/* Button for authorized users to add/update */}
          {isAssignedUser && (
            <Button
              type="primary"
              onClick={() => setIsModalVisible(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {serviceRequirementsData.length > 0
                ? "Update Requirements"
                : "Add Requirements"}
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spin indicator={antIcon} />
        </div>
      ) : (
        <ServiceRequirementsCard
          data={serviceRequirementsData}
          onUpdateClick={() => setIsModalVisible(true)}
          assignedUser={isAssignedUser}
          taskAssignment={taskAssignment}
        />
      )}

      {/* Redesigned Modal */}
      <Modal
        title={
          serviceRequirementsData.length > 0
            ? "Update Service Requirements"
            : "Add Service Requirements"
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setDescription("");
          setFileList([]);
          setOldFilesNeeded([]);
          setRemovedOldFiles([]);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsModalVisible(false);
              setDescription("");
              setFileList([]);
              setOldFilesNeeded([]);
              setRemovedOldFiles([]);
            }}
            className="border-gray-300 text-gray-700"
            disabled={loading}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
            loading={loading}
          >
            {serviceRequirementsData.length > 0 ? "Update" : "Save"}
          </Button>,
        ]}
        width={700}
      >
        <div className="p-6">
          <div className="space-y-6">
            {/* Template Download Section */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Download Template
                  </h3>
                  <div className="mt-2 text-sm text-blue-600">
                    <p>
                      Please download and fill in the template below before
                      submitting your service requirements.
                    </p>
                  </div>
                  <div className="mt-3">
                    <a
                      href="/templates/Service_Req_template.xlsx"
                      download="service_requirements_template.xlsx"
                      className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg
                        className="-ml-1 mr-2 h-5 w-5 text-blue-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download Service Requirements Template
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Field */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <TextArea
                id="description"
                rows={6}
                placeholder="Enter the service requirements"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Existing Files */}
            {oldFilesNeeded.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Existing Files
                </h4>
                <div className="space-y-3">
                  {oldFilesNeeded.map((fileUrl) => (
                    <div
                      key={fileUrl}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                    >
                      <div className="flex items-center overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <FileTextOutlined className="text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-700 truncate">
                          {getFileName(fileUrl)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <a
                          href={getViewerUrl(fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4"
                        >
                          View
                        </a>
                        <Button
                          type="text"
                          danger
                          onClick={() => handleRemoveFile(fileUrl)}
                          className="flex items-center"
                          icon={
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Removed Files */}
            {removedOldFiles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Removed Files
                </h4>
                <div className="space-y-3">
                  {removedOldFiles.map((fileUrl) => (
                    <div
                      key={fileUrl}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <FileTextOutlined className="text-red-500" />
                        </div>
                        <span className="text-sm text-gray-500 truncate">
                          {getFileName(fileUrl)}
                        </span>
                      </div>
                      <Button
                        type="text"
                        onClick={() => handleRestoreFile(fileUrl)}
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                        icon={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                              clipRule="evenodd"
                            />
                          </svg>
                        }
                      >
                        Restore
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Files */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Upload New Files
              </h4>
              <Upload
                fileList={fileList}
                onChange={handleUploadChange}
                beforeUpload={() => false}
                multiple
                showUploadList={true}
                className="upload-list-custom"
              >
                <Button
                  icon={<PaperClipOutlined />}
                  className="bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 rounded-lg shadow-sm flex items-center"
                >
                  Attach Files
                </Button>
              </Upload>
            </div>
          </div>
        </div>
      </Modal>

      {/* Assign Task Modal */}
      <Modal
        title="Assign Task"
        open={isAssignTaskVisible}
        onCancel={handleAssignTaskClose}
        footer={[
          <Button
            key="assign"
            type="primary"
            onClick={handleSubmitAssignment}
            className="bg-blue-500"
          >
            Assign
          </Button>,
        ]}
      >
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Team Members</label>
          <Select
            mode="multiple"
            placeholder="Select team members"
            value={selectedTeamMembers}
            onChange={setSelectedTeamMembers}
            style={{ width: "100%" }}
          >
            {members &&
              members.map((member) => (
                <Option key={member.id} value={member.id}>
                  {member.name}
                </Option>
              ))}
          </Select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Team Deadline
          </label>
          <DatePicker
            style={{ width: "100%" }}
            value={taskDeadline}
            onChange={setTaskDeadline}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Task Description
          </label>
          <Input
            placeholder="Enter task description"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Task References
          </label>
          <Input
            placeholder="Add reference URLs"
            value={taskReferences}
            onChange={(e) => setTaskReferences(e.target.value)}
          />
        </div>
      </Modal>

      {/* Needs More Info Modal */}
      <Modal
        title="Request More Information"
        open={isNeedsMoreInfoModalVisible}
        onCancel={handleNeedsMoreInfoClose}
        footer={[
          <Button key="cancel" onClick={handleNeedsMoreInfoClose}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleNeedsMoreInfoSubmit}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Submit Request
          </Button>,
        ]}
        width={600}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment <span className="text-red-500">*</span>
            </label>
            <TextArea
              rows={4}
              placeholder="Please provide details about what additional information is needed..."
              value={moreInfoComment}
              onChange={(e) => setMoreInfoComment(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attach Files (Optional)
            </label>
            <Upload
              fileList={moreInfoFileList}
              onChange={handleMoreInfoFileChange}
              beforeUpload={() => false}
              multiple
              showUploadList={true}
            >
              <Button icon={<PaperClipOutlined />}>
                Attach Files
              </Button>
            </Upload>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ServiceRequirements;
