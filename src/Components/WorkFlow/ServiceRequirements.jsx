import React, { useState, useContext, useEffect } from "react";
import {
  Button,
  Modal,
  Input,
  Upload,
  message,
  Spin,
  Select,
  DatePicker,
} from "antd";
import {
  PaperClipOutlined,
  FileTextOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { ProjectContext } from "../../Context/ProjectContext";
import { useParams } from "react-router-dom";
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
  const [reviewStatus, setReviewStatus] = useState("not_submitted");
  const [reviewComment, setReviewComment] = useState("");
  const [companyAdmins, setCompanyAdmins] = useState([]);
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

  // Review Modal states
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [reviewAction, setReviewAction] = useState("accept");
  const [reviewModalComment, setReviewModalComment] = useState("");
  const [reviewFileList, setReviewFileList] = useState([]);
  const [reviewOldFilesNeeded, setReviewOldFilesNeeded] = useState([]);
  const [reviewRemovedOldFiles, setReviewRemovedOldFiles] = useState([]);

  const [downloadingFiles, setDownloadingFiles] = useState([]);

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

  const handleReviewRemoveFile = (fileUrl) => {
    setReviewOldFilesNeeded((prev) => prev.filter((file) => file !== fileUrl));
    setReviewRemovedOldFiles((prev) => [...prev, fileUrl]);
  };

  const handleReviewRestoreFile = (fileUrl) => {
    setReviewRemovedOldFiles((prev) => prev.filter((file) => file !== fileUrl));
    setReviewOldFilesNeeded((prev) => [...prev, fileUrl]);
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
    formData.append("old_files", JSON.stringify(oldFilesNeeded));

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
        setStepId(response.plc_step_id);
        setStepStatus(response.status);
        setReviewStatus(response.review_status);
        setReviewComment(response.review_comment || "");
        setCompanyAdmins(response.company_admins || []);
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
          const existingReviewFiles = reviewData.data.documents.map((doc) => doc.file);
          setReviewOldFilesNeeded(existingReviewFiles);
        }
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

  const handleNeedsMoreInfoSubmit = async () => {
    if (!moreInfoComment.trim()) {
      message.warning("Please provide a comment.");
      return;
    }

    const formData = new FormData();
    formData.append("review_status", "needs_info");
    formData.append("review_comment", moreInfoComment);
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
        message.success("More information request submitted successfully!");
        setIsNeedsMoreInfoModalVisible(false);
        setMoreInfoComment("");
        setMoreInfoFileList([]);
        setReviewStatus("needs_info");
        setReviewComment(moreInfoComment);
        await get_step_id();
      } else {
        message.error("Failed to submit more information request.");
      }
    } catch (error) {
      console.error("Error submitting more info:", error);
      message.error("Failed to submit more information request.");
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
      if (stepData && stepData.length > 0) {
        const latestData = stepData[0];
        setDescription(latestData.text_data);
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
        { status: newStatus },
        true
      );
      if (response.status === 200) {
        setStepStatus(newStatus);
        setReviewStatus(response.data.review_status);
        setReviewComment(response.data.review_comment || "");
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
        { core_or_noncore: newProcess },
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
        setSelectedTeamMembers([]);
        setTaskDescription("");
        setTaskDeadline(null);
        setTaskReferences("");
        await getTaskAssignment(stepId);
      } else {
        message.error("Failed to assign task.");
      }
    } catch (error) {
      message.error("Failed to assign task.");
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
        setReviewComment(response.data.review_comment || "");
      } else {
        message.error("Failed to send step for review.");
      }
    } catch (error) {
      console.error("Error sending for review:", error);
      message.error("Failed to send step for review.");
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewModalComment.trim() && reviewAction !== "accept") {
      message.warning("Please provide a comment for your review.");
      return;
    }

    const formData = new FormData();
    formData.append(
      "review_status",
      reviewAction === "accept"
        ? "accepted"
        : reviewAction === "reject"
          ? "rejected"
          : "needs_info"
    );
    formData.append("review_comment", reviewModalComment);
    formData.append("old_files", JSON.stringify(reviewOldFilesNeeded));
    reviewFileList.forEach((file) => {
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
        message.success("Review submitted successfully!");
        setIsReviewModalVisible(false);
        setReviewModalComment("");
        setReviewFileList([]);
        setReviewOldFilesNeeded(response.data.documents?.map((doc) => doc.file) || []);
        setReviewRemovedOldFiles([]);
        setReviewStatus(response.data.review_status);
        setReviewComment(response.data.review_comment || "");
      } else {
        message.error("Failed to submit review.");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      message.error("Failed to submit review.");
    }
  };

  // Download handler for a single file
  const handleFileDownload = async (fileUrl, fileName) => {
    setDownloadingFiles((prev) => [...prev, fileUrl]);
    try {
      const response = await fetch(fileUrl, { credentials: 'include' });
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

  const ServiceRequirementsCard = ({ data, onUpdateClick, assignedUser, taskAssignment }) => {
    if (!data || data.length === 0) {
      return (
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md border border-gray-100 p-6 flex flex-col items-center justify-center min-h-[300px]">
          <div className="text-center max-w-md mx-auto">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-blue-100 rounded-full animate pulse"></div>
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
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        <div className="grid md:grid-cols-3 divide-x divide-gray-100">
          <div className="md:col-span-2 p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Service Requirements</h2>
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Last updated: {formatDate(latestData.saved_at)}
                </p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${reviewStatus === "accepted"
                ? "bg-green-100 text-green-800"
                : reviewStatus === "rejected"
                  ? "bg-red-100 text-red-800"
                  : reviewStatus === "needs_info"
                    ? "bg-orange-100 text-orange-800"
                    : reviewStatus === "under_review"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}>
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
            </div>
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 uppercase mb-3">Description</h3>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[120px] border border-gray-100">
                <p className="text-gray-700 whitespace-pre-wrap">{latestData.text_data}</p>
              </div>
            </div>
            <div className="mb-6 space-y-4">
              <div className="border-l-2 border-blue-200 pl-4 space-y-3 mb-4 relative">
                <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-0"></div>
                <div className="flex items-start">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Created by</p>
                    <p className="text-sm font-medium">{latestData.saved_by?.name || "System"}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(latestData.saved_at)}
                  </span>
                </div>
              </div>
            </div>
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
          <div className="md:col-span-1 bg-gray-50">
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
                    <button
                      key={index}
                      onClick={() => handleFileDownload(doc.file, getFileName(doc.file))}
                      className="text-sm text-blue-700 truncate hover:underline flex items-center gap-2 disabled:opacity-60"
                      title={getFileName(doc.file)}
                      disabled={downloadingFiles.includes(doc.file)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '0',
                        margin: '0',
                        cursor: 'pointer'
                      }}
                    >
                      {getFileName(doc.file)}
                      {downloadingFiles.includes(doc.file) && (
                        <LoadingOutlined style={{ fontSize: '16px', marginLeft: '6px' }} spin />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No documents attached
                </div>
              )}
            </div>
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
            {reviewComment && (
              <div className="p-6">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3">
                  Review Comment
                </h3>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-800">{reviewComment}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ReviewModal = () => {
    // These states are local to ReviewModal but are synced with parent states
    // when the modal opens or parent states change.
    const [localComment, setLocalComment] = useState(reviewModalComment);
    const [localAction, setLocalAction] = useState(reviewAction);
    const [isSubmitting, setIsSubmitting] = useState(false); // Use a distinct submitting state for clarity and control
    const [initialSyncDone, setInitialSyncDone] = useState(false);

    // Sync local state with parent state ONLY when modal first opens
    useEffect(() => {
      if (isReviewModalVisible && !initialSyncDone) {
        setLocalComment(reviewModalComment);
        setLocalAction(reviewAction);
        setInitialSyncDone(true);
      } else if (!isReviewModalVisible) {
        setInitialSyncDone(false);
      }
    }, [isReviewModalVisible]); // Remove reviewModalComment and reviewAction from dependencies

    // Handle comment changes with local state only - sync parent state only on submit
    const handleCommentChange = (e) => {
      const newValue = e.target.value;
      setLocalComment(newValue);
      // Don't sync parent state immediately to prevent re-renders
    };

    // Handle action changes with local state and update parent state
    const handleActionChange = (value) => {
      setLocalAction(value);
      setReviewAction(value); // Sync parent state immediately for action (this won't cause focus loss)
    };

    // Handle file upload changes
    const handleReviewFileChange = ({ fileList }) => {
      setReviewFileList(fileList);
    };

    // Reset modal state
    const resetModalState = () => {
      setIsReviewModalVisible(false);
      setLocalComment("");
      setReviewModalComment(""); // Reset parent comment state
      setLocalAction("accept");
      setReviewAction("accept"); // Reset parent action state
      setReviewFileList([]);
      setReviewOldFilesNeeded([]);
      setReviewRemovedOldFiles([]);
      setIsSubmitting(false); // Ensure submitting state is false on close
      setInitialSyncDone(false); // Reset sync flag
    };

    // Optimized submit handler
    const handleReviewSubmit = async () => {
      // Crucial: Prevent new submissions if one is already in progress
      if (isSubmitting) {
        return;
      }

      // Validate comment for non-accept actions
      if (!localComment.trim() && localAction !== "accept") {
        message.warning("Please provide a comment for your review.");
        return;
      }

      // Sync comment with parent state before submission
      setReviewModalComment(localComment);

      setIsSubmitting(true); // Set submitting to true at the very start

      const formData = new FormData();
      formData.append(
        "review_status",
        localAction === "accept"
          ? "accepted"
          : localAction === "reject"
            ? "rejected"
            : "needs_info"
      );
      formData.append("review_comment", localComment);
      formData.append("old_files", JSON.stringify(reviewOldFilesNeeded));
      reviewFileList.forEach((file) => {
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
          message.success("Review submitted successfully!");
          // Update parent states after successful submission
          setReviewStatus(response.data.review_status);
          setReviewComment(response.data.review_comment || "");
          setReviewOldFilesNeeded(response.data.documents?.map((doc) => doc.file) || []);
          resetModalState(); // Close modal and reset local states
        } else {
          message.error("Failed to submit review.");
        }
      } catch (error) {
        console.error("Error submitting review:", error);
        message.error(error.response?.data?.message || "Failed to submit review.");
      } finally {
        setIsSubmitting(false); // Always reset submitting to false when the process ends
      }
    };

    return (
      <Modal
        title="Submit Review"
        open={isReviewModalVisible}
        onCancel={resetModalState}
        footer={[
          <Button
            key="cancel"
            onClick={resetModalState}
            className="border-gray-300 text-gray-700"
            disabled={isSubmitting} // Disable cancel button when submitting
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleReviewSubmit}
            className={`${localAction === "accept"
              ? "bg-green-600 hover:bg-green-700"
              : localAction === "reject"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-orange-600 hover:bg-orange-700"
              }`}
            loading={isSubmitting} // Use the distinct submitting state for Ant Design's loading prop
            disabled={isSubmitting} // Explicitly disable the button to prevent multiple clicks
          >
            Submit Review
          </Button>,
        ]}
        width={700}
        maskClosable={false}
        destroyOnClose={true}
      >
        <div className="p-6">
          <div className="space-y-6">
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
                    Download Review Template
                  </h3>
                  <div className="mt-2 text-sm text-blue-600">
                    <p>
                      Please download and fill in the review template below to guide
                      your review process.
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
                Review Action
              </label>
              <Select
                value={localAction}
                onChange={handleActionChange}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <Option value="accept">Accept</Option>
                <Option value="reject">Reject</Option>
                <Option value="needs_more_info">Needs More Info</Option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment {localAction !== "accept" && <span className="text-red-500">*</span>}
              </label>
              <TextArea
                rows={6}
                placeholder="Enter your review comments..."
                value={localComment}
                onChange={handleCommentChange}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                autoSize={{ minRows: 6, maxRows: 8 }}
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
                        <span className="text-sm text-gray-700 truncate">
                          <button
                            onClick={() => handleFileDownload(fileUrl, getFileName(fileUrl))}
                            className="text-sm text-blue-700 truncate hover:underline flex items-center gap-2 disabled:opacity-60"
                            title={getFileName(fileUrl)}
                            disabled={downloadingFiles.includes(fileUrl)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '0',
                              margin: '0',
                              cursor: 'pointer'
                            }}
                          >
                            {getFileName(fileUrl)}
                            {downloadingFiles.includes(fileUrl) && (
                              <LoadingOutlined style={{ fontSize: '16px', marginLeft: '6px' }} spin />
                            )}
                          </button>
                        </span>
                      </div>
                      <div className="flex items-center">
                        <a
                          href={`${BASE_URL}${fileUrl}`}
                          download
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4"
                          title={getFileName(fileUrl)}
                        >
                          {getFileName(fileUrl)}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {reviewRemovedOldFiles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Removed Review Files
                </h4>
                <div className="space-y-3">
                  {reviewRemovedOldFiles.map((fileUrl) => (
                    <div
                      key={fileUrl}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <FileTextOutlined className="text-red-500" />
                        </div>
                        <span className="text-sm text-gray-500 truncate">
                          <button
                            onClick={() => handleFileDownload(fileUrl, getFileName(fileUrl))}
                            className="text-sm text-gray-500 truncate hover:underline flex items-center gap-2 disabled:opacity-60"
                            title={getFileName(fileUrl)}
                            disabled={downloadingFiles.includes(fileUrl)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '0',
                              margin: '0',
                              cursor: 'pointer'
                            }}
                          >
                            {getFileName(fileUrl)}
                            {downloadingFiles.includes(fileUrl) && (
                              <LoadingOutlined style={{ fontSize: '16px', marginLeft: '6px' }} spin />
                            )}
                          </button>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Upload New Review Files
              </h4>
              <Upload
                fileList={reviewFileList}
                onChange={handleReviewFileChange}
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
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Service Requirements</h1>
        <div className="flex space-x-3">
          {projectRole === "consultant admin" && reviewStatus !== "under_review" && reviewStatus !== "accepted" && (
            <Button
              type="default"
              onClick={handleSendForReview}
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            >
              Send for Review
            </Button>
          )}
          {projectRole === "company" && (
            <Button
              type="default"
              onClick={() => setIsReviewModalVisible(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            >
              Submit Review
            </Button>
          )}
        </div>
      </div>
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${reviewStatus === "accepted"
            ? "bg-green-100 text-green-800"
            : reviewStatus === "rejected"
              ? "bg-red-100 text-red-800"
              : reviewStatus === "needs_info"
                ? "bg-orange-100 text-orange-800"
                : reviewStatus === "under_review"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
            }`}>
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
        <div className="flex items-center space-x-3">
          {projectRole === "consultant admin" && (
            <Button
              type="default"
              onClick={handleAssignTask}
              className="flex items-center"
            >
              Assign Task
            </Button>
          )}
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
                          <button
                            onClick={() => handleFileDownload(fileUrl, getFileName(fileUrl))}
                            className="text-sm text-blue-700 truncate hover:underline flex items-center gap-2 disabled:opacity-60"
                            title={getFileName(fileUrl)}
                            disabled={downloadingFiles.includes(fileUrl)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '0',
                              margin: '0',
                              cursor: 'pointer'
                            }}
                          >
                            {getFileName(fileUrl)}
                            {downloadingFiles.includes(fileUrl) && (
                              <LoadingOutlined style={{ fontSize: '16px', marginLeft: '6px' }} spin />
                            )}
                          </button>
                        </span>
                      </div>
                      <div className="flex items-center">
                        <a
                          href={`${BASE_URL}${fileUrl}`}
                          download
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4"
                          title={getFileName(fileUrl)}
                        >
                          {getFileName(fileUrl)}
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
                          <button
                            onClick={() => handleFileDownload(fileUrl, getFileName(fileUrl))}
                            className="text-sm text-gray-500 truncate hover:underline flex items-center gap-2 disabled:opacity-60"
                            title={getFileName(fileUrl)}
                            disabled={downloadingFiles.includes(fileUrl)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '0',
                              margin: '0',
                              cursor: 'pointer'
                            }}
                          >
                            {getFileName(fileUrl)}
                            {downloadingFiles.includes(fileUrl) && (
                              <LoadingOutlined style={{ fontSize: '16px', marginLeft: '6px' }} spin />
                            )}
                          </button>
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
      <ReviewModal />
    </div>
  );
}

export default ServiceRequirements;