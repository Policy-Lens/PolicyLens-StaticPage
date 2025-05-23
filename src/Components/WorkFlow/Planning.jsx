import React, { useState, useContext, useEffect } from "react";
import {
  Button,
  Input,
  Modal,
  Select,
  DatePicker,
  Upload,
  message,
  Dropdown,
} from "antd";
import { PaperClipOutlined, FileTextOutlined } from "@ant-design/icons";
import { ProjectContext } from "../../Context/ProjectContext";
import { useParams } from "react-router-dom";
import { LoadingContext } from "./VertStepper";
import { BASE_URL, apiRequest } from "../../utils/api";
import DiscussingPolicies from "./DiscussingPolicies";
const { TextArea } = Input;
const { Option } = Select;

const Planning = () => {
  const [fileList, setFileList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAssignTaskVisible, setIsAssignTaskVisible] = useState(false);
  const [planningText, setPlanningText] = useState("");
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDeadline, setTaskDeadline] = useState(null);
  const [taskReferences, setTaskReferences] = useState("");
  const [stepStatus, setStepStatus] = useState("pending");

  // State for API data
  const [planningData, setPlanningData] = useState([]);
  const [stepId, setStepId] = useState(null);
  const [isAssignedUser, setIsAssignedUser] = useState(false);
  const [taskAssignment, setTaskAssignment] = useState(null);
  const [members, setMembers] = useState([]);
  const [oldFilesNeeded, setOldFilesNeeded] = useState([]);
  const [removedOldFiles, setRemovedOldFiles] = useState([]);

  const { projectid } = useParams();
  const {
    addStepData,
    getStepData,
    getStepId,
    checkStepAuth,
    projectRole,
    assignStep,
    getStepAssignment,
    getMembers,
  } = useContext(ProjectContext);
  const { setIsLoading } = useContext(LoadingContext);

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

  // Get step ID, step data, and check authorization
  const get_step_id = async () => {
    setIsLoading(true);
    try {
      const response = await getStepId(projectid, 7);
      if (response) {
        setStepId(response.plc_step_id);
        setStepStatus(response.status);
        const isAuthorized = await checkStepAuth(response.plc_step_id);
        setIsAssignedUser(isAuthorized);
      }
    } catch (error) {
      console.error("Error fetching step ID:", error);
      message.error("Failed to load Planning data");
    } finally {
      setIsLoading(false);
    }
  };

  const get_step_data = async (step_id) => {
    const stepData = await getStepData(step_id);
    setPlanningData(stepData || []);

    // If there's existing data, set it for editing
    if (stepData && stepData.length > 0) {
      const latestData = stepData[0];
      setPlanningText(latestData.text_data);

      // Initialize old files from existing documents
      const existingFiles = latestData.documents.map((doc) => doc.file);
      setOldFilesNeeded(existingFiles);
      setRemovedOldFiles([]);
    }
  };

  const checkAssignedUser = async (step_id) => {
    if (!step_id) return;
    const isAuthorized = await checkStepAuth(step_id);
    setIsAssignedUser(isAuthorized);
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

  const get_members = async () => {
    const res = await getMembers(projectid);
    setMembers(res);
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

  useEffect(() => {
    get_step_id();
  }, []);

  const handleAddData = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setPlanningText("");
    setFileList([]);
    setOldFilesNeeded([]);
    setRemovedOldFiles([]);
  };

  const handleAssignTask = () => {
    setIsAssignTaskVisible(true);
  };

  const handleAssignTaskClose = () => {
    setIsAssignTaskVisible(false);
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

  // Add getViewerUrl helper function after the formatDate function
  const getViewerUrl = (filePath) => {
    const extension = filePath.split(".").pop().toLowerCase();

    if (extension === "pdf") {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(
        `${BASE_URL}${filePath}`
      )}&embedded=true`;
    }

    if (["jpg", "jpeg", "png", "gif", "bmp", "svg"].includes(extension)) {
      return `${BASE_URL}${filePath}`;
    }

    return `https://docs.google.com/viewer?url=${encodeURIComponent(
      `${BASE_URL}${filePath}`
    )}&embedded=true`;
  };

  // Submit planning data
  const handleSubmit = async () => {
    if (!planningText.trim()) {
      message.warning("Please provide details for the plan.");
      return;
    }

    const formData = new FormData();
    formData.append("field_name", "Plan Details");
    formData.append("text_data", planningText);

    // Append old files array as JSON string
    formData.append("old_files", JSON.stringify(oldFilesNeeded));

    // Append new files
    fileList.forEach((file) => {
      formData.append("files", file.originFileObj || file);
    });

    try {
      const response = await addStepData(stepId, formData);
      if (response.status === 201) {
        message.success("Plan details submitted successfully!");
        setIsModalVisible(false);
        setPlanningText("");
        setFileList([]);
        setOldFilesNeeded([]);
        setRemovedOldFiles([]);
        await get_step_data(stepId);
      } else {
        message.error("Failed to submit plan details.");
      }
    } catch (error) {
      message.error("Failed to submit plan details.");
      console.error(error);
    }
  };

  // Submit task assignment
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

  return (
    <div className="bg-gray-50 min-h-full p-6">
      {/* Simple header with no background */}
      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Create a Plan/Draft Policies
          </h2>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium
              ${stepStatus === "completed"
                  ? "bg-green-100 text-green-800"
                  : stepStatus === "in_progress"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
            >
              {stepStatus.charAt(0).toUpperCase() +
                stepStatus.slice(1).replace("_", " ")}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {projectRole.includes("consultant admin") && (
            <Button
              type="default"
              onClick={() => {
                get_members();
                handleAssignTask();
              }}
              className="bg-white hover:bg-gray-50 border border-gray-300 shadow-sm"
            >
              Assign Task
            </Button>
          )}
          {(projectRole.includes("consultant admin") || isAssignedUser) && (
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
          {(projectRole.includes("consultant admin") || isAssignedUser) && (
            <Button
              type="primary"
              onClick={handleAddData}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {planningData.length > 0 ? "Update Plan" : "Add Plan"}
            </Button>
          )}
        </div>
      </div>

      {planningData.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Main content */}
          <div className="p-6">
            {/* Header with metadata */}
            <div className="flex flex-wrap justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Planning Information
                </h3>
                {planningData[0].saved_at && (
                  <div className="flex items-center mt-1">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 text-blue-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500">
                      Last updated {formatDate(planningData[0].saved_at)}
                    </span>
                  </div>
                )}
              </div>

              {/* User info with avatar */}
              {planningData[0].saved_by && (
                <div className="flex items-center bg-gray-50 px-3 py-1 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                      {planningData[0].saved_by.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-800">
                      {planningData[0].saved_by.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {planningData[0].saved_by.email}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Planning data with documents on the right */}
            <div className="space-y-4 mb-6">
              {planningData.map((item) => (
                <div
                  key={item.id}
                  className="border-l-4 border-blue-400 bg-gray-50 rounded-r-lg overflow-hidden"
                >
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 uppercase">
                      {item.field_name}
                    </h4>
                  </div>
                  <div className="flex flex-col md:flex-row">
                    <div className="px-4 py-3 flex-grow">
                      <p className="text-gray-700">{item.text_data}</p>
                    </div>

                    {/* Documents for this item */}
                    {item.documents && item.documents.length > 0 && (
                      <div className="border-t md:border-t-0 md:border-l border-gray-200 px-4 py-3 md:w-64">
                        <h5 className="text-xs font-medium text-gray-500 mb-2">
                          ATTACHED FILES
                        </h5>
                        <div className="space-y-2">
                          {item.documents.map((doc) => (
                            <div key={doc.id} className="flex items-center">
                              <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                                <FileTextOutlined className="text-blue-600 text-xs" />
                              </div>
                              <div className="overflow-hidden flex-grow">
                                <p className="text-xs font-medium text-gray-700 truncate">
                                  {getFileName(doc.file)}
                                </p>
                                <a
                                  href={getViewerUrl(doc.file)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                                >
                                  View
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-10 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Planning Data
            </h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              The planning section helps outline project policies and
              strategies. Add your plan to get started.
            </p>
            <Button
              onClick={handleAddData}
              type="primary"
              size="large"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Plan
            </Button>
          </div>
        </div>
      )}

      {/* Task Assignment section */}
      {taskAssignment && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Task Assignment
          </h3>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-700">
                  Assignment Details
                </h4>
                <p className="text-xs text-gray-500">
                  {formatDate(taskAssignment.assigned_at)}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Assigned To:
                  </p>
                  <ul className="list-disc list-inside mt-2">
                    {taskAssignment.assigned_to.map((user) => (
                      <li key={user.id} className="text-sm text-gray-600">
                        {user.name} - {user.email}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Deadline:</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {formatDate(taskAssignment.deadline)}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">
                  Description:
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {taskAssignment.description}
                </p>
              </div>

              {taskAssignment.references && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">
                    References:
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {taskAssignment.references}
                  </p>
                </div>
              )}
            </div>

            <div className="text-xs text-gray-500 mt-2">
              <p>
                <b>Status:</b> {taskAssignment.status}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Data Modal */}
      <Modal
        title={
          planningData.length > 0 ? "Update Plan Details" : "Add Plan Details"
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button
            key="save"
            type="primary"
            onClick={handleSubmit}
            className="bg-blue-500"
          >
            Save
          </Button>,
        ]}
      >
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
                  submitting your planning details.
                </p>
              </div>
              <div className="mt-3">
                <a
                  href="/temp.txt"
                  download="planning_template.txt"
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
                  Download Planning Template
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <TextArea
            rows={6}
            placeholder="Enter details for the plan"
            value={planningText}
            onChange={(e) => setPlanningText(e.target.value)}
          />
        </div>

        {/* Existing Files */}
        {oldFilesNeeded.length > 0 && (
          <div className="mt-4 mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Existing Files
            </h4>
            <div className="space-y-2">
              {oldFilesNeeded.map((fileUrl) => (
                <div
                  key={fileUrl}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                >
                  <div className="flex items-center">
                    <FileTextOutlined className="text-blue-500 mr-2" />
                    <span className="text-sm text-gray-600">
                      {getFileName(fileUrl)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <a
                      href={`${BASE_URL}${fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      View File
                    </a>
                    <Button
                      type="text"
                      danger
                      onClick={() => handleRemoveFile(fileUrl)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Removed Files */}
        {removedOldFiles.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Removed Files
            </h4>
            <div className="space-y-2">
              {removedOldFiles.map((fileUrl) => (
                <div
                  key={fileUrl}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                >
                  <div className="flex items-center">
                    <FileTextOutlined className="text-red-500 mr-2" />
                    <span className="text-sm text-gray-600">
                      {getFileName(fileUrl)}
                    </span>
                  </div>
                  <Button
                    type="text"
                    onClick={() => handleRestoreFile(fileUrl)}
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Files */}
        <div className="mt-3">
          <Upload
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={() => false}
            showUploadList={true}
            multiple
          >
            <Button icon={<PaperClipOutlined />}>Attach New Files</Button>
          </Upload>
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
      <DiscussingPolicies />
    </div>
  );
};

export default Planning;
