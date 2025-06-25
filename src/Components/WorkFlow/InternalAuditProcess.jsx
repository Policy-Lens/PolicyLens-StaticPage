import React, { useState, useContext, useEffect } from "react";
import { Button, Modal, Input, Upload, Select, DatePicker, message, Checkbox } from "antd";
import { PaperClipOutlined, FileTextOutlined } from "@ant-design/icons";
import { ProjectContext } from "../../Context/ProjectContext";
import { LoadingContext } from "./VertStepper";
import { useParams } from "react-router-dom";
import { apiRequest, BASE_URL } from "../../utils/api";
import InteractiveIsoClause from "../Common/InteractiveIsoClause";

const { TextArea } = Input;
const { Option } = Select;

const InternalAuditProcess = () => {
  const [stepStatus, setStepStatus] = useState("pending");
  const [reviewStatus, setReviewStatus] = useState("not_submitted");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewFileList, setReviewFileList] = useState([]);
  const [reviewOldFilesNeeded, setReviewOldFilesNeeded] = useState([]);
  const [reviewRemovedOldFiles, setReviewRemovedOldFiles] = useState([]);
  const [stepId, setStepId] = useState(null);
  const [isAssignedUser, setIsAssignedUser] = useState(false);
  const [isAssignTaskVisible, setIsAssignTaskVisible] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDeadline, setTaskDeadline] = useState(null);
  const [taskReferences, setTaskReferences] = useState("");
  const [members, setMembers] = useState([]);
  const [taskAssignments, setTaskAssignments] = useState([]);
  const [associatedIsoClause, setAssociatedIsoClause] = useState(null);
  const [process, setProcess] = useState("core");

  const { projectid } = useParams();
  const { getStepId, checkStepAuth, projectRole, getMembers, assignStep, getStepAssignment } = useContext(ProjectContext);
  const { isLoading, setIsLoading } = useContext(LoadingContext);

  const get_step_id = async () => {
    setIsLoading(true);
    try {
      const response = await getStepId(projectid, 9);
      if (response) {
        setStepId(response.plc_step_id);
        setStepStatus(response.status);
        setReviewStatus(response.review_status || "not_submitted");
        setReviewComment(response.review_comment || "");
        setAssociatedIsoClause(response.associated_iso_clause);
        setProcess(response.process || "core");
        await checkAssignedUser(response.plc_step_id);
        await getTaskAssignments(response.plc_step_id);
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
      message.error("Failed to load internal audit data");
    } finally {
      setIsLoading(false);
    }
  };

  const checkAssignedUser = async (step_id) => {
    if (!step_id) return;
    const isAuthorized = await checkStepAuth(step_id);
    setIsAssignedUser(isAuthorized);
  };

  const getTaskAssignments = async (step_id) => {
    try {
      const assignmentData = await getStepAssignment(step_id);
      if (assignmentData.status === 200 && assignmentData.data.length > 0) {
        setTaskAssignments(assignmentData.data);
      } else {
        setTaskAssignments([]);
      }
    } catch (error) {
      console.error("Error fetching task assignments:", error);
      setTaskAssignments([]);
    }
  };

  const get_members = async () => {
    setIsLoading(true);
    try {
      const res = await getMembers(projectid);
      setMembers(res);
    } catch (error) {
      console.error("Error fetching members:", error);
      message.error("Failed to load team members");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    get_step_id();
  }, []);

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
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProcess = async (newProcess) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignTask = async () => {
    await get_members();
    setIsAssignTaskVisible(true);
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
        references: taskReferences,
      };
      const result = await assignStep(stepId, assignmentData);
      if (result) {
        message.success("Task assigned successfully!");
        setIsAssignTaskVisible(false);
        setSelectedTeamMembers([]);
        setTaskDescription("");
        setTaskDeadline(null);
        setTaskReferences("");
        await getTaskAssignments(stepId);
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
        await get_step_id();
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

  const getFileName = (filePath) => {
    return filePath.split("/").pop();
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

  const beforeUpload = (file) => {
    const isValidType = ["pdf", "jpg", "jpeg", "png"].includes(file.name.split(".").pop().toLowerCase());
    const isValidSize = file.size / 1024 / 1024 < 10;
    if (!isValidType) {
      message.error("Only PDF and image files are allowed!");
      return false;
    }
    if (!isValidSize) {
      message.error("File must be smaller than 10MB!");
      return false;
    }
    return true;
  };

  const ReviewModal = () => {
    const [localComment, setLocalComment] = useState("");
    const [localAction, setLocalAction] = useState("accept");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReviewFileChange = ({ fileList }) => {
      setReviewFileList(fileList);
    };

    const handleReviewRemoveFile = (fileUrl) => {
      setReviewOldFilesNeeded((prev) => prev.filter((file) => file !== fileUrl));
      setReviewRemovedOldFiles((prev) => [...prev, fileUrl]);
    };

    const handleReviewRestoreFile = (fileUrl) => {
      setReviewRemovedOldFiles((prev) => prev.filter((file) => file !== fileUrl));
      setReviewOldFilesNeeded((prev) => [...prev, fileUrl]);
    };

    const resetModalState = () => {
      setIsReviewModalVisible(false);
      setLocalComment("");
      setLocalAction("accept");
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
          true
        );
        if (response.status === 200) {
          message.success("Review submitted successfully!");
          setReviewStatus(response.data.review_status);
          setReviewComment(response.data.review_comment || "");
          setReviewOldFilesNeeded(response.data.documents?.map((doc) => doc.file) || []);
          resetModalState();
          await get_step_id();
        } else {
          message.error("Failed to submit review.");
        }
      } catch (error) {
        console.error("Error submitting review:", error);
        message.error(error.response?.data?.error || "Failed to submit review.");
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
          <Button
            key="cancel"
            onClick={resetModalState}
            className="border-gray-300 text-gray-700"
            disabled={isSubmitting}
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
                      Please download and fill in the review template below to
                      guide your review process.
                    </p>
                  </div>
                  <div className="mt-3">
                    <a
                      href="/templates/Review_template.xlsx"
                      download="Review_template.xlsx"
                      className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none"
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
                onChange={setLocalAction}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500"
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
                onChange={(e) => setLocalComment(e.target.value)}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500"
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
                          onClick={() => handleReviewRemoveFile(fileUrl)}
                          className="flex items-center"
                        >
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
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {reviewRemovedOldFiles.length > 0 && (
              <div>
                <h4 classNameName="text-sm font-medium text-gray-700 mb-3">
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
                          {getFileName(fileUrl)}
                        </span>
                      </div>
                      <Button
                        type="text"
                        onClick={() => handleReviewRestoreFile(fileUrl)}
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
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
                        Restore
                      </Button>
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
                beforeUpload={beforeUpload}
                multiple
                showUploadList={true}
                className="upload-list-custom"
              >
                <Button
                  icon={<PaperClipOutlined />}
                  className="bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
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
    <div className="min-h-full p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Internal Audit Process
          </h2>
          <div className="flex space-x-3">
            {projectRole.includes("consultant admin") &&
              reviewStatus !== "under_review" &&
              reviewStatus !== "accepted" && (
                <Button
                  type="default"
                  onClick={handleSendForReview}
                  className="bg-green-600 hover:bg-green-700 text-white border-green-600"
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
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stepStatus === "completed"
                  ? "bg-green-100 text-green-800"
                  : stepStatus === "in_progress"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
            >
              {stepStatus.charAt(0).toUpperCase() +
                stepStatus.slice(1).replace("_", " ")}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${reviewStatus === "accepted"
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-1"
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
              ISO: <InteractiveIsoClause isoClause={associatedIsoClause} />
            </span>
          </div>
          <div className="flex space-x-3">
            {projectRole.includes("consultant admin") && (
              <Button
                type="default"
                onClick={handleAssignTask}
                className="bg-white hover:bg-gray-50 border border-gray-300 shadow-sm"
              >
                Assign Task
              </Button>
            )}
            {projectRole.includes("consultant admin") && (
              <Select
                value={process}
                onChange={updateProcess}
                style={{ width: 120 }}
                className="border-gray-300 rounded-lg shadow-sm focus:ring-blue-500"
              >
                <Option value="core">Core</Option>
                <Option value="non core">Non Core</Option>
              </Select>
            )}
            {(projectRole.includes("consultant admin") || isAssignedUser) && (
              <Select
                value={stepStatus}
                onChange={updateStepStatus}
                style={{ width: 140 }}
                className="border-gray-300 rounded-lg shadow-sm focus:ring-blue-500"
              >
                <Option value="pending">Pending</Option>
                <Option value="in_progress">In Progress</Option>
                <Option value="completed">Completed</Option>
              </Select>
            )}
          </div>
        </div>
      </div>
      {reviewComment && (
        <div className="mt-6">
          <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3">
            Review Comment
          </h3>
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
            <p className="text-sm text-gray-800">{reviewComment}</p>
          </div>
        </div>
      )}
      {reviewOldFilesNeeded.length > 0 && (
        <div className="mt-6">
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
                  <span className="text-sm text-gray-700 truncate">
                    {getFileName(fileUrl)}
                  </span>
                </div>
                <a
                  href={getViewerUrl(fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Workflow Checklist (Placeholder)
        </h3>
        <p className="text-gray-600">
          Workflow steps and comments will be fetched from the backend once the
          appropriate endpoint is implemented.
        </p>
      </div>
      {taskAssignments.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Task Assignments
          </h3>
          {taskAssignments.map((assignment, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 mb-4">
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-700">
                    Assignment #{index + 1}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {formatDate(assignment.assigned_at)}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Assigned To:
                    </p>
                    <ul className="list-disc list-inside mt-2">
                      {assignment.assigned_to.map((user) => (
                        <li key={user.id} className="text-sm text-gray-600">
                          {user.name} - {user.email}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Deadline:</p>
                    <p className="text-sm text-gray-600 mt-2">
                      {formatDate(assignment.deadline)}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">
                    Description:
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {assignment.description}
                  </p>
                </div>
                {assignment.references && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700">
                      References:
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {assignment.references}
                    </p>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                <p>
                  <b>Status:</b> {assignment.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal
        title="Assign Task"
        open={isAssignTaskVisible}
        onCancel={() => {
          setIsAssignTaskVisible(false);
          setSelectedTeamMembers([]);
          setTaskDescription("");
          setTaskDeadline(null);
          setTaskReferences("");
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsAssignTaskVisible(false);
              setSelectedTeamMembers([]);
              setTaskDescription("");
              setTaskDeadline(null);
              setTaskReferences("");
            }}
            className="border-gray-300 text-gray-700"
          >
            Cancel
          </Button>,
          <Button
            key="assign"
            type="primary"
            onClick={handleSubmitAssignment}
            className="bg-blue-600 hover:bg-blue-700"
            loading={isLoading}
          >
            Assign
          </Button>,
        ]}
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team Members
          </label>
          <Select
            mode="multiple"
            placeholder="Select team members"
            value={selectedTeamMembers}
            onChange={setSelectedTeamMembers}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500"
          >
            {members.map((member) => (
              <Option key={member.id} value={member.id}>
                {member.name}
              </Option>
            ))}
          </Select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team Deadline
          </label>
          <DatePicker
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500"
            value={taskDeadline}
            onChange={setTaskDeadline}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Description
          </label>
          <Input
            placeholder="Enter task description"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            className="border-gray-300 rounded-lg shadow-sm focus:ring-blue-500"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task References
          </label>
          <Input
            placeholder="Add reference URLs"
            value={taskReferences}
            onChange={(e) => setTaskReferences(e.target.value)}
            className="border-gray-300 rounded-lg shadow-sm focus:ring-blue-500"
          />
        </div>
      </Modal>
      <ReviewModal />
    </div>
  );
};

export default InternalAuditProcess;