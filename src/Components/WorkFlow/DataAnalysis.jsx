import React, { useState, useContext, useEffect } from "react";
import { Upload, Button, Modal, Select, DatePicker, Input, message } from "antd";
import { UploadOutlined, FileTextOutlined } from "@ant-design/icons";
import { ProjectContext } from "../../Context/ProjectContext";
import { useParams } from "react-router-dom";
import { LoadingContext } from "./VertStepper";

const { Option } = Select;

const DataAnalysis = () => {
  const [fileLists, setFileLists] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAssignTaskVisible, setIsAssignTaskVisible] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDeadline, setTaskDeadline] = useState(null);
  const [taskReferences, setTaskReferences] = useState("");

  // State for API data
  const [asisData, setAsisData] = useState([]);
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

  const [members, setMembers] = useState([]);

  const get_members = async () => {
    try {
      const res = await getMembers(projectid);
      setMembers(res);
    } catch (error) {
      console.error("Error fetching members:", error);
      message.error("Failed to load team members");
    }
  };

  // Get step ID, step data, and check authorization
  const get_step_id = async () => {
    setIsLoading(true);
    try {
      const step_id = await getStepId(projectid, 6);
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
      message.error("Failed to load data analysis information");
    } finally {
      setIsLoading(false);
    }
  };

  const get_step_data = async (step_id) => {
    try {
      const stepData = await getStepData(step_id);
      setAsisData(stepData || []);

      // If there's existing data, set it for editing
      if (stepData && stepData.length > 0) {
        const latestData = stepData[0];

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
        setTaskAssignment(assignmentData.data[0]);
      } else {
        setTaskAssignment(null);
      }
    } catch (error) {
      console.error("Error fetching task assignment:", error);
      setTaskAssignment(null);
    }
  };

  useEffect(() => {
    get_step_id();
  }, []);

  // Add effect to refresh data when modal is opened
  useEffect(() => {
    if (isModalVisible && stepId) {
      get_step_data(stepId);
    }
  }, [isModalVisible]);

  const handleFileChange = ({ fileList }) => {
    setFileLists(fileList);
  };

  const handleAddData = () => {
    // If we're updating, refresh the data before opening modal
    if (asisData.length > 0) {
      const latestData = asisData[0];
      const existingFiles = latestData.documents.map(doc => doc.file);
      setOldFilesNeeded(existingFiles);
      setRemovedOldFiles([]); // Reset removed files when opening modal
    }
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    // Reset all form states
    setFileLists([]);
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

  // Submit ASIS Report data
  const handleSubmit = async () => {
    if (fileLists.length === 0 && oldFilesNeeded.length === 0) {
      message.warning("Please upload at least one document.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("field_name", "Data Analysis");
      formData.append("text_data", "Data Analysis documents");

      // Append old files array as JSON string
      formData.append("old_files", JSON.stringify(oldFilesNeeded));

      // Append new files
      fileLists.forEach((file) => {
        formData.append("files", file.originFileObj || file);
      });

      const response = await addStepData(stepId, formData);
      if (response.status === 201) {
        message.success("Data Analysis documents submitted successfully!");
        setIsModalVisible(false);
        // Reset form state
        setFileLists([]);
        setOldFilesNeeded([]);
        setRemovedOldFiles([]);
        await get_step_data(stepId);
      } else {
        message.error("Failed to submit documents.");
      }
    } catch (error) {
      message.error("Failed to submit documents.");
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
        // Reset form fields
        setSelectedTeamMembers([]);
        setTaskDescription("");
        setTaskDeadline(null);
        setTaskReferences("");
        // Refresh task assignment data
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
    <div className="p-6 rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">ASIS Data Analysis</h2>
        <div className="flex gap-2">
          {projectRole.includes("admin") && !taskAssignment && (
            <Button type="default" onClick={() => { get_members(); setIsAssignTaskVisible(true); }}>
              Assign Task
            </Button>
          )}
          {(projectRole.includes("admin") || isAssignedUser) && (
            <Button type="primary" onClick={() => setIsModalVisible(true)} className="bg-blue-500">
              {asisData.length > 0 ? "Update Data" : "Add Data"}
            </Button>
          )}
        </div>
      </div>

      {/* Display ASIS Report Data */}
      {asisData.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800">ASIS Report Documents</h3>
          <div className="grid grid-cols-1 gap-4 mt-4">
            {asisData.map(item => (
              <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-700">{item.field_name}</h4>
                    <p className="text-xs text-gray-500">{formatDate(item.saved_at)}</p>
                  </div>
                </div>

                {item.documents && item.documents.length > 0 && (
                  <div className="mt-3">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Documents</h3>
                    <ul className="space-y-1">
                      {item.documents.map((doc) => (
                        <li key={doc.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FileTextOutlined className="text-blue-500 mr-2" />
                            <span className="text-sm text-gray-600">{getFileName(doc.file)}</span>
                          </div>
                          <a
                            href={`http://localhost:8000${doc.file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                          >
                            View File
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-xs text-gray-500 mt-2">
                  <p><b>Saved by:</b> {item.saved_by.name} - {item.saved_by.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Display Task Assignment Details if available */}
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
        title={asisData.length > 0 ? "Update ASIS Report" : "Add ASIS Report"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setFileLists([]);
          setOldFilesNeeded([]);
          setRemovedOldFiles([]);
        }}
        footer={[
          <Button key="save" type="primary" onClick={handleSubmit} className="bg-blue-500">
            Save
          </Button>,
        ]}
      >
        {/* Existing Files */}
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

        {/* Removed Files */}
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
            fileList={fileLists}
            onChange={handleFileChange}
            beforeUpload={() => false}
            showUploadList={true}
            multiple
          >
            <Button icon={<UploadOutlined />}>Attach New Files</Button>
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

export default DataAnalysis;
