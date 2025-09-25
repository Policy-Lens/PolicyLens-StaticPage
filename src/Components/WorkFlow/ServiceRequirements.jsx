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
  Select,
  DatePicker,
  Upload,
  Radio,
  Checkbox,
  AutoComplete,
} from "antd";
import { 
  PaperClipOutlined, 
  FileTextOutlined, 
  LoadingOutlined,
  SaveOutlined,
  SendOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  GlobalOutlined,
  LinkedinOutlined,
  BankOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileProtectOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
  SyncOutlined
} from "@ant-design/icons";
import { ProjectContext } from "../../Context/ProjectContext";
import { useParams } from "react-router-dom";
import { BASE_URL, apiRequest } from "../../utils/api";
import InteractiveIsoClause from "../Common/InteractiveIsoClause";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

function ServiceRequirements({ stepData, plcStepData, projectPlcData, projectId, refreshProjectData }) {
  const [form] = Form.useForm();
  const [serviceRequirementsData, setServiceRequirementsData] = useState(null);
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
  const [isAcceptModalVisible, setIsAcceptModalVisible] = useState(false);
  const [acceptComment, setAcceptComment] = useState("");
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [moreInfoFileList, setMoreInfoFileList] = useState([]);
  const [reviewOldFilesNeeded, setReviewOldFilesNeeded] = useState([]);
  const [reviewRemovedOldFiles, setReviewRemovedOldFiles] = useState([]);
  const [downloadingFiles, setDownloadingFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileLists, setFileLists] = useState({});
  const [gicsData, setGicsData] = useState({ sectors: [], industries: [], subsectors: [] });
  const [autoFetchLoading, setAutoFetchLoading] = useState(false);
  const [enrichmentStatus, setEnrichmentStatus] = useState("NOT_STARTED");
  const [isFormReset, setIsFormReset] = useState(false);

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

  // Service requirement options as per template
  const serviceRequirementOptions = [
    "Implementation",
    "Independent Assessment", 
    "Independent Testing",
    "Internal Audit",
    "Subject Matter Consulting",
    "End-to-End ISO certification",
    "Continuous compliance support",
    "Acting CISO / DPO"
  ];

  const complianceOptions = [
    "ISO 27001",
    "ISO 27701", 
    "PCI"
  ];

  const timelineOptions = [
    "1-2 weeks",
    "1 month",
    "2-3 months", 
    "3-6 months",
    "6-12 months",
    "1+ year"
  ];

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

  // Initialize Service Requirements data from bulk props (overview payload)
  useEffect(() => {
    if (plcStepData && !isFormReset) {
      console.log("ServiceRequirements: Received plcStepData:", plcStepData);
      
      // Check if we have service_requirements_data in the bulk response
      if (plcStepData.service_requirements_data) {
        console.log("ServiceRequirements: Found service_requirements_data:", plcStepData.service_requirements_data);
        setServiceRequirementsData(plcStepData.service_requirements_data);
        // Set enrichment status
        setEnrichmentStatus(plcStepData.service_requirements_data.enrichment_status || "NOT_STARTED");
        // Transform the data to match form field names
        const formData = {};
        const currentFormValues = form.getFieldsValue(); // Get current form values to preserve non-auto-fetchable fields
        
        Object.keys(plcStepData.service_requirements_data).forEach(key => {
          if (key !== 'id' && key !== 'step' && key !== 'created_by' && key !== 'updated_by' && key !== 'created_at' && key !== 'updated_at') {
            const value = plcStepData.service_requirements_data[key];
            
            // Only update auto-fetchable fields, preserve other fields like legal_name, contact_name, etc.
            const autoFetchableFields = [
              'hq_city', 'hq_country', 'hq_zip_code', 'about_company',
              'company_revenue', 'company_headcount', 'company_year_inception',
              'company_lines_business', 'company_brands', 'products_services',
              'company_locations', 'company_existing_compliances'
            ];
            
            if (autoFetchableFields.includes(key)) {
              // This is an auto-fetchable field, update it
              if (value && typeof value === 'string' && value.includes(';')) {
                // Handle multiselect fields - split by semicolon
                formData[key] = value.split(';');
              } else {
                formData[key] = value;
              }
            } else {
              // This is not an auto-fetchable field, preserve current value
              formData[key] = currentFormValues[key] || value;
            }
          }
        });
        console.log("ServiceRequirements: Setting form data:", formData);
        form.setFieldsValue(formData);
        // Reset the form reset flag after setting data
        setIsFormReset(false);
      } else {
        console.log("ServiceRequirements: No service_requirements_data found, using fallback");
        // Fallback: use plcStepData directly (for backward compatibility)
        setServiceRequirementsData(plcStepData);
        setEnrichmentStatus(plcStepData.enrichment_status || "NOT_STARTED");
        const formData = {};
        const currentFormValues = form.getFieldsValue(); // Get current form values to preserve non-auto-fetchable fields
        
        Object.keys(plcStepData).forEach(key => {
          if (key !== 'id' && key !== 'step' && key !== 'created_by' && key !== 'updated_by' && key !== 'created_at' && key !== 'updated_at') {
            const value = plcStepData[key];
            
            // Only update auto-fetchable fields, preserve other fields like legal_name, contact_name, etc.
            const autoFetchableFields = [
              'hq_city', 'hq_country', 'hq_zip_code', 'about_company',
              'company_revenue', 'company_headcount', 'company_year_inception',
              'company_lines_business', 'company_brands', 'products_services',
              'company_locations', 'company_existing_compliances'
            ];
            
            if (autoFetchableFields.includes(key)) {
              // This is an auto-fetchable field, update it
              if (value && typeof value === 'string' && value.includes(';')) {
                formData[key] = value.split(';');
              } else {
                formData[key] = value;
              }
            } else {
              // This is not an auto-fetchable field, preserve current value
              formData[key] = currentFormValues[key] || value;
            }
          }
        });
        form.setFieldsValue(formData);
        // Reset the form reset flag after setting data
        setIsFormReset(false);
      }
    } else if (plcStepData && isFormReset) {
      // If we're in reset mode and new data comes in, check if it's empty/null
      // If the data is empty/null, we can reset the flag
      if (!plcStepData.service_requirements_data || 
          (plcStepData.service_requirements_data && 
           Object.keys(plcStepData.service_requirements_data).length === 0)) {
        console.log("ServiceRequirements: Reset mode - data is empty, resetting flag");
        setIsFormReset(false);
      }
    }
  }, [plcStepData, form, isFormReset]);

  // Check if user is assigned to this step
  useEffect(() => {
    if (stepData?.step_id) {
      checkAssignedUser(stepData.step_id);
    }
  }, [stepData]);

  // Fetch GICS data for industry/subsector dropdowns
  useEffect(() => {
    fetchGicsData();
  }, []);

  const fetchGicsData = async () => {
    try {
      const response = await apiRequest("GET", "/api/policylens/gics/", null, true);
      if (response.data?.results) {
        const sectors = [...new Set(response.data.results.map(item => item.sector))];
        const industries = [...new Set(response.data.results.map(item => item.industry))];
        const subsectors = [...new Set(response.data.results.map(item => item.sub_industry))];
        
        setGicsData({
          sectors: sectors.sort(),
          industries: industries.sort(),
          subsectors: subsectors.sort()
        });
      }
    } catch (error) {
      console.error("Error fetching GICS data:", error);
    }
  };

  const checkAssignedUser = async (step_id) => {
    const isAuthorized = await checkStepAuth(step_id);
    setIsAssignedUser(isAuthorized);
  };

  // Reset form function that clears all fields
  const handleResetForm = () => {
    // Set reset flag to prevent repopulation
    setIsFormReset(true);
    
    // Clear all form fields immediately
    form.resetFields();
    
    // Clear file lists
    setFileLists({});
    
    // Reset enrichment status
    setEnrichmentStatus("NOT_STARTED");
    
    // Clear service requirements data
    setServiceRequirementsData(null);
    
    // Clear the database by calling the backend to reset the service requirements
    if (stepData?.step_id) {
      apiRequest(
        "DELETE",
        `/api/plc/service-requirements/${stepData.step_id}/`,
        null,
        true
      ).then(() => {
        // After successful deletion, refresh project data to update the bulk endpoint
        if (refreshProjectData) {
          refreshProjectData();
        }
      }).catch(error => {
        console.log("Reset: No existing data to delete or error occurred:", error);
        // Even if deletion fails, still refresh to ensure clean state
        if (refreshProjectData) {
          refreshProjectData();
        }
      });
    }
    
    // Set a timeout to clear the reset flag after 3 seconds as a fallback
    setTimeout(() => {
      setIsFormReset(false);
    }, 3000);
    
    message.success("Form has been reset successfully");
  };

  // Auto-fetch company information from website/LinkedIn
  const handleAutoFetch = async () => {
    const website = form.getFieldValue('website');
    const linkedin = form.getFieldValue('linkedin');
    
    if (!website && !linkedin) {
      message.warning("Please enter either website or LinkedIn URL to auto-fetch company information");
      return;
    }

    setAutoFetchLoading(true);
    try {
      // Call the backend auto-fetch API
      const response = await apiRequest(
        "POST",
        `/api/plc/service-requirements/${stepData.step_id}/auto-fetch/`,
        {
          website: website,
          linkedin: linkedin
        },
        true
      );

      if (response.status === 202) {
        message.success("Auto-fetch process started! This may take a few minutes.");
        
        // Start polling for status updates
        pollEnrichmentStatus(response.data.task_id);
      } else {
        message.error("Failed to start auto-fetch process");
      }
      
    } catch (error) {
      console.error("Error auto-fetching data:", error);
      message.error("Failed to auto-fetch company information");
    } finally {
      setAutoFetchLoading(false);
    }
  };

  // Poll for enrichment status updates
  const pollEnrichmentStatus = async (taskId) => {
    const maxAttempts = 30; // 5 minutes with 10-second intervals
    let attempts = 0;
    
    const pollInterval = setInterval(async () => {
      attempts++;
      
      try {
        const response = await apiRequest(
          "GET",
          `/api/plc/service-requirements/${stepData.step_id}/enrichment-status/`,
          null,
          true
        );

        if (response.status === 200) {
          const { enrichment_status } = response.data;
          console.log("ServiceRequirements: Enrichment status update:", response.data);
          
          // Update local state
          setEnrichmentStatus(enrichment_status);
          
          if (enrichment_status === "COMPLETED") {
            clearInterval(pollInterval);
            message.success("Company information auto-fetched successfully!");
            
            // Refresh the form data to show the enriched information
            if (refreshProjectData) {
              console.log("ServiceRequirements: Calling refreshProjectData to get updated data");
              refreshProjectData();
            }
            
            // Also fetch the latest service requirements data to populate the form
            try {
              const serviceReqResponse = await apiRequest(
                "GET",
                `/api/plc/service-requirements/${stepData.step_id}/`,
                null,
                true
              );
              
              if (serviceReqResponse.status === 200) {
                const enrichedData = serviceReqResponse.data;
                console.log("ServiceRequirements: Fetched enriched data:", enrichedData);
                
                // Populate the form fields with enriched data
                const formData = {};
                const autoFetchableFields = [
                  'hq_city', 'hq_country', 'hq_zip_code', 'about_company',
                  'company_revenue', 'company_headcount', 'company_year_inception',
                  'company_lines_business', 'company_brands', 'products_services',
                  'company_locations', 'company_existing_compliances'
                ];
                
                autoFetchableFields.forEach(field => {
                  if (enrichedData[field]) {
                    // Handle multiselect fields that are stored as semicolon-separated strings
                    if (field === 'company_lines_business' || field === 'company_brands' || 
                        field === 'products_services' || field === 'company_locations' || 
                        field === 'company_existing_compliances') {
                      if (typeof enrichedData[field] === 'string' && enrichedData[field].includes(';')) {
                        formData[field] = enrichedData[field].split(';');
                      } else {
                        formData[field] = enrichedData[field];
                      }
                    } else {
                      formData[field] = enrichedData[field];
                    }
                  }
                });
                
                console.log("ServiceRequirements: Setting form data:", formData);
                form.setFieldsValue(formData);
                
                // Update local state
                setServiceRequirementsData(enrichedData);
              }
            } catch (error) {
              console.error("Error fetching enriched data:", error);
            }
          } else if (enrichment_status === "FAILED") {
            clearInterval(pollInterval);
            message.error("Auto-fetch failed. Please try again or fill in manually.");
          }
        }
        
        // Stop polling after max attempts
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          message.warning("Auto-fetch is taking longer than expected. Please check back later.");
        }
        
      } catch (error) {
        console.error("Error polling enrichment status:", error);
        attempts++;
        
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          message.error("Failed to check auto-fetch status");
        }
      }
    }, 10000); // Poll every 10 seconds
  };

  const handleFormSubmit = async (values) => {
    if (!stepData?.step_id) {
      message.error("Step data not loaded yet. Please wait and try again.");
      return;
    }
    
    setLoading(true);
    try {
      // Prepare form data for the ServiceRequirements API
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
      let method = serviceRequirementsData?.id ? "PUT" : "POST";
      let response;
      let success = false;
      
      try {
        response = await apiRequest(
          method,
          `/api/plc/service-requirements/${stepData.step_id}/`,
          formData,
          true,
          true
        );
        success = true;
      } catch (error) {
        if (method === "PUT" && error?.status === 404) {
          try {
            method = "POST";
            response = await apiRequest(
              method,
              `/api/plc/service-requirements/${stepData.step_id}/`,
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
          throw error;
        }
      }
      
      if (success && (response.status === 200 || response.status === 201)) {
        message.success(
          method === "PUT" 
            ? "Service requirements updated successfully!" 
            : "Service requirements saved successfully!"
        );
        setServiceRequirementsData(response.data);
        // Refresh parent data to update the bulk endpoint
        if (refreshProjectData) {
          refreshProjectData();
        }
      } else {
        message.error("Failed to save service requirements.");
      }
      
    } catch (error) {
      console.error("Error saving service requirements:", error);
      message.error("Failed to save service requirements.");
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
        "PUT",
        `/api/plc/plc_step/${stepData.step_id}/submit-review/`,
        formData,
        true,
        true
      );
      if (response.status === 200) {
        message.success(
          action === "accept"
            ? "Step accepted successfully!"
            : action === "reject"
            ? "Step rejected successfully!"
            : "More information requested successfully!"
        );
        setReviewStatus(
          action === "accept" ? "accepted" : action === "reject" ? "rejected" : "needs_info"
        );
        setReviewComment(commentToSend);
        
        // Close modals
        setIsAcceptModalVisible(false);
        setIsRejectModalVisible(false);
        setIsNeedsMoreInfoModalVisible(false);
        setAcceptComment("");
        setRejectComment("");
        setMoreInfoComment("");
        setMoreInfoFileList([]);
        
        // Refresh parent data to update the bulk endpoint
        if (refreshProjectData) {
          refreshProjectData();
        }
      } else {
        message.error("Failed to submit review.");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      message.error("Failed to submit review.");
    }
  };

  const handleAssignTask = async () => {
    if (!stepData?.step_id) {
      message.error("Step data not loaded yet. Please wait and try again.");
      return;
    }
    
    if (!selectedTeamMembers.length) {
      message.error("Please select at least one team member.");
      return;
    }
    
    if (!taskDescription.trim()) {
      message.error("Please provide a task description.");
      return;
    }
    
    if (!taskDeadline) {
      message.error("Please set a task deadline.");
      return;
    }

    try {
      const response = await apiRequest(
        "POST",
        `/api/plc/step-assignment/${stepData.step_id}/create/`,
        {
          assigned_to: selectedTeamMembers,
          task_description: taskDescription,
          deadline: taskDeadline.toISOString(),
          references: taskReferences,
        },
        true
      );
      if (response.status === 201) {
        message.success("Task assigned successfully!");
        setIsAssignTaskVisible(false);
        setSelectedTeamMembers([]);
        setTaskDescription("");
        setTaskDeadline(null);
        setTaskReferences("");
        // Refresh parent data to update the bulk endpoint
        if (refreshProjectData) {
          refreshProjectData();
        }
      } else {
        message.error("Failed to assign task.");
      }
    } catch (error) {
      console.error("Error assigning task:", error);
      message.error("Failed to assign task.");
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await getMembers(projectid);
      setMembers(response);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const handleFileUpload = (fieldName, fileList) => {
    setFileLists(prev => ({
      ...prev,
      [fieldName]: fileList
    }));
  };

  const handleFileDownload = async (fileUrl, fileName) => {
    try {
      setDownloadingFiles(prev => [...prev, fileName]);
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
      message.error("Failed to download file.");
    } finally {
      setDownloadingFiles(prev => prev.filter(name => name !== fileName));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "green";
      case "in_progress":
        return "blue";
      case "pending":
        return "orange";
      case "accepted":
        return "green";
      case "rejected":
        return "red";
      case "needs_info":
        return "orange";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircleOutlined />;
      case "accepted":
        return <CheckCircleOutlined />;
      case "rejected":
        return <CloseCircleOutlined />;
      case "needs_info":
        return <QuestionCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getFileName = (filePath) => {
    return filePath.split("/").pop();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

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
        message.success("Status updated successfully");
        if (refreshProjectData) {
          refreshProjectData();
        }
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
        if (refreshProjectData) {
          refreshProjectData();
        }
      }
    } catch (error) {
      console.error("Error updating process:", error);
      message.error("Failed to update process");
    }
  };

  return (
    <div className="min-h-full p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Service Requirements</h2>
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
            {projectRole === "company" && reviewStatus === "under_review" && (
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
                onClick={() => {
                  fetchMembers();
                  setIsAssignTaskVisible(true);
                }}
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
            <Title level={3} className="text-gray-800 mb-2">
              Service Requirements Information
            </Title>
            <Text type="secondary">
              Complete the form below to define service requirements and company information.
            </Text>
          </div>

                    <Form
            form={form}
            layout="vertical"
            onFinish={handleFormSubmit}
            initialValues={serviceRequirementsData || {}}
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
                      <span className="text-lg font-semibold text-gray-800">Company Information</span>
                      <span className="ml-2 text-sm text-gray-500">(Contact details and basic info)</span>
                    </div>
                  ),
                  children: (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Legal Name of the Company"
                          name="legal_name"
                          rules={[{ required: true, message: 'Please enter the legal name' }]}
                        >
                          <Input placeholder="Enter legal company name" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Contact Name"
                          name="contact_name"
                          rules={[{ required: true, message: 'Please enter contact name' }]}
                        >
                          <Input placeholder="Enter contact person name" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Contact Number"
                          name="contact_number"
                          rules={[{ required: true, message: 'Please enter contact number' }]}
                        >
                          <Input placeholder="Enter contact phone number" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Contact Email"
                          name="contact_email"
                          rules={[
                            { required: true, message: 'Please enter contact email' },
                            { type: 'email', message: 'Please enter a valid email' }
                          ]}
                        >
                          <Input placeholder="Enter contact email address" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label={
                            <Space>
                              <GlobalOutlined />
                              Website
                            </Space>
                          }
                          name="website"
                        >
                          <Input placeholder="Enter company website URL" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label={
                            <Space>
                              <LinkedinOutlined />
                              LinkedIn
                            </Space>
                          }
                          name="linkedin"
                        >
                          <Input placeholder="Enter LinkedIn company page URL" />
                        </Form.Item>
                      </Col>
                    </Row>
                  ),
                },
                {
                  key: '2',
                  label: (
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-gray-800">Company Details</span>
                      <span className="ml-2 text-sm text-gray-500">(Auto-fetch from website/LinkedIn)</span>
                    </div>
                  ),
                  children: (
                    <Row gutter={16}>
                                             <Col span={24}>
                         <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                           <div className="flex items-center justify-between">
                             <div>
                               <Text strong className="text-blue-800">Auto-Fetch Company Information</Text>
                               <br />
                               <Text type="secondary" className="text-sm">
                                 Enter website or LinkedIn URL above, then click to auto-fetch company details
                               </Text>
                               {enrichmentStatus !== "NOT_STARTED" && (
                                 <div className="mt-2">
                                   <Text type="secondary" className="text-xs">
                                     Status: {enrichmentStatus === "PENDING" ? "Processing..." : 
                                              enrichmentStatus === "COMPLETED" ? "Completed" : 
                                              enrichmentStatus === "FAILED" ? "Failed" : "Unknown"}
                                   </Text>
                                 </div>
                               )}
                             </div>
                             <div className="flex items-center gap-2">
                               {enrichmentStatus === "COMPLETED" && (
                                 <span className="text-green-600 text-sm">
                                   <CheckCircleOutlined /> Enriched
                                 </span>
                               )}
                               {enrichmentStatus === "FAILED" && (
                                 <span className="text-red-600 text-sm">
                                   <CloseCircleOutlined /> Failed
                                 </span>
                               )}
                               <Button
                                 type="primary"
                                 icon={<SyncOutlined spin={autoFetchLoading || enrichmentStatus === "PENDING"} />}
                                 onClick={handleAutoFetch}
                                 loading={autoFetchLoading || enrichmentStatus === "PENDING"}
                                 disabled={enrichmentStatus === "PENDING"}
                                 className="bg-blue-600 hover:bg-blue-700"
                               >
                                 {autoFetchLoading || enrichmentStatus === "PENDING" ? "Processing..." : "Auto-Fetch"}
                               </Button>
                             </div>
                           </div>
                         </div>
                       </Col>
                      <Col span={8}>
                        <Form.Item label="HQ City" name="hq_city">
                          <Input placeholder="Auto-fetch from website/LinkedIn" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="HQ Country" name="hq_country">
                          <Input placeholder="Auto-fetch from website/LinkedIn" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="HQ Zip Code" name="hq_zip_code">
                          <Input placeholder="Auto-fetch from website/LinkedIn" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item label="About Company" name="about_company">
                          <TextArea rows={3} placeholder="Auto-fetch from website/LinkedIn" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="Company Revenue (mUSD)" name="company_revenue">
                          <Input placeholder="Auto-fetch from website/LinkedIn" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="Company Headcount" name="company_headcount">
                          <Input placeholder="Auto-fetch from website/LinkedIn" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="Company Year of Inception" name="company_year_inception">
                          <Input placeholder="Auto-fetch from website/LinkedIn" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Company Lines of Business" name="company_lines_business">
                          <TextArea rows={2} placeholder="Auto-fetch from website/LinkedIn" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Company Brands" name="company_brands">
                          <TextArea rows={2} placeholder="Auto-fetch from website/LinkedIn" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Products and Services" name="products_services">
                          <TextArea rows={2} placeholder="Auto-fetch from website/LinkedIn" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Company Locations" name="company_locations">
                          <TextArea rows={2} placeholder="Auto-fetch from website/LinkedIn" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item label="Company Existing Compliances" name="company_existing_compliances">
                          <TextArea rows={2} placeholder="Auto-fetch from website/LinkedIn" />
                        </Form.Item>
                      </Col>
                    </Row>
                  ),
                },
                {
                  key: '3',
                  label: (
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-gray-800">Industry Information</span>
                      <span className="ml-2 text-sm text-gray-500">(GICS DB - AI Autosuggest)</span>
                    </div>
                  ),
                  children: (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Company Industry" name="company_industry">
                          <AutoComplete
                            placeholder="Select or type industry (GICS DB)"
                            options={gicsData.sectors.map(sector => ({ value: sector, label: sector }))}
                            filterOption={(inputValue, option) =>
                              option?.label?.toLowerCase().includes(inputValue.toLowerCase())
                            }
                            showSearch
                            allowClear
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Company Subsector" name="company_subsector">
                          <AutoComplete
                            placeholder="Select or type subsector (GICS DB)"
                            options={gicsData.subsectors.map(subsector => ({ value: subsector, label: subsector }))}
                            filterOption={(inputValue, option) =>
                              option?.label?.toLowerCase().includes(inputValue.toLowerCase())
                            }
                            showSearch
                            allowClear
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  ),
                },
                {
                  key: '4',
                  label: (
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-gray-800">Project Requirements</span>
                      <span className="ml-2 text-sm text-gray-500">(Service requirements and decisions)</span>
                    </div>
                  ),
                  children: (
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          label="Requirement for Service"
                          name="requirement_for_service"
                          rules={[{ required: true, message: 'Please select the service requirement' }]}
                        >
                          <Select mode="multiple" placeholder="Select service requirements">
                            {serviceRequirementOptions.map(option => (
                              <Option key={option} value={option}>{option}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          label="Description of Enquiry"
                          name="description_of_enquiry"
                          rules={[{ required: true, message: 'Please provide enquiry description' }]}
                        >
                          <TextArea rows={3} placeholder="To be filled in by consultant" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item label="Compliances in Scope" name="compliances_in_scope">
                          <Select mode="multiple" placeholder="Select compliances">
                            {complianceOptions.map(option => (
                              <Option key={option} value={option}>{option}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Expected Completion Timeline" name="expected_completion_timeline">
                          <Select placeholder="To be filled in by consultant">
                            {timelineOptions.map(option => (
                              <Option key={option} value={option}>{option}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                                             <Col span={12}>
                         <Form.Item label="Go / No-go Decision" name="go_no_go">
                           <Radio.Group>
                             <Radio value="go">Go</Radio>
                             <Radio value="no_go">No-go</Radio>
                             <Radio value="pending">Pending</Radio>
                           </Radio.Group>
                         </Form.Item>
                       </Col>
                    </Row>
                  ),
                },
              ]}
            />
            
            <div className="flex justify-end space-x-4">
              <Button
                type="default" 
                onClick={handleResetForm} 
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
                {serviceRequirementsData ? "Update Requirements" : "Save Requirements"}
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

      {/* Assign Task Modal */}
      <Modal
        title="Assign Task"
        open={isAssignTaskVisible}
        onOk={handleAssignTask}
        onCancel={() => setIsAssignTaskVisible(false)}
        width={600}
      >
        <Form layout="vertical">
          <Form.Item label="Team Members" required>
            <Select
              mode="multiple"
              placeholder="Select team members"
              value={selectedTeamMembers}
              onChange={setSelectedTeamMembers}
            >
              {members.map((member) => (
                <Option key={member.id} value={member.id}>
                  {member.username}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Task Description" required>
            <TextArea
              rows={3}
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Describe the task to be completed"
            />
          </Form.Item>
          <Form.Item label="Deadline" required>
            <DatePicker
              showTime
              value={taskDeadline}
              onChange={setTaskDeadline}
              placeholder="Select deadline"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item label="References">
            <TextArea
              rows={2}
              value={taskReferences}
              onChange={(e) => setTaskReferences(e.target.value)}
              placeholder="Additional references or notes"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Accept Modal */}
      <Modal
        title="Accept Step"
        open={isAcceptModalVisible}
        onOk={() => handleReviewAction("accept")}
        onCancel={() => {
          setIsAcceptModalVisible(false);
          setAcceptComment("");
        }}
        width={500}
      >
        <Form layout="vertical">
          <Form.Item label="Acceptance Comment">
            <TextArea
              rows={3}
              value={acceptComment}
              onChange={(e) => setAcceptComment(e.target.value)}
              placeholder="Optional comment for acceptance"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Reject Step"
        open={isRejectModalVisible}
        onOk={() => handleReviewAction("reject")}
        onCancel={() => {
          setIsRejectModalVisible(false);
          setRejectComment("");
        }}
        width={500}
      >
        <Form layout="vertical">
          <Form.Item label="Rejection Comment" required>
            <TextArea
              rows={3}
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Please provide a reason for rejection"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Needs More Info Modal */}
      <Modal
        title="Request More Information"
        open={isNeedsMoreInfoModalVisible}
        onOk={() => handleReviewAction("needs_info")}
        onCancel={() => {
          setIsNeedsMoreInfoModalVisible(false);
          setMoreInfoComment("");
          setMoreInfoFileList([]);
        }}
        width={600}
      >
        <Form layout="vertical">
          <Form.Item label="Information Request" required>
            <TextArea
              rows={3}
              value={moreInfoComment}
              onChange={(e) => setMoreInfoComment(e.target.value)}
              placeholder="Please specify what additional information is needed"
            />
          </Form.Item>
          <Form.Item label="Supporting Files">
            <Upload
              fileList={moreInfoFileList}
              onChange={({ fileList }) => setMoreInfoFileList(fileList)}
              beforeUpload={() => false}
              multiple
            >
              <Button icon={<PaperClipOutlined />}>Upload Files</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ServiceRequirements;