import React, { useState, useContext, useEffect } from "react";
import { Button, Input, Upload, Modal, Select, DatePicker, message, Spin } from "antd";
import { PaperClipOutlined, FileTextOutlined, LoadingOutlined } from "@ant-design/icons";
import { ProjectContext } from "../../Context/ProjectContext";
import { useParams } from "react-router-dom";
import { BASE_URL, apiRequest } from "../../utils/api";
const { TextArea } = Input;
const { Option } = Select;

const DiscussingPolicies = () => {
  const [fileList, setFileList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAssignTaskVisible, setIsAssignTaskVisible] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [discussingPoliciesText, setDiscussingPoliciesText] = useState("");
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDeadline, setTaskDeadline] = useState(null);
  const [taskReferences, setTaskReferences] = useState("");
  const [stepStatus, setStepStatus] = useState("pending");
  const [reviewStatus, setReviewStatus] = useState("not_submitted");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewAction, setReviewAction] = useState("accept");
  const [reviewModalComment, setReviewModalComment] = useState("");
  const [reviewFileList, setReviewFileList] = useState([]);
  const [reviewOldFilesNeeded, setReviewOldFilesNeeded] = useState([]);
  const [reviewRemovedOldFiles, setReviewRemovedOldFiles] = useState([]);
  const [discussingPoliciesData, setDiscussingPoliciesData] = useState([]);
  const [stepId, setStepId] = useState(null);
  const [isAssignedUser, setIsAssignedUser] = useState(false);
  const [taskAssignment, setTaskAssignment] = useState(null);
  const [members, setMembers] = useState([]);
  const [oldFilesNeeded, setOldFilesNeeded] = useState([]);
  const [removedOldFiles, setRemovedOldFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyAdmins, setCompanyAdmins] = useState([]);

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
        setReviewStatus(response.data.review_status || "not_submitted");
        setReviewComment(response.data.review_comment || "");
        message.success("Status updated successfully");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error("Failed to update status");
    }
  };

  const get_step_id = async () => {
    setLoading(true);
    try {
      const response = await getStepId(projectid, 8);
      if (response && response.plc_step_id) {
        setStepId(response.plc_step_id);
        setStepStatus(response.status || "pending");
        setReviewStatus(response.review_status || "not_submitted");
        setReviewComment(response.review_comment || "");
        setCompanyAdmins(response.company_admins || []);
        await get_step_data(response.plc_step_id);
        const isAuthorized = await checkStepAuth(response.plc_step_id);
        setIsAssignedUser(isAuthorized);
        if (isAuthorized) {
          await getTaskAssignment(response.plc_step_id);
        }
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
      } else {
        message.error("Failed to retrieve step ID");
      }
    } catch (error) {
      console.error("Error fetching step ID:", error);
      message.error("Failed to load discussing policies data");
    } finally {
      setLoading(false);
    }
  };

  const get_step_data = async (step_id) => {
    try {
      const stepData = await getStepData(step_id);
      setDiscussingPoliciesData(stepData || []);
      if (stepData && stepData.length > 0) {
        const latestData = stepData[0];
        setDiscussingPoliciesText(latestData.text_data);
        const existingFiles = latestData.documents.map((doc) => doc.file);
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
    const res = await getMembers(projectid);
    setMembers(res);
  };

  useEffect(() => {
    get_step_id();
  }, []);

  const handleAddData = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setDiscussingPoliciesText("");
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

  const handleSubmit = async () => {
    if (!discussingPoliciesText.trim()) {
      message.warning("Please provide details for the discussing policies.");
      return;
    }

    if (!stepId) {
      message.error("Step ID is not available. Please try again.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("field_name", "Discussing Policies Details");
    formData.append("text_data", discussingPoliciesText);
    formData.append("old_files", JSON.stringify(oldFilesNeeded));

    fileList.forEach((file) => {
      formData.append("files", file.originFileObj || file);
    });

    try {
      const response = await addStepData(stepId, formData);
      if (response.status === 201) {
        message.success("Discussing policies details submitted successfully!");
        setIsModalVisible(false);
        setDiscussingPoliciesText("");
        setFileList([]);
        setOldFilesNeeded([]);
        setRemovedOldFiles([]);
        await get_step_data(stepId);
      } else {
        message.error("Failed to submit discussing policies details.");
      }
    } catch (error) {
      message.error("Failed to submit discussing policies details.");
      console.error(error);
    } finally {
      setLoading(false);
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
    if (!stepId) {
      message.error("Step ID is not available. Please try again.");
      return;
    }

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
      reviewAction === "accept" ? "accepted" : reviewAction === "reject" ? "rejected" : "needs_info"
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

  const ReviewModal = () => {
    const [localComment, setLocalComment] = useState(reviewModalComment);
    const [localAction, setLocalAction] = useState(reviewAction);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialSyncDone, setInitialSyncDone] = useState(false);

    useEffect(() => {
      if (isReviewModalVisible && !initialSyncDone) {
        setLocalComment(reviewModalComment);
        setLocalAction(reviewAction);
        setInitialSyncDone(true);
      } else if (!isReviewModalVisible) {
        setInitialSyncDone(false);
      }
    }, [isReviewModalVisible]);

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
      setInitialSyncDone(false);
    };

    const handleReviewSubmitLocal = async () => {
      if (isSubmitting) return;
      if (!localComment.trim() && localAction !== "accept") {
        message.warning("Please provide a comment for your review.");
        return;
      }

      setReviewModalComment(localComment);
      setIsSubmitting(true);

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
        } else {
          message.error("Failed to submit review.");
        }
      } catch (error) {
        console.error("Error submitting review:", error);
        message.error(error.response?.data?.message || "Failed to submit review.");
      } finally {
        setIsSubmitting(false);
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
            onClick={handleReviewSubmitLocal}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Review Action</label>
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
                <h4 className="text-sm font-medium text-gray-700 mb-3">Existing Review Files</h4>
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
                        <span className="text-sm text-gray-700 truncate">{getFileName(fileUrl)}</span>
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
            {reviewRemovedOldFiles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Removed Review Files</h4>
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
                        <span className="text-sm text-gray-500 truncate">{getFileName(fileUrl)}</span>
                      </div>
                      <Button
                        type="text"
                        onClick={() => handleReviewRestoreFile(fileUrl)}
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
              <h4 className="text-sm font-medium text-gray-700 mb-3">Upload New Review Files</h4>
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
    <div className="p-6 rounded-md">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Discussing Policies</h1>
        <div className="flex space-x-3">
          {projectRole.includes("consultant admin") && reviewStatus !== "under_review" && reviewStatus !== "accepted" && (
            <Button
              type="default"
              onClick={handleSendForReview}
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            >
              Send for Review
            </Button>
          )}
          {projectRole.includes("company") && (
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
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
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
            <Button type="primary" onClick={handleAddData} className="bg-blue-500">
              {discussingPoliciesData.length > 0 ? "Update Data" : "Add Data"}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2">Share Documents</h2>
        <Button type="primary" onClick={() => console.log("Share Documents")} className="bg-blue-500">
          Share the Docs
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spin indicator={antIcon} />
        </div>
      ) : discussingPoliciesData.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex flex-wrap justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Policy Discussion Information</h3>
                {discussingPoliciesData[0]?.saved_at && (
                  <div className="flex items-center mt-1">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500">Last updated {formatDate(discussingPoliciesData[0].saved_at)}</span>
                  </div>
                )}
              </div>
              {discussingPoliciesData[0]?.saved_by && (
                <div className="flex items-center bg-gray-50 px-3 py-1 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                      {discussingPoliciesData[0].saved_by.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-800">{discussingPoliciesData[0].saved_by.name}</p>
                    <p className="text-xs text-gray-500">{discussingPoliciesData[0].saved_by.email}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-4 mb-6">
              {discussingPoliciesData.map((item) => (
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
                                <p className="text-xs font-medium text-gray-700 truncate">{getFileName(doc.file)}</p>
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
      ) : (
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md border border-gray-100 p-6 flex flex-col items-center justify-center min-h-[300px]">
          <div className="text-center max-w-md mx-auto">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">No Policy Discussions</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Policy discussions help align stakeholders on important decisions. Add your first policy discussion to get started.
            </p>
            <Button
              onClick={handleAddData}
              type="primary"
              size="large"
              className="bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200 font-medium h-10 px-6"
            >
              <span className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Add Policy Discussion</span>
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
                    {taskAssignment.assigned_to.map((user) => (
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
        title={discussingPoliciesData.length > 0 ? "Update Discussing Policies Details" : "Add Discussing Policies Details"}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="cancel" onClick={handleModalClose} className="border-gray-300 text-gray-700" disabled={loading}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleSubmit} className="bg-blue-500" loading={loading}>
            Save
          </Button>,
        ]}
        width={700}
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
                  <h3 className="text-sm font-medium text-blue-800">Download Template</h3>
                  <div className="mt-2 text-sm text-blue-600">
                    <p>Please download and fill in the template below before submitting your policy discussion details.</p>
                  </div>
                  <div className="mt-3">
                    <a
                      href="/templates/Discussing_Policies_template.xlsx"
                      download="discussing_policies_template.xlsx"
                      className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Policy Discussion Template
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Details</label>
              <TextArea
                rows={6}
                placeholder="Enter details for the discussing policies"
                value={discussingPoliciesText}
                onChange={(e) => setDiscussingPoliciesText(e.target.value)}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {oldFilesNeeded.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Existing Files</h4>
                <div className="space-y-3">
                  {oldFilesNeeded.map((fileUrl) => (
                    <div key={fileUrl} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <FileTextOutlined className="text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-700 truncate">{getFileName(fileUrl)}</span>
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
            {removedOldFiles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Removed Files</h4>
                <div className="space-y-3">
                  {removedOldFiles.map((fileUrl) => (
                    <div key={fileUrl} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <FileTextOutlined className="text-red-500" />
                        </div>
                        <span className="text-sm text-gray-500 truncate">{getFileName(fileUrl)}</span>
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
              <h4 className="text-sm font-medium text-gray-700 mb-3">Upload New Files</h4>
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
          <Button key="assign" type="primary" onClick={handleSubmitAssignment} className="bg-blue-500">
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
            {members && members.map((member) => (
              <Option key={member.id} value={member.id}>
                {member.name}
              </Option>
            ))}
          </Select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Team Deadline</label>
          <DatePicker
            style={{ width: "100%" }}
            value={taskDeadline}
            onChange={setTaskDeadline}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Task Description</label>
          <Input
            placeholder="Enter task description"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Task References</label>
          <Input
            placeholder="Add reference URLs"
            value={taskReferences}
            onChange={(e) => setTaskReferences(e.target.value)}
          />
        </div>
      </Modal>

      <ReviewModal />
    </div>
  );
};

export default DiscussingPolicies;