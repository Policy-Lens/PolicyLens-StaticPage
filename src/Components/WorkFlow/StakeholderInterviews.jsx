import React, { useState, useContext, useEffect } from "react";
import { Collapse, Button, Input, Upload, DatePicker, Modal, Select, message } from "antd";
import { PaperClipOutlined, FileTextOutlined, LoadingOutlined } from "@ant-design/icons";
import { ProjectContext } from "../../Context/ProjectContext";
import { LoadingContext } from "./VertStepper";
import { useParams } from "react-router-dom";
import { BASE_URL, apiRequest } from "../../utils/api";
const { Panel } = Collapse;
const { TextArea } = Input;
const { Option } = Select;

const StakeholderInterviews = () => {
  const [fileList, setFileList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAssignTaskVisible, setIsAssignTaskVisible] = useState(false);
  const [interviewText, setInterviewText] = useState("");
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDeadline, setTaskDeadline] = useState(null);
  const [taskReferences, setTaskReferences] = useState("");
  const [interviewData, setInterviewData] = useState([]);
  const [stepId, setStepId] = useState(null);
  const [isAssignedUser, setIsAssignedUser] = useState(false);
  const [taskAssignment, setTaskAssignment] = useState(null);
  const [members, setMembers] = useState([]);
  const [oldFilesNeeded, setOldFilesNeeded] = useState([]);
  const [removedOldFiles, setRemovedOldFiles] = useState([]);
  const [stepStatus, setStepStatus] = useState("pending");
  // Review-related states
  const [reviewStatus, setReviewStatus] = useState("not_submitted");
  const [reviewComment, setReviewComment] = useState("");
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [reviewAction, setReviewAction] = useState("accept");
  const [reviewModalComment, setReviewModalComment] = useState("");
  const [reviewFileList, setReviewFileList] = useState([]);
  const [reviewOldFilesNeeded, setReviewOldFilesNeeded] = useState([]);
  const [reviewRemovedOldFiles, setReviewRemovedOldFiles] = useState([]);
  const [downloadingFiles, setDownloadingFiles] = useState([]);

  const { projectid } = useParams();
  const {
    addStepData,
    getStepData,
    getStepId,
    checkStepAuth,
    projectRole,
    assignStep,
    getStepAssignment,
    getMembers
  } = useContext(ProjectContext);
  const { isLoading, setIsLoading } = useContext(LoadingContext);

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleRemoveFile = (fileUrl) => {
    setOldFilesNeeded(prev => prev.filter(file => file !== fileUrl));
    setRemovedOldFiles(prev => [...prev, fileUrl]);
  };

  const handleRestoreFile = (fileUrl) => {
    setRemovedOldFiles(prev => prev.filter(file => file !== fileUrl));
    setOldFilesNeeded(prev => [...prev, fileUrl]);
  };

  const handleReviewRemoveFile = (fileUrl) => {
    setReviewOldFilesNeeded((prev) => prev.filter((file) => file !== fileUrl));
    setReviewRemovedOldFiles((prev) => [...prev, fileUrl]);
  };

  const handleReviewRestoreFile = (fileUrl) => {
    setReviewRemovedOldFiles((prev) => prev.filter((file) => file !== fileUrl));
    setReviewOldFilesNeeded((prev) => [...prev, fileUrl]);
  };

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

  const get_step_id = async () => {
    setIsLoading(true);
    try {
      const response = await getStepId(projectid, 5);
      if (response) {
        console.log("API Response (Stakeholder Interviews):", response);
        setStepId(response.plc_step_id);
        setStepStatus(response.status);
        setReviewStatus(response.review_status || "not_submitted");
        setReviewComment(response.review_comment || "");
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
      message.error("Failed to load stakeholder interview data");
    } finally {
      setIsLoading(false);
    }
  };

  const get_step_data = async (step_id) => {
    try {
      const stepData = await getStepData(step_id);
      setInterviewData(stepData || []);
      if (stepData && stepData.length > 0) {
        const latestData = stepData[0];
        setInterviewText(latestData.text_data);
        const existingFiles = latestData.documents.map(doc => doc.file);
        setOldFilesNeeded(existingFiles);
        setRemovedOldFiles([]);
      }
    } catch (error) {
      console.error("Error fetching step data:", error);
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
    try {
      const res = await getMembers(projectid);
      setMembers(res);
    } catch (error) {
      console.error("Error fetching members:", error);
      message.error("Failed to load team members");
    }
  };

  useEffect(() => {
    get_step_id();
  }, []);

  const handleAddData = () => {
    if (interviewData.length > 0) {
      const latestData = interviewData[0];
      setInterviewText(latestData.text_data);
      const existingFiles = latestData.documents.map((doc) => doc.file);
      setOldFilesNeeded(existingFiles);
      setRemovedOldFiles([]);
    }
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setInterviewText("");
    setFileList([]);
    setOldFilesNeeded([]);
    setRemovedOldFiles([]);
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

  const getFileName = (filePath) => {
    return filePath.split('/').pop();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date format";
      return date.toLocaleString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date error";
    }
  };

  const getViewerUrl = (filePath) => {
    const extension = filePath.split(".").pop().toLowerCase();
    if (extension === "pdf") {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(`${BASE_URL}${filePath}`)}&embedded=true`;
    }
    if (["jpg", "jpeg", "png", "gif", "bmp", "svg"].includes(extension)) {
      return `${BASE_URL}${filePath}`;
    }
    return `https://docs.google.com/viewer?url=${encodeURIComponent(`${BASE_URL}${filePath}`)}&embedded=true`;
  };

  const handleSubmit = async () => {
    if (!interviewText.trim()) {
      message.warning("Please provide details for the stakeholder interview.");
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("field_name", "Stakeholder Interview Details");
      formData.append("text_data", interviewText);
      formData.append("old_files", JSON.stringify(oldFilesNeeded));
      fileList.forEach((file) => {
        formData.append("files", file.originFileObj || file);
      });
      const response = await addStepData(stepId, formData);
      if (response.status === 201) {
        message.success("Stakeholder interview details submitted successfully!");
        setIsModalVisible(false);
        setInterviewText("");
        setFileList([]);
        setOldFilesNeeded([]);
        setRemovedOldFiles([]);
        await get_step_id(); // Refresh data
      } else {
        message.error("Failed to submit stakeholder interview details.");
      }
    } catch (error) {
      message.error("Failed to submit stakeholder interview details.");
      console.error(error);
    } finally {
      setIsLoading(false);
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
    setIsLoading(true);
    try {
      const assignmentData = {
        assigned_to: selectedTeamMembers,
        description: taskDescription,
        deadline: taskDeadline.format("YYYY-MM-DD"),
        references: taskReferences
      };
      const result = await assignStep(stepId, assignmentData);
      if (result) {
        message.success("Task assigned successfully!");
        setIsAssignTaskVisible(false);
        setSelectedTeamMembers([]);
        setTaskDescription("");
        setTaskDeadline(null);
        setTaskReferences("");
        await get_step_id(); // Refresh data
      } else {
        message.error("Failed to assign task.");
      }
    } catch (error) {
      message.error("Failed to assign task.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStepStatus = async (newStatus) => {
    setIsLoading(true);
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
        await get_step_id(); // Refresh data
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendForReview = async () => {
    setIsLoading(true);
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
        await get_step_id(); // Refresh data
      } else {
        message.error("Failed to send step for review.");
      }
    } catch (error) {
      console.error("Error sending for review:", error);
      message.error("Failed to send step for review.");
    } finally {
      setIsLoading(false);
    }
  };

  const ReviewModal = () => {
    const [localComment, setLocalComment] = useState(reviewModalComment);
    const [localAction, setLocalAction] = useState(reviewAction);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCommentChange = (e) => {
      setLocalComment(e.target.value);
    };

    const handleActionChange = (value) => {
      setLocalAction(value);
      setReviewAction(value);
    };

    const handleReviewFileChange = ({ fileList }) => {
      setReviewFileList(fileList);
    };

    const resetModalState = () => {
      setIsReviewModalVisible(false);
      setLocalComment("");
      setReviewModalComment("");
      setLocalAction("accept");
      setReviewAction("accept");
      setReviewFileList([]);
      setReviewOldFilesNeeded([]);
      setReviewRemovedOldFiles([]);
      setIsSubmitting(false);
    };

    const handleReviewSubmit = async () => {
      if (isSubmitting) return;
      if (!localComment.trim() && localAction !== "accept") {
        message.warning("Please provide a comment for your review.");
        return;
      }
      setReviewModalComment(localComment);
      setIsSubmitting(true);
      setIsLoading(true);
      const formData = new FormData();
      formData.append(
        "review_status",
        localAction === "accept" ? "accepted" : localAction === "reject" ? "rejected" : "needs_info"
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
          setReviewStatus(response.data.review_status);
          setReviewComment(response.data.review_comment || "");
          setReviewOldFilesNeeded(response.data.documents?.map((doc) => doc.file) || []);
          resetModalState();
          await get_step_id(); // Refresh data
        } else {
          message.error("Failed to submit review.");
        }
      } catch (error) {
        console.error("Error submitting review:", error);
        message.error(error.response?.data?.message || "Failed to submit review.");
      } finally {
        setIsSubmitting(false);
        setIsLoading(false);
      }
    };

    return (
      <Modal
        title="Submit Review"
        open={isReviewModalVisible}
        onCancel={resetModalState}
        footer={[
          <Button key="cancel" onClick={resetModalState} className="border-gray-300 text-gray-700" disabled={isSubmitting}>
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
            loading={isSubmitting}
            disabled={isSubmitting}
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Download Review Template</h3>
                  <div className="mt-2 text-sm text-blue-600">
                    <p>Please download and fill in the review template below to guide your review process.</p>
                  </div>
                  <div className="mt-3">
                    <a
                      href="/templates/Review_template.xlsx"
                      download="review_template.xlsx"
                      className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Review Template
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Review Action</label>
              <Select
                value={localAction}
                onChange={handleActionChange}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <Option value="accept">Accept</Option>
                <Option value="reject">Reject</Option>
                <Option value="needs_info">Needs More Info</Option>
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
                <h4 className="text-sm font-medium text-gray-700 mb-3">Existing Review Files</h4>
                <div className="space-y-3">
                  {reviewOldFilesNeeded.map((fileUrl) => (
                    <div key={fileUrl} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <FileTextOutlined className="text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-700 truncate">{getFileName(fileUrl)}</span>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() => handleFileDownload(fileUrl, getFileName(fileUrl))}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4"
                          title={getFileName(fileUrl)}
                          disabled={downloadingFiles.includes(fileUrl)}
                          style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
                        >
                          View
                          {downloadingFiles.includes(fileUrl) && (
                            <LoadingOutlined spin style={{ fontSize: 16, marginLeft: 6 }} />
                          )}
                        </button>
                        <Button type="text" danger onClick={() => handleReviewRemoveFile(fileUrl)} className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {reviewRemovedOldFiles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Removed Review Files</h4>
                <div className="space-y-3">
                  {reviewRemovedOldFiles.map((fileUrl) => (
                    <div key={fileUrl} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <FileTextOutlined className="text-red-500" />
                        </div>
                        <span className="text-sm text-gray-500 truncate">{getFileName(fileUrl)}</span>
                      </div>
                      <Button type="text" onClick={() => handleReviewRestoreFile(fileUrl)} className="text-blue-600 hover:text-blue-800 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        Restore
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Upload New Review Files</h4>
              <Upload
                fileList={reviewFileList}
                onChange={handleReviewFileChange}
                beforeUpload={() => false}
                multiple
                showUploadList={true}
                className="upload-list-custom"
              >
                <Button icon={<PaperClipOutlined />} className="bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 rounded-lg shadow-sm flex items-center">
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
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Stakeholder Interviews</h2>
          <div className="flex space-x-3">
            {projectRole.includes("consultant admin") && reviewStatus !== "under_review" && reviewStatus !== "accepted" && (
              <Button type="default" onClick={handleSendForReview} className="bg-green-600 hover:bg-green-700 text-white border-green-600">
                Send for Review
              </Button>
            )}
            {projectRole === "company" && (
              <Button type="default" onClick={() => setIsReviewModalVisible(true)} className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600">
                Submit Review
              </Button>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${stepStatus === "completed" ? "bg-green-100 text-green-800" :
                stepStatus === "in_progress" ? "bg-blue-100 text-blue-800" :
                  "bg-yellow-100 text-yellow-800"
              }`}>
              {stepStatus.charAt(0).toUpperCase() + stepStatus.slice(1).replace("_", " ")}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${reviewStatus === "accepted" ? "bg-green-100 text-green-800" :
                reviewStatus === "rejected" ? "bg-red-100 text-red-800" :
                  reviewStatus === "needs_info" ? "bg-orange-100 text-orange-800" :
                    reviewStatus === "under_review" ? "bg-blue-100 text-blue-800" :
                      "bg-yellow-100 text-yellow-800"
              }`}>
              {reviewStatus === "accepted" ? "Accepted" :
                reviewStatus === "rejected" ? "Rejected" :
                  reviewStatus === "needs_info" ? "Needs More Info" :
                    reviewStatus === "under_review" ? "Under Review" :
                      "Not Submitted"}
            </span>
          </div>
          <div className="flex space-x-3">
            {projectRole.includes("consultant admin") && (
              <Button type="default" onClick={handleAssignTask} className="bg-white hover:bg-gray-50 border border-gray-300 shadow-sm">
                Assign Task
              </Button>
            )}
            {(projectRole.includes("consultant admin") || isAssignedUser) && (
              <Select value={stepStatus} onChange={updateStepStatus} style={{ width: 140 }}>
                <Option value="pending">Pending</Option>
                <Option value="in_progress">In Progress</Option>
                <Option value="completed">Completed</Option>
              </Select>
            )}
            {(projectRole.includes("consultant admin") || isAssignedUser) && (
              <Button type="primary" onClick={handleAddData} className="bg-blue-600 hover:bg-blue-700">
                {interviewData.length > 0 ? "Update Interview" : "Add Interview"}
              </Button>
            )}
          </div>
        </div>
      </div>
      {interviewData.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex flex-wrap justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Stakeholder Interview Information</h3>
                {interviewData[0].saved_at && (
                  <div className="flex items-center mt-1">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500">Last updated {formatDate(interviewData[0].saved_at)}</span>
                  </div>
                )}
              </div>
              {interviewData[0].saved_by && (
                <div className="flex items-center bg-gray-50 px-3 py-1 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                      {interviewData[0].saved_by.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-800">{interviewData[0].saved_by.name}</p>
                    <p className="text-xs text-gray-500">{interviewData[0].saved_by.email}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-4 mb-6">
              {interviewData.map((item) => (
                <div key={item.id} className="border-l-4 border-blue-400 bg-gray-50 rounded-r-lg overflow-hidden">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 uppercase">{item.field_name}</h4>
                  </div>
                  <div className="flex flex-col md:flex-row">
                    <div className="px-4 py-3 flex-grow">
                      <p className="text-gray-700">{item.text_data}</p>
                    </div>
                    {item.documents && item.documents.length > 0 && (
                      <div className="border-t md:border-t-0 md:border-l border-gray-200 px-4 py-3 md:w-64">
                        <h5 className="text-xs font-medium text-gray-500 mb-2">ATTACHED FILES</h5>
                        <div className="space-y-2">
                          {item.documents.map((doc) => (
                            <div key={doc.id} className="flex items-center">
                              <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                                <FileTextOutlined className="text-blue-600 text-xs" />
                              </div>
                              <div className="overflow-hidden flex-grow">
                                <button
                                  onClick={() => handleFileDownload(doc.file, getFileName(doc.file))}
                                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-2 disabled:opacity-60"
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
                <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3">Review Comment</h3>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-800">{reviewComment}</p>
                </div>
              </div>
            )}
            {reviewOldFilesNeeded.length > 0 && (
              <div className="p-6">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3">Review Files</h3>
                <div className="space-y-3">
                  {reviewOldFilesNeeded.map((fileUrl) => (
                    <div key={fileUrl} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <FileTextOutlined className="text-blue-600" />
                        </div>
                        <button
                          onClick={() => handleFileDownload(fileUrl, getFileName(fileUrl))}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          title={getFileName(fileUrl)}
                          disabled={downloadingFiles.includes(fileUrl)}
                          style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
                        >
                          {getFileName(fileUrl)}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md border border-gray-100 p-6 flex flex-col items-center justify-center min-h-[300px]">
          <div className="text-center max-w-md mx-auto">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">No Stakeholder Interview Data</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              The stakeholder interviews section captures valuable insights. Add your interview details to get started.
            </p>
            <Button onClick={handleAddData} type="primary" size="large" className="bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200 font-medium h-10 px-6">
              <span className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Add Interview</span>
              </span>
            </Button>
          </div>
        </div>
      )}
      {taskAssignment && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Assignment</h3>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-700">Assignment Details</h4>
                <p className="text-xs text-gray-500">{formatDate(taskAssignment.assigned_at)}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Assigned To:</p>
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
                  <p className="text-sm text-gray-600 mt-2">{formatDate(taskAssignment.deadline)}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">Description:</p>
                <p className="text-sm text-gray-600 mt-2">{taskAssignment.description}</p>
              </div>
              {taskAssignment.references && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">References:</p>
                  <p className="text-sm text-gray-600 mt-2">{taskAssignment.references}</p>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              <p><b>Status:</b> {taskAssignment.status}</p>
            </div>
          </div>
        </div>
      )}
      <Modal
        title={interviewData.length > 0 ? "Update Stakeholder Interview" : "Add Stakeholder Interview"}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="cancel" onClick={handleModalClose}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700" loading={isLoading}>
            Submit
          </Button>,
        ]}
        width={800}
      >
        <div className="p-4 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Download Template</h3>
                <div className="mt-2 text-sm text-blue-600">
                  <p>Please download and fill in the template below before submitting your stakeholder interview details.</p>
                </div>
                <div className="mt-3">
                  <a
                    href="/temp.txt"
                    download="stakeholder_interview_template.txt"
                    className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Stakeholder Interview Template
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="interviewDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Stakeholder Interview Details
              </label>
              <TextArea
                id="interviewDescription"
                value={interviewText}
                onChange={(e) => setInterviewText(e.target.value)}
                placeholder="Enter your stakeholder interview details"
                rows={10}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">Attachments</label>
          <Upload
            multiple
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={() => false}
          >
            <Button icon={<PaperClipOutlined />}>Select Files</Button>
          </Upload>
        </div>
        {oldFilesNeeded.length > 0 && (
          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700">Existing Attachments</label>
            <div className="flex flex-wrap gap-2">
              {oldFilesNeeded.map((fileUrl, index) => (
                <div key={index} className="border rounded p-2 flex items-center bg-gray-50 group">
                  <FileTextOutlined className="mr-2 text-blue-500" />
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
                  <Button type="text" size="small" danger className="ml-2 opacity-0 group-hover:opacity-100" onClick={() => handleRemoveFile(fileUrl)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        {removedOldFiles.length > 0 && (
          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700">Removed Attachments</label>
            <div className="flex flex-wrap gap-2">
              {removedOldFiles.map((fileUrl, index) => (
                <div key={index} className="border rounded p-2 flex items-center bg-gray-100 text-gray-500 group">
                  <FileTextOutlined className="mr-2" />
                  <button
                    onClick={() => handleFileDownload(fileUrl, getFileName(fileUrl))}
                    className="text-sm text-gray-500 line-through hover:underline flex items-center gap-2 disabled:opacity-60"
                    title={getFileName(fileUrl)}
                    disabled={downloadingFiles.includes(fileUrl)}
                    style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
                  >
                    {getFileName(fileUrl)}
                    {downloadingFiles.includes(fileUrl) && (
                      <LoadingOutlined spin style={{ fontSize: 16, marginLeft: 6 }} />
                    )}
                  </button>
                  <Button type="text" size="small" className="ml-2 opacity-0 group-hover:opacity-100" onClick={() => handleRestoreFile(fileUrl)}>
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
      <Modal
        title="Assign Task"
        open={isAssignTaskVisible}
        onCancel={handleAssignTaskClose}
        footer={[
          <Button key="cancel" onClick={handleAssignTaskClose}>
            Cancel
          </Button>,
          <Button key="assign" type="primary" onClick={handleSubmitAssignment} className="bg-blue-600 hover:bg-blue-700" loading={isLoading}>
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
            {members.map((member) => (
              <Option key={member.id} value={member.id}>
                {member.name}
              </Option>
            ))}
          </Select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Team Deadline</label>
          <DatePicker style={{ width: "100%" }} value={taskDeadline} onChange={setTaskDeadline} />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Task Description</label>
          <Input placeholder="Enter task description" value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Task References</label>
          <Input placeholder="Add reference URLs" value={taskReferences} onChange={(e) => setTaskReferences(e.target.value)} />
        </div>
      </Modal>
      <ReviewModal />
    </div>
  );
};

export default StakeholderInterviews;