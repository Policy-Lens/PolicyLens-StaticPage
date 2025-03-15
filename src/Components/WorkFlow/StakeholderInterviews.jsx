import React, { useState, useContext, useEffect } from "react";
import { Collapse, Button, Input, Upload, DatePicker, Modal, Select, message } from "antd";
import { PaperClipOutlined, FileTextOutlined } from "@ant-design/icons";
import { ProjectContext } from "../../Context/ProjectContext";
import { useParams } from "react-router-dom";

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
  
  // State for API data
  const [interviewData, setInterviewData] = useState([]);
  const [stepId, setStepId] = useState(null);
  const [isAssignedUser, setIsAssignedUser] = useState(false);
  const [taskAssignment, setTaskAssignment] = useState(null);
  const [members, setMembers] = useState([]);
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

  // Get step ID, step data, and check authorization
  const get_step_id = async () => {
    const step_id = await getStepId(projectid, 5);
    if (step_id) {
      setStepId(step_id);
      await get_step_data(step_id);
      const isAuthorized = await checkStepAuth(step_id);
      setIsAssignedUser(isAuthorized);
      if (isAuthorized) {
        await getTaskAssignment(step_id);
      }
    }
  };

  const get_step_data = async (step_id) => {
    const stepData = await getStepData(step_id);
    setInterviewData(stepData || []);
    
    // If there's existing data, set it for editing
    if (stepData && stepData.length > 0) {
      const latestData = stepData[0];
      setInterviewText(latestData.text_data);
      
      // Initialize old files from existing documents
      const existingFiles = latestData.documents.map(doc => doc.file);
      setOldFilesNeeded(existingFiles);
      setRemovedOldFiles([]);
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
        console.log(assignmentData.data[0]);
      } else {
        setTaskAssignment(null);
        console.log("No assignment data found");
      }
    } catch (error) {
      console.error("Error fetching task assignment:", error);
      setTaskAssignment(null);
    }
  };

  const get_members = async () => {
    const res = await getMembers(projectid);
    console.log(res);
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
    setInterviewText("");
    setFileList([]);
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

  // Submit stakeholder interview data
  const handleSubmit = async () => {
    if (!interviewText.trim()) {
      message.warning("Please provide details for the stakeholder interview.");
      return;
    }

    const formData = new FormData();
    formData.append("field_name", "Stakeholder Interview Details");
    formData.append("text_data", interviewText);

    // Append old files array as JSON string
    formData.append("old_files", JSON.stringify(oldFilesNeeded));

    // Append new files
    fileList.forEach((file) => {
      formData.append("files", file.originFileObj || file);
    });

    try {
      const response = await addStepData(stepId, formData);
      if (response.status === 201) {
        message.success("Stakeholder interview details submitted successfully!");
        setIsModalVisible(false);
        setInterviewText("");
        setFileList([]);
        setOldFilesNeeded([]);
        setRemovedOldFiles([]);
        await get_step_data(stepId);
      } else {
        message.error("Failed to submit stakeholder interview details.");
      }
    } catch (error) {
      message.error("Failed to submit stakeholder interview details.");
      console.error(error);
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

    const assignmentData = {
      assigned_to: selectedTeamMembers,
      description: taskDescription,
      deadline: taskDeadline.format("YYYY-MM-DD"),
      references: taskReferences
    };

    try {
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
    }
  };

  return (
    <div className="p-6 rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Stakeholder Interviews</h2>
        <div className="flex gap-2">
          {projectRole.includes("admin") && !taskAssignment && (
            <Button type="default" onClick={() => {get_members(); handleAssignTask();}}>
              Assign Task
            </Button>
          )}
          {(projectRole.includes("admin") || isAssignedUser) && (
            <Button type="primary" onClick={handleAddData} className="bg-blue-500">
              {interviewData.length > 0 ? "Update Data" : "Add Data"}
            </Button>
          )}
        </div>
      </div>

      {/* Display Interview Data */}
      {interviewData.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800">Interview Details</h3>
          <div className="grid grid-cols-1 gap-4 mt-4">
            {interviewData.map(item => (
              <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-700">{item.field_name}</h4>
                    <p className="text-xs text-gray-500">{formatDate(item.saved_at)}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{item.text_data}</p>
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
        title={interviewData.length > 0 ? "Update Interview" : "Add Interview"}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="save" type="primary" onClick={handleSubmit} className="bg-blue-500">
            Save
          </Button>,
        ]}
      >
        <div className="mb-4">
          <TextArea 
            rows={6} 
            placeholder="Enter details from stakeholder interviews" 
            value={interviewText}
            onChange={(e) => setInterviewText(e.target.value)}
          />
        </div>

        {/* Existing Files */}
        {oldFilesNeeded.length > 0 && (
          <div className="mt-4 mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Existing Files</h4>
            <div className="space-y-2">
              {oldFilesNeeded.map((fileUrl) => (
                <div key={fileUrl} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <div className="flex items-center">
                    <FileTextOutlined className="text-blue-500 mr-2" />
                    <span className="text-sm text-gray-600">{getFileName(fileUrl)}</span>
                  </div>
                  <div className="flex items-center">
                    <a 
                      href={`http://localhost:8000${fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      View File
                    </a>
                    <Button 
                      type="text" 
                      danger 
                      onClick={() => handleRemoveFile(fileUrl)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Removed Files */}
        {removedOldFiles.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Removed Files</h4>
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

        {/* Add New Files */}
        <div className="mt-3">
          <Upload
            fileList={fileList}
            onChange={handleUploadChange}
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
        onCancel={handleAssignTaskClose}
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

export default StakeholderInterviews;
