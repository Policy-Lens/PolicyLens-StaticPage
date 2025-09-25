import React, { useState, useContext, useEffect } from "react";
import {
  Button,
  Input,
  Form,
  Row,
  Col,
  Card,
  Divider,
  Space,
  Typography,
  Tooltip,
  Collapse,
  message,
  Modal,
  Dropdown,
  Select,
  DatePicker,
  Upload,
  Table,
  Checkbox,
  Radio,
  Switch,
  InputNumber,
  TimePicker,
} from "antd";
import { 
  PaperClipOutlined, 
  FileTextOutlined, 
  LoadingOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  DownloadOutlined
} from "@ant-design/icons";
import { ProjectContext } from "../../Context/ProjectContext";
import { useParams } from "react-router-dom";
import { BASE_URL, apiRequest } from "../../utils/api";
import InteractiveIsoClause from "../Common/InteractiveIsoClause";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

function InquirySection({ stepData, plcStepData, projectPlcData, projectId, refreshProjectData }) {
  const [form] = Form.useForm();
  const [inquiryData, setInquiryData] = useState(null);
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
  const [isNeedsMoreInfoModalVisible, setIsNeedsMoreInfoModalVisible] = useState(false);
  const [moreInfoComment, setMoreInfoComment] = useState("");
  // New: accept/reject comment modals
  const [isAcceptModalVisible, setIsAcceptModalVisible] = useState(false);
  const [acceptComment, setAcceptComment] = useState("");
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [moreInfoFileList, setMoreInfoFileList] = useState([]);
  const [reviewOldFilesNeeded, setReviewOldFilesNeeded] = useState([]);
  const [reviewRemovedOldFiles, setReviewRemovedOldFiles] = useState([]);
  const [downloadingFiles, setDownloadingFiles] = useState([]);
  const [loading, setLoading] = useState(false); // Changed to false since we have bulk data
  const [fileLists, setFileLists] = useState({});

  const { projectid } = useParams();
  const {
    checkStepAuth,
    projectRole,
    assignStep,
    getStepAssignment,
    getMembers,
    addStepData,
    getStepData,
  } = useContext(ProjectContext);

  // Initialize data from bulk props instead of API calls
  useEffect(() => {
    if (stepData) {
      setStepStatus(stepData.status || "pending");
      setProcess(stepData.process || "core");
      setAssociatedIsoClause(stepData.associated_iso_clause);
      setReviewStatus(stepData.review_status || "not_submitted");
      setReviewComment(stepData.review_comment || "");
    }
  }, [stepData]);

  // Initialize Inquiry data from bulk props (overview payload)
  useEffect(() => {
    if (plcStepData) {
      // Prefer the normalized inquiry_data snapshot provided by backend overview
      if (plcStepData.inquiry_data) {
        setInquiryData(plcStepData.inquiry_data);
        const raw = plcStepData.inquiry_data;
        const formData = {};
        Object.keys(raw).forEach((key) => {
          if (
            [
              "id",
              "step",
              "created_by",
              "updated_by",
              "created_at",
              "updated_at",
            ].includes(key)
          ) {
            return;
          }
          const value = raw[key];
          if (typeof value === "string" && value.includes(";")) {
            formData[key] = value.split(";");
          } else {
            formData[key] = value;
          }
        });
        form.setFieldsValue(formData);
      }

      // Extract assignments
      if (plcStepData.assignments && plcStepData.assignments.length > 0) {
        setTaskAssignment(plcStepData.assignments[0]);
      }
    }
  }, [plcStepData, form]);

  // Fallback: Fetch data from API if bulk inquiry snapshot is not available
  useEffect(() => {
    if (stepData?.step_id && (!plcStepData || !plcStepData.inquiry_data)) {
      fetchInquiryData(stepData.step_id);
    }
  }, [stepData?.step_id, plcStepData]);

  // Check if user is assigned to this step
  useEffect(() => {
    if (taskAssignment && taskAssignment.assigned_to_names) {
      // This would need to be enhanced based on current user context
      // For now, we'll assume the user is assigned if there are assignments
      setIsAssignedUser(taskAssignment.assigned_to_names.length > 0);
    }
  }, [taskAssignment]);

  // Field definitions for the form
  const scopeFields = [
    // Location Information
    { name: "country", label: "Country", type: "select", options: ["India", "USA", "UK", "Canada", "Australia", "Germany", "France", "Japan", "China", "Singapore", "Other"] },
    { name: "city", label: "City", type: "select", options: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Surat", "Other"] },
    { name: "headcount", label: "Headcount", type: "number" },
    { name: "servers", label: "#Servers", type: "number" },
    { name: "desktops", label: "#Desktops", type: "number" },
    { name: "laptops", label: "#Laptops", type: "number" },
    { name: "network_devices", label: "#Active Network Devices", type: "number" },
    { name: "cloud_services", label: "Active Cloud Services", type: "multiselect", options: ["AWS", "Azure", "Google Cloud", "IBM Cloud", "Oracle Cloud", "Alibaba Cloud", "DigitalOcean", "Heroku", "Other"] },
    { name: "departments", label: "Departments", type: "multiselect", options: ["IT", "HR", "Finance", "Marketing", "Sales", "Operations", "Legal", "Compliance", "Security", "Other"] },
    { name: "vendors_suppliers", label: "Vendors / Suppliers", type: "multiselect", options: ["Microsoft", "Oracle", "SAP", "Salesforce", "Adobe", "Cisco", "Dell", "HP", "IBM", "Other"] },
    { name: "iso_standards", label: "ISO Standards", type: "multiselect", options: ["ISO 27001", "ISO 27701", "PCI", "ISO 27001;ISO27701;PCI"] },
    { name: "statutory_requirements", label: "Statutory Requirements", type: "multiselect", options: ["GDPR", "SOX", "HIPAA", "GLBA", "CCPA", "LGPD", "PDPA", "Other"] },
    { name: "regulatory_requirements", label: "Regulatory Requirements", type: "multiselect", options: ["SEBI", "RBI", "IRDAI", "TRAI", "CERC", "Other"] },
    
    // Company Documents
    { name: "legal_status", label: "Legal Status of the Company", type: "multiselect", options: ["Proprietory", "Partnership", "Pvt. Ltd.", "Ltd.", "LLP", "Public Limited", "Sole Proprietorship", "Other"] },
    { name: "pan", label: "PAN", type: "upload" },
    { name: "gst", label: "GST", type: "upload" },
    { name: "uan", label: "UAN", type: "upload" },
    { name: "cin", label: "CIN", type: "upload" },
    { name: "document_incorporation", label: "Document of Incorporation", type: "upload" },
    { name: "document_establishment", label: "Document of Establishment", type: "upload" },
    { name: "membership_ids", label: "Membership IDs", type: "upload" },
    { name: "billing_address", label: "Billing Address", type: "textarea" },
    { name: "bill_to_person", label: "Bill to Person Name", type: "input" },
    { name: "bill_to_department", label: "Bill to Department", type: "input" },
    { name: "company_logo", label: "Company Logo", type: "upload" },
    { name: "company_color_pallet", label: "Company Color Pallet", type: "upload" },
    
    // Scope of Services
    { name: "services", label: "Services", type: "select", options: ["ISO 27001 Certification", "ISO 9001 Certification", "SOC 2 Certification", "GDPR Compliance", "HIPAA Compliance", "PCI-DSS Compliance", "SOX Compliance", "NIST Compliance", "Gap Analysis", "Risk Assessment", "Audit Support", "Other"] },
    { name: "duration", label: "Duration", type: "input" },
    { name: "applicable_phases", label: "Applicable Phases", type: "multiselect", options: ["Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5"] },
    { name: "resource_deployment", label: "Resource Deployment", type: "table" },
    { name: "gannt_chart", label: "Gannt Chart", type: "upload" },
    { name: "expected_deliverable", label: "Expected Deliverable", type: "textarea" },
    { name: "budget", label: "Budget", type: "table" },
    { name: "currency_transaction", label: "Currency of Transaction", type: "select", options: ["USD", "EUR", "GBP", "INR", "CAD", "AUD"] },
    { name: "dependencies", label: "Dependencies", type: "table" },
  ];



  const checkAssignedUser = async (step_id) => {
    const isAuthorized = await checkStepAuth(step_id);
    setIsAssignedUser(isAuthorized);
  };

  const fetchInquiryData = async (step_id) => {
    try {
      const response = await apiRequest(
        "GET",
        `/api/plc/inquiry-data/${step_id}/`,
        null,
        true
      );
      if (response.status === 200) {
        setInquiryData(response.data);
        // Transform the data to match form field names
        const formData = {};
        Object.keys(response.data).forEach(key => {
          if (key !== 'id' && key !== 'step' && key !== 'created_by' && key !== 'updated_by' && key !== 'created_at' && key !== 'updated_at') {
            const value = response.data[key];
            if (value && typeof value === 'string' && value.includes(';')) {
              // Handle multiselect fields - split by semicolon
              formData[key] = value.split(';');
            } else {
              formData[key] = value;
            }
          }
        });
        form.setFieldsValue(formData);
      }
    } catch (error) {
      if (error?.status !== 404) {
        console.error("Error fetching inquiry data:", error);
      }
    }
  };

  const handleFormSubmit = async (values) => {
    if (!stepData?.step_id) {
      message.error("Step data not loaded yet. Please wait and try again.");
      return;
    }
    
    setLoading(true);
    try {
      // Prepare form data for the new InquiryData API
          const formData = new FormData();
      
      // Add all field values to form data
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null && values[key] !== '') {
          if (Array.isArray(values[key])) {
            // Handle multiselect fields - join with semicolon
            formData.append(key, values[key].join(';'));
          } else {
            formData.append(key, values[key]);
          }
        }
      });
      
      // Add files for upload fields
      Object.keys(fileLists).forEach(fieldName => {
          if (fileLists[fieldName] && fileLists[fieldName].length > 0) {
            fileLists[fieldName].forEach((file) => {
            formData.append(fieldName, file.originFileObj || file);
          });
        }
      });

      // Determine if this is a create or update operation
      // Safer check: require an id on inquiryData to enable PUT
      let method = inquiryData?.id ? "PUT" : "POST";
      let response;
      let success = false;
      
      console.log("Current inquiryData:", inquiryData);
      console.log("Selected method:", method);
      
      try {
        // First attempt with determined method
        response = await apiRequest(
          method,
          `/api/plc/inquiry-data/${stepData.step_id}/`,
              formData,
              true,
              true
        );
        success = true;
      } catch (error) {
        console.log("Initial request failed:", error);
        console.log("Error status:", error?.status);
        console.log("Error message:", error?.error || error?.message);
        
        // If PUT fails with "not found" error, retry as POST
        if (method === "PUT" && 
            error?.status === 404) {
          console.log("PUT failed, retrying as POST...");
          try {
            method = "POST";
            response = await apiRequest(
              method,
              `/api/plc/inquiry-data/${stepData.step_id}/`,
              formData,
              true,
              true
            );
            success = true;
          } catch (retryError) {
            console.error("Retry as POST also failed:", retryError);
            throw retryError;
          }
      } else {
          // Re-throw the error if it's not a 404 "not found" case
          throw error;
        }
      }
      
      if (success && (response.status === 200 || response.status === 201)) {
        message.success(
          method === "PUT" 
            ? "Inquiry data updated successfully!" 
            : "Inquiry data saved successfully!"
        );
        setInquiryData(response.data);
        // Refresh parent data to update the bulk endpoint
        if (refreshProjectData) {
          refreshProjectData();
        }
      } else {
        message.error("Failed to save inquiry data.");
      }
      
    } catch (error) {
      console.error("Error saving inquiry data:", error);
      message.error("Failed to save inquiry data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendForReview = async () => {
    if (!stepData?.step_id) {
      message.error("Step data not loaded yet. Please wait and try again.");
      return;
    }
    
    try {
      const response = await apiRequest(
        "PUT",
        `/api/plc/plc_step/${stepData.step_id}/update-status/`,
        { status: "completed" },
        true
      );
      if (response.status === 200) {
        message.success("Step sent for review successfully!");
        setStepStatus("completed");
        setReviewStatus("under_review");
        // Refresh parent data to update the bulk endpoint
        if (refreshProjectData) {
          refreshProjectData();
        }
      } else {
        message.error("Failed to send step for review.");
      }
    } catch (error) {
      console.error("Error sending for review:", error);
      message.error("Failed to send step for review.");
    }
  };

  const handleReviewAction = async (action) => {
    if (!stepData?.step_id) {
      message.error("Step data not loaded yet. Please wait and try again.");
      return;
    }
    
    // Comments per action
    let commentToSend = "";
    if (action === "accept") {
      commentToSend = acceptComment.trim();
    } else if (action === "reject") {
      if (!rejectComment.trim()) {
        message.warning("Please provide a rejection comment.");
        return;
      }
      commentToSend = rejectComment.trim();
    } else if (action === "needs_info") {
      if (!moreInfoComment.trim()) {
        message.warning("Please provide details for your request.");
        return;
      }
      commentToSend = moreInfoComment.trim();
    }

    const formData = new FormData();
    formData.append(
      "review_status",
      action === "accept" ? "accepted" : action === "reject" ? "rejected" : "needs_info"
    );
    formData.append("review_comment", commentToSend);
    formData.append("old_files", JSON.stringify(reviewOldFilesNeeded));
    moreInfoFileList.forEach((file) => {
      formData.append("files", file.originFileObj);
    });

    try {
      const response = await apiRequest(
        "POST",
        `/api/plc/plc_step/${stepData.step_id}/submit-review/`,
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
        // Refresh parent data to update the bulk endpoint
        if (refreshProjectData) {
          refreshProjectData();
        }
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
      const result = await assignStep(stepData.step_id, assignmentData);
      if (result) {
        message.success("Task assigned successfully!");
        setIsAssignTaskVisible(false);
        setSelectedTeamMembers([]);
        setTaskDescription("");
        setTaskDeadline(null);
        setTaskReferences("");
        // No longer need to call get_step_id since we have bulk data
        // The parent component will handle data updates
      } else {
        message.error("Failed to assign task.");
      }
    } catch (error) {
      message.error("Failed to assign task.");
      console.error(error);
    }
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

  const handleUploadChange = (fieldName, { fileList }) => {
    setFileLists((prev) => ({ ...prev, [fieldName]: fileList }));
  };



  // Initialize data when component mounts
  useEffect(() => {
    // No longer need to call get_step_id since we have bulk data
    // The data is initialized from props in the useEffect hooks above
  }, []);

  const updateStepStatus = async (newStatus) => {
    try {
      const response = await apiRequest(
        "PUT",
        `/api/plc/plc_step/${stepData.step_id}/update-status/`,
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
        `/api/plc/plc_step/${stepData.step_id}/update/`,
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

  // Render form field based on type
  const renderField = (field) => {
    switch (field.type) {
      case "input":
        return <Input placeholder={`Enter ${field.label.toLowerCase()}`} />;
      case "textarea":
        return <TextArea rows={3} placeholder={`Enter ${field.label.toLowerCase()}`} />;
      case "select":
    return (
          <Select placeholder={`Select ${field.label.toLowerCase()}`}>
            {field.options?.map(option => (
              <Option key={option} value={option}>{option}</Option>
            ))}
          </Select>
        );
      case "multiselect":
        return (
          <Select
            mode="multiple"
            placeholder={`Select ${field.label.toLowerCase()}`}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {field.options?.map(option => (
              <Option key={option} value={option}>{option}</Option>
            ))}
          </Select>
        );
      case "upload":
        return (
              <Upload
            fileList={fileLists[field.name] || []}
            onChange={(info) => handleUploadChange(field.name, info)}
                beforeUpload={() => false}
                multiple
          >
            <Button icon={<PaperClipOutlined />}>Upload Files</Button>
              </Upload>
        );
      case "number":
        return <InputNumber placeholder={`Enter ${field.label.toLowerCase()}`} style={{ width: '100%' }} />;
      case "table":
        return (
          <div className="border border-gray-200 rounded p-3">
            <TextArea 
              rows={4} 
              placeholder={`Enter ${field.label.toLowerCase()} as table format (e.g., Column1 | Column2 | Column3\nRow1 | Data1 | Data2)`} 
            />
            <Text className="text-xs text-gray-500 mt-1">
              Use | to separate columns and new lines for rows
            </Text>
          </div>
        );
      case "date":
        return <DatePicker placeholder={`Select ${field.label.toLowerCase()}`} style={{ width: '100%' }} />;
      case "time":
        return <TimePicker placeholder={`Select ${field.label.toLowerCase()}`} style={{ width: '100%' }} />;
      case "checkbox":
        return <Checkbox>{field.label}</Checkbox>;
      case "radio":
        return (
          <Radio.Group>
            {field.options?.map(option => (
              <Radio key={option} value={option}>{option}</Radio>
            ))}
          </Radio.Group>
        );
      case "switch":
        return <Switch />;
      default:
        return <Input placeholder={`Enter ${field.label.toLowerCase()}`} />;
    }
  };

  // Show loading state if stepData is not yet available
  if (!stepData?.step_id) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading step data...</p>
          </div>
        </div>
      </div>
    );
  }

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
                className="bg-green-600 hover:bg-green-700 text-white border-green-600"
              >
                Send for Review
              </Button>
            )}
            {projectRole === "company" && (
              <>
              <Button
                type="default"
                onClick={() => setIsAcceptModalVisible(true)}
                className="bg-green-600 hover:bg-green-700 text-white border-green-600"
              >
                Accept
              </Button>
                <Button
                  type="default"
                  onClick={() => setIsRejectModalVisible(true)}
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
          </div>
        </div>
      </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <Title level={3} className="text-gray-800 mb-2">
                  Inquiry Information
                </Title>
                <Text type="secondary">
                  Complete the form below to define inquiry details and requirements.
                </Text>
              </div>
              <div className="flex space-x-2">
                <Button
                  type="default"
                  icon={<DownloadOutlined />}
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = '/templates/Inquiry_template.xlsx';
                    link.download = 'inquiry_template.xlsx';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  Download Template
                </Button>
                    </div>
                  </div>
            </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleFormSubmit}
            initialValues={inquiryData || {}}
          >
            <Collapse
              defaultActiveKey={['1']}
              expandIconPosition="end"
              className="mb-6"
              items={[
                {
                  key: '1',
                  label: (
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-gray-800">Location Information</span>
                      <span className="ml-2 text-sm text-gray-500">(Country, city, infrastructure details)</span>
                              </div>
                  ),
                  children: (
                    <Row gutter={16}>
                      {scopeFields.filter(field => 
                        ['country', 'city', 'headcount', 'servers', 'desktops', 'laptops', 'network_devices', 
                         'cloud_services', 'departments', 'vendors_suppliers', 'iso_standards', 
                         'statutory_requirements', 'regulatory_requirements'].includes(field.name)
                      ).map((field, index) => (
                        <Col span={field.type === "textarea" || field.type === "table" ? 24 : 12} key={field.name}>
                          <Form.Item
                            name={field.name}
                            label={field.label}
                            rules={field.required ? [{ required: true, message: `Please enter ${field.label.toLowerCase()}` }] : []}
                          >
                            {renderField(field)}
                          </Form.Item>
                        </Col>
                      ))}
                    </Row>
                  ),
                },
                {
                  key: '2',
                  label: (
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-gray-800">Company Documents</span>
                      <span className="ml-2 text-sm text-gray-500">(Legal status, documents, billing info)</span>
                        </div>
                  ),
                  children: (
                          <Row gutter={16}>
                      {scopeFields.filter(field => 
                        ['legal_status', 'pan', 'gst', 'uan', 'cin', 'document_incorporation',
                         'document_establishment', 'membership_ids', 'billing_address', 
                         'bill_to_person', 'bill_to_department', 'company_logo', 'company_color_pallet'].includes(field.name)
                      ).map((field, index) => (
                        <Col span={field.type === "textarea" || field.type === "table" ? 24 : 12} key={field.name}>
                                <Form.Item
                            name={field.name}
                                  label={field.label}
                            rules={field.required ? [{ required: true, message: `Please enter ${field.label.toLowerCase()}` }] : []}
                                >
                                  {renderField(field)}
                                </Form.Item>
                              </Col>
                            ))}
                          </Row>
                  ),
                },
                {
                  key: '3',
                  label: (
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-gray-800">Scope of Services</span>
                      <span className="ml-2 text-sm text-gray-500">(Services, duration, phases, deliverables)</span>
                            </div>
                  ),
                  children: (
                    <Row gutter={16}>
                      {scopeFields.filter(field => 
                        ['services', 'duration', 'applicable_phases', 'resource_deployment',
                         'gannt_chart', 'expected_deliverable', 'budget', 'currency_transaction', 'dependencies'].includes(field.name)
                      ).map((field, index) => (
                        <Col span={field.type === "textarea" || field.type === "table" ? 24 : 12} key={field.name}>
                          <Form.Item
                            name={field.name}
                            label={field.label}
                            rules={field.required ? [{ required: true, message: `Please enter ${field.label.toLowerCase()}` }] : []}
                          >
                            {renderField(field)}
                          </Form.Item>
                        </Col>
                      ))}
                    </Row>
                  ),
                },
              ]}
            />
            
            <div className="flex justify-end space-x-4">
            <Button
                type="default" 
                onClick={() => form.resetFields()} 
                className="border-gray-300 text-gray-700"
              >
                Reset Form
              </Button>
              <Button 
              type="primary"
                htmlType="submit" 
              className="bg-blue-600 hover:bg-blue-700"
                loading={loading}
                icon={<SaveOutlined />}
              >
                {inquiryData ? "Update Inquiry" : "Save Inquiry"}
            </Button>
          </div>
          </Form>
        </div>
      </div>

      {/* Review Comment Display */}
      {reviewComment && (
        <div className="mt-6 p-6 bg-white rounded-xl shadow-md">
          <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3">
            Review Comment
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{reviewComment}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Files Display */}
      {reviewOldFilesNeeded && reviewOldFilesNeeded.length > 0 && (
        <div className="mt-6 p-6 bg-white rounded-xl shadow-md">
          <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-3">
            Additional Files Requested
          </h3>
          <div className="space-y-3">
            {reviewOldFilesNeeded.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="text-sm text-gray-700">{getFileName(file)}</span>
                </div>
                <Button
                  type="link"
                  size="small"
                  onClick={() => handleFileDownload(file, getFileName(file))}
                  className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                >
                  Download
                </Button>
              </div>
            ))}
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
        title="Accept Inquiry"
        open={isAcceptModalVisible}
        onCancel={() => setIsAcceptModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsAcceptModalVisible(false)}>Cancel</Button>,
          <Button key="ok" type="primary" onClick={() => { setIsAcceptModalVisible(false); handleReviewAction("accept"); }} className="bg-green-600 hover:bg-green-700">Confirm Accept</Button>,
        ]}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Comment (optional)</label>
          <TextArea rows={3} placeholder="Optional acceptance note" value={acceptComment} onChange={(e) => setAcceptComment(e.target.value)} />
        </div>
      </Modal>

      <Modal
        title="Reject Inquiry"
        open={isRejectModalVisible}
        onCancel={() => setIsRejectModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsRejectModalVisible(false)}>Cancel</Button>,
          <Button key="ok" type="primary" danger onClick={() => { setIsRejectModalVisible(false); handleReviewAction("reject"); }}>Submit Rejection</Button>,
        ]}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Comment <span className="text-red-500">*</span></label>
          <TextArea rows={4} placeholder="Provide reason for rejection" value={rejectComment} onChange={(e) => setRejectComment(e.target.value)} />
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
              onChange={({ fileList: newFileList }) => setMoreInfoFileList(newFileList)}
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

export default InquirySection;