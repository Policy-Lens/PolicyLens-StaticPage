import React, { useState, useContext, useEffect } from "react";
import {
  Button,
  Modal,
  Input,
  message,
  DatePicker,
  Select,
} from "antd";
import { ProjectContext } from "../../Context/ProjectContext";
import { LoadingContext } from "./VertStepper";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../../utils/api";
import ImplementPolicies from "./ImplementPolicies";
import InteractiveIsoClause from "../Common/InteractiveIsoClause";

const { TextArea } = Input;
const { Option } = Select;

function DiscussImplementation() {
  const [isAssignTaskVisible, setIsAssignTaskVisible] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDeadline, setTaskDeadline] = useState(null);
  const [taskReferences, setTaskReferences] = useState("");
  const [isAssignedUser, setIsAssignedUser] = useState(false);
  const { projectid } = useParams();
  const {
    projectRole,
    checkStepAuth,
    getMembers,
    assignStep,
    getStepAssignment,
    getStepId,
  } = useContext(ProjectContext);
  const { isLoading, setIsLoading } = useContext(LoadingContext);
  const [stepId, setStepId] = useState(null);
  const [members, setMembers] = useState([]);
  const [taskAssignments, setTaskAssignments] = useState([]);
  const [stepStatus, setStepStatus] = useState("pending");
  const [associatedIsoClause, setAssociatedIsoClause] = useState(null);
  const [process, setProcess] = useState("core");

  const checkAssignedUser = async (step_id) => {
    if (!step_id) return;
    const isAuthorized = await checkStepAuth(step_id);
    setIsAssignedUser(isAuthorized);
  };

  const get_members = async () => {
    setIsLoading(true);
    try {
      const res = await getMembers(projectid);
      setMembers(res);
    } catch (error) {
      console.error("Error fetching members:", error);
      message.error("Failed to load team members");
    } finally {
      setIsLoading(false);
    }
  };

  const getTaskAssignments = async (step_id) => {
    try {
      const assignmentData = await getStepAssignment(step_id);
      if (assignmentData.status === 200 && assignmentData.data.length > 0) {
        setTaskAssignments(assignmentData.data);
      } else {
        setTaskAssignments([]);
      }
    } catch (error) {
      console.error("Error fetching task assignments:", error);
      setTaskAssignments([]);
    }
  };

  const get_step_id = async () => {
    setIsLoading(true);
    try {
      const response = await getStepId(projectid, 8);
      if (response) {
        setStepId(response.plc_step_id);
        setStepStatus(response.status);
        setAssociatedIsoClause(response.associated_iso_clause);
        setProcess(response.process || "core");
        await checkAssignedUser(response.plc_step_id);
        await getTaskAssignments(response.plc_step_id);
      }
    } catch (error) {
      console.error("Error fetching step ID:", error);
      message.error("Failed to load Discuss Implementation data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignTask = () => {
    get_members();
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
    setIsLoading(true);
    try {
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
        setSelectedTeamMembers([]);
        setTaskDescription("");
        setTaskDeadline(null);
        setTaskReferences("");
        await get_step_id();
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

  const updateStepStatus = async (newStatus) => {
    setIsLoading(true);
    try {
      const response = await apiRequest(
        "PUT",
        `/api/plc/plc_step/${stepId}/update-status/`,
        { status: newStatus },
        true
      );
      if (response.status === 200) {
        setStepStatus(newStatus);
        message.success("Status updated successfully");
        await get_step_id();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProcess = async (newProcess) => {
    setIsLoading(true);
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
        await get_step_id();
      }
    } catch (error) {
      console.error("Error updating process:", error);
      message.error("Failed to update process");
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    get_step_id();
  }, []);

  return (
    <div className="min-h-full p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Discuss Implementation
          </h2>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stepStatus === "completed"
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-1"
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
              ISO: <InteractiveIsoClause isoClause={associatedIsoClause} />
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
                className="border-gray-300 rounded-lg shadow-sm focus:ring-blue-500"
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
                className="border-gray-300 rounded-lg shadow-sm focus:ring-blue-500"
              >
                <Option value="pending">Pending</Option>
                <Option value="in_progress">In Progress</Option>
                <Option value="completed">Completed</Option>
              </Select>
            )}
          </div>
        </div>
      </div>
      {taskAssignments.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Task Assignments
          </h3>
          {taskAssignments.map((assignment, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 mb-4">
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-700">
                    Assignment #{index + 1}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {formatDate(assignment.assigned_at)}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Assigned To:
                    </p>
                    <ul className="list-disc list-inside mt-2">
                      {assignment.assigned_to.map((user) => (
                        <li key={user.id} className="text-sm text-gray-600">
                          {user.name} - {user.email}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Deadline:</p>
                    <p className="text-sm text-gray-600 mt-2">
                      {formatDate(assignment.deadline)}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">
                    Description:
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {assignment.description}
                  </p>
                </div>
                {assignment.references && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700">
                      References:
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {assignment.references}
                    </p>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                <p>
                  <b>Status:</b> {assignment.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal
        title="Assign Task"
        open={isAssignTaskVisible}
        onCancel={() => {
          setIsAssignTaskVisible(false);
          setSelectedTeamMembers([]);
          setTaskDescription("");
          setTaskDeadline(null);
          setTaskReferences("");
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsAssignTaskVisible(false);
              setSelectedTeamMembers([]);
              setTaskDescription("");
              setTaskDeadline(null);
              setTaskReferences("");
            }}
            className="border-gray-300 text-gray-700"
          >
            Cancel
          </Button>,
          <Button
            key="assign"
            type="primary"
            onClick={handleSubmitAssignment}
            className="bg-blue-600 hover:bg-blue-700"
            loading={isLoading}
          >
            Assign
          </Button>,
        ]}
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team Members
          </label>
          <Select
            mode="multiple"
            placeholder="Select team members"
            value={selectedTeamMembers}
            onChange={setSelectedTeamMembers}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500"
          >
            {members.map((member) => (
              <Option key={member.id} value={member.id}>
                {member.name}
              </Option>
            ))}
          </Select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team Deadline
          </label>
          <DatePicker
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500"
            value={taskDeadline}
            onChange={setTaskDeadline}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Description
          </label>
          <Input
            placeholder="Enter task description"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            className="border-gray-300 rounded-lg shadow-sm focus:ring-blue-500"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task References
          </label>
          <Input
            placeholder="Add reference URLs"
            value={taskReferences}
            onChange={(e) => setTaskReferences(e.target.value)}
            className="border-gray-300 rounded-lg shadow-sm focus:ring-blue-500"
          />
        </div>
      </Modal>
      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Implement Policies
        </h2>
        <ImplementPolicies />
      </div>
    </div>
  );
}

export default DiscussImplementation;