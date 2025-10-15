import React, { useState, useContext, useEffect } from "react";
import {
  Button,
  Input,
  Upload,
  message,
  Modal,
  Dropdown,
  Select,
  DatePicker,
} from "antd";
import { PaperClipOutlined, FileTextOutlined, LoadingOutlined } from "@ant-design/icons";
import { ProjectContext } from "../../Context/ProjectContext";
import { useParams } from "react-router-dom";
import { BASE_URL, apiRequest } from "../../utils/api";
import { useTheme } from "../../contexts/ThemeContext";
import InteractiveIsoClause from "../Common/InteractiveIsoClause";
import FinalizeContractForm from "./FinalizeContractForm";
const { TextArea } = Input;
const { Option } = Select;

function FinalizeContract() {
  const { isDarkMode } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [description, setDescription] = useState("");
  const [fileList, setFileList] = useState([]);
  const [finalizeContractData, setFinalizeContractData] = useState([]);
  const [stepId, setStepId] = useState(null);
  const [isAssignedUser, setIsAssignedUser] = useState(false);
  const [oldFilesNeeded, setOldFilesNeeded] = useState([]);
  const [removedOldFiles, setRemovedOldFiles] = useState([]);
  const [stepStatus, setStepStatus] = useState("pending");
  const [reviewStatus, setReviewStatus] = useState("not_submitted");
  const [reviewComment, setReviewComment] = useState("");
  const [isAssignTaskVisible, setIsAssignTaskVisible] = useState(false);
  const [taskAssignment, setTaskAssignment] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDeadline, setTaskDeadline] = useState(null);
  const [taskReferences, setTaskReferences] = useState("");
  const [associatedIsoClause, setAssociatedIsoClause] = useState(null);
  const [process, setProcess] = useState("core");
  const [isNeedsMoreInfoModalVisible, setIsNeedsMoreInfoModalVisible] = useState(false);
  const [moreInfoComment, setMoreInfoComment] = useState("");
  const [moreInfoFileList, setMoreInfoFileList] = useState([]);
  const [reviewOldFilesNeeded, setReviewOldFilesNeeded] = useState([]);
  const [reviewRemovedOldFiles, setReviewRemovedOldFiles] = useState([]);
  const [downloadingFiles, setDownloadingFiles] = useState([]);
  const [formData, setFormData] = useState({});
  const [showForm, setShowForm] = useState(true); // Show form by default

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

  const handleReviewFileChange = ({ fileList: newFileList }) => {
    setMoreInfoFileList(newFileList);
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

    const formData = new FormData();
    formData.append("field_name", "Finalize Contract");
    formData.append("text_data", description);
    formData.append("old_files", JSON.stringify(oldFilesNeeded));
    fileList.forEach((file) => {
      formData.append("files", file.originFileObj || file);
    });

    try {
      const response = await addStepData(stepId, formData);
      if (response.status === 201) {
        message.success("Contract finalized successfully!");
        setIsModalVisible(false);
        setDescription("");
        setFileList([]);
        setOldFilesNeeded([]);
        setRemovedOldFiles([]);
        await get_step_id(); // Refresh data immediately
      } else {
        message.error("Failed to finalize contract.");
      }
    } catch (error) {
      message.error("Failed to finalize contract.");
      console.error(error);
    }
  };

  const handleFormSave = async (data) => {
    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("field_name", "Finalize Contract");
      formDataToSubmit.append("text_data", JSON.stringify(data));
      formDataToSubmit.append("old_files", JSON.stringify(oldFilesNeeded));

      fileList.forEach((file) => {
        formDataToSubmit.append("files", file.originFileObj || file);
      });

      const response = await addStepData(stepId, formDataToSubmit);
      if (response.status === 201) {
        message.success("Contract finalized successfully!");
        setShowForm(false); // Hide the form
        setFormData({});
        setFileList([]);
        setOldFilesNeeded([]);
        setRemovedOldFiles([]);
        await get_step_id();
      } else {
        message.error("Failed to finalize contract.");
      }
    } catch (error) {
      message.error("Failed to finalize contract.");
      console.error(error);
    }
  };

  const handleSendForReview = async () => {
    try {
      const response = await apiRequest(
        "PUT",
        `/api/plc/plc_step/${stepId}/update-status/`,
        { status: "completed" },
        true
      );
      if (response.status === 200) {
        message.success("Step sent for review successfully!");
        setStepStatus("completed");
        setReviewStatus("under_review");
        await get_step_id(); // Refresh data immediately
      } else {
        message.error("Failed to send step for review.");
      }
    } catch (error) {
      console.error("Error sending for review:", error);
      message.error("Failed to send step for review.");
    }
  };

  const handleReviewAction = async (action) => {
    if (action !== "accept" && !moreInfoComment.trim()) {
      message.warning("Please provide a comment for your review.");
      return;
    }

    const formData = new FormData();
    formData.append(
      "review_status",
      action === "accept" ? "accepted" : action === "reject" ? "rejected" : "needs_info"
    );
    formData.append("review_comment", moreInfoComment);
    formData.append("old_files", JSON.stringify(reviewOldFilesNeeded));
    moreInfoFileList.forEach((file) => {
      formData.append("files", file.originFileObj);
    });

    try {
      const response = await apiRequest(
        "POST",
        `/api/plc/plc_step/${stepId}/submit-review/`,
        formData,
        true,
        true
      );
      if (response.status === 200) {
        message.success(`Review ${action} submitted successfully!`);
        setReviewStatus(response.data.review_status);
        setReviewComment(response.data.review_comment || "");
        setReviewOldFilesNeeded(response.data.documents?.map((doc) => doc.file) || []);
        setIsNeedsMoreInfoModalVisible(false);
        setMoreInfoComment("");
        setMoreInfoFileList([]);
        await get_step_id(); // Refresh data immediately
      } else {
        message.error(`Failed to submit ${action} review.`);
      }
    } catch (error) {
      console.error(`Error submitting ${action} review:`, error);
      message.error(error.response?.data?.message || `Failed to submit ${action} review.`);
    }
  };

  const getFileName = (filePath) => {
    return filePath.split("/").pop();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

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

  const get_step_id = async () => {
    try {
      const response = await getStepId(projectid, 3);
      if (response) {
        setStepId(response.plc_step_id);
        setStepStatus(response.status);
        setReviewStatus(response.review_status || "not_submitted");
        setReviewComment(response.review_comment || "");
        setAssociatedIsoClause(response.associated_iso_clause);
        setProcess(response.process || "core");
        await get_step_data(response.plc_step_id);
        await checkAssignedUser(response.plc_step_id);
        await getTaskAssignment(response.plc_step_id);
        const reviewData = await apiRequest(
          "GET",
          `/api/plc/plc_step/${response.plc_step_id}/review-files/`,
          null,
          true
        );
        if (reviewData.status === 200 && reviewData.data.documents) {
          setReviewOldFilesNeeded(reviewData.data.documents.map((doc) => doc.file));
        }
      }
    } catch (error) {
      console.error("Error fetching step ID:", error);
      message.error("Failed to load contract data.");
    }
  };

  const get_step_data = async (step_id) => {
    const stepData = await getStepData(step_id);
    setFinalizeContractData(stepData || []);
    if (stepData && stepData.length > 0) {
      const latestData = stepData[0];
      setDescription(latestData.text_data);
      const existingFiles = latestData.documents.map((doc) => doc.file);
      setOldFilesNeeded(existingFiles);
      setRemovedOldFiles([]);
    } else {
      setDescription("");
      setOldFilesNeeded([]);
      setRemovedOldFiles([]);
    }
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

  const handleAssignTask = () => {
    get_members();
    setIsAssignTaskVisible(true);
  };

  const handleAssignTaskClose = () => {
    setIsAssignTaskVisible(false);
    setSelectedTeamMembers([]);
    setTaskDescription("");
    setTaskDeadline(null);
    setTaskReferences("");
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
        setSelectedTeamMembers([]);
        setTaskDescription("");
        setTaskDeadline(null);
        setTaskReferences("");
        await get_step_id(); // Refresh data immediately
      } else {
        message.error("Failed to assign task.");
      }
    } catch (error) {
      message.error("Failed to assign task.");
      console.error(error);
    }
  };

  const handleAddData = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setDescription("");
    setFileList([]);
    setOldFilesNeeded([]);
    setRemovedOldFiles([]);
  };

  const handleNeedsMoreInfoClose = () => {
    setIsNeedsMoreInfoModalVisible(false);
    setMoreInfoComment("");
    setMoreInfoFileList([]);
  };

  const handleFileDownload = async (fileUrl, fileName) => {
    setDownloadingFiles((prev) => [...prev, fileUrl]);
    try {
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${BASE_URL}${fileUrl}`;
      const response = await fetch(fullUrl, { credentials: 'include' });
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error('Failed to download file');
    } finally {
      setDownloadingFiles((prev) => prev.filter((f) => f !== fileUrl));
    }
  };

  useEffect(() => {
    get_step_id();
  }, []);

  const getLatestUpdateTime = () => {
    if (finalizeContractData.length === 0) return null;
    const dates = finalizeContractData.map((item) =>
      new Date(item.saved_at).getTime()
    );
    return new Date(Math.max(...dates));
  };

  const getLatestUser = () => {
    if (finalizeContractData.length === 0) return null;
    const latestDate = getLatestUpdateTime();
    const latestItem = finalizeContractData.find(
      (item) => new Date(item.saved_at).getTime() === latestDate.getTime()
    );
    return latestItem ? latestItem.saved_by : null;
  };

  const updateStepStatus = async (newStatus) => {
    try {
      const response = await apiRequest(
        "PUT",
        `/api/plc/plc_step/${stepId}/update-status/`,
        { status: newStatus },
        true
      );
      if (response.status === 200) {
        setStepStatus(newStatus);
        message.success("Status updated successfully");
        await get_step_id(); // Refresh data immediately
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
        { core_or_noncore: newProcess },
        true
      );
      if (response.status === 200) {
        setProcess(newProcess);
        message.success("Process updated successfully");
        await get_step_id(); // Refresh data immediately
      }
    } catch (error) {
      console.error("Error updating process:", error);
      message.error("Failed to update process");
    }
  };

  const latestUpdateTime = getLatestUpdateTime();
  const latestUser = getLatestUser();

  return (
    <div className={`min-h-full p-6 ${isDarkMode ? 'dark-bg-primary' : ''}`}>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${isDarkMode ? 'dark-text-primary' : 'text-gray-800'}`}>Finalize Contract</h2>
          <div className="flex space-x-3">
            {projectRole && projectRole.includes("consultant admin") && reviewStatus !== "under_review" && reviewStatus !== "accepted" && (
              <Button
                type="default"
                onClick={handleSendForReview}
                className="bg-green-600 hover:bg-green-700 text-white border-green-600"
              >
                Send for Review
              </Button>
            )}
            {projectRole === "company" && (
              <>
                <Button
                  type="default"
                  onClick={() => handleReviewAction("accept")}
                  className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                >
                  Accept
                </Button>
                <Button
                  type="default"
                  onClick={() => handleReviewAction("reject")}
                  className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                >
                  Reject
                </Button>
                <Button
                  type="default"
                  onClick={() => setIsNeedsMoreInfoModalVisible(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600"
                >
                  Needs More Info
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium
                ${reviewStatus === "accepted"
                  ? "bg-green-100 text-green-800"
                  : reviewStatus === "rejected"
                    ? "bg-red-100 text-red-800"
                    : reviewStatus === "needs_info"
                      ? "bg-orange-100 text-orange-800"
                      : reviewStatus === "under_review"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                }`}
            >
              {reviewStatus === "accepted"
                ? "Accepted"
                : reviewStatus === "rejected"
                  ? "Rejected"
                  : reviewStatus === "needs_info"
                    ? "Needs More Info"
                    : reviewStatus === "under_review"
                      ? "Under Review"
                      : "Not Submitted"}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              ISO:&nbsp;<InteractiveIsoClause isoClause={associatedIsoClause} />
            </span>
          </div>
          <div className="flex space-x-3">
            {projectRole && projectRole.includes("consultant admin") && (
              <Button
                type="default"
                onClick={handleAssignTask}
                className="bg-white hover:bg-gray-50 border border-gray-300 shadow-sm"
              >
                Assign Task
              </Button>
            )}
            {projectRole && projectRole.includes("consultant admin") && (
              <Select
                value={process}
                onChange={updateProcess}
                style={{ width: 120 }}
              >
                <Option value="core">Core</Option>
                <Option value="non core">Non Core</Option>
              </Select>
            )}
            {((projectRole && projectRole.includes("consultant admin")) || isAssignedUser) && (
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
            {((projectRole && projectRole.includes("consultant")) || (projectRole && projectRole.includes("admin")) || isAssignedUser) && (
              <Button
                type="primary"
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {finalizeContractData.length > 0 ? "Update Contract" : "Add Contract"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {finalizeContractData.length > 0 ? (
        <div className={`rounded-xl shadow-md overflow-hidden ${isDarkMode ? 'dark-bg-card' : 'bg-white'}`}>
          <div className="p-6">
            <div className="flex flex-wrap justify-between items-center mb-6">
              <div>
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'dark-text-primary' : 'text-gray-800'}`}>
                  Contract Information
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

            <div className="space-y-4 mb-6">
              {finalizeContractData.map((item) => (
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
                                <button
                                  onClick={() => handleFileDownload(doc.file, getFileName(doc.file))}
                                  className="text-sm text-blue-700 truncate hover:underline flex items-center gap-2 disabled:opacity-60"
                                  title={getFileName(doc.file)}
                                  disabled={downloadingFiles.includes(doc.file)}
                                  style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
                                >
                                  {getFileName(doc.file)}
                                  {downloadingFiles.includes(doc.file) && (
                                    <LoadingOutlined spin style={{ fontSize: 16, marginLeft: 6 }} />
                                  )}
                                </button>
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
            {reviewComment && (
              <div className="p-6">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3">
                  Review Comment
                </h3>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                  <p className={`text-sm ${isDarkMode ? 'dark-text-primary' : 'text-gray-800'}`}>{reviewComment}</p>
                </div>
              </div>
            )}
            {reviewOldFilesNeeded.length > 0 && (
              <div className="p-6">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3">
                  Review Files
                </h3>
                <div className="space-y-3">
                  {reviewOldFilesNeeded.map((fileUrl) => (
                    <div
                      key={fileUrl}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                    >
                      <div className="flex items-center overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <FileTextOutlined className="text-blue-600" />
                        </div>
                        <button
                          onClick={() => handleFileDownload(fileUrl, getFileName(fileUrl))}
                          className="text-sm text-blue-700 truncate hover:underline flex items-center gap-2 disabled:opacity-60"
                          title={getFileName(fileUrl)}
                          disabled={downloadingFiles.includes(fileUrl)}
                          style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
                        >
                          {getFileName(fileUrl)}
                          {downloadingFiles.includes(fileUrl) && (
                            <LoadingOutlined spin style={{ fontSize: 16, marginLeft: 6 }} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : showForm ? (
        <div className={`rounded-xl shadow-md p-6 ${isDarkMode ? 'dark-bg-card' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              {finalizeContractData.length > 0 ? "Update Contract" : "Add Contract"}
            </h3>
            <Button
              type="default"
              onClick={() => setShowForm(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              Cancel
            </Button>
          </div>
          <FinalizeContractForm
            stepId={stepId}
            onSave={handleFormSave}
            initialData={formData}
          />
        </div>
      ) : (
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md border border-gray-100 p-6 flex flex-col items-center justify-center min-h-[300px]">
          <div className="text-center max-w-md mx-auto">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-600"
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
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              No Contract Data
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              The contract section helps finalize the agreement between parties.
              Add your contract details to get started.
            </p>
            <Button
              onClick={() => setShowForm(true)}
              type="primary"
              size="large"
              className="bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200 font-medium h-10 px-6"
            >
              <span className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Add Contract</span>
              </span>
            </Button>
          </div>
        </div>
      )}

      {taskAssignment && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Task Assignment
          </h3>
          <div className={`rounded-xl shadow-md p-6 ${isDarkMode ? 'dark-bg-card' : 'bg-white'}`}>
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
                    {(taskAssignment.assigned_to || []).map((user) => (
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

      <Modal
        title={finalizeContractData.length > 0 ? "Update Contract" : "Add Contract"}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width="90%"
        style={{ maxWidth: '1200px' }}
      >
        <FinalizeContractForm
          stepId={stepId}
          onSave={handleFormSave}
          initialData={formData}
        />
      </Modal>

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
            onClick={() => handleReviewAction("needs_info")}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Submit Request
          </Button>,
        ]}
        width={600}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
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
                  Download Review Template
                </h3>
                <div className="mt-2 text-sm text-blue-600">
                  <p>
                    Please download and fill in the review template to guide your
                    review process.
                  </p>
                </div>
                <div className="mt-3">
                  <a
                    href="/templates/Review_template.xlsx"
                    download="review_template.xlsx"
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
                    Download Review Template
                  </a>
                </div>
              </div>
            </div>
          </div>
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
          {reviewOldFilesNeeded.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Existing Review Files
              </h4>
              <div className="space-y-3">
                {reviewOldFilesNeeded.map((fileUrl) => (
                  <div
                    key={fileUrl}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-center overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <FileTextOutlined className="text-blue-600" />
                      </div>
                      <button
                        onClick={() => handleFileDownload(fileUrl, getFileName(fileUrl))}
                        className="text-sm text-blue-700 truncate hover:underline flex items-center gap-2 disabled:opacity-60"
                        title={getFileName(fileUrl)}
                        disabled={downloadingFiles.includes(fileUrl)}
                        style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
                      >
                        {getFileName(fileUrl)}
                        {downloadingFiles.includes(fileUrl) && (
                          <LoadingOutlined spin style={{ fontSize: 16, marginLeft: 6 }} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attach Files (Optional)
            </label>
            <Upload
              fileList={moreInfoFileList}
              onChange={handleReviewFileChange}
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

export default FinalizeContract;