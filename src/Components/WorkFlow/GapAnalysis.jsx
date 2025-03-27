import React, { useState, useContext, useEffect } from "react";
import { Collapse, Button, Input, Upload, DatePicker, Modal, Select, message } from "antd";
import { PaperClipOutlined, FileTextOutlined } from "@ant-design/icons";
import { ProjectContext } from "../../Context/ProjectContext";
import { useParams } from "react-router-dom";
import { LoadingContext } from "./VertStepper";
import { BASE_URL } from "../../utils/api";
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

  // Use the loading context
  const { isLoading, setIsLoading } = useContext(LoadingContext);

  const consultants = ["Consultant 1", "Consultant 2", "Consultant 3"];
  const [members, setMembers] = useState([])

  const get_members = async () => {
    try {
      const res = await getMembers(projectid)
      // console.log(res)
      setMembers(res)
    } catch (error) {
      console.error("Error fetching members:", error);
      message.error("Failed to load team members");
    }
  }

  // Get step ID, step data, and check authorization
  const get_step_id = async () => {
    setIsLoading(true);
    try {
      const step_id = await getStepId(projectid, 4);
      if (step_id) {
        setStepId(step_id);
        await get_step_data(step_id);
        const isAuthorized = await checkStepAuth(step_id);
        setIsAssignedUser(isAuthorized);
        if (isAuthorized) {
          await getTaskAssignment(step_id);
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
        const existingFiles = latestData.documents.map(doc => doc.file);
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
      const assignmentData = await getStepAssignment(step_id);
      if (assignmentData.status === 200 && assignmentData.data.length > 0) {
        setTaskAssignment(assignmentData.data[0]); // Access the first element
        // console.log(assignmentData.data[0]);
      } else {
        setTaskAssignment(null);
        // console.log("No assignment data found");
      }
    } catch (error) {
      console.error("Error fetching task assignment:", error);
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
      const existingFiles = latestData.documents.map(doc => doc.file);
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
    return filePath.split('/').pop();
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Add getViewerUrl helper function after the formatDate function
  const getViewerUrl = (filePath) => {
    const extension = filePath.split('.').pop().toLowerCase();

    if (extension === 'pdf') {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(`${BASE_URL}${filePath}`)}&embedded=true`;
    }

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension)) {
      return `${BASE_URL}${filePath}`;
    }

    return `https://docs.google.com/viewer?url=${encodeURIComponent(`${BASE_URL}${filePath}`)}&embedded=true`;
  };

  // New function to handle file removal
  const handleRemoveFile = (fileUrl) => {
    setOldFilesNeeded(prev => prev.filter(file => file !== fileUrl));
    setRemovedOldFiles(prev => [...prev, fileUrl]);
  };

  // New function to handle file restoration
  const handleRestoreFile = (fileUrl) => {
    setRemovedOldFiles(prev => prev.filter(file => file !== fileUrl));
    setOldFilesNeeded(prev => [...prev, fileUrl]);
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
        references: taskReferences
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

  return (
    <div className="bg-gray-50 min-h-full p-6">
      {/* Simple header with no background */}
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Gap Analysis</h2>
        <div className="flex gap-2">
          {projectRole.includes("admin") && !taskAssignment && (
            <Button type="default" onClick={() => { get_members(); setIsAssignTaskVisible(true); }}>
              Assign Task
            </Button>
          )}
          {(projectRole.includes("admin") || isAssignedUser) && (
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

      {gapAnalysisData.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Main content */}
          <div className="p-6">
            {/* Header with metadata */}
            <div className="flex flex-wrap justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Gap Analysis Information</h3>
                {gapAnalysisData[0].saved_at && (
                  <div className="flex items-center mt-1">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500">Last updated {formatDate(gapAnalysisData[0].saved_at)}</span>
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
                    <p className="text-sm font-medium text-gray-800">{gapAnalysisData[0].saved_by.name}</p>
                    <p className="text-xs text-gray-500">{gapAnalysisData[0].saved_by.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Gap Analysis data with documents on the right */}
            <div className="space-y-4 mb-6">
              {gapAnalysisData.map((item) => (
                <div key={item.id} className="border-l-4 border-blue-400 bg-gray-50 rounded-r-lg overflow-hidden">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 uppercase">{item.field_name}</h4>
                  </div>
                  <div className="flex flex-col md:flex-row">
                    <div className="px-4 py-3 flex-grow">
                      <p className="text-gray-700">{item.text_data}</p>
                    </div>

                    {/* Documents for this item */}
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
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-10 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Gap Analysis Data</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              The gap analysis section helps identify areas for improvement. Add your analysis to get started.
            </p>
            <Button
              onClick={handleAddData}
              type="primary"
              size="large"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Analysis
            </Button>
          </div>
        </div>
      )}

      {/* Task Assignment section remains unchanged */}
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

      {/* Add Data Modal */}
      <Modal
        title={gapAnalysisData.length > 0 ? "Update Gap Analysis" : "Add Gap Analysis"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setGapAnalysisText("");
          setFileLists({});
          setOldFilesNeeded([]);
          setRemovedOldFiles([]);
        }}
        footer={[
          <Button key="save" type="primary" onClick={handleSubmit} className="bg-blue-500">
            Save
          </Button>,
        ]}
      >
        <div className="mb-4">
          <TextArea
            rows={6}
            placeholder="Enter details for the gap analysis plan"
            value={gapAnalysisText}
            onChange={(e) => setGapAnalysisText(e.target.value)}
          />
        </div>

        {/* Move existing files component here */}
        {oldFilesNeeded.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Existing Files</h3>
            <div className="space-y-2">
              {oldFilesNeeded.map((fileUrl) => (
                <div key={fileUrl} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <div className="flex items-center">
                    <FileTextOutlined className="text-blue-500 mr-2" />
                    <span className="text-sm text-gray-600">{getFileName(fileUrl)}</span>
                  </div>
                  <Button
                    type="text"
                    danger
                    onClick={() => handleRemoveFile(fileUrl)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Move removed files component here */}
        {removedOldFiles.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Removed Files</h3>
            <div className="space-y-2">
              {removedOldFiles.map((fileUrl) => (
                <div key={fileUrl} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <div className="flex items-center">
                    <FileTextOutlined className="text-red-500 mr-2" />
                    <span className="text-sm text-gray-600">{getFileName(fileUrl)}</span>
                  </div>
                  <Button
                    type="text"
                    onClick={() => handleRestoreFile(fileUrl)}
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add new files component */}
        <div className="mt-3">
          <Upload
            fileList={fileLists["gapAnalysisPlan"] || []}
            onChange={(info) => handleFileChange("gapAnalysisPlan", info)}
            beforeUpload={() => false}
            showUploadList={true}
            multiple
          >
            <Button icon={<PaperClipOutlined />}>Attach New Files</Button>
          </Upload>
        </div>
      </Modal>

      {/* Assign Task Modal */}
      <Modal
        title="Assign Task"
        open={isAssignTaskVisible}
        onCancel={() => setIsAssignTaskVisible(false)}
        footer={[
          <Button key="assign" type="primary" onClick={handleSubmitAssignment} className="bg-blue-500">
            Assign
          </Button>
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
    </div>
  );
};

export default GapAnalysis;
