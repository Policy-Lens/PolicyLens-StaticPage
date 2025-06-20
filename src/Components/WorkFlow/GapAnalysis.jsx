import React, { useState, useContext, useEffect } from "react";
import {
  Collapse,
  Button,
  Input,
  Upload,
  DatePicker,
  Modal,
  Select,
  message,
  Dropdown,
} from "antd";
import { PaperClipOutlined, FileTextOutlined } from "@ant-design/icons";
import { ProjectContext } from "../../Context/ProjectContext";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingContext } from "./VertStepper";
import { BASE_URL, apiRequest } from "../../utils/api";
import StakeholderInterviews from "./StakeholderInterviews";
import InteractiveIsoClause from "../Common/InteractiveIsoClause";
const { Panel } = Collapse;
const { TextArea } = Input;
const { Option } = Select;

const GapAnalysis = () => {
  const [fileLists, setFileLists] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAssignTaskVisible, setIsAssignTaskVisible] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDeadline, setTaskDeadline] = useState(null);
  const [taskReferences, setTaskReferences] = useState("");
  const [gapAnalysisText, setGapAnalysisText] = useState("");

  // State for API data
  const [gapAnalysisData, setGapAnalysisData] = useState([]);
  const [stepId, setStepId] = useState(null);
  const [isAssignedUser, setIsAssignedUser] = useState(false);
  const [taskAssignment, setTaskAssignment] = useState(null);

  // New state for handling old files
  const [oldFilesNeeded, setOldFilesNeeded] = useState([]);
  const [removedOldFiles, setRemovedOldFiles] = useState([]);

  // Add state for stakeholder data inclusion
  const [includeStakeholderData, setIncludeStakeholderData] = useState(false);
  const [showInsightsPanel, setShowInsightsPanel] = useState(false);
  const [stakeholderData, setStakeholderData] = useState(null);
  const [fetchingStakeholderData, setFetchingStakeholderData] = useState(false);
  const [associatedIsoClause, setAssociatedIsoClause] = useState(null);
  const [process, setProcess] = useState("core");

  // Needs More Info Modal states
  const [isNeedsMoreInfoModalVisible, setIsNeedsMoreInfoModalVisible] = useState(false);
  const [moreInfoComment, setMoreInfoComment] = useState("");
  const [moreInfoFileList, setMoreInfoFileList] = useState([]);

  const { projectid } = useParams();
  const navigate = useNavigate();
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

  // Use the loading context
  const { isLoading, setIsLoading } = useContext(LoadingContext);

  const consultants = ["Consultant 1", "Consultant 2", "Consultant 3"];
  const [members, setMembers] = useState([]);

  const get_members = async () => {
    try {
      const res = await getMembers(projectid);
      // console.log(res)
      setMembers(res);
    } catch (error) {
      console.error("Error fetching members:", error);
      message.error("Failed to load team members");
    }
  };

  const [stepStatus, setStepStatus] = useState("pending");

  const get_step_id = async () => {
    setIsLoading(true);
    try {
      const response = await getStepId(projectid, 4);
      if (response) {
        // Debug: Log the entire response to see what we're getting
        console.log("API Response (Gap Analysis):", response);
        console.log("Associated ISO Clause (Gap Analysis):", response.associated_iso_clause);

        setStepId(response.plc_step_id);
        setStepStatus(response.status);
        setAssociatedIsoClause(response.associated_iso_clause);
        setProcess(response.process || "core");
        await get_step_data(response.plc_step_id);
        const isAuthorized = await checkStepAuth(response.plc_step_id);
        setIsAssignedUser(isAuthorized);
        if (isAuthorized) {
          await getTaskAssignment(response.plc_step_id);
        }
        await get_members();
      }
    } catch (error) {
      console.error("Error fetching step ID:", error);
      message.error("Failed to load gap analysis data");
    } finally {
      setIsLoading(false);
    }
  };

  const get_step_data = async (step_id) => {
    try {
      const stepData = await getStepData(step_id);
      setGapAnalysisData(stepData || []);

      // If there's existing data, set it for editing
      if (stepData && stepData.length > 0) {
        const latestData = stepData[0];
        setGapAnalysisText(latestData.text_data);

        // Initialize old files from existing documents
        const existingFiles = latestData.documents.map((doc) => doc.file);
        setOldFilesNeeded(existingFiles);
        setRemovedOldFiles([]); // Reset removed files when data is refreshed
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
      console.log(
        "GapAnalysis: Fetching task assignment for step ID:",
        step_id
      );
      const assignmentData = await getStepAssignment(step_id);
      console.log(
        "GapAnalysis: Task assignment data received:",
        assignmentData
      );
      if (assignmentData.status === 200 && assignmentData.data.length > 0) {
        console.log(
          "GapAnalysis: Setting task assignment:",
          assignmentData.data[0]
        );
        setTaskAssignment(assignmentData.data[0]); // Access the first element
        // console.log(assignmentData.data[0]);
      } else {
        console.log("GapAnalysis: No task assignment found");
        setTaskAssignment(null);
        // console.log("No assignment data found");
      }
    } catch (error) {
      console.error("GapAnalysis: Error fetching task assignment:", error);
      setTaskAssignment(null);
    }
  };

  useEffect(() => {
    get_step_id();
  }, []);

  const handleFileChange = (panelKey, { fileList }) => {
    setFileLists((prev) => ({ ...prev, [panelKey]: fileList }));
  };

  const handleAddData = () => {
    // If we're updating, refresh the data before opening modal
    if (gapAnalysisData.length > 0) {
      const latestData = gapAnalysisData[0];
      setGapAnalysisText(latestData.text_data);
      const existingFiles = latestData.documents.map((doc) => doc.file);
      setOldFilesNeeded(existingFiles);
      setRemovedOldFiles([]); // Reset removed files when opening modal
    }
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    // Reset all form states
    setGapAnalysisText("");
    setFileLists({});
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

  // New function to handle file removal
  const handleRemoveFile = (fileUrl) => {
    setOldFilesNeeded((prev) => prev.filter((file) => file !== fileUrl));
    setRemovedOldFiles((prev) => [...prev, fileUrl]);
  };

  // New function to handle file restoration
  const handleRestoreFile = (fileUrl) => {
    setRemovedOldFiles((prev) => prev.filter((file) => file !== fileUrl));
    setOldFilesNeeded((prev) => [...prev, fileUrl]);
  };

  // Function to incorporate stakeholder insights into the gap analysis
  const incorporateInsight = (insight) => {
    const newText =
      gapAnalysisText +
      "\n\n--- Stakeholder Insight ---\n" +
      insight +
      "\n-------------------------\n";
    setGapAnalysisText(newText);
  };

  // Helper function to extract key insights from stakeholder interviews
  const extractKeyInsights = (text) => {
    if (!text) return [];

    // First try to split by standard separators
    let insights = [];

    // Check for bullet points
    if (text.includes("•") || text.includes("*") || text.includes("-")) {
      const pattern = /[•*-]\s+(.*?)(?=\n[•*-]|\n\n|$)/gs;
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        insights = matches.map((match) => match.trim());
      }
    }
    // Check for numbered lists
    else if (/\d+\.\s/.test(text)) {
      const pattern = /\d+\.\s+(.*?)(?=\n\d+\.|\n\n|$)/gs;
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        insights = matches.map((match) => match.trim());
      }
    }

    // If no structured insights found, split by paragraphs
    if (insights.length === 0) {
      insights = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    }

    // Limit to reasonable snippets (not too long, not too short)
    return insights
      .filter((insight) => insight.length > 15 && insight.length < 300)
      .slice(0, 5); // Limit to 5 insights
  };

  // Submit gap analysis data
  const handleSubmit = async () => {
    if (!gapAnalysisText.trim()) {
      message.warning("Please provide details for the gap analysis plan.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("field_name", "Gap Analysis");
      formData.append("text_data", gapAnalysisText);

      // Append old files array as JSON string
      formData.append("old_files", JSON.stringify(oldFilesNeeded));

      // If stakeholder reference is included, add reference ID
      if (includeStakeholderData && stakeholderData && stakeholderData.id) {
        formData.append(
          "references",
          JSON.stringify([
            {
              step_type: "stakeholder_interviews",
              step_id: 5,
              data_id: stakeholderData.id,
            },
          ])
        );
      } else if (includeStakeholderData) {
        // If they wanted to include the reference but we don't have valid data
        message.warning(
          "Could not include stakeholder data reference - invalid or missing data"
        );
      }

      // Append new files
      if (fileLists["gapAnalysisPlan"]) {
        fileLists["gapAnalysisPlan"].forEach((file) => {
          formData.append("files", file.originFileObj || file);
        });
      }

      const response = await addStepData(stepId, formData);
      if (response.status === 201) {
        message.success("Gap analysis plan submitted successfully!");
        setIsModalVisible(false);
        // Reset all form states
        setGapAnalysisText("");
        setFileLists({});
        setOldFilesNeeded([]);
        setRemovedOldFiles([]);
        await get_step_data(stepId);
      } else {
        message.error("Failed to submit gap analysis plan.");
      }
    } catch (error) {
      message.error("Failed to submit gap analysis plan.");
      console.error(error);
    } finally {
      setIsLoading(false);
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

    setIsLoading(true);
    try {
      // console.log(selectedTeamMembers);
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
        // Reset task assignment form
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
    } finally {
      setIsLoading(false);
    }
  };

  // Needs More Info Modal handlers
  const handleNeedsMoreInfoSubmit = async () => {
    if (!moreInfoComment.trim()) {
      message.warning("Please provide a comment.");
      return;
    }

    try {
      // Here you would typically send the comment and files to your API
      // For now, we'll just show a success message
      message.success("More information request submitted successfully!");
      setIsNeedsMoreInfoModalVisible(false);
      setMoreInfoComment("");
      setMoreInfoFileList([]);
    } catch (error) {
      message.error("Failed to submit more information request.");
      console.error(error);
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

  // Function to get stakeholder data for reference
  const getStakeholderData = async () => {
    if (stakeholderData) return; // Don't fetch if we already have it

    setFetchingStakeholderData(true);
    try {
      // Get the step ID for stakeholder interviews (step 5)
      const interviewStepId = await getStepId(projectid, 5);

      if (interviewStepId) {
        // Get latest data for that step
        const interviewData = await getStepData(interviewStepId);
        if (interviewData && interviewData.length > 0) {
          setStakeholderData(interviewData[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching stakeholder data for reference:", error);
    } finally {
      setFetchingStakeholderData(false);
    }
  };

  // Function to toggle insights panel, fetch data if needed
  const toggleInsightsPanel = () => {
    if (!stakeholderData && !showInsightsPanel) {
      getStakeholderData();
    }
    setShowInsightsPanel(!showInsightsPanel);
  };

  const handleRedirectToQuestionnaire = () => {
    navigate(`/project/${projectid}/questionbank`);
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

  const updateProcess = async (newProcess) => {
    try {
      const response = await apiRequest(
        "PATCH",
        `/api/plc/plc_step/${stepId}/update/`,
        {
          core_or_noncore: newProcess,
        },
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

  return (
    <div className="min-h-full p-6">
      <Button
        type="primary"
        size="large"
        className="mb-4 bg-blue-600 hover:bg-blue-700"
        onClick={handleRedirectToQuestionnaire}
      >
        Go to Questionnaire
      </Button>

      {/* Simple header with no background */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Gap Analysis</h2>
          <div className="flex space-x-3">
            {/* Send for Review button - only for consultant admin */}
            {projectRole.includes("consultant admin") && (
              <Button
                type="default"
                onClick={() => {
                  // Static implementation - just show a success message
                  message.success("Step sent for review successfully!");
                }}
                className="bg-green-600 hover:bg-green-700 text-white border-green-600"
              >
                Send for Review
              </Button>
            )}

            {/* Review buttons - only for Company */}
            {projectRole === "company" && (
              <>
                <Button
                  type="default"
                  onClick={() => {
                    message.success("Step accepted successfully!");
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                >
                  Accept
                </Button>
                <Button
                  type="default"
                  onClick={() => {
                    message.success("Step rejected successfully!");
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                >
                  Reject
                </Button>
                <Button
                  type="default"
                  onClick={() => {
                    setIsNeedsMoreInfoModalVisible(true);
                  }}
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
            {/* ISO Clause badge */}
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
                onClick={() => {
                  get_members();
                  handleAssignTask();
                }}
                className="bg-white hover:bg-gray-50 border border-gray-300 shadow-sm"
              >
                Assign Task
              </Button>
            )}

            {/* Process Update Dropdown for Admin */}
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
                onClick={handleAddData}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {gapAnalysisData.length > 0 ? "Update Analysis" : "Add Analysis"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {gapAnalysisData.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Main content */}
          <div className="p-6">
            {/* Header with metadata */}
            <div className="flex flex-wrap justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Gap Analysis Information
                </h3>
                {gapAnalysisData[0].saved_at && (
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
                      Last updated {formatDate(gapAnalysisData[0].saved_at)}
                    </span>
                  </div>
                )}
              </div>

              {/* User info with avatar */}
              {gapAnalysisData[0].saved_by && (
                <div className="flex items-center bg-gray-50 px-3 py-1 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                      {gapAnalysisData[0].saved_by.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-800">
                      {gapAnalysisData[0].saved_by.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {gapAnalysisData[0].saved_by.email}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Gap Analysis data with documents on the right */}
            <div className="space-y-4 mb-6">
              {gapAnalysisData.map((item) => (
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
              No Gap Analysis Data
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              The gap analysis section helps identify areas for improvement. Add
              your analysis to get started.
            </p>
            <Button
              onClick={handleAddData}
              type="primary"
              size="large"
              className="bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200 font-medium h-10 px-6"
            >
              <span className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Add Analysis</span>
              </span>
            </Button>
          </div>
        </div>
      )}

      {/* Stakeholder Interview Data Section */}
      <div className="mt-8">
        <StakeholderInterviews />
      </div>

      {/* Task Assignment section remains unchanged */}
      {taskAssignment && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Task Assignment
          </h3>
          <div className="p-4 border border-gray-200 rounded-lg">
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
          gapAnalysisData.length > 0
            ? "Update Gap Analysis Plan"
            : "Add Gap Analysis Plan"
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="cancel" onClick={handleModalClose}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmit}
            loading={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Submit
          </Button>,
        ]}
        width={800}
      >
        <div className="p-4 mb-4">
          {/* Template Download Section */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
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
                    submitting your gap analysis plan.
                  </p>
                </div>
                <div className="mt-3">
                  <a
                    href="/temp.txt"
                    download="gap_analysis_template.txt"
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
                    Download Gap Analysis Template
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Gap analysis text field */}
            <div>
              <label
                htmlFor="gapAnalysisDescription"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Gap Analysis Plan Description
              </label>
              <div className="flex">
                <div className="flex-grow">
                  <TextArea
                    id="gapAnalysisDescription"
                    value={gapAnalysisText}
                    onChange={(e) => setGapAnalysisText(e.target.value)}
                    placeholder="Enter your gap analysis plan"
                    rows={10}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeStakeholder"
                  checked={includeStakeholderData}
                  onChange={(e) => {
                    setIncludeStakeholderData(e.target.checked);
                    if (e.target.checked && !stakeholderData) {
                      getStakeholderData();
                    }
                  }}
                  className="mr-2"
                />
                <label htmlFor="includeStakeholder" className="cursor-pointer">
                  Include reference to stakeholder interview data
                </label>
              </div>

              <Button
                type="link"
                onClick={toggleInsightsPanel}
                className="text-blue-600 hover:text-blue-700"
              >
                {showInsightsPanel ? "Hide Insights" : "View Key Insights"}
              </Button>
            </div>

            {/* Show loading indicator when fetching data */}
            {fetchingStakeholderData && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
                <span className="text-sm text-gray-600">
                  Loading stakeholder data...
                </span>
              </div>
            )}

            {/* Show insights panel when requested */}
            {showInsightsPanel && stakeholderData?.text_data ? (
              <div className="mt-3 border rounded-md p-3 bg-blue-50">
                <h4 className="font-medium mb-2">Key Stakeholder Insights</h4>
                <div className="max-h-60 overflow-y-auto">
                  {extractKeyInsights(stakeholderData.text_data).map(
                    (insight, idx) => (
                      <div
                        key={idx}
                        className="mb-2 p-2 bg-white rounded shadow-sm"
                      >
                        <p className="text-sm mb-1">{insight}</p>
                        <Button
                          size="small"
                          type="primary"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => incorporateInsight(insight)}
                        >
                          Add to Analysis
                        </Button>
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : (
              showInsightsPanel && (
                <div className="mt-3 border rounded-md p-3 bg-gray-50">
                  <p className="text-sm text-gray-500 italic">
                    No stakeholder insights available. Complete the stakeholder
                    interviews first.
                  </p>
                </div>
              )
            )}

            {/* Show reference preview when including data */}
            {includeStakeholderData && stakeholderData && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <h4 className="text-sm font-medium mb-1">
                  Stakeholder Data Reference
                </h4>
                <p className="text-xs text-gray-600">
                  Latest interview data from{" "}
                  {formatDate(
                    stakeholderData.created_at || stakeholderData.saved_at
                  )}{" "}
                  will be linked
                </p>
                <div className="mt-2 text-xs bg-blue-50 p-2 rounded">
                  <strong>Preview:</strong>{" "}
                  {stakeholderData.text_data
                    ? stakeholderData.text_data.substring(0, 100) + "..."
                    : "No text content available"}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">
            Attachments
          </label>
          <Upload
            multiple
            fileList={fileLists["gapAnalysisPlan"] || []}
            onChange={(info) => handleFileChange("gapAnalysisPlan", info)}
            beforeUpload={() => false}
          >
            <Button icon={<PaperClipOutlined />}>Select Files</Button>
          </Upload>
        </div>

        {oldFilesNeeded.length > 0 && (
          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700">
              Existing Attachments
            </label>
            <div className="flex flex-wrap gap-2">
              {oldFilesNeeded.map((fileUrl, index) => (
                <div
                  key={index}
                  className="border rounded p-2 flex items-center bg-gray-50 group"
                >
                  <FileTextOutlined className="mr-2 text-blue-500" />
                  <span className="text-sm">{getFileName(fileUrl)}</span>
                  <Button
                    type="text"
                    size="small"
                    danger
                    className="ml-2 opacity-0 group-hover:opacity-100"
                    onClick={() => handleRemoveFile(fileUrl)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {removedOldFiles.length > 0 && (
          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700">
              Removed Attachments
            </label>
            <div className="flex flex-wrap gap-2">
              {removedOldFiles.map((fileUrl, index) => (
                <div
                  key={index}
                  className="border rounded p-2 flex items-center bg-gray-100 text-gray-500 group"
                >
                  <FileTextOutlined className="mr-2" />
                  <span className="text-sm line-through">
                    {getFileName(fileUrl)}
                  </span>
                  <Button
                    type="text"
                    size="small"
                    className="ml-2 opacity-0 group-hover:opacity-100"
                    onClick={() => handleRestoreFile(fileUrl)}
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Task Modal */}
      <Modal
        title="Assign Task"
        open={isAssignTaskVisible}
        onCancel={() => setIsAssignTaskVisible(false)}
        footer={[
          <Button
            key="assign"
            type="primary"
            onClick={handleSubmitAssignment}
            className="bg-blue-600 hover:bg-blue-700"
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

      {/* Needs More Info Modal */}
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
    </div>
  );
};

export default GapAnalysis;
