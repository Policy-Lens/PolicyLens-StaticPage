import React, { useState, useContext, useEffect } from "react";
import { Button, Select, Modal, Input, DatePicker, message, Upload } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { ProjectContext } from "../../Context/ProjectContext";
import { apiRequest } from "../../utils/api";
import InteractiveIsoClause from "../Common/InteractiveIsoClause";
import { PaperClipOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

const RART = () => {
  const navigate = useNavigate();
  const { projectid } = useParams();
  const [stepStatus, setStepStatus] = useState("pending");
  const [stepId, setStepId] = useState(null);
  const [isAssignedUser, setIsAssignedUser] = useState(false);
  const [isAssignTaskVisible, setIsAssignTaskVisible] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDeadline, setTaskDeadline] = useState(null);
  const [taskReferences, setTaskReferences] = useState("");
  const [members, setMembers] = useState([]);
  const [associatedIsoClause, setAssociatedIsoClause] = useState(null);
  const [process, setProcess] = useState("core");
  const [isNeedsMoreInfoModalVisible, setIsNeedsMoreInfoModalVisible] = useState(false);
  const [moreInfoComment, setMoreInfoComment] = useState("");
  const [moreInfoFileList, setMoreInfoFileList] = useState([]);

  const {
    getStepId,
    checkStepAuth,
    projectRole,
    assignStep,
    getMembers
  } = useContext(ProjectContext);

  const get_step_id = async () => {
    try {
      const response = await getStepId(projectid, 6);
      if (response) {
        console.log("API Response (RART):", response);
        console.log("Associated ISO Clause (RART):", response.associated_iso_clause);

        setStepId(response.plc_step_id);
        setStepStatus(response.status);
        setAssociatedIsoClause(response.associated_iso_clause);
        setProcess(response.process || "core");
        const isAuthorized = await checkStepAuth(response.plc_step_id);
        setIsAssignedUser(isAuthorized);
      }
    } catch (error) {
      console.error("Error fetching step ID:", error);
      message.error("Failed to load RART data");
    }
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

  const get_members = async () => {
    const res = await getMembers(projectid);
    setMembers(res);
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

        // Reset form fields
        setSelectedTeamMembers([]);
        setTaskDescription("");
        setTaskDeadline(null);
        setTaskReferences("");
      } else {
        message.error("Failed to assign task.");
      }
    } catch (error) {
      message.error("Failed to assign task.");
      console.error(error);
    }
  };

  const handleRedirectToReports = () => {
    navigate(`/project/${projectid}/myreports`);
  };

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

  useEffect(() => {
    get_step_id();
  }, []);

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Risk Assessment and Risk Treatment (RART)
            </h1>
            <div className="flex space-x-3">
              {/* Send for Review button - only for consultant admin */}
              {projectRole?.includes("consultant admin") && (
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
            <div className="flex items-center space-x-3">
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
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                ISO: <InteractiveIsoClause isoClause={associatedIsoClause} />
              </span>
            </div>
            <div className="flex space-x-3">
              {projectRole?.includes("consultant admin") && (
                <Button
                  type="default"
                  onClick={handleAssignTask}
                  className="bg-white hover:bg-gray-50 border border-gray-300 shadow-sm"
                >
                  Assign Task
                </Button>
              )}
              {projectRole?.includes("consultant admin") && (
                <Select
                  value={process}
                  onChange={updateProcess}
                  style={{ width: 120 }}
                >
                  <Option value="core">Core</Option>
                  <Option value="non core">Non Core</Option>
                </Select>
              )}
              {(projectRole?.includes("consultant admin") || isAssignedUser) && (
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
              <Button
                type="primary"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleRedirectToReports}
              >
                Go to My Reports
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Treatment Overview
          </h2>
          <p className="text-gray-600 mb-6">
            Access and manage your risk assessments and treatments through the
            My Reports section. Here you can view, generate, and analyze reports
            based on the project data.
          </p>
        </div>
      </div>

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

export default RART;
