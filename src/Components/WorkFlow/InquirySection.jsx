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
  Card,
  Form,
  Table,
  Space,
  Spin,
  Collapse,
  Tooltip,
  Radio,
  Checkbox
} from "antd";
import { PaperClipOutlined, FileTextOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, MailOutlined, PhoneOutlined, LoadingOutlined } from "@ant-design/icons";
import { ProjectContext } from "../../Context/ProjectContext";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../../utils/api";
import { apiRequest } from "../../utils/api";
import InteractiveIsoClause from "../Common/InteractiveIsoClause";
const { TextArea } = Input;
const { Option } = Select;

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
  const [downloadingFiles, setDownloadingFiles] = useState([]);
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
    const response = await getStepId(projectid, 2);
    if (response) {
      setStepId(response.plc_step_id);
      setAssociatedIsoClause(response.associated_iso_clause);
      setProcess(response.process || "core");
      await get_step_data(response.plc_step_id);
      await checkAssignedUser(response.plc_step_id);
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
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-3">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-blue-600"
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
            <div className="ml-2">
              <div className="text-sm text-blue-600">
                <p>
                  Please download and fill in the template before submitting.
                </p>
              </div>
              <div className="mt-2">
                <a
                  href="/templates/Inquiry_template.xlsx"
                  download={`${fieldName
                    .toLowerCase()
                    .replace(/\s+/g, "_")}_template.xlsx`}
                  className="inline-flex items-center px-3 py-1 border border-blue-300 shadow-sm text-xs font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg
                    className="-ml-0.5 mr-1.5 h-4 w-4 text-blue-500"
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
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [reviewAction, setReviewAction] = useState("accept");
  const [reviewModalComment, setReviewModalComment] = useState("");
  const [reviewFileList, setReviewFileList] = useState([]);
  const [reviewOldFilesNeeded, setReviewOldFilesNeeded] = useState([]);
  const [reviewRemovedOldFiles, setReviewRemovedOldFiles] = useState([]);
  const [downloadingFiles, setDownloadingFiles] = useState([]);

  const { projectid } = useParams();
  const {
    getStepData,
    getStepId,
    checkStepAuth,
    projectRole,
    assignStep,
    getStepAssignment,
    getMembers,
  } = useContext(ProjectContext);

  const getFileName = (filePath) => {
    return filePath.split("/").pop();
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const checkAssignedUser = async (step_id) => {
    const isAuthorized = await checkStepAuth(step_id);
    setIsAssignedUser(isAuthorized);
  };

  const get_step_id = async () => {
    try {
      const response = await getStepId(projectid, 2);
      if (response) {
        setStepId(response.plc_step_id);
        setStepStatus(response.status);
        setReviewStatus(response.review_status);
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
      message.error("Failed to load inquiry data.");
    }
  };

  const get_step_data = async (step_id) => {
    const stepData = await getStepData(step_id);
    setInquiryData(stepData || []);
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

    const handleReviewSubmit = async () => {
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
          <Button key="cancel" onClick={resetModalState} disabled={isSubmitting}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleReviewSubmit}
            className={`${localAction === "accept" ? "bg-green-600 hover:bg-green-700" : localAction === "reject" ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"}`}
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
                            style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
                          >
                            {getFileName(fileUrl)}
                            {downloadingFiles.includes(fileUrl) && (
                              <LoadingOutlined spin style={{ fontSize: 16, marginLeft: 6 }} />
                            )}
                          </button>
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

  useEffect(() => {
    get_step_id();
  }, []);

  const groupedData = inquiryData.reduce((acc, item) => {
    acc[item.field_name] = item;
    return acc;
  }, {});

  const getLatestUpdateTime = () => {
    if (inquiryData.length === 0) return null;
    const dates = inquiryData.map((item) => new Date(item.saved_at).getTime());
    const latestTime = Math.max(...dates);
    return new Date(latestTime);
  };

  const getLatestUser = () => {
    if (inquiryData.length === 0) return null;
    const latestDate = getLatestUpdateTime();
    const latestItem = inquiryData.find(
      (item) => new Date(item.saved_at).getTime() === latestDate.getTime()
    );
    return latestItem ? latestItem.saved_by : null;
  };

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

  const getFieldDocuments = (fieldName) => {
    if (inquiryData.length === 0) return [];
    const fieldItem = inquiryData.find((item) => item.field_name === fieldName);
    if (!fieldItem || !fieldItem.documents || fieldItem.documents.length === 0) {
      return [];
    }
    return fieldItem.documents.map((doc) => ({
      ...doc,
      fieldName: fieldName,
    }));
  };

  const latestUpdateTime = getLatestUpdateTime();
  const latestUser = getLatestUser();
  const allDocuments = getAllDocuments();

  return (
    <div className="min-h-full p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Inquiry Section</h2>
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              ISO:&nbsp;<InteractiveIsoClause isoClause={associatedIsoClause} />
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
              >
                <Option value="pending">Pending</Option>
                <Option value="in_progress">In Progress</Option>
                <Option value="completed">Completed</Option>
              </Select>
            )}
            {(projectRole.includes("consultant admin") || isAssignedUser) && (
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
      </div>

      {Object.keys(groupedData).length > 0 ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
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

      <InquirySection
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />

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

      <ReviewModal />
    </div>
  );
}

export default InquiryPage;