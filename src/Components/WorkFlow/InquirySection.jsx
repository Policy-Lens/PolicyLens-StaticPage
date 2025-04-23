import React, { useState, useContext, useEffect } from "react";
import {
  Modal,
  Input,
  Upload,
  Button,
  message,
  Select,
  DatePicker,
  Dropdown,
} from "antd";
import { PaperClipOutlined, FileTextOutlined } from "@ant-design/icons";
import { ProjectContext } from "../../Context/ProjectContext";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../../utils/api";
const { TextArea } = Input;
const { Option } = Select;
import { apiRequest } from "../../utils/api";

function InquirySection({ isVisible, onClose }) {
  const [fileLists, setFileLists] = useState({});
  const [inputs, setInputs] = useState({
    Scope: "",
    Timeline: "",
    Budget: "",
    Availability: "",
    "Draft Proposal": "",
  });
  const [stepId, setStepId] = useState(null);
  const [isAssignedUser, setIsAssignedUser] = useState(false);
  const [inquiryData, setInquiryData] = useState([]);
  const [oldFilesNeeded, setOldFilesNeeded] = useState({});
  const [removedOldFiles, setRemovedOldFiles] = useState({});
  const { projectid } = useParams();
  const { addStepData, getStepData, getStepId, checkStepAuth, projectRole } =
    useContext(ProjectContext);

  const handleInputChange = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleUploadChange = (panelKey, { fileList }) => {
    setFileLists((prev) => ({ ...prev, [panelKey]: fileList }));
  };

  const handleRemoveFile = (fieldKey, fileUrl) => {
    setOldFilesNeeded((prev) => ({
      ...prev,
      [fieldKey]: prev[fieldKey].filter((file) => file !== fileUrl),
    }));
    setRemovedOldFiles((prev) => ({
      ...prev,
      [fieldKey]: [...(prev[fieldKey] || []), fileUrl],
    }));
  };

  const handleRestoreFile = (fieldKey, fileUrl) => {
    setRemovedOldFiles((prev) => ({
      ...prev,
      [fieldKey]: prev[fieldKey].filter((file) => file !== fileUrl),
    }));
    setOldFilesNeeded((prev) => ({
      ...prev,
      [fieldKey]: [...(prev[fieldKey] || []), fileUrl],
    }));
  };

  const checkAssignedUser = async (step_id) => {
    const isAuthorized = await checkStepAuth(step_id);
    setIsAssignedUser(isAuthorized);
  };

  const handleSubmit = async (fieldName) => {
    if (!inputs[fieldName]?.trim()) {
      message.warning(`Please provide ${fieldName} details.`);
      return;
    }

    const formData = new FormData();
    formData.append("field_name", fieldName);
    formData.append("text_data", inputs[fieldName]);

    if (oldFilesNeeded[fieldName]?.length > 0) {
      formData.append("old_files", JSON.stringify(oldFilesNeeded[fieldName]));
    }

    if (fileLists[fieldName]) {
      fileLists[fieldName].forEach((file) => {
        formData.append("files", file.originFileObj || file);
      });
    }

    try {
      const response = await addStepData(stepId, formData);

      if (response.status === 201) {
        message.success(`${fieldName} submitted successfully!`);

        setFileLists((prev) => ({ ...prev, [fieldName]: [] }));

        await get_step_data(stepId);
      } else {
        message.error(`Failed to submit ${fieldName}.`);
      }
    } catch (error) {
      message.error(`Failed to submit ${fieldName}.`);
      console.error(error);
    }
  };

  const get_step_id = async () => {
    const step_id = await getStepId(projectid, 2);
    if (step_id) {
      setStepId(step_id);
      await get_step_data(step_id);
      await checkAssignedUser(step_id);
    }
  };

  const get_step_data = async (step_id) => {
    const stepData = await getStepData(step_id);
    setInquiryData(stepData || []);

    if (stepData && stepData.length > 0) {
      const newInputs = {};
      const newOldFiles = {};
      const newRemovedFiles = {};

      const groupedData = stepData.reduce((acc, item) => {
        const fieldName = item.field_name;
        acc[fieldName] = item;
        return acc;
      }, {});

      Object.entries(groupedData).forEach(([fieldName, item]) => {
        newInputs[fieldName] = item.text_data;

        if (item.documents && item.documents.length > 0) {
          newOldFiles[fieldName] = item.documents.map((doc) => doc.file);
          newRemovedFiles[fieldName] = [];
        } else {
          newOldFiles[fieldName] = [];
          newRemovedFiles[fieldName] = [];
        }
      });

      const allFields = [
        "Scope",
        "Timeline",
        "Budget",
        "Availability",
        "Draft Proposal",
      ];
      allFields.forEach((field) => {
        if (!newInputs[field]) newInputs[field] = "";
        if (!newOldFiles[field]) newOldFiles[field] = [];
        if (!newRemovedFiles[field]) newRemovedFiles[field] = [];
      });

      setInputs(newInputs);
      setOldFilesNeeded(newOldFiles);
      setRemovedOldFiles(newRemovedFiles);
      setFileLists({});
    } else {
      setInputs({
        Scope: "",
        Timeline: "",
        Budget: "",
        Availability: "",
        "Draft Proposal": "",
      });
      setOldFilesNeeded({
        Scope: [],
        Timeline: [],
        Budget: [],
        Availability: [],
        "Draft Proposal": [],
      });
      setRemovedOldFiles({
        Scope: [],
        Timeline: [],
        Budget: [],
        Availability: [],
        "Draft Proposal": [],
      });
      setFileLists({});
    }
  };

  useEffect(() => {
    get_step_id();
  }, []);

  useEffect(() => {
    if (isVisible && stepId) {
      get_step_data(stepId);
    }
  }, [isVisible]);

  const getFileName = (filePath) => {
    return filePath.split("/").pop();
  };

  const renderInputWithAttachButton = (
    fieldName,
    placeholder,
    isLarge = false
  ) => {
    const hasExistingData = inquiryData.some(
      (item) => item.field_name === fieldName
    );

    return (
      <div className="space-y-4">
        {/* Template Download Section */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-3">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-2">
              <div className="text-sm text-blue-600">
                <p>Please download and fill in the template before submitting.</p>
              </div>
              <div className="mt-2">
                <a
                  href="/temp.txt"
                  download={`${fieldName.toLowerCase().replace(/\s+/g, '_')}_template.txt`}
                  className="inline-flex items-center px-3 py-1 border border-blue-300 shadow-sm text-xs font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="-ml-0.5 mr-1.5 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download {fieldName} Template
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="relative border border-gray-300 rounded-lg overflow-hidden">
          {isLarge ? (
            <TextArea
              rows={6}
              placeholder={placeholder}
              value={inputs[fieldName] || ""}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              className="border-none resize-none p-4 pr-[100px] text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <Input
              placeholder={placeholder}
              value={inputs[fieldName] || ""}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              className="border-none p-4 pr-[100px] text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>

        {oldFilesNeeded[fieldName]?.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Existing Files
            </h4>
            <div className="space-y-2">
              {oldFilesNeeded[fieldName].map((fileUrl) => (
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
                      onClick={() => handleRemoveFile(fieldName, fileUrl)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {removedOldFiles[fieldName]?.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Removed Files
            </h4>
            <div className="space-y-2">
              {removedOldFiles[fieldName].map((fileUrl) => (
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
                    onClick={() => handleRestoreFile(fieldName, fileUrl)}
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <Upload
            fileList={fileLists[fieldName] || []}
            onChange={(info) => handleUploadChange(fieldName, info)}
            beforeUpload={() => false}
            showUploadList={true}
            multiple
          >
            <Button
              icon={<PaperClipOutlined />}
              className="bg-gray-100 rounded-full px-4 py-1 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-200 focus:outline-none"
            >
              Attach New Files
            </Button>
          </Upload>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            type="primary"
            onClick={() => handleSubmit(fieldName)}
            className="bg-blue-500 text-white"
          >
            {hasExistingData ? "Update" : "Submit"} {fieldName}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Modal
      open={isVisible}
      onCancel={() => {
        onClose();
      }}
      footer={null}
      width={800}
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4">Inquiry Section</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-2">Scope</h3>
          {renderInputWithAttachButton(
            "Scope",
            "Enter the scope of the project",
            true
          )}
        </div>

        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-2">Timeline</h3>
          {renderInputWithAttachButton("Timeline", "Add timeline details")}
        </div>

        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-2">Budget</h3>
          {renderInputWithAttachButton("Budget", "Enter budget")}
        </div>

        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-2">
            Availability
          </h3>
          {renderInputWithAttachButton(
            "Availability",
            "Enter availability details"
          )}
        </div>

        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-2">
            Draft Proposal
          </h3>
          {renderInputWithAttachButton(
            "Draft Proposal",
            "Upload draft proposal",
            true
          )}
        </div>
      </div>
    </Modal>
  );
}

function InquiryPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inquiryData, setInquiryData] = useState([]);
  const [stepId, setStepId] = useState(null);
  const [isAssignedUser, setIsAssignedUser] = useState(false);
  const [stepStatus, setStepStatus] = useState("pending");
  const [isAssignTaskVisible, setIsAssignTaskVisible] = useState(false);
  const [taskAssignment, setTaskAssignment] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDeadline, setTaskDeadline] = useState(null);
  const [taskReferences, setTaskReferences] = useState("");

  const { projectid } = useParams();
  const { getStepData, getStepId, checkStepAuth, projectRole, assignStep, getStepAssignment, getMembers } =
    useContext(ProjectContext);

  const getFileName = (filePath) => {
    return filePath.split("/").pop();
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const checkAssignedUser = async (step_id) => {
    const isAuthorized = await checkStepAuth(step_id);
    setIsAssignedUser(isAuthorized);
  };

  const get_step_id = async () => {
    const response = await getStepId(projectid, 2);
    if (response) {
      setStepId(response.plc_step_id);
      setStepStatus(response.status); // Set the status from response
      await get_step_data(response.plc_step_id);
      await checkAssignedUser(response.plc_step_id);
      await getTaskAssignment(response.plc_step_id);
    }
  };

  const get_step_data = async (step_id) => {
    const stepData = await getStepData(step_id);
    setInquiryData(stepData || []);
  };

  const getTaskAssignment = async (step_id) => {
    try {
      console.log("Fetching task assignment for step ID:", step_id);
      const assignmentData = await getStepAssignment(step_id);
      console.log("Task assignment data received:", assignmentData);
      if (assignmentData.status === 200 && assignmentData.data.length > 0) {
        console.log("Setting task assignment:", assignmentData.data[0]);
        setTaskAssignment(assignmentData.data[0]);
      } else {
        console.log("No task assignment found");
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

  const handleAssignTask = () => {
    setIsAssignTaskVisible(true);
  };

  const handleAssignTaskClose = () => {
    setIsAssignTaskVisible(false);
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

  // Group data by field name
  const groupedData = inquiryData.reduce((acc, item) => {
    acc[item.field_name] = item;
    return acc;
  }, {});

  // Get the latest update time across all fields
  const getLatestUpdateTime = () => {
    if (inquiryData.length === 0) return null;

    const dates = inquiryData.map((item) => new Date(item.saved_at).getTime());
    const latestTime = Math.max(...dates);
    return new Date(latestTime);
  };

  // Get the user who last updated any field
  const getLatestUser = () => {
    if (inquiryData.length === 0) return null;

    const latestDate = getLatestUpdateTime();
    const latestItem = inquiryData.find(
      (item) => new Date(item.saved_at).getTime() === latestDate.getTime()
    );

    return latestItem ? latestItem.saved_by : null;
  };

  // Collect all documents from all fields
  const getAllDocuments = () => {
    if (inquiryData.length === 0) return [];

    const allDocs = [];
    inquiryData.forEach((item) => {
      if (item.documents && item.documents.length > 0) {
        item.documents.forEach((doc) => {
          allDocs.push({
            ...doc,
            fieldName: item.field_name,
          });
        });
      }
    });

    return allDocs;
  };

  const latestUpdateTime = getLatestUpdateTime();
  const latestUser = getLatestUser();
  const allDocuments = getAllDocuments();

  // Get documents for a specific field
  const getFieldDocuments = (fieldName) => {
    if (inquiryData.length === 0) return [];

    const fieldItem = inquiryData.find((item) => item.field_name === fieldName);
    if (
      !fieldItem ||
      !fieldItem.documents ||
      fieldItem.documents.length === 0
    ) {
      return [];
    }

    return fieldItem.documents.map((doc) => ({
      ...doc,
      fieldName: fieldName,
    }));
  };

  return (
    <div className="bg-gray-50 min-h-full p-6">
      {/* Simple header with no background */}
      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Inquiry Section
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

            {(projectRole.includes("admin") || isAssignedUser) && (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "pending",
                      label: "Pending",
                      onClick: () => updateStepStatus("pending"),
                    },
                    {
                      key: "in_progress",
                      label: "In Progress",
                      onClick: () => updateStepStatus("in_progress"),
                    },
                    {
                      key: "completed",
                      label: "Completed",
                      onClick: () => updateStepStatus("completed"),
                    },
                  ],
                }}
              >
                <Button
                  size="small"
                  className="flex items-center gap-1"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
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
                  }
                />
              </Dropdown>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {projectRole.includes("admin") && !taskAssignment && (
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
          {(projectRole.includes("admin") || isAssignedUser) && (
            <Button
              type="primary"
              onClick={() => setIsModalVisible(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {inquiryData.length > 0 ? "Update Data" : "Add Data"}
            </Button>
          )}
        </div>
      </div>

      {Object.keys(groupedData).length > 0 ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Main content */}
          <div className="p-6">
            {/* Header with metadata */}
            <div className="flex flex-wrap justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Inquiry Information
                </h3>
                {latestUpdateTime && (
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
                      Last updated {formatDate(latestUpdateTime)}
                    </span>
                  </div>
                )}
              </div>

              {/* User info with avatar */}
              {latestUser && (
                <div className="flex items-center bg-gray-50 px-3 py-1 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                      {latestUser.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-800">
                      {latestUser.name}
                    </p>
                    <p className="text-xs text-gray-500">{latestUser.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Compact inquiry fields with documents on the right */}
            <div className="space-y-4 mb-6">
              {/* Scope */}
              {groupedData["Scope"] && (
                <div className="border-l-4 border-blue-400 bg-gray-50 rounded-r-lg overflow-hidden">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 uppercase">
                      SCOPE
                    </h4>
                  </div>
                  <div className="flex flex-col md:flex-row">
                    <div className="px-4 py-3 flex-grow">
                      <p className="text-gray-700">
                        {groupedData["Scope"].text_data}
                      </p>
                    </div>

                    {/* Documents for Scope */}
                    {getFieldDocuments("Scope").length > 0 && (
                      <div className="border-t md:border-t-0 md:border-l border-gray-200 px-4 py-3 md:w-64">
                        <h5 className="text-xs font-medium text-gray-500 mb-2">
                          ATTACHED FILES
                        </h5>
                        <div className="space-y-2">
                          {getFieldDocuments("Scope").map((doc) => (
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
              )}

              {/* Timeline */}
              {groupedData["Timeline"] && (
                <div className="border-l-4 border-blue-400 bg-gray-50 rounded-r-lg overflow-hidden">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 uppercase">
                      TIMELINE
                    </h4>
                  </div>
                  <div className="flex flex-col md:flex-row">
                    <div className="px-4 py-3 flex-grow">
                      <p className="text-gray-700">
                        {groupedData["Timeline"].text_data}
                      </p>
                    </div>

                    {/* Documents for Timeline */}
                    {getFieldDocuments("Timeline").length > 0 && (
                      <div className="border-t md:border-t-0 md:border-l border-gray-200 px-4 py-3 md:w-64">
                        <h5 className="text-xs font-medium text-gray-500 mb-2">
                          ATTACHED FILES
                        </h5>
                        <div className="space-y-2">
                          {getFieldDocuments("Timeline").map((doc) => (
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
              )}

              {/* Budget */}
              {groupedData["Budget"] && (
                <div className="border-l-4 border-blue-400 bg-gray-50 rounded-r-lg overflow-hidden">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 uppercase">
                      BUDGET
                    </h4>
                  </div>
                  <div className="flex flex-col md:flex-row">
                    <div className="px-4 py-3 flex-grow">
                      <p className="text-gray-700">
                        {groupedData["Budget"].text_data}
                      </p>
                    </div>

                    {/* Documents for Budget */}
                    {getFieldDocuments("Budget").length > 0 && (
                      <div className="border-t md:border-t-0 md:border-l border-gray-200 px-4 py-3 md:w-64">
                        <h5 className="text-xs font-medium text-gray-500 mb-2">
                          ATTACHED FILES
                        </h5>
                        <div className="space-y-2">
                          {getFieldDocuments("Budget").map((doc) => (
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
              )}

              {/* Availability */}
              {groupedData["Availability"] && (
                <div className="border-l-4 border-blue-400 bg-gray-50 rounded-r-lg overflow-hidden">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 uppercase">
                      AVAILABILITY
                    </h4>
                  </div>
                  <div className="flex flex-col md:flex-row">
                    <div className="px-4 py-3 flex-grow">
                      <p className="text-gray-700">
                        {groupedData["Availability"].text_data}
                      </p>
                    </div>

                    {/* Documents for Availability */}
                    {getFieldDocuments("Availability").length > 0 && (
                      <div className="border-t md:border-t-0 md:border-l border-gray-200 px-4 py-3 md:w-64">
                        <h5 className="text-xs font-medium text-gray-500 mb-2">
                          ATTACHED FILES
                        </h5>
                        <div className="space-y-2">
                          {getFieldDocuments("Availability").map((doc) => (
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
              )}

              {/* Draft Proposal */}
              {groupedData["Draft Proposal"] && (
                <div className="border-l-4 border-blue-400 bg-gray-50 rounded-r-lg overflow-hidden">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 uppercase">
                      DRAFT PROPOSAL
                    </h4>
                  </div>
                  <div className="flex flex-col md:flex-row">
                    <div className="px-4 py-3 flex-grow">
                      <p className="text-gray-700">
                        {groupedData["Draft Proposal"].text_data}
                      </p>
                    </div>

                    {/* Documents for Draft Proposal */}
                    {getFieldDocuments("Draft Proposal").length > 0 && (
                      <div className="border-t md:border-t-0 md:border-l border-gray-200 px-4 py-3 md:w-64">
                        <h5 className="text-xs font-medium text-gray-500 mb-2">
                          ATTACHED FILES
                        </h5>
                        <div className="space-y-2">
                          {getFieldDocuments("Draft Proposal").map((doc) => (
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
              )}
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
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Inquiry Data
            </h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              The inquiry section helps gather important project details like
              scope, timeline, and budget. Add your first inquiry to get
              started.
            </p>
            <Button
              onClick={() => setIsModalVisible(true)}
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
              Add Inquiry Data
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

      <InquirySection
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />

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
    </div>
  );
}

export default InquiryPage;
