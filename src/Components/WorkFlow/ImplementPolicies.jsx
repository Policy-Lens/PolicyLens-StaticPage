import React, { useState, useContext, useEffect } from "react";
import { Button, Modal, Input, Upload, message, DatePicker, Select } from "antd";
import { PaperClipOutlined, FileTextOutlined } from "@ant-design/icons";
import { ProjectContext } from "../../Context/ProjectContext";
import { useParams } from "react-router-dom";

const { TextArea } = Input;
const { Option } = Select;

function ImplementPolicies() {
  // State variables for file management
  const [fileList, setFileList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAssignTaskVisible, setIsAssignTaskVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [oldFilesNeeded, setOldFilesNeeded] = useState([]);
  const [removedOldFiles, setRemovedOldFiles] = useState([]);

  // State variables for task assignment
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDeadline, setTaskDeadline] = useState(null);
  const [taskReferences, setTaskReferences] = useState("");

  // User and project context state variables
  const [isAssignedUser, setIsAssignedUser] = useState(false);
  const { projectid } = useParams();
  const { 
    addStepData, 
    getStepData, 
    getStepId, 
    projectRole, 
    checkStepAuth,
    getMembers,
    assignStep,
    getStepAssignment
  } = useContext(ProjectContext);
  const [implementPoliciesData, setImplementPoliciesData] = useState([]);
  const [stepId, setStepId] = useState(null);
  const [members, setMembers] = useState([]);
  const [taskAssignment, setTaskAssignment] = useState(null);

  // File upload handlers
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

  // Check if user is assigned to this step
  const checkAssignedUser = async (step_id) => {
    if (!step_id) return;
    const isAuthorized = await checkStepAuth(step_id);
    setIsAssignedUser(isAuthorized);
  };

  const get_members = async () => {
    const res = await getMembers(projectid);
    console.log(res);
    setMembers(res);
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

  // Get the step data
  const get_step_data = async (step_id) => {
    const stepData = await getStepData(step_id);
    setImplementPoliciesData(stepData || []);
  };

  // Modal handlers
  const handleAddData = () => {
    // Reset the form data when opening modal
    if (implementPoliciesData && implementPoliciesData.length > 0) {
      const latestData = implementPoliciesData[0];
      setFeedbackText(latestData.text_data);
      const existingFiles = latestData.documents.map(doc => doc.file);
      setOldFilesNeeded(existingFiles);
      setRemovedOldFiles([]);
    } else {
      setFeedbackText("");
      setOldFilesNeeded([]);
      setRemovedOldFiles([]);
    }
    setFileList([]);
    setIsModalVisible(true);
  };

  // Submit feedback data
  const handleSubmit = async () => {
    if (!feedbackText.trim()) {
      message.warning("Please provide feedback text.");
      return;
    }

    const formData = new FormData();
    formData.append("field_name", "Feedback");
    formData.append("text_data", feedbackText);

    // Append old files array as JSON string
    formData.append("old_files", JSON.stringify(oldFilesNeeded));

    // Append new files
    fileList.forEach((file) => {
      formData.append("files", file.originFileObj || file);
    });

    try {
      const response = await addStepData(stepId, formData);
      if (response.status === 201) {
        message.success("Feedback submitted successfully!");
        setIsModalVisible(false);
        // Reset form data
        setFeedbackText("");
        setFileList([]);
        setOldFilesNeeded([]);
        setRemovedOldFiles([]);
        // Fetch updated data
        await get_step_data(stepId);
      } else {
        message.error("Failed to submit feedback.");
      }
    } catch (error) {
      message.error("Failed to submit feedback.");
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
    console.log(selectedTeamMembers);
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

  // Helper function to extract filename from path
  const getFileName = (filePath) => {
    return filePath.split('/').pop();
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get step ID for this component (step 10)
  const get_step_id = async () => {
    const step_id = await getStepId(projectid, 10);
    if (step_id) {
      setStepId(step_id);
      await get_step_data(step_id);
      await checkAssignedUser(step_id);
      await getTaskAssignment(step_id);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    get_step_id();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Implement Policies</h2>
        <div className="flex gap-2">
          {projectRole.includes("admin") && !taskAssignment && (
            <Button type="default" onClick={() => {get_members(); setIsAssignTaskVisible(true);}}>
              Assign Task
            </Button>
          )}
          {(projectRole.includes("admin") || isAssignedUser) && (
            <Button type="primary" onClick={handleAddData} className="bg-blue-500">
              {implementPoliciesData.length > 0 ? "Update Data" : "Add Data"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content - Takes up 2/3 of the space */}
        <div className="col-span-2">
          {implementPoliciesData.length > 0 && (
            <>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Feedback Details</h3>
              
              <div className="border border-gray-200 rounded-lg shadow-sm p-6">
                {implementPoliciesData.map((item, index) => (
                  <div key={item.id} className={index !== 0 ? "mt-8 pt-8 border-t border-gray-200" : ""}>
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-lg font-semibold">{item.field_name}</h4>
                      <p className="text-sm text-gray-500">{formatDate(item.saved_at)}</p>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{item.text_data}</p>

                    {item.documents && item.documents.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-base font-medium mb-2">Documents</h5>
                        <div className="space-y-1">
                          {item.documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <FileTextOutlined className="text-blue-500 mr-2" />
                                <span className="text-gray-600">{getFileName(doc.file)}</span>
                              </div>
                              <a 
                                href={`http://localhost:8000${doc.file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700"
                              >
                                View File
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-sm text-gray-500">
                      <p>Saved by: {item.saved_by.name} - {item.saved_by.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {implementPoliciesData.length === 0 && (
            <div className="text-center text-gray-500 my-10">
              <p>No feedback data available.</p>
              <p>Click "Add Data" to get started.</p>
            </div>
          )}
        </div>

        {/* Task Assignment Section - Takes up 1/3 of the space */}
        <div className="col-span-1">
          {taskAssignment && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Assignment</h3>
              <div className="border border-gray-200 rounded-lg shadow-sm p-4">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-700">Assignment Details</h4>
                    <p className="text-xs text-gray-500">{formatDate(taskAssignment.assigned_at)}</p>
                  </div>
                  
                  <div className="space-y-4">
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
                      <p className="text-sm text-gray-600 mt-1">{formatDate(taskAssignment.deadline)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">Description:</p>
                      <p className="text-sm text-gray-600 mt-1">{taskAssignment.description}</p>
                    </div>
                    
                    {taskAssignment.references && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">References:</p>
                        <p className="text-sm text-gray-600 mt-1">{taskAssignment.references}</p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500"><b>Status:</b> {taskAssignment.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Modal */}
      <Modal
        title={implementPoliciesData.length > 0 ? "Update Feedback" : "Add Feedback"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          // Don't reset the form data here, it will be handled in handleAddData
        }}
        footer={[
          <Button key="save" type="primary" onClick={handleSubmit} className="bg-blue-500">
            Save
          </Button>,
        ]}
        width={600}
      >
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2">Feedback</h4>
          <TextArea
            rows={4}
            placeholder="Enter your feedback"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="w-full"
          />
        </div>
        
        {/* Existing Files */}
        {oldFilesNeeded.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2">Existing Files</h4>
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
            <h4 className="text-sm font-semibold mb-2">Removed Files</h4>
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
        <div>
          <h4 className="text-sm font-semibold mb-2">Upload New Files</h4>
          <Upload
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={() => false}
            multiple
            showUploadList={true}
          >
            <Button
              icon={<PaperClipOutlined />}
              className="bg-gray-100 hover:bg-gray-200"
            >
              Attach Files
            </Button>
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
}

export default ImplementPolicies;